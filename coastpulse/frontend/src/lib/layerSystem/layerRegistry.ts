/**
 * COASTPULSE — Centralized Layer Registry
 *
 * Defines all available scientific map layers, categories, metadata,
 * coordinate bounds, raster source types, and default display parameters.
 */

export type LayerCategoryId =
  | "sar"
  | "water"
  | "vegetation"
  | "change"
  | "optical"
  | "terrain"
  | "reference";

export type FilterChipCategory = "all" | "sar" | "optical" | "derived" | "terrain" | "vector";

export interface LayerCategoryDef {
  id: LayerCategoryId;
  label: string;
  iconName: string;
  description: string;
}

export type ColorRampType = "grayscale" | "viridis" | "turbo" | "water" | "vegetation" | "magma";

export interface LayerRenderingOptions {
  colorRamp: ColorRampType;
  stretch: "minmax" | "stddev" | "linear";
  noDataTransparent: boolean;
  minVal?: number;
  maxVal?: number;
}

export interface LayerDefinition {
  id: string;
  categoryId: LayerCategoryId;
  filterChip: FilterChipCategory;
  name: string;
  sensor: string;
  satellite: string;
  acquisitionDate?: string;
  polarization?: string;
  productType?: string;
  processingLevel: string;
  units?: string;
  resolutionM?: number;
  description: string;
  sourceType: "raster_image" | "raster_tiles" | "geojson" | "vector";
  sourceUrl: string;
  coordinates?: [[number, number], [number, number], [number, number], [number, number]]; // Top-Left, Top-Right, Bottom-Right, Bottom-Left
  defaultOpacity: number;
  defaultVisible: boolean;
  thumbnailUrl?: string;
  isAvailable: boolean;
  unavailableReason?: string;
  isNativeScienceData: boolean;
  // Forensic Metadata Attributes
  sourceProductId: string;
  crs: string;
  pixelDimensions?: string;
  rasterDimensions?: string;
  noDataValue?: string;
  geographicCoverage?: string;
  downloadSourceReference?: string;
  supportedRenders?: ColorRampType[];
}

export const LAYER_CATEGORIES: LayerCategoryDef[] = [
  {
    id: "sar",
    label: "SAR (NISAR / Sentinel-1)",
    iconName: "Activity",
    description: "Synthetic Aperture Radar backscatter (gamma0 / sigma0) for all-weather penetration.",
  },
  {
    id: "water",
    label: "Water & Inundation",
    iconName: "Droplets",
    description: "Surface water extent, tidal creek dynamics, and flood inundation masks.",
  },
  {
    id: "vegetation",
    label: "Vegetation & Mangrove",
    iconName: "TreePine",
    description: "Radar Vegetation Index (RVI), canopy structure, and Muthupet mangrove biomass.",
  },
  {
    id: "change",
    label: "Coastal Change",
    iconName: "Activity",
    description: "Bitemporal change detection, log-ratio variance, and shoreline displacement.",
  },
  {
    id: "optical",
    label: "Optical (Sentinel-2)",
    iconName: "ImageIcon",
    description: "Multispectral MSI surface reflectance and true-color satellite composites.",
  },
  {
    id: "terrain",
    label: "Terrain & Elevation",
    iconName: "Mountain",
    description: "Digital elevation models (DEM) and coastal bathymetry gradients.",
  },
  {
    id: "reference",
    label: "Reference",
    iconName: "MapPin",
    description: "Administrative boundaries, shoreline baselines, and protected sanctuaries.",
  },
];

// Nagapattinam standard coordinate bounds for georeferenced raster products (EPSG:4326)
// left=79.599096, bottom=10.200016, right=80.099327, top=11.400453
export const NAGAPATTINAM_COORDS: [[number, number], [number, number], [number, number], [number, number]] = [
  [79.599096, 11.400453], // Top-Left
  [80.099327, 11.400453], // Top-Right
  [80.099327, 10.200016], // Bottom-Right
  [79.599096, 10.200016], // Bottom-Left
];

