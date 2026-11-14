"use client";

import React, { useState } from "react";
import {
  Satellite,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  ShieldCheck,
} from "lucide-react";
import { SAMPLE_SAR_GRANULES } from "@/lib/mockData";
import { SARGranule, RadarBand, OrbitPass } from "@/types";

export const SatelliteExplorerView: React.FC<{
  onSelectForAnalysis: (granule: SARGranule) => void;
}> = ({ onSelectForAnalysis }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBand, setSelectedBand] = useState<RadarBand | "ALL">("ALL");
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitPass | "ALL">("ALL");
  const [selectedGranule, setSelectedGranule] = useState<SARGranule>(
    SAMPLE_SAR_GRANULES[0]
  );
  const [copiedSha, setCopiedSha] = useState(false);

  const filteredGranules = SAMPLE_SAR_GRANULES.filter((g) => {
    const matchesSearch =
      g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.mission.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBand = selectedBand === "ALL" || g.band === selectedBand;
    const matchesOrbit = selectedOrbit === "ALL" || g.orbitPass === selectedOrbit;
    return matchesSearch && matchesBand && matchesOrbit;
  });

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Granule ID, Mission, Track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Band Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Band:</span>
              {(["ALL", "L", "S", "C"] as const).map((band) => (
                <button
                  key={band}
                  onClick={() => setSelectedBand(band)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium border ${
                    selectedBand === band
                      ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300"
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>

            {/* Orbit Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Orbit:</span>
              {(["ALL", "ASCENDING", "DESCENDING"] as const).map((orbit) => (
                <button
                  key={orbit}
                  onClick={() => setSelectedOrbit(orbit)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium border ${
                    selectedOrbit === orbit
                      ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300"
                  }`}
                >
                  {orbit === "ALL" ? "ALL" : orbit === "ASCENDING" ? "ASC" : "DESC"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Granule List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>Showing {filteredGranules.length} verified granules over Nagapattinam</span>
            <span>Target Datum: WGS84 / EPSG:4326</span>
          </div>

          <div className="space-y-3">
            {filteredGranules.map((granule) => {
              const isSelected = selectedGranule.id === granule.id;
              return (
                <div
                  key={granule.id}
                  onClick={() => setSelectedGranule(granule)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-cyan-500/70 bg-[#0c162d] shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      : "border-slate-800 bg-[#0a1122]/70 hover:border-slate-700 hover:bg-[#0c152a]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-cyan-200 font-mono">
                          {granule.id}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {granule.productType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">{granule.summary}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-1 rounded bg-slate-900 text-slate-300 text-xs font-mono border border-slate-800">
                        {granule.band}-band ({granule.centerFrequencyGhz} GHz)
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectForAnalysis(granule);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Date:</span>{" "}
                      {new Date(granule.acquisitionDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-slate-500">Orbit:</span> {granule.orbitPass} (Trk {granule.relativeOrbit})
                    </div>
                    <div>
                      <span className="text-slate-500">Pols:</span> {granule.polarizations.join(", ")}
                    </div>
                    <div>
                      <span className="text-slate-500">Angle:</span> {granule.centerIncidenceAngleDeg}°
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Metadata & Provenance Inspector */}
        <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>Granule Provenance Inspector</span>
            </h3>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              HDF5 / GeoTIFF
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Selected Granule ID</span>
              <p className="text-cyan-300 font-semibold break-all mt-0.5">
                {selectedGranule.id}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
              <div>
                <span className="text-slate-400 block text-[10px]">Mission</span>
                <span className="text-white font-medium">{selectedGranule.mission}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Product Level</span>
                <span className="text-white font-medium">{selectedGranule.productType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Carrier Frequency</span>
                <span className="text-white font-medium">
                  {selectedGranule.centerFrequencyGhz} GHz ({selectedGranule.band}-band)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ground Resolution</span>
                <span className="text-white font-medium">{selectedGranule.resolutionM} m</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Incidence Angles</span>
                <span className="text-white font-medium">
                  {selectedGranule.incidenceAngleNearDeg}° – {selectedGranule.incidenceAngleFarDeg}°
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Relative Track</span>
                <span className="text-white font-medium">{selectedGranule.relativeOrbit}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">SHA-256 Checksum (Archive Digest)</span>
                <button
                  onClick={() => handleCopySha(selectedGranule.sourceSha256)}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedSha ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 break-all select-all">
                {selectedGranule.sourceSha256}
              </div>
            </div>

            <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/40 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Radiometrically Terrain Corrected (RTC)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Gamma-nought (γ⁰) flattening applied using Copernicus GLO-30 digital elevation model.
                Ready for physical wetland analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
