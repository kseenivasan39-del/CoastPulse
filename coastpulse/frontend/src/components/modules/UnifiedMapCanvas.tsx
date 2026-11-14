"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Layers,
  ChevronDown,
  Navigation,
  Sparkles,
} from "lucide-react";

interface UnifiedMapCanvasProps {
  onPixelClick: (lat: number, lon: number) => void;
  inspectedPixel: any;
}

export const UnifiedMapCanvas: React.FC<UnifiedMapCanvasProps> = ({
  onPixelClick,
  inspectedPixel,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coords, setCoords] = useState<[number, number]>([79.8433, 10.7670]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (typeof window !== "undefined" && maplibregl.config) {
      maplibregl.config.WORKER_URL = "/maplibre-gl-worker.mjs";
    }

    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "esri-satellite": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, Earthstar Geographics",
        },
      },
      layers: [
        {
          id: "satellite-layer",
          type: "raster",
          source: "esri-satellite",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: [79.8433, 10.7670],
      zoom: 9.8,
      attributionControl: false,
    });

    map.on("load", () => {
      setMapLoaded(true);

      // 1. Nagapattinam AOI Polygon boundary outline
      map.addSource("district-boundary", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { name: "Nagapattinam District" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [79.80, 11.25],
                [79.85, 11.15],
                [79.82, 10.95],
                [79.86, 10.76],
                [79.84, 10.50],
                [79.85, 10.28],
                [79.52, 10.30],
                [79.50, 10.42],
                [79.62, 10.55],
                [79.70, 10.75],
                [79.65, 11.00],
                [79.72, 11.20],
                [79.80, 11.25],
              ],
            ],
          },
        },
      });

      // Line glow
      map.addLayer({
        id: "district-glow",
        type: "line",
        source: "district-boundary",
        paint: {
          "line-color": "#ffffff",
          "line-width": 2,
          "line-dasharray": [4, 2],
        },
      });

      // 2. Add NISAR change raster overlay
      map.addSource("nisar-processed-change", {
        type: "image",
        url: "/data/processed/authoritative_change_visualization.png",
        coordinates: [
          [79.599096, 11.400453],
          [80.099327, 11.400453],
          [80.099327, 10.200016],
          [79.599096, 10.200016],
        ],
      });

      map.addLayer({
        id: "nisar-change-layer",
        type: "raster",
        source: "nisar-processed-change",
        paint: {
          "raster-opacity": 0.85,
        },
      });
    });

    map.on("mousemove", (e) => {
      setCoords([e.lngLat.lng, e.lngLat.lat]);
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

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden select-none bg-[#03060c]">
      {/* Underlying WebGL Map */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* 1. Top Bounding Box Header Pill */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
        <div className="px-3.5 py-1.5 rounded-xl bg-[#070b13]/85 backdrop-blur-md border border-[#16233a] shadow-xl flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2 h-2 rounded-full border border-white" />
            <span className="font-bold">AOI: Nagapattinam District Coastal Delta</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-slate-400 font-mono text-[11px]">
            Area: <span className="text-slate-200 font-bold">7,255.78 km²</span>
          </div>
        </div>
      </div>

      {/* 2. Top-Right Basemap Selector */}
      <div className="absolute top-3 right-4 z-10">
        <div className="px-3 py-1.5 rounded-xl bg-[#070b13]/85 backdrop-blur-md border border-[#16233a] shadow-xl flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
          <Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="font-semibold">Satellite (True Color)</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* 3. Left Floating GIS Toolbar */}
      <div className="absolute top-16 left-4 z-10 flex flex-col gap-1 p-1 rounded-xl bg-[#070b13]/90 backdrop-blur-md border border-[#16233a] shadow-xl">
        <button className="p-2 rounded-lg bg-[#ff7b1a] text-black hover:bg-[#ff943d] transition-all shadow-md">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M4 0l16 12-7 1.5 4 8.5-3 1.5-4-8.5-4 4.5z" />
          </svg>
        </button>
        <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#121c2e] transition-colors">
          <div className="w-4 h-4 border-2 border-dashed border-current rounded-sm" />
        </button>
        <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#121c2e] transition-colors">
          <div className="w-4 h-4 border-2 border-current rounded-full" />
        </button>
        <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#121c2e] transition-colors">
          <div className="w-4 h-4 border-l-2 border-b-2 border-current" />
        </button>
        <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#121c2e] transition-colors">
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Right Floating Map Nav Controls */}
      <div className="absolute top-16 right-4 z-10 flex flex-col gap-1 p-1 rounded-xl bg-[#070b13]/90 backdrop-blur-md border border-[#16233a] shadow-xl">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#121c2e] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#121c2e] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px w-full bg-[#18263e]" />
        <button
          onClick={() => mapRef.current?.resetNorth()}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#121c2e] transition-colors"
        >
          <Navigation className="w-4 h-4 text-[#ff7b1a]" />
        </button>
      </div>

      {/* 5. Center District Label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
        <span className="font-extrabold text-sm md:text-base tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase font-sans">
          Nagapattinam<br />District
        </span>
      </div>

      {/* 6. Bottom Scale & Coordinates Bar */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-lg bg-[#070b13]/85 backdrop-blur-md border border-[#16233a] text-[10px] font-mono text-slate-300">
        <span className="font-bold">0 5 10 20 km</span>
        <div className="w-16 h-1 bg-white/80 rounded" />
      </div>

      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-3 px-3 py-1 rounded-lg bg-[#070b13]/85 backdrop-blur-md border border-[#16233a] text-[11px] font-mono text-slate-300">
        <span>{coords[0].toFixed(4)}° E, {coords[1].toFixed(4)}° N</span>
        <span className="text-slate-500">|</span>
        <span className="text-[#00e5ff] font-bold">EPSG:4326</span>
      </div>
    </div>
  );
};
