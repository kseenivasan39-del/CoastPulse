"use client";

import React, { useState } from "react";
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Info,
} from "lucide-react";
import { SAMPLE_SAR_GRANULES, SAMPLE_CHANGE_RECORDS } from "@/lib/mockData";
import { SARGranule } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const SAMPLE_HISTOGRAM = [
  { deltaDb: "-6 to -5", count: 420, category: "Loss" },
  { deltaDb: "-5 to -4", count: 850, category: "Loss" },
  { deltaDb: "-4 to -3", count: 1840, category: "Loss" },
  { deltaDb: "-3 to -2", count: 4120, category: "Loss" },
  { deltaDb: "-2 to -1", count: 9600, category: "Loss" },
  { deltaDb: "-1 to 0", count: 28400, category: "Stable" },
  { deltaDb: "0 to +1", count: 31200, category: "Stable" },
  { deltaDb: "+1 to +2", count: 11400, category: "Gain" },
  { deltaDb: "+2 to +3", count: 5200, category: "Gain" },
  { deltaDb: "+3 to +4", count: 2100, category: "Gain" },
  { deltaDb: "+4 to +5", count: 720, category: "Gain" },
];

export const ChangeDetectionView: React.FC = () => {
  const [refGranule, setRefGranule] = useState<SARGranule>(SAMPLE_SAR_GRANULES[0]);
  const [secGranule, setSecGranule] = useState<SARGranule>(SAMPLE_SAR_GRANULES[1]);
  const [thresholdDb, setThresholdDb] = useState<number>(2.5); // Threshold in dB for significance
  const [selectedRecord, setSelectedRecord] = useState(SAMPLE_CHANGE_RECORDS[0]);

  // Compatibility checking
  const isFrequencyMatch = refGranule.band === secGranule.band;
  const isOrbitMatch = refGranule.orbitPass === secGranule.orbitPass;
  const deltaAngle = Math.abs(
    refGranule.centerIncidenceAngleDeg - secGranule.centerIncidenceAngleDeg
  );
  const isAngleCompatible = deltaAngle <= 2.0;
  const isFullyCompatible = isFrequencyMatch && isOrbitMatch && isAngleCompatible;

  return (
    <div className="space-y-6">
      {/* Header & Scene Pair Selection */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Change Detection Laboratory
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Log-Ratio & Difference Engine
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Bitemporal SAR Surface Change & Water Fluctuation
            </h2>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
              isFullyCompatible
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-amber-950/60 border-amber-800 text-amber-300"
            }`}
          >
            {isFullyCompatible ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Scenes Pair: Scientifically Compatible</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Pair Incompatible (Physical Constraint Violated)</span>
              </>
            )}
          </div>
        </div>

        {/* Scene Pair Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Reference Scene T1 */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Reference Scene (T1 — Baseline)
            </span>
            <select
              value={refGranule.id}
              onChange={(e) => {
                const found = SAMPLE_SAR_GRANULES.find((g) => g.id === e.target.value);
                if (found) setRefGranule(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              {SAMPLE_SAR_GRANULES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.acquisitionDate.split("T")[0]} • {g.band}-band • {g.orbitPass} • {g.id.substring(0, 24)}...
                </option>
              ))}
            </select>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Date: {new Date(refGranule.acquisitionDate).toLocaleDateString()}</span>
              <span>Look Angle: {refGranule.centerIncidenceAngleDeg}°</span>
            </div>
          </div>

          {/* Secondary Scene T2 */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Secondary Scene (T2 — Repeat Pass)
            </span>
            <select
              value={secGranule.id}
              onChange={(e) => {
                const found = SAMPLE_SAR_GRANULES.find((g) => g.id === e.target.value);
                if (found) setSecGranule(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              {SAMPLE_SAR_GRANULES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.acquisitionDate.split("T")[0]} • {g.band}-band • {g.orbitPass} • {g.id.substring(0, 24)}...
                </option>
              ))}
            </select>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Date: {new Date(secGranule.acquisitionDate).toLocaleDateString()}</span>
              <span>Look Angle: {secGranule.centerIncidenceAngleDeg}°</span>
            </div>
          </div>
        </div>

        {/* Compatibility Diagnostic Bar */}
        {!isFullyCompatible && (
          <div className="rounded-lg bg-red-950/30 border border-red-800/60 p-3 text-xs text-red-300 space-y-1">
            <p className="font-semibold">Rejection Diagnostics:</p>
            {!isFrequencyMatch && (
              <p>• Radar band mismatch ({refGranule.band}-band vs {secGranule.band}-band). Wavelength difference violates scattering consistency.</p>
            )}
            {!isOrbitMatch && (
              <p>• Orbit pass conflict ({refGranule.orbitPass} vs {secGranule.orbitPass}). Opposing illumination vectors invert shadow/layover.</p>
            )}
            {!isAngleCompatible && (
              <p>• Incidence angle delta is {deltaAngle.toFixed(2)}° (tolerance is &le; 2.0°).</p>
            )}
          </div>
        )}
      </div>

      {/* Analysis Metrics & Histogram Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Area Change Quantification */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-[#0a1122] p-5">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Change Quantification Summary
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Surface Water Inundation Gain</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-cyan-400 font-mono">
                  +{selectedRecord.waterAreaGainHa.toLocaleString()} ha
                </span>
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-[10px] text-slate-400">
                Salt flats and low-lying mudflats flooded in Vedaranyam swamp.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Water Receding / Drainage Loss</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-amber-400 font-mono">
                  -{selectedRecord.waterAreaLossHa.toLocaleString()} ha
                </span>
                <TrendingDown className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-400">
                Tidal creek drainage and aquaculture drain cycles.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Mangrove Canopy Backscatter Shift</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {selectedRecord.vegetationBiomassShiftPct > 0 ? "+" : ""}
                  {selectedRecord.vegetationBiomassShiftPct}%
                </span>
                <span className="text-[10px] font-mono text-slate-400">Within normal ENL variance</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Muthupet core mangrove canopy structure remains stable across passes.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Significance Threshold (dB)</span>
              <span className="text-cyan-400 font-mono font-bold">±{thresholdDb} dB</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={thresholdDb}
              onChange={(e) => setThresholdDb(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Noise floor threshold filters random speckle variations below ±{thresholdDb} dB.
            </p>
          </div>
        </div>

        {/* Right 2 Cols: Backscatter Change Histogram */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Backscatter Difference Distribution Δγ⁰ (dB)
              </h3>
              <p className="text-xs text-slate-400">
                Pixel frequency distribution between {refGranule.acquisitionDate.split("T")[0]} and{" "}
                {secGranule.acquisitionDate.split("T")[0]}.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Mean: {selectedRecord.meanDeltaDb} dB</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Std: {selectedRecord.stdDeltaDb} dB</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SAMPLE_HISTOGRAM}>
                <XAxis dataKey="deltaDb" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d152a",
                    borderColor: "#334155",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {SAMPLE_HISTOGRAM.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.category === "Loss"
                          ? "#f59e0b"
                          : entry.category === "Gain"
                          ? "#06b6d4"
                          : "#475569"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scientific Uncertainty Disclosure */}
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs font-mono text-slate-300 space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Statistical Confidence & Uncertainty Assessment</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-400">
              <div>Confidence Score: {selectedRecord.confidenceScore}%</div>
              <div>Estimated Calibration Error: ±{selectedRecord.uncertaintyMarginDb} dB</div>
              <div>Tidal Phase Difference: -0.15m (Low Tide)</div>
              <div>Surface Wind Speed: 3.2 m/s (Sub-critical)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
