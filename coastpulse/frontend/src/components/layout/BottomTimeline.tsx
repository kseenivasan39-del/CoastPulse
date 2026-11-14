"use client";

import React, { useState } from "react";
import {
  Calendar,
  Play,
  Pause,
  Sliders,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  Split,
  ChevronRight,
} from "lucide-react";

interface BottomTimelineProps {
  dates: Array<{ id: string; date: string; label: string; granuleId: string }>;
  selectedT1Index: number;
  selectedT2Index: number;
  onSelectT1: (index: number) => void;
  onSelectT2: (index: number) => void;
  onCompareDates: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const BottomTimeline: React.FC<BottomTimelineProps> = ({
  dates,
  selectedT1Index,
  selectedT2Index,
  onSelectT1,
  onSelectT2,
  onCompareDates,
  isPlaying,
  onTogglePlay,
}) => {
  return (
    <div className="h-16 bg-[#070b16] border-t border-[#18233c] px-4 flex items-center justify-between shrink-0 select-none text-xs font-mono relative z-20">
      {/* Playback Controls & Cycle Indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className="p-2 rounded-lg bg-[#0e1930] text-[#00e5ff] border border-[#1e2e4f] hover:bg-[#132344] transition-colors shadow-sm"
          title={isPlaying ? "Pause Timeline Animation" : "Play Timeline Animation"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#ff9933] font-black uppercase tracking-wider">NISAR 12-DAY CYCLE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff9933] animate-pulse" />
          </div>
          <span className="text-white font-extrabold text-xs">Track 084 ASCENDING (Cauvery Delta)</span>
        </div>
      </div>

      {/* Interactive Date Timeline Badges */}
      <div className="flex items-center gap-2.5 overflow-x-auto px-4 py-1">
        {dates.map((d, idx) => {
          const isT1 = selectedT1Index === idx;
          const isT2 = selectedT2Index === idx;

          return (
            <div
              key={d.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isT1
                  ? "bg-[#0b254a] border-[#00e5ff] text-white shadow-md shadow-[#00e5ff]/20"
                  : isT2
                  ? "bg-[#331c04] border-[#ff9933] text-white shadow-md shadow-[#ff9933]/20"
                  : "bg-[#0b1222] border-[#1e2e4f] text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  {isT1 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00e5ff] text-slate-950 font-black">T1 BASELINE</span>}
                  {isT2 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff9933] text-slate-950 font-black">T2 REPEAT</span>}
                  <span className="text-xs font-bold text-white">{d.date}</span>
                </div>
                <span className="text-[10px] text-slate-400">{d.label}</span>
              </div>

              {/* T1/T2 selection toggle buttons */}
              <div className="flex flex-col gap-1 ml-2 border-l border-[#18233c] pl-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectT1(idx);
                  }}
                  className={`text-[9px] px-1.5 py-0.2 rounded font-black transition-colors ${
                    isT1 ? "bg-[#00e5ff] text-slate-950" : "bg-[#111c34] text-slate-400 hover:text-white"
                  }`}
                  title="Set as T1 Reference Pass"
                >
                  T1
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectT2(idx);
                  }}
                  className={`text-[9px] px-1.5 py-0.2 rounded font-black transition-colors ${
                    isT2 ? "bg-[#ff9933] text-slate-950" : "bg-[#111c34] text-slate-400 hover:text-white"
                  }`}
                  title="Set as T2 Secondary Pass"
                >
                  T2
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare Action Button */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400">Comparing:</span>
          <span className="text-[#00e5ff] font-bold">{dates[selectedT1Index]?.date}</span>
          <span className="text-slate-500">&rarr;</span>
          <span className="text-[#ff9933] font-bold">{dates[selectedT2Index]?.date}</span>
        </div>

        <button
          onClick={onCompareDates}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00e5ff] to-[#ff9933] hover:from-[#33ecff] hover:to-[#ffa84d] text-slate-950 font-black flex items-center gap-2 transition-all shadow-lg shadow-[#00e5ff]/20 font-sans cursor-pointer text-xs"
        >
          <Split className="h-4 w-4 text-slate-950" />
          <span>Launch Bitemporal Swipe</span>
        </button>
      </div>
    </div>
  );
};
