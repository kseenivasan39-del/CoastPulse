"use client";

import React, { useState } from "react";
import {
  Calendar,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface ObservationTimelineProps {
  onSelectDate: (id: string) => void;
}

export const ObservationTimeline: React.FC<ObservationTimelineProps> = ({ onSelectDate }) => {
  const [filter, setFilter] = useState<"all" | "nisar" | "sentinel">("all");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedT1, setSelectedT1] = useState<string>("nisar-t1");
  const [selectedT2, setSelectedT2] = useState<string>("nisar-t2");

  const cards = [
    {
      id: "nisar-0918",
      title: "NISAR L2 GCOV",
      date: "2026-09-18",
      sub: "Track 084 · Asc",
      thumb: "/data/thumbnails/t1_thumb.png",
      tag: null,
    },
    {
      id: "nisar-t1",
      title: "NISAR L2 GCOV",
      date: "2026-10-30",
      sub: "Track 084 · Asc",
      thumb: "/data/thumbnails/t1_thumb.png",
      tag: "T1",
    },
    {
      id: "nisar-t2",
      title: "NISAR L2 GCOV",
      date: "2026-11-11",
      sub: "Track 084 · Asc",
      thumb: "/data/thumbnails/t2_thumb.png",
      tag: "T2",
    },
    {
      id: "s1-1123",
      title: "Sentinel-1 IW",
      date: "2026-11-23",
      sub: "Orbit 32145",
      thumb: "/data/thumbnails/t1_thumb.png",
      tag: null,
    },
    {
      id: "nisar-1205",
      title: "NISAR L2 GCOV",
      date: "2026-12-05",
      sub: "Track 084",
      thumb: "/data/thumbnails/t2_thumb.png",
      tag: null,
    },
  ];

  return (
    <div className="h-[145px] bg-[#070b13]/95 border-t border-[#151f32] px-4 py-2.5 flex items-center gap-4 shrink-0 select-none backdrop-blur-md z-20">
      {/* 1. Left Controls & Timeline Scroller */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Filter Pills & Controls Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ff7b1a]" />
            <span className="font-bold text-xs text-white">Observation Timeline</span>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  filter === "all"
                    ? "bg-[#ff7b1a] text-white"
                    : "bg-[#0f192b] text-slate-400 hover:text-white"
                }`}
              >
                All (6)
              </button>
              <button
                onClick={() => setFilter("nisar")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  filter === "nisar"
                    ? "bg-[#ff7b1a] text-white"
                    : "bg-[#0f192b] text-slate-400 hover:text-white"
                }`}
              >
                NISAR (4)
              </button>
              <button
                onClick={() => setFilter("sentinel")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  filter === "sentinel"
                    ? "bg-[#ff7b1a] text-white"
                    : "bg-[#0f192b] text-slate-400 hover:text-white"
                }`}
              >
                Sentinel-1 (2)
              </button>
            </div>
          </div>

          {/* Date range & Play/Pause */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1728] border border-[#1b2b45] text-[11px] font-mono text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>2026-09-01</span>
              <span className="text-slate-500">→</span>
              <span>2026-12-31</span>
            </div>

            <div className="flex items-center gap-1 bg-[#0e1728] border border-[#1b2b45] rounded-lg p-0.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 rounded text-[#ff7b1a] hover:bg-[#16233a] transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
            </div>
          </div>
        </div>

        {/* Observation Cards Horizontal Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button className="p-1.5 rounded-lg bg-[#0e1728] border border-[#1b2b45] text-slate-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {cards.map((card) => {
            const isT1 = card.tag === "T1";
            const isT2 = card.tag === "T2";

            return (
              <div
                key={card.id}
                onClick={() => onSelectDate(card.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer shrink-0 min-w-[195px] ${
                  isT1
                    ? "bg-[#18110b] border-[#ff7b1a] shadow-[0_0_12px_rgba(255,123,26,0.3)]"
                    : isT2
                    ? "bg-[#18110b] border-[#ff7b1a] shadow-[0_0_12px_rgba(255,123,26,0.3)]"
                    : "bg-[#0b1220] border-[#16233a] hover:border-[#223658]"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                  <img src={card.thumb} alt="thumb" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-white truncate">{card.title}</span>
                    {card.tag && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#ff7b1a] text-black">
                        {card.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">{card.date}</div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{card.sub}</div>
                </div>
              </div>
            );
          })}

          <button className="p-1.5 rounded-lg bg-[#0e1728] border border-[#1b2b45] text-slate-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Right Backscatter Trend Sparkline Mini-Chart */}
      <div className="w-[280px] h-full rounded-xl bg-[#0b1220] border border-[#16233a] p-2.5 flex flex-col justify-between shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] text-white">Backscatter Trend (AOI)</span>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-[#00e5ff]">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff]" /> HH
            </span>
            <span className="flex items-center gap-1 text-[#ff7b1a]">
              <span className="w-2 h-2 rounded-full bg-[#ff7b1a]" /> HV
            </span>
          </div>
        </div>

        {/* SVG Sparkline */}
        <div className="h-[60px] w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 240 60">
            {/* Grid Lines */}
            <line x1="0" y1="15" x2="240" y2="15" stroke="#18263e" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="35" x2="240" y2="35" stroke="#18263e" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="55" x2="240" y2="55" stroke="#18263e" strokeWidth="1" strokeDasharray="3 3" />

            {/* HH Cyan Line */}
            <path
              d="M 10 38 Q 65 30 120 33 T 180 34 T 230 31"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2"
            />
            {/* HV Orange Line */}
            <path
              d="M 10 50 Q 65 47 120 48 T 180 47 T 230 46"
              fill="none"
              stroke="#ff7b1a"
              strokeWidth="2"
            />

            {/* HH Points */}
            <circle cx="10" cy="38" r="3" fill="#00e5ff" />
            <circle cx="65" cy="30" r="3" fill="#00e5ff" />
            <circle cx="120" cy="33" r="3" fill="#00e5ff" />
            <circle cx="180" cy="34" r="3" fill="#00e5ff" />
            <circle cx="230" cy="31" r="3" fill="#00e5ff" />

            {/* HV Points */}
            <circle cx="10" cy="50" r="3" fill="#ff7b1a" />
            <circle cx="65" cy="47" r="3" fill="#ff7b1a" />
            <circle cx="120" cy="48" r="3" fill="#ff7b1a" />
            <circle cx="180" cy="47" r="3" fill="#ff7b1a" />
            <circle cx="230" cy="46" r="3" fill="#ff7b1a" />
          </svg>
        </div>

        {/* X-Axis Dates */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono px-1">
          <span>Sep 18</span>
          <span>Oct 30</span>
          <span>Nov 11</span>
          <span>Nov 23</span>
          <span>Dec 05</span>
        </div>
      </div>
    </div>
  );
};
