"use client";

import React, { useState } from "react";
import {
  Download,
  Layers,
  FileCode,
  FileSpreadsheet,
  Globe,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { LAYER_REGISTRY, LayerDefinition } from "@/lib/layerSystem";

interface GisExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GisExportModal: React.FC<GisExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<"geojson" | "geotiff" | "shapefile" | "csv">("geojson");
  const [selectedLayerId, setSelectedLayerId] = useState<string>("nisar-hh");
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentLayer = LAYER_REGISTRY.find((l) => l.id === selectedLayerId) || LAYER_REGISTRY[0];

  const handleExport = () => {
    setDownloading(true);

    if (selectedFormat === "geojson") {
      // Export genuine geojson feature collection
      const geojson = {
        type: "FeatureCollection",
        metadata: {
          layer_id: currentLayer.id,
          layer_name: currentLayer.name,
          crs: currentLayer.crs || "EPSG:4326",
          source_product: currentLayer.sourceProductId,
          exported_at: new Date().toISOString(),
        },
        features: [
          {
            type: "Feature",
            properties: {
              name: currentLayer.name,
              sensor: currentLayer.sensor,
              polarization: currentLayer.polarization || "HH",
              units: currentLayer.units || "dB",
              resolution_m: currentLayer.resolutionM || 10,
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [79.599096, 11.400453],
                  [80.099327, 11.400453],
                  [80.099327, 10.200016],
                  [79.599096, 10.200016],
                  [79.599096, 11.400453],
                ],
              ],
            },
          },
        ],
      };

      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CoastPulse_${currentLayer.id}_EPSG4326.geojson`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else if (selectedFormat === "csv") {
      // Direct CSV export from backend statistics endpoint
      window.open("http://127.0.0.1:8000/api/v1/reports/export/statistics.csv", "_blank");
    } else {
      // Direct Georeferenced Raster PNG / TIFF asset download
      const a = document.createElement("a");
      a.href = currentLayer.sourceUrl;
      a.download = `CoastPulse_${currentLayer.id}_georeferenced.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => {
      setDownloading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#070e1c] border border-[#162947] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#050b16]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">GIS Data & Vector Export</h3>
              <p className="text-[11px] text-slate-400">Export calibrated scientific layers for QGIS / ArcGIS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#101b2f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Layer Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Select Scientific Layer to Export</label>
            <select
              value={selectedLayerId}
              onChange={(e) => setSelectedLayerId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0b1424] border border-[#182a46] text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-sans"
            >
              {LAYER_REGISTRY.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name} ({layer.sensor})
                </option>
              ))}
            </select>
          </div>

          {/* Format Picker Cards */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Choose Target GIS Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormat("geojson")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedFormat === "geojson"
                    ? "bg-[#181109] border-[#ff8c2b] text-white shadow-[0_0_12px_rgba(255,140,43,0.25)]"
                    : "bg-[#0b1424] border-[#182a46] text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCode className="w-4 h-4 text-[#ff8c2b] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">GeoJSON</div>
                  <div className="text-[10px] text-slate-400">Vector bounding polygon & metadata attributes</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat("geotiff")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedFormat === "geotiff"
                    ? "bg-[#0c1a32] border-cyan-400 text-white shadow-[0_0_12px_rgba(0,229,255,0.25)]"
                    : "bg-[#0b1424] border-[#182a46] text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">Georeferenced Raster</div>
                  <div className="text-[10px] text-slate-400">Float32 / Gamma0 calibrated bounds</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat("csv")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedFormat === "csv"
                    ? "bg-[#0c1a32] border-emerald-400 text-white shadow-[0_0_12px_rgba(52,211,153,0.25)]"
                    : "bg-[#0b1424] border-[#182a46] text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">Zonal CSV Stats</div>
                  <div className="text-[10px] text-slate-400">Tabular backscatter & water metrics</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat("shapefile")}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedFormat === "shapefile"
                    ? "bg-[#181109] border-[#ff8c2b] text-white shadow-[0_0_12px_rgba(255,140,43,0.25)]"
                    : "bg-[#0b1424] border-[#182a46] text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">OGC WGS84</div>
                  <div className="text-[10px] text-slate-400">EPSG:4326 Coordinate system</div>
                </div>
              </button>
            </div>
          </div>

          {/* Coordinate System Info */}
          <div className="p-3 rounded-xl bg-[#0c1628] border border-[#162742] text-[10px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold">CRS Reference: EPSG:4326 (WGS 84 / Geographic)</div>
            <div>Spatial Extent: [79.599°E - 80.099°E, 10.200°N - 11.400°N]</div>
            <div>Pixel Size: 170.9m native NISAR L2 GCOV grid</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#14233c] bg-[#050b16] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={downloading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all active:scale-[0.98] cursor-pointer"
          >
            {success ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Dataset Package</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
