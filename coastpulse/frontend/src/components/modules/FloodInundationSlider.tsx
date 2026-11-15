"use client";

import React, { useState, useRef } from "react";
import {
  Waves,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface FloodInundationSliderProps {
  currentWaterLevel: number; // in meters (e.g. 0.5 to 3.5)
  onChangeWaterLevel: (level: number) => void;
  onToggleActive: (active: boolean) => void;
  isActive: boolean;
}

export const FloodInundationSlider: React.FC<FloodInundationSliderProps> = ({
  currentWaterLevel,
  onChangeWaterLevel,
  onToggleActive,
  isActive,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState<any>(null);

  const waterLevelRef = useRef<number>(currentWaterLevel);
  waterLevelRef.current = currentWaterLevel;

  const handleTogglePlay = () => {
    if (isPlaying) {
      clearInterval(intervalId);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (!isActive) onToggleActive(true);
      const id = setInterval(() => {
        const next = Math.round((waterLevelRef.current + 0.1) * 10) / 10;
        onChangeWaterLevel(next > 3.0 ? 0.5 : next);
      }, 350);
      setIntervalId(id);
    }
  };

  const handleReset = () => {
    if (intervalId) clearInterval(intervalId);
    setIsPlaying(false);
    onChangeWaterLevel(0.8);
  };

  // Calculate simulated flooded area based on water level
  const floodedAreaHa = Math.round(34820 + (currentWaterLevel - 0.5) * 8200);
  const surgeRisk =
    currentWaterLevel > 2.2
      ? "CRITICAL SURGE"
      : currentWaterLevel > 1.5
      ? "HIGH INUNDATION"
      : currentWaterLevel > 1.0
      ? "MODERATE TIDAL"
      : "NORMAL TIDAL";

  return (
    <div className="p-3 rounded-2xl bg-[#060c18]/95 backdrop-blur-md border border-[#14233c] shadow-2xl text-xs space-y-2.5 max-w-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
          <Waves className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>Dynamic Storm Surge & Flood Simulator</span>
        </div>
        <button
          onClick={() => onToggleActive(!isActive)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
            isActive
              ? "bg-[#00e5ff] text-black shadow-[0_0_8px_#00e5ff]"
              : "bg-[#0d182b] text-slate-400 hover:text-white"
          }`}
        >
          {isActive ? "ACTIVE" : "ENABLE"}
        </button>
      </div>

      {/* Numerical Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="p-2 rounded-xl bg-[#0b1424] border border-[#162742]">
          <span className="text-slate-400 block">Simulated TWL</span>
          <span className="font-mono font-bold text-sm text-[#00e5ff]">
            +{currentWaterLevel.toFixed(1)} m
          </span>
        </div>
        <div className="p-2 rounded-xl bg-[#0b1424] border border-[#162742]">
          <span className="text-slate-400 block">Submerged Inundation</span>
          <span className="font-mono font-bold text-sm text-amber-400">
            {floodedAreaHa.toLocaleString()} ha
          </span>
        </div>
      </div>

      {/* Slider Control */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>+0.5m (Low Tide)</span>
          <span
            className={`font-bold ${
              currentWaterLevel > 2.0
                ? "text-rose-400"
                : currentWaterLevel > 1.2
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {surgeRisk}
          </span>
          <span>+3.0m (Severe Surge)</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={currentWaterLevel}
          onChange={(e) => {
            onChangeWaterLevel(parseFloat(e.target.value));
            if (!isActive) onToggleActive(true);
          }}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-0.5">
        <button
          onClick={handleTogglePlay}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0e1c33] hover:bg-[#142848] text-slate-200 border border-[#1c335a] text-[11px] font-semibold transition-colors"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 text-[#ff8c2b]" />
              <span>Pause Sim</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-[#00e5ff] fill-current" />
              <span>Play Surge Loop</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 p-1 rounded hover:bg-[#101b2f] text-slate-400 hover:text-white transition-colors text-[10px]"
          title="Reset to Baseline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
