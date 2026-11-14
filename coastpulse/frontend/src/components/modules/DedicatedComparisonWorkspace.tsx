"use client";

import React, { useState, useRef } from "react";
import {
  Split,
  Sliders,
  Calendar,
  Layers,
  Activity,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2,
  RefreshCw,
} from "lucide-react";

interface DedicatedComparisonWorkspaceProps {
  dates: Array<{ id: string; date: string; label: string; granuleId: string }>;
  t1Index: number;
  t2Index: number;
  onT1Change: (idx: number) => void;
  onT2Change: (idx: number) => void;
  onBackToMap: () => void;
}

export const DedicatedComparisonWorkspace: React.FC<DedicatedComparisonWorkspaceProps> = ({
  dates,
  t1Index,
  t2Index,
  onT1Change,
  onT2Change,
  onBackToMap,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100 percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showDifferenceOverlay, setShowDifferenceOverlay] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const t1 = dates[t1Index] || dates[0];
  const t2 = dates[t2Index] || dates[1];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="flex flex-col h-full bg-[#050811] text-xs font-sans select-none overflow-hidden"
    >
      {/* Top Comparison Header Controls */}
      <div className="h-14 bg-[#070b16] border-b border-[#18233c] px-6 flex items-center justify-between shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMap}
            className="text-xs text-[#00e5ff] hover:text-white font-bold flex items-center gap-1.5 bg-[#0e1930] px-3 py-1.5 rounded-md border border-[#1e2e4f] transition-colors"
          >
            &larr; Back to Interactive Map
          </button>
          <div className="h-4 w-px bg-[#18233c]" />
          <div className="flex items-center gap-2 text-slate-200">
            <Split className="h-4 w-4 text-[#ff9933]" />
            <span className="font-extrabold text-white text-xs">NASA × ISRO NISAR Repeat-Pass Comparison</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Track 084 ASCENDING</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white font-medium">
            <input
              type="checkbox"
              checked={showDifferenceOverlay}
              onChange={(e) => setShowDifferenceOverlay(e.target.checked)}
              className="accent-[#00e5ff] h-4 w-4 rounded cursor-pointer"
            />
            <span>Log-Ratio Inundation Overlay</span>
          </label>

          <button
            onClick={() => {
              const url = "http://127.0.0.1:8000/api/v1/comparisons/download/nisar-nagapattinam-change";
              const link = document.createElement("a");
              link.href = url;
              link.download = `nisar_change_diff_${t1.date}_${t2.date}.tif`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3.5 py-1.5 bg-[#ff8c2b] hover:bg-[#ffa34d] text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-950" />
            <span>Export Diff GeoTIFF</span>
          </button>
        </div>
      </div>

      {/* Main Draggable Swipe Canvas */}
      <div ref={containerRef} className="relative flex-1 bg-[#03060c] overflow-hidden cursor-ew-resize">
        {/* Left Side: T1 Reference Observation */}
        <div className="absolute inset-0 bg-[#050d1e] flex items-center justify-center p-8 pointer-events-none">
          <div className="relative w-full max-w-4xl h-full max-h-[82vh] border border-[#00e5ff]/40 rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center shadow-2xl">
            <div className="absolute top-4 left-4 z-20 px-3.5 py-2 rounded-lg bg-black/85 border border-[#00e5ff] font-mono text-xs text-[#00e5ff] shadow-2xl">
              <div className="font-extrabold">REFERENCE T1: {t1.date}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cycle 34 Baseline [γ⁰ HH]</div>
            </div>

            <div className="absolute bottom-6 left-6 z-20 text-slate-300 font-mono text-left bg-slate-950/80 p-3 rounded-lg border border-slate-800 backdrop-blur">
              <div className="text-[#00e5ff] font-bold text-sm">NISAR L2 GCOV (Oct 30, 2026)</div>
              <div className="text-xs text-slate-400 mt-1">Mean Backscatter: -12.38 dB • Incidence: 37.2°</div>
              <div className="text-[10px] text-slate-500">Native 170.9m grid • Terrain-flattened</div>
            </div>
          </div>
        </div>

        {/* Right Side: T2 Secondary Observation */}
        <div
          className="absolute inset-0 bg-[#160c03] flex items-center justify-center p-8 pointer-events-none overflow-hidden transition-none"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <div className="relative w-full max-w-4xl h-full max-h-[82vh] border border-[#ff9933]/60 rounded-xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center shadow-2xl">
            <div className="absolute top-4 right-4 z-20 px-3.5 py-2 rounded-lg bg-black/85 border border-[#ff9933] font-mono text-xs text-[#ff9933] shadow-2xl text-right">
              <div className="font-extrabold">SECONDARY T2: {t2.date}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cycle 35 Repeat [+12 Days]</div>
            </div>

            {/* Change overlay visualization when enabled */}
            {showDifferenceOverlay && (
              <img
                src="/data/processed/authoritative_change_visualization.png"
                alt="Bitemporal Change"
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            )}

            <div className="absolute bottom-6 right-6 z-20 text-slate-300 font-mono text-right bg-slate-950/80 p-3 rounded-lg border border-slate-800 backdrop-blur">
              <div className="text-[#ff9933] font-bold text-sm">NISAR L2 GCOV (Nov 11, 2026)</div>
              <div className="text-xs text-slate-400 mt-1">Mean: -12.03 dB • Net Delta: +0.35 dB</div>
              <div className="text-[10px] text-slate-500">Water Shift: +1,420 ha • Lee Filtered</div>
            </div>
          </div>
        </div>

        {/* Draggable Vertical Divider Handle */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#00e5ff] via-white to-[#ff9933] shadow-[0_0_20px_rgba(0,229,255,0.9)] z-30 cursor-ew-resize flex items-center justify-center pointer-events-auto"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="h-9 w-9 rounded-full bg-slate-950 border-2 border-white shadow-2xl flex items-center justify-center text-[#00e5ff] hover:scale-110 transition-transform">
            <Split className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="h-12 bg-[#070b16] border-t border-[#18233c] px-6 flex items-center justify-between font-mono text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-6">
          <span>Region: <strong className="text-white">Nagapattinam Delta</strong></span>
          <span>•</span>
          <span>Spatial Overlap: <strong className="text-[#34d399]">100% (Track 084 Identical)</strong></span>
          <span>•</span>
          <span>Incidence Delta: <strong className="text-[#34d399]">0.0°</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#00e5ff] font-extrabold">T1: {t1.date}</span>
          <span className="text-slate-500">&harr;</span>
          <span className="text-[#ff9933] font-extrabold">T2: {t2.date}</span>
        </div>
      </div>
    </div>
  );
};
