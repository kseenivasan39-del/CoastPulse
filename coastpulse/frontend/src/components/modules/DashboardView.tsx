"use client";

import React, { useState } from "react";
import {
  Satellite,
  Activity,
  Layers,
  Waves,
  TreePine,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  NAGAPATTINAM_STUDY_AREA,
  SAMPLE_SAR_GRANULES,
  SAMPLE_PROCESSING_JOBS,
} from "@/lib/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SAMPLE_RADAR_TIMELINE = [
  { date: "2026-03-20", backscatterHH: -12.4, backscatterHV: -19.2, waterIndex: 0.42 },
  { date: "2026-03-26", backscatterHH: -12.1, backscatterHV: -18.9, waterIndex: 0.45 },
  { date: "2026-04-01", backscatterHH: -11.8, backscatterHV: -18.5, waterIndex: 0.48 },
  { date: "2026-04-07", backscatterHH: -12.5, backscatterHV: -19.0, waterIndex: 0.40 },
  { date: "2026-04-13", backscatterHH: -11.5, backscatterHV: -18.1, waterIndex: 0.51 },
];

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({
  onNavigate,
}) => {
  const [selectedGranule, setSelectedGranule] = useState(SAMPLE_SAR_GRANULES[0]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Study Area Overview */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-[#0d162d] via-[#091122] to-[#070d1a] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
              <MapPin className="h-3 w-3 text-cyan-400" />
              <span>Primary Study Area: {NAGAPATTINAM_STUDY_AREA.name}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Nagapattinam Coastal Wetlands & Mangrove Dynamics
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monitoring surface hydrology, salt flat inundation, and mangrove biomass in
              the Cauvery Delta using calibrated NASA-ISRO NISAR L-band and S-band radar backscatter.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-400">
              <span>Total Area: {NAGAPATTINAM_STUDY_AREA.totalAreaHa.toLocaleString()} ha</span>
              <span>•</span>
              <span>Wetland Extent: {NAGAPATTINAM_STUDY_AREA.wetlandAreaHa.toLocaleString()} ha</span>
              <span>•</span>
              <span>Coastal Front: {NAGAPATTINAM_STUDY_AREA.coastalLengthKm} km</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate("explorer")}
              className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-colors"
            >
              <Satellite className="h-4 w-4" />
              <span>Explore Satellite Scenes</span>
            </button>
            <button
              onClick={() => onNavigate("map")}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Layers className="h-4 w-4" />
              <span>Launch Earth Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Available SAR Granules",
            val: SAMPLE_SAR_GRANULES.length.toString(),
            detail: "3 NISAR L/S + 1 Sentinel-1",
            icon: Satellite,
            color: "text-cyan-400",
          },
          {
            label: "Active Processing Tasks",
            val: SAMPLE_PROCESSING_JOBS.length.toString(),
            detail: "1 Completed • 1 Running • 1 Queued",
            icon: Activity,
            color: "text-teal-400",
          },
          {
            label: "Delineated Water Extent",
            val: "34,820 ha",
            detail: "+1,420 ha post-tide fluctuation",
            icon: Waves,
            color: "text-blue-400",
          },
          {
            label: "Mangrove RVI Canopy Health",
            val: "0.68 RVI",
            detail: "L-band Volumetric Scattering",
            icon: TreePine,
            color: "text-emerald-400",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800/80 bg-[#0a1122] p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight">{stat.val}</div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Backscatter Timeline & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Backscatter Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Multi-Temporal Mean Backscatter Profile (γ⁰ dB)</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Nagapattinam Transect
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates calibrated co-polarization (HH) and cross-polarization (HV) gamma-nought backscatter.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-slate-300">γ⁰ HH</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300">γ⁰ HV</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SAMPLE_RADAR_TIMELINE}>
                <defs>
                  <linearGradient id="colorHH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorHV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[-25, -5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d152a",
                    borderColor: "#334155",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="backscatterHH"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorHH)"
                  name="γ⁰ HH (dB)"
                />
                <Area
                  type="monotone"
                  dataKey="backscatterHV"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorHV)"
                  name="γ⁰ HV (dB)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            * Calibrated sample baseline for interface development. True satellite analysis enforces identical orbit track and geometry.
          </p>
        </div>

        {/* Processing Job Status Widget */}
        <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-semibold text-white">Scientific Processing Jobs</h3>
              <button
                onClick={() => onNavigate("analysis")}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View Workspace &rarr;
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {SAMPLE_PROCESSING_JOBS.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-slate-800/90 bg-slate-900/60 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-200 leading-tight">
                        {job.jobName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        ID: {job.id}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold shrink-0 ${
                        job.status === "COMPLETED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : job.status === "PROCESSING"
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {job.status === "PROCESSING" && (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${job.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Progress</span>
                        <span>{job.progressPercent}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono border-t border-slate-800/60 pt-1.5">
                    <span>Algorithm: {job.algorithm.split("(")[0]}</span>
                    <span>{job.elapsedSec}s elapsed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-cyan-950/30 border border-cyan-800/40 p-3 text-xs text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>NISAR L1 GCOV processor worker daemon operational.</span>
          </div>
        </div>
      </div>

      {/* Latest Available Granules Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Recently Ingested SAR Granules (Nagapattinam Footprint)
            </h3>
            <p className="text-xs text-slate-400">
              Verified scenes matching geospatial boundary [79.6°E - 80.1°E, 10.2°N - 11.4°N].
            </p>
          </div>
          <button
            onClick={() => onNavigate("explorer")}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Full Catalogue</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Granule ID</th>
                <th className="px-4 py-3">Mission</th>
                <th className="px-4 py-3">Band</th>
                <th className="px-4 py-3">Orbit</th>
                <th className="px-4 py-3">Pols</th>
                <th className="px-4 py-3">Center Angle</th>
                <th className="px-4 py-3">Acquisition Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {SAMPLE_SAR_GRANULES.slice(0, 4).map((granule) => (
                <tr key={granule.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-cyan-300">{granule.id}</td>
                  <td className="px-4 py-3">{granule.mission}</td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
                      {granule.band}-band
                    </span>
                  </td>
                  <td className="px-4 py-3">{granule.orbitPass} (Trk {granule.relativeOrbit})</td>
                  <td className="px-4 py-3">{granule.polarizations.join(", ")}</td>
                  <td className="px-4 py-3">{granule.centerIncidenceAngleDeg}°</td>
                  <td className="px-4 py-3">
                    {new Date(granule.acquisitionDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedGranule(granule);
                        onNavigate("analysis");
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700 text-slate-300 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
