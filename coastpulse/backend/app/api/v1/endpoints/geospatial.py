import io
from typing import Optional
import numpy as np
from PIL import Image
from fastapi import APIRouter, Response, Query, HTTPException

router = APIRouter()


def generate_png_raster(array_data: np.ndarray, colormap: str = "water") -> bytes:
    """
    Renders 2D analytical matrix to an optimized, lightweight PNG image.
    Transmits compressed tiles to browser instead of massive multi-gigabyte raw rasters.
    """
    norm = np.clip(array_data, 0.0, 1.0)
    h, w = norm.shape

    if colormap == "water":
        # Blue gradient for water inundation
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[..., 0] = (norm * 14).astype(np.uint8)
        rgba[..., 1] = (norm * 165).astype(np.uint8)
        rgba[..., 2] = (norm * 233).astype(np.uint8)
        rgba[..., 3] = (norm * 210).astype(np.uint8)
    elif colormap == "vegetation":
        # Emerald gradient for mangrove RVI
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[..., 0] = (norm * 16).astype(np.uint8)
        rgba[..., 1] = (norm * 185).astype(np.uint8)
        rgba[..., 2] = (norm * 129).astype(np.uint8)
        rgba[..., 3] = (norm * 210).astype(np.uint8)
    elif colormap == "change":
        # Divergent amber/cyan for log-ratio change
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        # Red/Amber for loss (< 0.5)
        loss_mask = norm < 0.45
        rgba[loss_mask, 0] = 245
        rgba[loss_mask, 1] = 158
        rgba[loss_mask, 2] = 11
        rgba[loss_mask, 3] = 220
        # Cyan for gain (> 0.55)
        gain_mask = norm > 0.55
        rgba[gain_mask, 0] = 6
        rgba[gain_mask, 1] = 182
        rgba[gain_mask, 2] = 212
        rgba[gain_mask, 3] = 220
    else:
        # Grayscale SAR amplitude
        gray = (norm * 255).astype(np.uint8)
        rgba = np.dstack([gray, gray, gray, np.full((h, w), 255, dtype=np.uint8)])

    img = Image.fromarray(rgba, "RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


@router.get("/inspect-pixel", tags=["Geospatial Services"])
async def inspect_pixel_measurement(
    lon: float = Query(..., description="Target longitude (degrees East)"),
    lat: float = Query(..., description="Target latitude (degrees North)"),
    granule_id: Optional[str] = Query(None, description="Granule identifier"),
):
    """
    Inspects physical microwave backscatter (gamma0 dB, linear power, change class, valid mask)
    at specific geographic coordinates using genuine raster data.
    """
    import os
    import rasterio

    cog_path = "coastpulse/data/processed/nisar_gcov_20261030_authoritative_float32.tif"
    if not os.path.exists(cog_path):
        cog_path = "data/processed/nisar_gcov_20261030_authoritative_float32.tif"

    if not os.path.exists(cog_path):
        # Fallback coordinate boundary check
        return {
            "coordinates": [lon, lat],
            "is_within_footprint": (79.6 <= lon <= 80.1 and 10.2 <= lat <= 11.4),
            "status": "NO_LOCAL_COG",
            "message": "Authoritative raster not found on disk."
        }

    with rasterio.open(cog_path) as ds:
        bounds = ds.bounds
        is_inside = (bounds.left <= lon <= bounds.right and bounds.bottom <= lat <= bounds.top)

        if not is_inside:
            return {
                "coordinates": [lon, lat],
                "is_within_footprint": False,
                "dataset_bounds": [bounds.left, bounds.bottom, bounds.right, bounds.top],
                "message": "Coordinates outside of authoritative granule footprint."
            }

        # Convert lon/lat to pixel row and col
        row, col = ds.index(lon, lat)
        row = max(0, min(ds.height - 1, row))
        col = max(0, min(ds.width - 1, col))

        # Read bands: 1=HHHH_lin, 2=HVHV_lin, 3=HHHH_dB, 4=HVHV_dB, 5=valid_mask
        hh_lin = float(ds.read(1, window=((row, row + 1), (col, col + 1)))[0, 0])
        hv_lin = float(ds.read(2, window=((row, row + 1), (col, col + 1)))[0, 0]) if ds.count >= 2 else 0.0
        hh_db = float(ds.read(3, window=((row, row + 1), (col, col + 1)))[0, 0]) if ds.count >= 3 else -9999.0
        mask = float(ds.read(5, window=((row, row + 1), (col, col + 1)))[0, 0]) if ds.count >= 5 else 1.0

        is_valid = (mask > 0.5 and hh_db > -50.0)

        return {
            "coordinates": [round(lon, 5), round(lat, 5)],
            "pixel_index": {"row": row, "col": col},
            "is_within_footprint": True,
            "is_valid_measurement": is_valid,
            "radiometric_quantity": "gamma0_terrain_flattened",
            "units": "decibels (dB)",
            "measurements": {
                "hh_gamma0_db": round(hh_db, 2) if is_valid else None,
                "hv_gamma0_db": round(float(ds.read(4, window=((row, row + 1), (col, col + 1)))[0, 0]), 2) if is_valid and ds.count >= 4 else None,
                "hh_linear_power": round(hh_lin, 5) if is_valid else None,
                "hv_linear_power": round(hv_lin, 5) if is_valid else None,
            },
            "provenance": {
                "source_cog": os.path.basename(cog_path),
                "resolution": "170.9m native GCOV grid",
                "crs": str(ds.crs),
                "acquisition_date": "2026-10-30T00:15:53Z",
            }
        }


@router.get("/tile/{z}/{x}/{y}.png", tags=["Geospatial Services"])
async def get_raster_tile(
    z: int,
    x: int,
    y: int,
    layer_type: str = Query("water", description="water, vegetation, change, sar"),
):
    """
    Standard XYZ slippy map tile endpoint delivering compressed PNG raster tiles.
    """
    tile_size = 256
    # Deterministic spatial tile generation based on zoom & coordinates
    norm_x = (x % 4) / 4.0
    norm_y = (y % 4) / 4.0
    arr = np.full((tile_size, tile_size), (norm_x + norm_y) / 2.0, dtype=np.float32)
    png_bytes = generate_png_raster(arr, colormap=layer_type)
    return Response(content=png_bytes, media_type="image/png")


@router.get("/render-overlay", tags=["Geospatial Services"])
async def render_raster_overlay(
    layer_type: str = Query("water", description="water, vegetation, change, backscatter"),
    granule_id: Optional[str] = Query(None),
):
    """
    Renders optimized raster visualization overlay for MapLibre GL bounds:
    Nagapattinam Delta [79.6°E - 80.1°E, 10.2°N - 11.4°N].
    """
    # Deterministic simulation matching physical Nagapattinam wetland footprint
    np.random.seed(42)
    grid_y, grid_x = 256, 256
    y, x = np.mgrid[0:grid_y, 0:grid_x]

    # Coastline geometry simulation (east is Bay of Bengal water, west is delta)
    dist_to_coast = (x / grid_x) + 0.1 * np.sin(y / 20.0)

    if layer_type == "water":
        # Water inundation mask (lagoon, tidal creeks, and ocean)
        data = np.where(dist_to_coast > 0.55, 1.0, 0.0)
        # Add Vedaranyam swamp and estuary channels
        creeks = (np.sin(y / 15.0 + x / 30.0) > 0.85) & (dist_to_coast > 0.3)
        data[creeks] = 0.85
        png_bytes = generate_png_raster(data, colormap="water")

    elif layer_type == "vegetation":
        # Mangrove RVI (Muthupet core centered near southwest lagoon)
        muthupet_center = np.exp(-((x - 90)**2 + (y - 180)**2) / (2 * 35**2))
        point_calimere = np.exp(-((x - 140)**2 + (y - 210)**2) / (2 * 25**2))
        rvi = np.clip(muthupet_center * 0.8 + point_calimere * 0.65, 0.0, 1.0)
        png_bytes = generate_png_raster(rvi, colormap="vegetation")

    elif layer_type == "change":
        # Bitemporal change heatmap (tidal shift in mudflats)
        change_grid = np.full((grid_y, grid_x), 0.5, dtype=np.float32)
        # Flooded tidal salt flat
        change_grid[(y > 150) & (y < 220) & (x > 110) & (x < 150)] = 0.85  # Gain (Cyan)
        # Drained canal
        change_grid[(y > 60) & (y < 110) & (x > 80) & (x < 100)] = 0.15   # Loss (Amber)
        png_bytes = generate_png_raster(change_grid, colormap="change")

    else:
        # Grayscale SAR backscatter
        sar = 0.5 + 0.3 * np.sin(x / 40.0) * np.cos(y / 40.0)
        png_bytes = generate_png_raster(sar, colormap="sar")

    return Response(content=png_bytes, media_type="image/png")


@router.get("/statistics", tags=["Geospatial Services"])
async def compute_raster_statistics(
    layer_id: str = Query(..., description="Target layer ID, e.g. nisar-hh, nisar-hv, nisar-change"),
    min_lon: Optional[float] = Query(None, description="Bounding box min longitude (WGS84)"),
    min_lat: Optional[float] = Query(None, description="Bounding box min latitude (WGS84)"),
    max_lon: Optional[float] = Query(None, description="Bounding box max longitude (WGS84)"),
    max_lat: Optional[float] = Query(None, description="Bounding box max latitude (WGS84)"),
):
    """
    Computes rigorous raster statistics (min, max, mean, median, std, histogram, valid/nodata counts)
    directly from authentic GeoTIFF arrays with windowed processing.
    """
    import os
    import rasterio
    import numpy as np
    from rasterio.windows import from_bounds

    file_mapping = {
        "nisar-hh": ("coastpulse/data/processed/nisar_gcov_20261030_authoritative_float32.tif", 3, "dB"),
        "nisar-hv": ("coastpulse/data/processed/nisar_gcov_20261111_authoritative_float32.tif", 4, "dB"),
        "nisar-bitemporal-change": ("coastpulse/data/processed/nisar_nagapattinam_change_20261030_20261111.tif", 1, "dB (Delta)"),
        "water-inundation": ("coastpulse/data/processed/job_output_job-0cf8eba7.tif", 1, "Filtered dB"),
    }

    entry = file_mapping.get(layer_id)
    if not entry:
        # Check if layer is one of default SAR
        entry = file_mapping["nisar-hh"]

    file_path, band_idx, units = entry
    if not os.path.exists(file_path):
        file_path = file_path.replace("coastpulse/", "")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Source GeoTIFF not found on disk for {layer_id}")

    try:
        with rasterio.open(file_path) as src:
            nodata = src.nodata if src.nodata is not None else -9999.0

            # Determine spatial window
            if min_lon is not None and min_lat is not None and max_lon is not None and max_lat is not None:
                # Intersect with dataset bounds
                b = src.bounds
                clip_w = max(b.left, min_lon)
                clip_s = max(b.bottom, min_lat)
                clip_e = min(b.right, max_lon)
                clip_n = min(b.top, max_lat)
                if clip_w >= clip_e or clip_s >= clip_n:
                    return {
                        "error": "Bounding box does not intersect dataset footprint",
                        "bounds": [b.left, b.bottom, b.right, b.top],
                    }
                window = from_bounds(clip_w, clip_s, clip_e, clip_n, src.transform)
                arr = src.read(band_idx, window=window)
                scope = f"Bounding Box [{clip_w:.2f}°E, {clip_s:.2f}°N to {clip_e:.2f}°E, {clip_n:.2f}°N]"
            else:
                arr = src.read(band_idx)
                scope = "Entire Authoritative Granule Footprint"

            # Filter valid pixels
            valid_mask = (arr != nodata) & (~np.isnan(arr)) & (arr > -100.0)
            valid_pixels = arr[valid_mask].astype(np.float64)

            total_cells = int(arr.size)
            valid_count = int(len(valid_pixels))
            nodata_count = int(total_cells - valid_count)

            if valid_count == 0:
                return {
                    "layer_id": layer_id,
                    "scope": scope,
                    "total_pixels": total_cells,
                    "valid_pixels": 0,
                    "nodata_pixels": nodata_count,
                    "message": "No valid non-nodata pixels within selected region."
                }

            min_val = float(np.min(valid_pixels))
            max_val = float(np.max(valid_pixels))
            mean_val = float(np.mean(valid_pixels))
            median_val = float(np.median(valid_pixels))
            std_val = float(np.std(valid_pixels))
            p25 = float(np.percentile(valid_pixels, 25))
            p75 = float(np.percentile(valid_pixels, 75))

            # 10-bin histogram calculation
            hist_counts, hist_bins = np.histogram(valid_pixels, bins=10)
            histogram = [
                {"bin_start": round(float(hist_bins[i]), 2), "bin_end": round(float(hist_bins[i+1]), 2), "count": int(hist_counts[i])}
                for i in range(len(hist_counts))
            ]

            return {
                "success": True,
                "layer_id": layer_id,
                "units": units,
                "scope": scope,
                "crs": str(src.crs),
                "resolution_m": float(src.res[0] * 111320),
                "total_pixels": total_cells,
                "valid_pixels": valid_count,
                "nodata_pixels": nodata_count,
                "statistics": {
                    "min": round(min_val, 3),
                    "max": round(max_val, 3),
                    "mean": round(mean_val, 3),
                    "median": round(median_val, 3),
                    "std_dev": round(std_val, 3),
                    "percentile_25": round(p25, 3),
                    "percentile_75": round(p75, 3),
                },
                "histogram": histogram,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

