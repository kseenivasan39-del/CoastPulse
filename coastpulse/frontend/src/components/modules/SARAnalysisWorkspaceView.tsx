"use client";

import React, { useState } from "react";
import {
  Layers,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Maximize2,
  Download,
  Info,
} from "lucide-react";
import { SAMPLE_SAR_GRANULES } from "@/lib/mockData";
import { SARGranule, Polarization } from "@/types";

export const SARAnalysisWorkspaceView: React.FC<{ initialGranule?: SARGranule }> = ({
  initialGranule,
}) => {
  const [granule, setGranule] = useState<SARGranule>(
    initialGranule || SAMPLE_SAR_GRANULES[0]
  );
  const [selectedPol, setSelectedPol] = useState<Polarization>("HH");
  const [contrastThreshold, setContrastThreshold] = useState<number>(-16); // dB threshold for surface water
  const [speckleFilter, setSpeckleFilter] = useState<string>("Quegan-Yu 5x5");
  const [layerWaterMask, setLayerWaterMask] = useState<boolean>(true);
  const [layerMangroveCanopy, setLayerMangroveCanopy] = useState<boolean>(true);
  const [layerGrid, setLayerGrid] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processSuccess, setProcessSuccess] = useState<boolean>(false);

  const handleRunProcessing = () => {
    setIsProcessing(true);
    setProcessSuccess(false);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessSuccess(true);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header & Scene Selector */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                SAR Radiometric Analysis Workspace
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                γ⁰ dB Radiometric Space
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-mono">{granule.id}</h2>
            <p className="text-xs text-slate-400">
              {granule.mission} • {granule.band}-band ({granule.centerFrequencyGhz} GHz) •{" "}
              {granule.orbitPass} (Track {granule.relativeOrbit}) • Look Angle: {granule.centerIncidenceAngleDeg}°
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={granule.id}
              onChange={(e) => {
                const found = SAMPLE_SAR_GRANULES.find((g) => g.id === e.target.value);
                if (found) setGranule(found);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              {SAMPLE_SAR_GRANULES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.id.substring(0, 32)}...
                </option>
              ))}
            </select>

            <button
              onClick={handleRunProcessing}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isProcessing ? "Calibrating..." : "Execute Filtering"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Controls & Parameters */}
        <div className="space-y-5 rounded-xl border border-slate-800 bg-[#0a1122] p-5">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Radiometric Controls</span>
          </h3>

          {/* Polarization Selector */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Channel Polarization</label>
            <div className="grid grid-cols-2 gap-2">
              {granule.polarizations.map((pol) => (
                <button
                  key={pol}
                  onClick={() => setSelectedPol(pol as Polarization)}
                  className={`py-2 rounded text-xs font-mono font-medium border ${
                    selectedPol === pol
                      ? "bg-cyan-950 text-cyan-300 border-cyan-600"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {pol} {pol === "HH" ? "(Co-pol)" : "(Cross-pol)"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedPol === "HH"
                ? "Optimal for specular surface water & double-bounce flooded trunks."
                : "Sensitive to volumetric canopy scattering in Muthupet mangrove forest."}
            </p>
          </div>

          {/* Adaptive Water Delineation Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Water Threshold (γ⁰ dB)</span>
              <span className="text-cyan-400 font-mono font-bold">{contrastThreshold} dB</span>
            </div>
            <input
              type="range"
              min="-28"
              max="-10"
              step="0.5"
              value={contrastThreshold}
              onChange={(e) => setContrastThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Deep Inundation (-28 dB)</span>
              <span>Turbid/Rough (-10 dB)</span>
            </div>
          </div>

          {/* Multi-temporal Speckle Filter */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Speckle Suppression</label>
            <select
              value={speckleFilter}
              onChange={(e) => setSpeckleFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Quegan-Yu 5x5">Quegan-Yu Multi-Temporal (ENL 4.8)</option>
              <option value="Refined Lee 7x7">Refined Lee Filter (Preserve Edges)</option>
              <option value="Frost 5x5">Frost Exponential Adaptive Filter</option>
              <option value="Raw Unfiltered">None (Raw Single-Look Radar Speckle)</option>
            </select>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
              Layer Overlays
            </span>
            <div className="space-y-2">
              {[
                { label: "Surface Water Mask", state: layerWaterMask, set: setLayerWaterMask },
                {
                  label: "Mangrove RVI Mask",
                  state: layerMangroveCanopy,
                  set: setLayerMangroveCanopy,
                },
                { label: "WGS84 Coordinate Grid", state: layerGrid, set: setLayerGrid },
              ].map((layer, idx) => (
                <div
                  key={idx}
                  onClick={() => layer.set(!layer.state)}
                  className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 text-xs"
                >
                  <span className="text-slate-300">{layer.label}</span>
                  {layer.state ? (
                    <Eye className="h-3.5 w-3.5 text-cyan-400" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {processSuccess && (
            <div className="rounded-lg bg-emerald-950/40 border border-emerald-800 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Radiometric calibration updated with threshold {contrastThreshold} dB.</span>
            </div>
          )}
        </div>

        {/* Center/Right 3 Cols: High Precision Interactive SAR Canvas */}
        <div className="lg:col-span-3 rounded-xl border border-slate-800 bg-[#070c18] flex flex-col justify-between overflow-hidden relative min-h-[500px]">
          {/* Canvas Top Bar */}
          <div className="p-4 bg-[#0a1122]/90 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-semibold">
                Viewing: {granule.band}-band ({selectedPol})
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">Filter: {speckleFilter}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                10m GCOV Pixel
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                Calibrated
              </span>
            </div>
          </div>

          {/* Interactive Simulated SAR Raster Visualizer */}
          <div className="relative flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Visual Representation of Radar Delta Footprint */}
            <div className="relative w-full max-w-xl aspect-[4/3] rounded-lg border border-slate-700 bg-slate-950 overflow-hidden shadow-2xl flex flex-col justify-between p-6">
              {/* Radar Coordinate Grid */}
              {layerGrid && (
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none border border-cyan-500/10">
                  <span className="text-[9px] font-mono text-cyan-500/40 p-1">11.4°N, 79.6°E</span>
                  <span className="text-[9px] font-mono text-cyan-500/40 p-1 text-right col-start-4">
                    11.4°N, 80.1°E
                  </span>
                  <span className="text-[9px] font-mono text-cyan-500/40 p-1 self-end row-start-4">
                    10.2°N, 79.6°E
                  </span>
                  <span className="text-[9px] font-mono text-cyan-500/40 p-1 self-end text-right row-start-4 col-start-4">
                    10.2°N, 80.1°E
                  </span>
                </div>
              )}

              {/* Coastal Land-Sea Simulated Backscatter Gradient */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="bg-slate-900/90 border border-slate-700 rounded px-2.5 py-1 text-[11px] font-mono text-slate-300">
                    Nagapattinam Coastline & Bay of Bengal
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    Lambertian Terrain Flattened
                  </div>
                </div>

                {/* Backscatter Legend Bar */}
                <div className="mt-8 p-4 rounded bg-slate-900/80 border border-slate-800 backdrop-blur space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-blue-400">Water Inundation (&le; {contrastThreshold} dB)</span>
                    <span className="text-emerald-400">Vegetation / Mangrove (&gt; -12 dB)</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-700 via-slate-600 to-emerald-500" />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>-28 dB</span>
                    <span>-18 dB</span>
                    <span>-6 dB</span>
                  </div>
                </div>
              </div>

              {/* Status details inside raster */}
              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                <div>
                  <span>Water Mask: </span>
                  <span className={layerWaterMask ? "text-cyan-400" : "text-slate-600"}>
                    {layerWaterMask ? "ENABLED" : "OFF"}
                  </span>
                </div>
                <div>
                  <span>Mangrove RVI: </span>
                  <span className={layerMangroveCanopy ? "text-emerald-400" : "text-slate-600"}>
                    {layerMangroveCanopy ? "ENABLED" : "OFF"}
                  </span>
                </div>
                <div>
                  <span>Target: Point Calimere</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Scientific Parameters */}
          <div className="p-4 bg-[#0a1122] border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div>Equivalent Number of Looks (ENL): 4.8</div>
            <div>Noise Floor (NESZ): -26.5 dB</div>
            <div>Calibration Accuracy: ±0.6 dB</div>
            <div>Incidence Geometry: Ascending (37.35°)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
