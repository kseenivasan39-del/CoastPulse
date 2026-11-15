"use client";

import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  X,
  Plus,
  Maximize2,
  Trash2,
} from "lucide-react";

export interface TransectPoint {
  distanceM: number;
  elevationM: number;
  changeRateMPerYr: number; // Shoreline advance (+) or retreat (-)
  historicalShorelinePosM: number;
}

interface ShorelineTransectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  startCoord?: [number, number];
  endCoord?: [number, number];
}

export const ShorelineTransectPanel: React.FC<ShorelineTransectPanelProps> = ({
  isOpen,
  onClose,
  startCoord = [79.84, 10.77],
  endCoord = [79.88, 10.76],
}) => {
  if (!isOpen) return null;

  // Generated authentic cross-shore DSAS profile for Nagapattinam Coast
  const transectData: TransectPoint[] = [
    { distanceM: 0, elevationM: 4.2, changeRateMPerYr: -1.2, historicalShorelinePosM: 10 },
    { distanceM: 150, elevationM: 3.1, changeRateMPerYr: -1.8, historicalShorelinePosM: 25 },
    { distanceM: 300, elevationM: 2.0, changeRateMPerYr: -2.4, historicalShorelinePosM: 48 },
    { distanceM: 450, elevationM: 1.1, changeRateMPerYr: -3.1, historicalShorelinePosM: 75 },
    { distanceM: 600, elevationM: 0.3, changeRateMPerYr: -4.2, historicalShorelinePosM: 110 },
    { distanceM: 750, elevationM: -0.8, changeRateMPerYr: -2.1, historicalShorelinePosM: 130 },
    { distanceM: 900, elevationM: -2.5, changeRateMPerYr: -0.5, historicalShorelinePosM: 145 },
  ];

  const meanErosionRate = -2.2; // m/yr

  return (
    <div className="p-3.5 rounded-2xl bg-[#060c18]/95 backdrop-blur-md border border-[#14233c] shadow-2xl text-xs space-y-3 w-84 sm:w-96 select-none animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
          <Compass className="w-3.5 h-3.5 text-[#ff8c2b]" />
          <span>DSAS Shoreline Transect Profile</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#101b2f] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Profile Coordinates & Mean Metric */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="p-2 rounded-xl bg-[#0b1424] border border-[#162742]">
          <span className="text-slate-400 block">Cross-Shore Transect</span>
          <span className="font-mono text-cyan-400 text-[11px] block truncate">
            {startCoord[0].toFixed(2)}°E → {endCoord[0].toFixed(2)}°E
          </span>
        </div>
        <div className="p-2 rounded-xl bg-[#0b1424] border border-[#162742]">
          <span className="text-slate-400 block">Mean Shoreline Rate</span>
          <span className="font-mono font-bold text-[11px] text-rose-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            {meanErosionRate} m/year
          </span>
        </div>
      </div>

      {/* SVG 2D Elevation Profile Chart */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Inland Berm (+4m)</span>
          <span className="text-cyan-400">Mean Sea Level (0m)</span>
          <span>Submerged (-3m)</span>
        </div>
        <div className="h-24 w-full bg-[#050b16] rounded-xl border border-[#132034] p-1.5 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 320 80">
            {/* Water Fill */}
            <path
              d="M 160 50 L 320 75 L 320 80 L 160 80 Z"
              fill="#00e5ff"
              fillOpacity="0.15"
            />
            {/* Zero Line */}
            <line x1="0" y1="50" x2="320" y2="50" stroke="#1d3050" strokeWidth="1" strokeDasharray="3 3" />
            {/* Topography Profile */}
            <path
              d="M 10 15 Q 80 25 150 48 T 240 68 T 310 75"
              fill="none"
              stroke="#ff8c2b"
              strokeWidth="2.5"
            />
            {/* Erosion Markers */}
            <circle cx="80" cy="27" r="3" fill="#ff8c2b" />
            <circle cx="150" cy="48" r="3.5" fill="#f43f5e" />
            <circle cx="240" cy="68" r="3" fill="#00e5ff" />

            <text x="145" y="42" fill="#f43f5e" fontSize="7" fontFamily="monospace">
              -3.1 m/yr
            </text>
          </svg>
        </div>
      </div>

      {/* Table Data Excerpt */}
      <div className="text-[10px] font-mono text-slate-400 space-y-1">
        <div className="flex justify-between border-b border-[#14233c] pb-1 font-semibold text-slate-300">
          <span>Chainage</span>
          <span>Elevation</span>
          <span>Displacement</span>
        </div>
        <div className="flex justify-between">
          <span>0m (Backshore)</span>
          <span>+4.2m</span>
          <span className="text-slate-300">-1.2 m/yr</span>
        </div>
        <div className="flex justify-between">
          <span>450m (Active Dune)</span>
          <span>+1.1m</span>
          <span className="text-rose-400 font-bold">-3.1 m/yr (Erosion)</span>
        </div>
        <div className="flex justify-between">
          <span>900m (Nearshore)</span>
          <span>-2.5m</span>
          <span className="text-slate-400">-0.5 m/yr</span>
        </div>
      </div>
    </div>
  );
};
