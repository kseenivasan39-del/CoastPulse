"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import {
  Globe,
  Compass,
  Layers,
  ChevronDown,
  Navigation,
  Crosshair,
  Maximize2,
  Plus,
  Minus,
  Sparkles,
  Search,
  Filter,
  Radio,
  Eye,
  Calendar,
} from "lucide-react";
import { GLOBAL_COASTAL_OBSERVATORIES, CoastalLocation } from "@/lib/geoUtils";

interface GlobalObservatoryMapProps {
  selectedLocation: CoastalLocation | null;
  onSelectLocation: (loc: CoastalLocation) => void;
  onCustomAoiDrawn?: (bbox: [number, number, number, number]) => void;
}

export type BasemapMode = "highres" | "nasa-gibs-live" | "nasa-night-lights";

export const GlobalObservatoryMap: React.FC<GlobalObservatoryMapProps> = ({
  selectedLocation,
  onSelectLocation,
  onCustomAoiDrawn,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [coords, setCoords] = useState<[number, number]>([0, 20]);
  const [zoomLevel, setZoomLevel] = useState<number>(2.0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [basemapMode, setBasemapMode] = useState<BasemapMode>("highres");
  const [showBasemapDropdown, setShowBasemapDropdown] = useState(false);

  // Filtered coastal observatories
  const filteredObservatories = GLOBAL_COASTAL_OBSERVATORIES.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Maximize parallel tile fetching for fast caching across NASA GIBS and Esri
    if (typeof window !== "undefined" && maplibregl.config) {
      maplibregl.config.WORKER_URL = "/maplibre-gl-worker.mjs";
      maplibregl.config.MAX_PARALLEL_IMAGE_REQUESTS = 32;
      maplibregl.config.MAX_TILE_CACHE_ZOOM_LEVELS = 10;
    }

    // Compute yesterday's date in UTC for full global daylight satellite mosaic
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "esri-satellite": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics",
        },
        "nasa-gibs-live": {
          type: "raster",
          tiles: [
            `https://gibs-a.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${yesterdayDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
            `https://gibs-b.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${yesterdayDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
            `https://gibs-c.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${yesterdayDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
          ],
          tileSize: 256,
          attribution: "NASA Global Imagery Browse Services (GIBS)",
          maxzoom: 9,
        },
        "nasa-night-lights": {
          type: "raster",
          tiles: [
            "https://gibs-a.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
            "https://gibs-b.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
            "https://gibs-c.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
          ],
          tileSize: 256,
          attribution: "NASA Earth Observatory (VIIRS Black Marble)",
          maxzoom: 8,
        },
        "esri-reference-labels": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
            "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "highres-layer",
          type: "raster",
          source: "esri-satellite",
          minzoom: 0,
          maxzoom: 19,
          layout: { visibility: "visible" },
          paint: {
            "raster-fade-duration": 0,
          },
        },
        {
          id: "nasa-gibs-layer",
          type: "raster",
          source: "nasa-gibs-live",
          minzoom: 0,
          maxzoom: 19,
          layout: { visibility: "none" },
          paint: {
            "raster-fade-duration": 0,
          },
        },
        {
          id: "nasa-night-layer",
          type: "raster",
          source: "nasa-night-lights",
          minzoom: 0,
          maxzoom: 19,
          layout: { visibility: "none" },
          paint: {
            "raster-fade-duration": 0,
          },
        },
        {
          id: "reference-labels",
          type: "raster",
          source: "esri-reference-labels",
          minzoom: 1,
          maxzoom: 19,
          paint: {
            "raster-opacity": 0.85,
            "raster-fade-duration": 0,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: selectedLocation ? selectedLocation.coordinates : [20, 15],
      zoom: selectedLocation ? 9.5 : 2.2,
      attributionControl: false,
    });

    map.on("error", (e: any) => {
      if (e?.error?.message?.includes("fetch") || e?.error?.status === 0 || e?.error?.status === 404) {
        return;
      }
    });

    map.on("load", () => {
      setMapLoaded(true);

      // Add Global Observatory Sites GeoJSON
      const features = GLOBAL_COASTAL_OBSERVATORIES.map((loc) => ({
        type: "Feature" as const,
        properties: {
          name: loc.name,
          category: loc.category,
          country: loc.country,
        },
        geometry: {
          type: "Point" as const,
          coordinates: loc.coordinates,
        },
      }));

      map.addSource("global-observatories", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
      });

      // Outer Pulsing Glow Circle
      map.addLayer({
        id: "observatory-glow",
        type: "circle",
        source: "global-observatories",
        paint: {
          "circle-radius": 14,
          "circle-color": "#00e5ff",
          "circle-opacity": 0.25,
          "circle-blur": 0.8,
        },
      });

      // Core Station Marker Circle
      map.addLayer({
        id: "observatory-points",
        type: "circle",
        source: "global-observatories",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff8c2b",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Add AOI Bounding Boxes Source
      const bboxFeatures = GLOBAL_COASTAL_OBSERVATORIES.map((loc) => ({
        type: "Feature" as const,
        properties: { name: loc.name },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [loc.bbox[0], loc.bbox[1]],
              [loc.bbox[2], loc.bbox[1]],
              [loc.bbox[2], loc.bbox[3]],
              [loc.bbox[0], loc.bbox[3]],
              [loc.bbox[0], loc.bbox[1]],
            ],
          ],
        },
      }));

      map.addSource("global-bboxes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: bboxFeatures,
        },
      });

      map.addLayer({
        id: "global-bboxes-line",
        type: "line",
        source: "global-bboxes",
        paint: {
          "line-color": "#00e5ff",
          "line-width": 1.5,
          "line-dasharray": [3, 2],
        },
      });

      map.addLayer({
        id: "global-bboxes-fill",
        type: "fill",
        source: "global-bboxes",
        paint: {
          "fill-color": "#00e5ff",
          "fill-opacity": 0.05,
        },
      });

      map.on("click", "observatory-points", (e) => {
        if (!e.features || !e.features[0]) return;
        const name = e.features[0].properties?.name;
        const match = GLOBAL_COASTAL_OBSERVATORIES.find((l) => l.name === name);
        if (match) {
          onSelectLocation(match);
        }
      });

      map.on("mouseenter", "observatory-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "observatory-points", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    map.on("mousemove", (e) => {
      setCoords([e.lngLat.lng, e.lngLat.lat]);
    });

    map.on("zoom", () => {
      setZoomLevel(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Layer Visibility on mode switch
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    if (map.getLayer("highres-layer")) {
      map.setLayoutProperty("highres-layer", "visibility", basemapMode === "highres" ? "visible" : "none");
    }
    if (map.getLayer("nasa-gibs-layer")) {
      map.setLayoutProperty("nasa-gibs-layer", "visibility", basemapMode === "nasa-gibs-live" ? "visible" : "none");
    }
    if (map.getLayer("nasa-night-layer")) {
      map.setLayoutProperty("nasa-night-layer", "visibility", basemapMode === "nasa-night-lights" ? "visible" : "none");
    }
  }, [basemapMode, mapLoaded]);

  // Fly to selected location when changed
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;
    mapRef.current.flyTo({
      center: selectedLocation.coordinates,
      zoom: 9.8,
      essential: true,
      duration: 1800,
    });
  }, [selectedLocation]);

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden select-none bg-[#02050b]">
      {/* MapLibre GL Canvas */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* 1. Global View Header Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="px-3.5 py-2 rounded-xl bg-[#060c18]/90 backdrop-blur-md border border-[#14233c] shadow-2xl flex items-center gap-3 text-xs">
          <Globe className="w-4 h-4 text-[#00e5ff] animate-spin-slow" />
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-xs">COASTPULSE GLOBAL EXPLORER</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {GLOBAL_COASTAL_OBSERVATORIES.length} Verified Coastal Observatories Active
            </span>
          </div>
        </div>

        {/* Global Location Quick Switcher */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#060c18]/90 backdrop-blur-md border border-[#14233c] shadow-xl text-xs text-slate-200">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter delta, wetland, country..."
              className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-48 font-mono"
            />
          </div>

          {searchQuery && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-[#060c18] border border-[#14233c] rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
              {filteredObservatories.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    onSelectLocation(loc);
                    setSearchQuery("");
                  }}
                  className="w-full text-left p-2.5 hover:bg-[#0c182c] border-b border-[#101b2f] flex flex-col transition-colors"
                >
                  <span className="font-bold text-xs text-white">{loc.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {loc.country} · {loc.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top-Right Real-Time Basemap Switcher */}
      <div className="absolute top-4 right-16 z-20">
        <div className="relative">
          <button
            onClick={() => setShowBasemapDropdown(!showBasemapDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#060c18]/90 backdrop-blur-md border border-[#14233c] hover:border-[#00e5ff]/50 shadow-xl text-xs text-slate-200 transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
            <span className="font-semibold">
              {basemapMode === "highres" && "High-Res Basemap (Esri/Maxar)"}
              {basemapMode === "nasa-gibs-live" && "Live NASA GIBS (Today's Feed)"}
              {basemapMode === "nasa-night-lights" && "VIIRS Night Lights (NASA)"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showBasemapDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-[#060c18] border border-[#14233c] rounded-xl shadow-2xl p-2 z-30 space-y-1 backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select Planetary View Source
              </div>

              {/* Option 1: High-Res Basemap */}
              <button
                onClick={() => {
                  setBasemapMode("highres");
                  setShowBasemapDropdown(false);
                }}
                className={`w-full text-left p-2 rounded-lg flex flex-col transition-colors ${
                  basemapMode === "highres" ? "bg-[#0f1d38] border border-[#00e5ff]/40 text-[#00e5ff]" : "text-slate-300 hover:bg-[#0c182c]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">High-Res Basemap</span>
                  <span className="text-[10px] font-mono text-slate-400">Maxar / Esri</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">Sub-meter optical clarity for coastal features</span>
              </button>

              {/* Option 2: Live NASA GIBS */}
              <button
                onClick={() => {
                  setBasemapMode("nasa-gibs-live");
                  setShowBasemapDropdown(false);
                }}
                className={`w-full text-left p-2 rounded-lg flex flex-col transition-colors ${
                  basemapMode === "nasa-gibs-live" ? "bg-[#181109] border border-[#ff8c2b] text-[#ff8c2b]" : "text-slate-300 hover:bg-[#0c182c]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ff8c2b] animate-ping" />
                    NASA GIBS Live Daily
                  </span>
                  <span className="text-[10px] font-mono text-[#ff8c2b]">Real-Time</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">Updated within 3–4 hours of orbital overflight</span>
              </button>

              {/* Option 3: NASA VIIRS Night Lights */}
              <button
                onClick={() => {
                  setBasemapMode("nasa-night-lights");
                  setShowBasemapDropdown(false);
                }}
                className={`w-full text-left p-2 rounded-lg flex flex-col transition-colors ${
                  basemapMode === "nasa-night-lights" ? "bg-[#0f1d38] border border-[#00e5ff]/40 text-[#00e5ff]" : "text-slate-300 hover:bg-[#0c182c]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">VIIRS Night Lights</span>
                  <span className="text-[10px] font-mono text-slate-400">NASA EarthData</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">Coastal urban illumination & marine vessel lights</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Left GIS Drawing Toolbar */}
      <div className="absolute top-20 left-4 z-10 flex flex-col gap-1 p-1 rounded-xl bg-[#060c18]/90 backdrop-blur-md border border-[#14233c] shadow-xl">
        <button
          onClick={() => mapRef.current?.flyTo({ center: [20, 15], zoom: 2.2 })}
          title="World View"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <Globe className="w-4 h-4 text-[#00e5ff]" />
        </button>
        <button
          onClick={() => {
            const loc = GLOBAL_COASTAL_OBSERVATORIES[1]; // Florida Everglades
            onSelectLocation(loc);
          }}
          title="Go to Florida Everglades"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <div className="text-[9px] font-black text-[#ff8c2b]">USA</div>
        </button>
        <button
          onClick={() => {
            const loc = GLOBAL_COASTAL_OBSERVATORIES[2]; // Mekong Delta
            onSelectLocation(loc);
          }}
          title="Go to Mekong Delta, Vietnam"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <div className="text-[9px] font-black text-[#ff8c2b]">VNM</div>
        </button>
        <button
          onClick={() => {
            const loc = GLOBAL_COASTAL_OBSERVATORIES[3]; // Wadden Sea
            onSelectLocation(loc);
          }}
          title="Go to Wadden Sea, Netherlands / Germany"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <div className="text-[9px] font-black text-[#ff8c2b]">EUR</div>
        </button>
        <div className="h-px w-full bg-[#18263e]" />
        <button
          onClick={() => {
            const loc = GLOBAL_COASTAL_OBSERVATORIES[8]; // Nagapattinam
            onSelectLocation(loc);
          }}
          title="Demonstration Study: Nagapattinam"
          className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-[#101b2f] transition-colors"
        >
          <div className="text-[9px] font-mono font-bold text-cyan-400">DEMO</div>
        </button>
      </div>

      {/* 4. Right Map Navigation Stack */}
      <div className="absolute top-20 right-4 z-10 flex flex-col gap-1 p-1 rounded-xl bg-[#060c18]/90 backdrop-blur-md border border-[#14233c] shadow-xl">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="h-px w-full bg-[#18263e]" />
        <button
          onClick={() => mapRef.current?.resetNorth()}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <Navigation className="w-4 h-4 text-rose-500 fill-current -rotate-45" />
        </button>
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* 5. Bottom Coordinates & Telemetry HUD */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-lg bg-[#060c18]/90 backdrop-blur-md border border-[#14233c] text-[10px] font-mono text-slate-300">
        <Globe className="w-3.5 h-3.5 text-[#00e5ff]" />
        <span>
          {basemapMode === "highres" && "STATIC HIGH-RESOLUTION IMAGERY (MAXAR/ESRI)"}
          {basemapMode === "nasa-gibs-live" && "LIVE DAILY OBSERVATION STREAM (NASA GIBS / MODIS)"}
          {basemapMode === "nasa-night-lights" && "NIGHT-TIME ILLUMINATION FEED (NASA VIIRS DNB)"}
        </span>
      </div>

      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-3 px-3 py-1 rounded-lg bg-[#060c18]/90 backdrop-blur-md border border-[#14233c] text-[11px] font-mono text-slate-300">
        <span>
          {coords[0].toFixed(4)}° {coords[0] >= 0 ? "E" : "W"},{" "}
          {coords[1].toFixed(4)}° {coords[1] >= 0 ? "N" : "S"}
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-[#00e5ff] font-bold">Zoom {zoomLevel.toFixed(1)}</span>
      </div>
    </div>
  );
};
