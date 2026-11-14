"use client";

import React, { useState } from "react";
import {
  Waves,
  TreePine,
  Fish,
  AlertOctagon,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Info,
  CheckCircle2,
  Droplets,
} from "lucide-react";
import { NAGAPATTINAM_STUDY_AREA } from "@/lib/mockData";

export const CoastalIntelligenceView: React.FC = () => {
  const [selectedSubzone, setSelectedSubzone] = useState<string>("Muthupet");

  const subzones = [
    {
      id: "Muthupet",
      name: "Muthupet Mangrove Wetland",
      classification: "Protected Coastal Mangrove Reserve",
      waterCoverHa: 12400,
      mangroveDensity: "High (Avicennia marina dominant)",
      threatLevel: "MODERATE",
      salinityPpt: 32.4,
      vulnerabilityFactors: "Upstream freshwater reduction; cyclone storm surges",
    },
    {
      id: "PointCalimere",
      name: "Point Calimere Wildlife & Bird Sanctuary",
      classification: "Ramsar Site Wetland",
      waterCoverHa: 17200,
      mangroveDensity: "Salt Marsh & Intertidal Mudflats",
      threatLevel: "LOW",
      salinityPpt: 38.1,
      vulnerabilityFactors: "Seasonal hypersalinity; extreme summer evaporation",
    },
    {
      id: "CauveryDeltaMouth",
      name: "Cauvery Delta Estuarine Mouth",
      classification: "Active Riverine Estuary & Coastal Barrier",
      waterCoverHa: 5220,
      mangroveDensity: "Sparse Riparian & Dune Vegetation",
      threatLevel: "HIGH",
      salinityPpt: 26.5,
      vulnerabilityFactors: "Coastal erosion; seawater intrusion into freshwater aquifers",
    },
  ];

  const currentZone = subzones.find((z) => z.id === selectedSubzone) || subzones[0];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Coastal Ecosystem Intelligence
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                Nagapattinam Littoral Zone
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Ecosystem Vulnerability, Mangrove Health & Hydrology Monitoring
            </h2>
            <p className="text-xs text-slate-400">
              Correlating synthetic aperture radar backscatter indices (RVI, BDD) with
              ecological indicators and salinity gradients.
            </p>
          </div>
        </div>
      </div>

      {/* Subzone Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {subzones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedSubzone(zone.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedSubzone === zone.id
                ? "bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent"
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>

      {/* Subzone Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ecological Overview Card */}
        <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Ecological Classification
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                currentZone.threatLevel === "HIGH"
                  ? "bg-red-950 text-red-400 border border-red-800"
                  : currentZone.threatLevel === "MODERATE"
                  ? "bg-amber-950 text-amber-400 border border-amber-800"
                  : "bg-emerald-950 text-emerald-400 border border-emerald-800"
              }`}
            >
              Vulnerability: {currentZone.threatLevel}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Ecosystem Type</span>
              <p className="text-slate-200 font-semibold mt-0.5">{currentZone.classification}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Vegetation / Canopy</span>
              <p className="text-slate-200 mt-0.5">{currentZone.mangroveDensity}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Current Inundation Area</span>
              <p className="text-cyan-400 font-semibold mt-0.5">
                {currentZone.waterCoverHa.toLocaleString()} ha
              </p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Estuarine Salinity</span>
              <p className="text-slate-200 mt-0.5">{currentZone.salinityPpt} PSU (Practical Salinity Units)</p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block">
              Key Stressors
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {currentZone.vulnerabilityFactors}
            </p>
          </div>
        </div>

        {/* Radar Bio-physical Indicators */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Microwave Radar Biophysical Indicators
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Radar Vegetation Index (RVI)</span>
                <TreePine className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">0.68</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                RVI = 4*HV / (HH + HV). Values &gt; 0.6 indicate dense, multi-layered mangrove canopy with significant volumetric scattering.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Bitemporal Dual-Pol Water Index</span>
                <Droplets className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">0.84</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                High confidence threshold separating specular open water channels from flooded mudflats.
              </p>
            </div>
          </div>

          {/* Scientific Disclaimer Card */}
          <div className="rounded-lg bg-amber-950/20 border border-amber-800/40 p-4 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Scientific Caveat: Wind Surface Roughness & Tidal Synchronization</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Microwave backscatter over coastal estuaries varies with surface capillary waves generated by wind speeds exceeding 5 m/s. All water extent measurements in this module are checked against regional coastal meteorological stations and tidal models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