export const LAYER_REGISTRY: LayerDefinition[] = [
  // 1. SAR (NISAR / Sentinel-1)
  {
    id: "nisar-hh",
    categoryId: "sar",
    filterChip: "sar",
    name: "HH Backscatter (γ⁰)",
    sensor: "NISAR L-SAR",
    satellite: "NISAR",
    acquisitionDate: "2026-10-30",
    polarization: "HH",
    productType: "Float32 Calibrated",
    processingLevel: "Level-2 GCOV (Terrain Flattened)",
    units: "dB",
    resolutionM: 10,
    description: "Co-polarized horizontal backscatter calibrated to terrain-flattened gamma-nought (γ⁰). Sensitive to rough water and structure.",
    sourceType: "raster_image",
    sourceUrl: "/data/processed/nisar_t1_georef.png",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.75,
    defaultVisible: true,
    thumbnailUrl: "/data/thumbnails/t1_thumb.png",
    isAvailable: true,
    isNativeScienceData: true,
    sourceProductId: "NISAR_L2_PR_GCOV_034_084_A_007_4005_DHDH_A_20261030T001553",
    crs: "EPSG:4326 (WGS 84)",
    pixelDimensions: "0.001563° × 0.001535° (~170.9 m)",
    rasterDimensions: "782 × 320 px (250,240 cells)",
    noDataValue: "-9999.0 dB",
    geographicCoverage: "Nagapattinam Coast [79.6°E - 80.1°E, 10.2°N - 11.4°N]",
    downloadSourceReference: "NASA ASF DAAC / ISRO SAC Bhoonidhi C3622241360-ASF",
    supportedRenders: ["grayscale", "viridis", "turbo"],
  },
  {
    id: "nisar-hv",
    categoryId: "sar",
    filterChip: "sar",
    name: "HV Backscatter (γ⁰)",
    sensor: "NISAR L-SAR",
    satellite: "NISAR",
    acquisitionDate: "2026-11-11",
    polarization: "HV",
    productType: "Float32 Calibrated",
    processingLevel: "Level-2 GCOV (Terrain Flattened)",
    units: "dB",
    resolutionM: 10,
    description: "Cross-polarized horizontal-vertical backscatter with volumetric scattering sensitivity across mangrove canopy.",
    sourceType: "raster_image",
    sourceUrl: "/data/processed/nisar_t2_georef.png",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.75,
    defaultVisible: true,
    thumbnailUrl: "/data/thumbnails/t2_thumb.png",
    isAvailable: true,
    isNativeScienceData: true,
    sourceProductId: "NISAR_L2_PR_GCOV_035_084_A_007_4005_DHDH_A_20261111T001554",
    crs: "EPSG:4326 (WGS 84)",
    pixelDimensions: "0.001563° × 0.001535° (~170.9 m)",
    rasterDimensions: "782 × 320 px (250,240 cells)",
    noDataValue: "-9999.0 dB",
    geographicCoverage: "Nagapattinam Coast [79.6°E - 80.1°E, 10.2°N - 11.4°N]",
    downloadSourceReference: "NASA ASF DAAC / ISRO SAC Bhoonidhi C3622241360-ASF",
    supportedRenders: ["grayscale", "viridis", "magma"],
  },
  {
    id: "sentinel1-grd",
    categoryId: "sar",
    filterChip: "sar",
    name: "Sentinel-1 C-SAR GRD (VV)",
    sensor: "Sentinel-1A C-SAR",
    satellite: "Sentinel-1A",
    acquisitionDate: "2026-10-28",
    polarization: "VV",
    productType: "GRDH Level-1",
    processingLevel: "Level-1 GRD",
    units: "σ⁰ (dB)",
    resolutionM: 10,
    description: "C-band 5.405 GHz co-polarized observation over Cauvery river mouth.",
    sourceType: "raster_image",
    sourceUrl: "http://127.0.0.1:8000/api/v1/geospatial/render-overlay?layer_type=sar",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.65,
    defaultVisible: false,
    thumbnailUrl: "/data/thumbnails/t1_thumb.png",
    isAvailable: true,
    isNativeScienceData: true,
    sourceProductId: "S1A_IW_GRDH_1SDV_20261028T004215_056291_06E41B_7A3F",
    crs: "EPSG:4326 (WGS 84)",
    pixelDimensions: "10 m × 10 m",
    rasterDimensions: "256 × 256 px",
    noDataValue: "0.0",
    geographicCoverage: "Cauvery Estuary / Nagapattinam Maritime",
    downloadSourceReference: "Copernicus Data Space Ecosystem (CDSE)",
    supportedRenders: ["grayscale", "turbo"],
  },

  // 2. Water & Inundation
  {
    id: "water-inundation",
    categoryId: "water",
    filterChip: "derived",
    name: "Surface Water & Inundation Extent",
    sensor: "NISAR & Sentinel-1 Derived",
    satellite: "NISAR × Sentinel-1",
    acquisitionDate: "2026-11-11",
    polarization: "Dual-Pol Ratio",
    productType: "Otsu Adaptive Water Mask",
    processingLevel: "Level-3 Analysis-Ready-Data (ARD)",
    units: "Binary / Probability",
    resolutionM: 10,
    description: "Delineated open surface water, tidal creeks, and inland flooded depressions derived from dual-polarization SAR backscatter.",
    sourceType: "raster_image",
    sourceUrl: "/data/processed/water_inundation_real.png",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.85,
    defaultVisible: false,
    thumbnailUrl: "/data/thumbnails/t2_thumb.png",
    isAvailable: true,
    isNativeScienceData: false,
    sourceProductId: "COASTPULSE-ARD-WATER-20261111-NAGAPATTINAM",
    crs: "EPSG:4326 (WGS 84)",
    pixelDimensions: "10 m ground resolution",
    rasterDimensions: "782 × 320 px",
    noDataValue: "0 (Transparent)",
    geographicCoverage: "Vedaranyam Canal, Point Calimere Estuary & Coromandel Coast",
    downloadSourceReference: "CoastPulse Scientific Processing Pipeline",
    supportedRenders: ["water", "grayscale"],
  },
  {
    id: "tidal-wetland-flow",
    categoryId: "water",
    filterChip: "derived",
    name: "Vedaranyam Estuary Wetland Channels",
    sensor: "Multi-Temporal SAR",
    satellite: "NISAR",
    acquisitionDate: "2026-11-11",
    polarization: "HH+HV",
    productType: "Hydrographic Mask",
    processingLevel: "Level-3 Hydrographic",
    units: "Channel Depth Index",
    resolutionM: 12.5,
    description: "Active tidal drainage network and hyper-saline swamp lagoons along Point Calimere wildlife sanctuary.",
    sourceType: "raster_image",
    sourceUrl: "http://127.0.0.1:8000/api/v1/geospatial/render-overlay?layer_type=water",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.7,
    defaultVisible: false,
    isAvailable: true,
    isNativeScienceData: false,
    sourceProductId: "CP-WETLAND-HYDRO-20261111",
    crs: "EPSG:4326 (WGS 84)",
    rasterDimensions: "256 × 256 px",
    downloadSourceReference: "CoastPulse Wetland Engine",
    supportedRenders: ["water", "viridis"],
  },
  {
    id: "storm-surge-flood",
    categoryId: "water",
    filterChip: "derived",
    name: "Post-Storm Inundation Anomaly",
    sensor: "NISAR GCOV Change",
    satellite: "NISAR",
    acquisitionDate: "2026-11-11",
    productType: "Thresholded Diff",
    processingLevel: "Level-3 Anomaly",
    units: "Δ dB",
    resolutionM: 10,
    description: "Identifies severe backscatter drop corresponding to standing floodwater over agricultural lowlands.",
    sourceType: "raster_image",
    sourceUrl: "http://127.0.0.1:8000/api/v1/geospatial/render-overlay?layer_type=change",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.75,
    defaultVisible: false,
    isAvailable: true,
    isNativeScienceData: false,
    sourceProductId: "CP-STORM-SURGE-DIFF-20261111",
    crs: "EPSG:4326 (WGS 84)",
    rasterDimensions: "256 × 256 px",
    downloadSourceReference: "CoastPulse Anomaly Engine",
    supportedRenders: ["turbo", "viridis"],
  },

  // 3. Vegetation & Mangrove
  {
    id: "mangrove-rvi",
    categoryId: "vegetation",
    filterChip: "derived",
    name: "Muthupet Mangrove RVI (Radar Vegetation)",
    sensor: "NISAR L-band Polarimetric",
    satellite: "NISAR",
    acquisitionDate: "2026-11-11",
    polarization: "Quad/Dual Covariance",
    productType: "Radar Vegetation Index",
    processingLevel: "Level-3 Biophysical",
    units: "RVI [0–1]",
    resolutionM: 10,
    description: "Calculated as 8*HV / (HH + HV + 2*HV). Calibrated to biomass density and leaf area index in Muthupet mangrove forest.",
    sourceType: "raster_image",
    sourceUrl: "/data/processed/mangrove_vegetation_real.png",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.85,
    defaultVisible: false,
    thumbnailUrl: "/data/thumbnails/t2_thumb.png",
    isAvailable: true,
    isNativeScienceData: false,
    sourceProductId: "CP-MANGROVE-RVI-FLOAT32-20261111",
    crs: "EPSG:4326 (WGS 84)",
    pixelDimensions: "10 m ground resolution",
    rasterDimensions: "782 × 320 px",
    noDataValue: "-9999.0",
    geographicCoverage: "Muthupet Lagoon & Point Calimere Mangrove Reserve",
    downloadSourceReference: "CoastPulse Polarimetric Decomposition Subsystem",
    supportedRenders: ["vegetation", "viridis"],
  },
  {
    id: "coastal-canopy-density",
    categoryId: "vegetation",
    filterChip: "derived",
    name: "Coastal Casuarina & Palm Canopy",
    sensor: "Sentinel-1 + NISAR",
    satellite: "NISAR × S1",
    acquisitionDate: "2026-10-30",
    polarization: "HV",
    productType: "Canopy Density",
    processingLevel: "Level-3 Forestry",
    units: "Vegetation Fraction",
    resolutionM: 10,
    description: "Volumetric cross-polarization response mapped across littoral shelterbelts.",
    sourceType: "raster_image",
    sourceUrl: "http://127.0.0.1:8000/api/v1/geospatial/render-overlay?layer_type=vegetation",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.7,
    defaultVisible: false,
    isAvailable: true,
    isNativeScienceData: false,
    sourceProductId: "CP-CANOPY-DENSITY-20261030",
    crs: "EPSG:4326 (WGS 84)",
    rasterDimensions: "256 × 256 px",
    downloadSourceReference: "CoastPulse Forestry Module",
    supportedRenders: ["vegetation", "turbo"],
  },

  // 4. Coastal Change
  {
    id: "nisar-bitemporal-change",
    categoryId: "change",
    filterChip: "derived",
    name: "NISAR Bitemporal Change (Oct 30 vs Nov 11)",
    sensor: "NISAR L-SAR",
    satellite: "NISAR",
    acquisitionDate: "2026-11-11",
    polarization: "HH Log-Ratio",
    productType: "Coherent Diff Overlay",
    processingLevel: "Level-3 Change Detection",
    units: "Ratio dB",
    resolutionM: 10,
    description: "Calibrated 12-day repeat orbit change detection. Highlights tidal flats, mudflat shifts, and inland ponding.",
    sourceType: "raster_image",
    sourceUrl: "/data/processed/coastal_change_real.png",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.85,
    defaultVisible: false,
    thumbnailUrl: "/data/thumbnails/t2_thumb.png",
    isAvailable: true,
    isNativeScienceData: false,
    sourceProductId: "CP-BITEMPORAL-DIFF-20261030-20261111",
    crs: "EPSG:4326 (WGS 84)",
    pixelDimensions: "10 m ground resolution",
    rasterDimensions: "782 × 320 px",
    geographicCoverage: "Nagapattinam Intertidal Zone & Estuary",
    downloadSourceReference: "CoastPulse Coherent Change Engine",
    supportedRenders: ["turbo", "magma"],
  },
  {
    id: "shoreline-erosion-vector",
    categoryId: "change",
    filterChip: "derived",
    name: "Shoreline Displacement Baseline",
    sensor: "Long-term InSAR Baseline",
    satellite: "NISAR × S1",
    acquisitionDate: "2026-11-11",
    productType: "Displacement Rate",
    processingLevel: "Level-4 Cumulative",
    units: "m/year",
    resolutionM: 10,
    description: "Monitors shoreline retreat and accretion dynamics along Nagapattinam port breakwater.",
    sourceType: "raster_image",
    sourceUrl: "/data/processed/authoritative_change_visualization.png",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.7,
    defaultVisible: false,
    isAvailable: true,
    isNativeScienceData: false,
    sourceProductId: "CP-SHORELINE-DISPLACEMENT-2026",
    crs: "EPSG:4326 (WGS 84)",
    rasterDimensions: "782 × 320 px",
    downloadSourceReference: "CoastPulse Shoreline Vector Engine",
    supportedRenders: ["turbo", "grayscale"],
  },

  // 5. Optical (Sentinel-2)
  {
    id: "sentinel2-truecolor",
    categoryId: "optical",
    filterChip: "optical",
    name: "Sentinel-2 MSI True Color (TCI)",
    sensor: "Sentinel-2B MSI",
    satellite: "Sentinel-2B",
    acquisitionDate: "2026-11-02",
    productType: "Level-2A Bottom-Of-Atmosphere",
    processingLevel: "Level-2A Surface Reflectance",
    resolutionM: 10,
    description: "High-resolution cloud-free multispectral composite (B04-B03-B02) for visual validation of coastal geomorphology.",
    sourceType: "raster_image",
    sourceUrl: "http://127.0.0.1:8000/api/v1/geospatial/render-overlay?layer_type=water",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.8,
    defaultVisible: false,
    isAvailable: true,
    isNativeScienceData: true,
    sourceProductId: "S2B_MSIL2A_20261102T050929_N0511_R019_T44PMV_20261102T074512",
    crs: "EPSG:4326 (WGS 84)",
    pixelDimensions: "10 m optical resolution",
    rasterDimensions: "256 × 256 px",
    downloadSourceReference: "ESA Copernicus Open Access Hub",
    supportedRenders: ["grayscale"],
  },

  // 6. Terrain & Elevation
  {
    id: "copernicus-dem",
    categoryId: "terrain",
    filterChip: "terrain",
    name: "Copernicus GLO-30 Digital Elevation",
    sensor: "TanDEM-X / WorldDEM",
    satellite: "TanDEM-X",
    productType: "DEM (GLO-30)",
    processingLevel: "Level-3 Orthometric DEM",
    units: "meters (Orthometric)",
    resolutionM: 30,
    description: "30-meter global elevation model for coastal hydrodynamic runup and flood vulnerability analysis.",
    sourceType: "raster_image",
    sourceUrl: "http://127.0.0.1:8000/api/v1/geospatial/render-overlay?layer_type=dem",
    coordinates: NAGAPATTINAM_COORDS,
    defaultOpacity: 0.6,
    defaultVisible: false,
    isAvailable: true,
    isNativeScienceData: true,
    sourceProductId: "COP-DEM_GLO-30-DGED_2026_N10_00_E079_00",
    crs: "EPSG:4326 (WGS 84)",
    pixelDimensions: "30 m (1 arc-second)",
    rasterDimensions: "256 × 256 px",
    noDataValue: "-32767.0 m",
    geographicCoverage: "Nagapattinam Coastal Plain & Cauvery Delta",
    downloadSourceReference: "Copernicus Space Component Data Access (CSCDA)",
    supportedRenders: ["turbo", "viridis", "grayscale"],
  },

  // 7. Reference
  {
    id: "ref-district-boundary",
    categoryId: "reference",
    filterChip: "vector",
    name: "Nagapattinam Administrative Boundary",
    sensor: "Survey of India / GADM",
    satellite: "Geospatial Reference",
    productType: "GeoJSON Vector",
    processingLevel: "Level-0 Baseline Vector",
    description: "Official district coastal boundary polygon and shoreline perimeter.",
    sourceType: "geojson",
    sourceUrl: "inline-geojson",
    defaultOpacity: 1.0,
    defaultVisible: true,
    isAvailable: true,
    isNativeScienceData: true,
    sourceProductId: "GADM-IND-TN-NAGAPATTINAM-2026",
    crs: "EPSG:4326 (WGS 84)",
    geographicCoverage: "Nagapattinam Administrative District Boundary",
    downloadSourceReference: "Survey of India / GADM v4.1",
  },
  {
    id: "ref-sanctuary-reserve",
    categoryId: "reference",
    filterChip: "vector",
    name: "Point Calimere Ramsar Sanctuary",
    sensor: "MoEFCC Ramsar Site 1210",
    satellite: "Conservation Registry",
    productType: "GeoJSON Vector",
    processingLevel: "Level-0 Protected Zone",
    description: "Protected mangrove and coastal wetland Ramsar conservation boundary.",
    sourceType: "geojson",
    sourceUrl: "inline-geojson",
    defaultOpacity: 0.9,
    defaultVisible: true,
    isAvailable: true,
    isNativeScienceData: true,
    sourceProductId: "RAMSAR-SITE-1210-POINT-CALIMERE",
    crs: "EPSG:4326 (WGS 84)",
    geographicCoverage: "Point Calimere Wildlife and Bird Sanctuary (385 km²)",
    downloadSourceReference: "Ramsar Convention on Wetlands of International Importance",
  },
  {
    id: "ref-esri-imagery",
    categoryId: "reference",
    filterChip: "optical",
    name: "Esri World Imagery Basemap",
    sensor: "WorldView / Maxar / TerraColor",
    satellite: "Commercial Optical Constellation",
    productType: "Global Optical Base",
    processingLevel: "Orthorectified True Color",
    resolutionM: 0.5,
    description: "Sub-meter global optical reference basemap.",
    sourceType: "raster_tiles",
    sourceUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    defaultOpacity: 1.0,
    defaultVisible: true,
    isAvailable: true,
    isNativeScienceData: false,
    sourceProductId: "ESRI-WORLD-IMAGERY-GLOBAL-TILES",
    crs: "EPSG:3857 (Web Mercator)",
    pixelDimensions: "Variable zoom 0-19",
    downloadSourceReference: "Esri / Maxar / Earthstar Geographics",
  },
];
