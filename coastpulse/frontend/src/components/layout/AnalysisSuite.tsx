"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  BarChart2,
  Sparkles,
  ChevronDown,
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  Waves,
  Droplets,
  TreePine,
  TrendingUp,
} from "lucide-react";

interface AnalysisSuiteProps {
  onRunAnalysis: () => void;
}

export const AnalysisSuite: React.FC<AnalysisSuiteProps> = ({ onRunAnalysis }) => {
  const [activeTab, setActiveTab] = useState<"analysis" | "results" | "ai">("analysis");
  const [threshold, setThreshold] = useState<number>(-16.4);
  const [pol, setPol] = useState<"HH" | "HV">("HH");
  const [running, setRunning] = useState<boolean>(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      onRunAnalysis();
    }, 800);
  };

  return (
    <div className="w-[320px] bg-[#070b13]/95 border-l border-[#151f32] flex flex-col h-full text-xs select-none backdrop-blur-md z-10 shrink-0">
      {/* 1. Header Segmented Buttons */}
      <div className="p-3 border-b border-[#131b2c] flex items-center gap-1.5 bg-[#090f1a]">
        {[
          { id: "analysis", label: "Analysis", icon: SlidersHorizontal },
          { id: "results", label: "Results", icon: BarChart2 },
          { id: "ai", label: "AI Assistant", icon: Sparkles },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-[11px] transition-all ${
                isActive
                  ? "bg-[#ff7b1a] text-white shadow-[0_0_12px_rgba(255,123,26,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-[#121c2e]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 2. Scientific Analysis Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-[13px]">
            <Droplets className="w-4 h-4 text-[#00e5ff]" />
            <span>Scientific Analysis</span>
          </div>

          {/* Analysis Type Picker */}
          <div className="p-2.5 rounded-xl bg-[#0b1220] border border-[#16233a] flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-[#00e5ff]" />
              <span className="font-semibold text-slate-200">Water Detection</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Form Fields */}
          <div className="p-3.5 rounded-xl bg-[#0b1220] border border-[#16233a] space-y-3">
            {/* Input Dataset */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Input Dataset</label>
              <div className="p-2 rounded-lg bg-[#0e1728] border border-[#1b2b45] flex items-center justify-between text-slate-200 cursor-pointer">
                <span className="font-mono text-[11px]">NISAR L2 GCOV (HH)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Algorithm */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Algorithm</label>
              <div className="p-2 rounded-lg bg-[#0e1728] border border-[#1b2b45] flex items-center justify-between text-slate-200 cursor-pointer">
                <span className="font-semibold text-[11px]">Otsu Threshold (Dynamic)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Polarisation Radio Buttons */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Polarisation</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pol"
                    checked={pol === "HH"}
                    onChange={() => setPol("HH")}
                    className="w-3.5 h-3.5 text-[#ff7b1a] bg-[#0e1728] border-slate-600 focus:ring-0 accent-[#ff7b1a]"
                  />
                  <span className={`text-[11px] font-bold ${pol === "HH" ? "text-white" : "text-slate-400"}`}>HH</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pol"
                    checked={pol === "HV"}
                    onChange={() => setPol("HV")}
                    className="w-3.5 h-3.5 text-[#ff7b1a] bg-[#0e1728] border-slate-600 focus:ring-0 accent-[#ff7b1a]"
                  />
                  <span className={`text-[11px] font-bold ${pol === "HV" ? "text-white" : "text-slate-400"}`}>HV</span>
                </label>
              </div>
            </div>

            {/* Smoothing Filter */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Smoothing</label>
              <div className="p-2 rounded-lg bg-[#0e1728] border border-[#1b2b45] flex items-center justify-between text-slate-200 cursor-pointer">
                <span className="font-semibold text-[11px]">Refined Lee (7×7)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Threshold (γ⁰, dB)</span>
                <span className="text-[11px] font-mono font-bold text-white bg-[#0e1728] px-2 py-0.5 rounded border border-[#1b2b45]">
                  {threshold.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="-5"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#ff7b1a]"
              />
            </div>

            {/* Run Analysis Big Button */}
            <button
              onClick={handleRun}
              disabled={running}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#e65c00] to-[#f97316] hover:from-[#f97316] hover:to-[#fb923c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.45)] transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{running ? "Processing Raster..." : "Run Analysis"}</span>
            </button>
          </div>
        </div>

        {/* 3. Quick Insights Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-white font-bold text-[12px]">
            <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Quick Insights</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-[#0b1220] border border-[#16233a] flex flex-col items-center text-center">
              <Droplets className="w-3.5 h-3.5 text-[#00e5ff] mb-1" />
              <div className="font-extrabold text-[12px] text-white">34,820 ha</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Water Extent</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0b1220] border border-[#16233a] flex flex-col items-center text-center">
              <TreePine className="w-3.5 h-3.5 text-[#34d399] mb-1" />
              <div className="font-extrabold text-[12px] text-white">0.68</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Mangrove RVI</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0b1220] border border-[#16233a] flex flex-col items-center text-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#ff7b1a] mb-1" />
              <div className="font-extrabold text-[12px] text-white">+0.57 dB</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Backscatter Δ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
