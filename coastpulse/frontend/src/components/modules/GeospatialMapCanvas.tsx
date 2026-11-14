"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  MapPin,
  Eye,
  EyeOff,
  Sliders,
  Crosshair,
  Info,
  Activity,
  CheckCircle2,
  Square,
  Trash2,
  RotateCcw,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { LayerConfig } from "@/components/layout/LeftSidebar";

interface GeospatialMapCanvasProps {
  layers: LayerConfig[];
  currentAoi: any;
  onPixelClick: (lat: number, lon: number) => void;
  inspectedPixel: any;
}

export const GeospatialMapCanvas: React.FC<GeospatialMapCanvasProps> = ({
  layers,
  currentAoi,
  onPixelClick,
  inspectedPixel,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zoom, setZoom] = useState<number>(9.8);
  const [cursorCoords, setCursorCoords] = useState<[number, number]>([79.843, 10.767]);
  const [basemapStyle, setBasemapStyle] = useState<"satellite" | "dark" | "osm">("satellite");
  const [drawBoxMode, setDrawBoxMode] = useState<boolean>(false);
  const [drawnBox, setDrawnBox] = useState<any>(null);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (typeof window !== "undefined" && maplibregl.config) {
      maplibregl.config.WORKER_URL = "/maplibre-gl-worker.mjs";
    }

    // OpenStreetMap raster tiles or ESRI World Imagery raster fallback style
    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "esri-satellite": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics",
        },
        "osm-carto": {
          type: "raster",
          tiles: [
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [
        {
          id: "satellite-layer",
          type: "raster",
          source: "esri-satellite",
          minzoom: 0,
          maxzoom: 19,
          layout: {
            visibility: "visible",
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: [79.843, 10.767], // Nagapattinam Delta center
      zoom: 9.8,
      attributionControl: false,
    });

    map.on("load", () => {
      setMapLoaded(true);

      // Add Nagapattinam Study Area Bounding Box Source & Layers
      map.addSource("nagapattinam-aoi", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { name: "Nagapattinam District Delta AOI" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [79.6, 10.2],
                [80.1, 10.2],
                [80.1, 11.4],
                [79.6, 11.4],
                [79.6, 10.2],
              ],
            ],
          },
        },
      });

      // AOI Fill Layer
      map.addLayer({
        id: "aoi-fill",
        type: "fill",
        source: "nagapattinam-aoi",
        paint: {
          "fill-color": "#06b6d4",
          "fill-opacity": 0.08,
        },
      });

      // AOI Outline Layer
      map.addLayer({
        id: "aoi-line",
        type: "line",
        source: "nagapattinam-aoi",
        paint: {
          "line-color": "#06b6d4",
          "line-width": 2,
          "line-dasharray": [3, 2],
        },
      });

      // Add Raster Image Source for Authentic Nagapattinam Change Visualization
      map.addSource("nisar-change-raster", {
        type: "image",
        url: "/data/processed/authoritative_change_visualization.png",
        coordinates: [
          [79.599096, 11.400453], // Top-Left
          [80.099327, 11.400453], // Top-Right
          [80.099327, 10.200016], // Bottom-Right
          [79.599096, 10.200016], // Bottom-Left
        ],
      });

      // NISAR Overlay Layer
      map.addLayer({
        id: "nisar-raster-layer",
        type: "raster",
        source: "nisar-change-raster",
        paint: {
          "raster-opacity": 0.85,
          "raster-fade-duration": 300,
        },
      });
    });

    map.on("mousemove", (e) => {
      setCursorCoords([e.lngLat.lng, e.lngLat.lat]);
    });

    map.on("zoom", () => {
      setZoom(map.getZoom());
    });

    map.on("click", (e) => {
      onPixelClick(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layer visibility when layers prop changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const changeLayer = layers.find((l) => l.id === "log-ratio-change");
    const aoiLayer = layers.find((l) => l.id === "district-boundaries");

    if (map.getLayer("nisar-raster-layer") && changeLayer) {
      map.setLayoutProperty(
        "nisar-raster-layer",
        "visibility",
        changeLayer.visible ? "visible" : "none"
      );
      map.setPaintProperty(
        "nisar-raster-layer",
        "raster-opacity",
        changeLayer.opacity / 100
      );
    }

    if (map.getLayer("aoi-line") && aoiLayer) {
      map.setLayoutProperty(
        "aoi-line",
        "visibility",
        aoiLayer.visible ? "visible" : "none"
      );
      map.setLayoutProperty(
        "aoi-fill",
        "visibility",
        aoiLayer.visible ? "visible" : "none"
      );
    }
  }, [layers, mapLoaded]);

  // Center on Inspected Pixel or Coordinate change
  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [79.843, 10.767],
      zoom: 10.2,
      essential: true,
      duration: 1200,
    });
  }, []);

  return (
    <div className="relative w-full h-full bg-[#030712] overflow-hidden select-none font-sans">
      {/* 1. Underlying MapLibre GL WebGL Canvas */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* 2. Top-Left Mission HUD Info Box */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none font-mono">
        <div className="px-3.5 py-2 rounded-lg bg-[#070d18]/90 border border-slate-800 text-slate-200 backdrop-blur-md shadow-2xl flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide text-xs">NASA-ISRO NISAR L2 GCOV</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-cyan-300">Track 084 ASCENDING</span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-400">EPSG:4326</span>
        </div>

        {/* Dynamic Pixel Measurement Tag */}
        {inspectedPixel && inspectedPixel.measurements && (
          <div className="px-3 py-1.5 rounded-md bg-[#0a1120]/95 border border-cyan-500/60 text-[11px] text-slate-300 backdrop-blur-md shadow-xl flex items-center gap-3">
            <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              Target: <strong className="text-white">{inspectedPixel.coordinates?.[0]?.toFixed(3)}°E, {inspectedPixel.coordinates?.[1]?.toFixed(3)}°N</strong>
            </span>
            <span>•</span>
            <span>
              $\gamma^0$: <strong className="text-cyan-300">{inspectedPixel.measurements.t1_gamma0_db} dB</strong>
            </span>
            <span>•</span>
            <span>
              $\Delta$: <strong className={inspectedPixel.measurements.delta_db > 0 ? "text-emerald-400" : "text-rose-400"}>
                {inspectedPixel.measurements.delta_db > 0 ? "+" : ""}{inspectedPixel.measurements.delta_db} dB
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* 3. Top-Right Mission Tools Floating Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#070d18]/90 border border-slate-800 rounded-lg p-1.5 backdrop-blur-md shadow-2xl">
        <button
          onClick={() => {
            if (mapRef.current) mapRef.current.zoomIn();
          }}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (mapRef.current) mapRef.current.zoomOut();
          }}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="h-px bg-slate-800 my-0.5" />
        <button
          onClick={handleRecenter}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          title="Reset View to Muthupet Lagoon & Calimere Sanctuary"
        >
          <Compass className="h-4 w-4" />
        </button>
      </div>

      {/* 4. Bottom-Left Telemetry Coordinates & Scale Bar */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2.5 font-mono text-[10px] text-slate-400 pointer-events-none">
        <div className="px-3 py-1.5 rounded bg-[#070d18]/90 border border-slate-800 backdrop-blur-md flex items-center gap-2 shadow-lg">
          <span className="text-slate-500 uppercase tracking-wider">LAT/LON:</span>
          <span className="text-cyan-300 font-bold">
            {cursorCoords[1].toFixed(5)}°N, {cursorCoords[0].toFixed(5)}°E
          </span>
        </div>

        <div className="px-3 py-1.5 rounded bg-[#070d18]/90 border border-slate-800 backdrop-blur-md flex items-center gap-2 shadow-lg">
          <span>ZOOM: {zoom.toFixed(1)}</span>
          <span>•</span>
          <span>GRID: 170.9m GCOV</span>
          <span>•</span>
          <div className="w-12 h-1 bg-cyan-400/80 rounded-full inline-block shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
        </div>
      </div>

      {/* 5. Bottom-Right NASA Scientific Legend Bar */}
      <div className="absolute bottom-4 right-4 z-20 rounded-lg bg-[#070d18]/95 border border-slate-800 p-3 backdrop-blur-md font-mono text-[10px] text-slate-300 space-y-1.5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-slate-400 font-semibold">
          <span>CALIBRATED RADAR SPECTRUM</span>
          <span className="text-cyan-400 text-[9px]">L-BAND γ⁰</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          <span>Smooth Surface Water (γ⁰ HH ≤ -16.4 dB)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span>Volumetric Mangrove Forest (RVI ≥ 0.65)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
          <span>Inundation Log-Ratio Loss (Δ ≤ -1.5 dB)</span>
        </div>
      </div>
    </div>
  );
};
