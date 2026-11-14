"use client";

import React, { useState } from "react";
import {
  Calendar,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Maximize2,
} from "lucide-react";

export const UnifiedObservationTimeline: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "nisar" | "sentinel">("all");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const cards = [
    {
      id: "nisar-0918",
      title: "NISAR L2",
      date: "2026-09-18",
      sub: "Track 084",
      thumb: "/data/thumbnails/t1_thumb.png",
      tag: null,
    },
    {
      id: "nisar-t1",
      title: "NISAR L2",
      date: "2026-10-30",
      sub: "Track 084",
      thumb: "/data/thumbnails/t1_thumb.png",
      tag: "T1",
    },
    {
      id: "nisar-t2",
      title: "NISAR L2",
      date: "2026-11-11",
      sub: "Track 084",
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
      title: "NISAR L2",
      date: "2026-12-05",
      sub: "Track 084",
      thumb: "/data/thumbnails/t2_thumb.png",
      tag: null,
    },
    {
      id: "s1-1217",
      title: "Sentinel-1 IW",
      date: "2026-12-17",
      sub: "Orbit 32158",
      thumb: "/data/thumbnails/t2_thumb.png",
      tag: null,
    },
  ];

  return (
    <div className="h-[148px] bg-[#040812]/95 border-t border-[#121c2d] px-4 py-2.5 flex items-center gap-4 shrink-0 select-none backdrop-blur-md z-20">
      {/* 1. Left Observation Timeline Section */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ff8c2b]" />
            <span className="font-bold text-xs text-white">Observation Timeline</span>

            {/* Filter pills */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  filter === "all"
                    ? "bg-[#ff8c2b] text-black"
                    : "bg-[#0c1628] text-slate-400 hover:text-white"
                }`}
              >
                All (6)
              </button>
              <button
                onClick={() => setFilter("nisar")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  filter === "nisar"
                    ? "bg-[#ff8c2b] text-black"
                    : "bg-[#0c1628] text-slate-400 hover:text-white"
                }`}
              >
                NISAR (4)
              </button>
              <button
                onClick={() => setFilter("sentinel")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  filter === "sentinel"
                    ? "bg-[#ff8c2b] text-black"
                    : "bg-[#0c1628] text-slate-400 hover:text-white"
                }`}
              >
                Sentinel-1 (2)
              </button>
            </div>
          </div>

          {/* Date range picker & playback */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0a1222] border border-[#16233a] text-[11px] font-mono text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>2026-09-01</span>
              <span className="text-slate-500">→</span>
              <span>2026-12-31</span>
            </div>

            <div className="flex items-center gap-1 bg-[#0a1222] border border-[#16233a] rounded-xl p-0.5">
              <button className="p-1 rounded text-slate-400 hover:text-white">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 rounded text-[#ff8c2b] hover:bg-[#142238] transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button className="p-1 rounded text-slate-400 hover:text-white">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Observation Cards Horizontal Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button className="p-1.5 rounded-xl bg-[#0a1222] border border-[#16233a] text-slate-400 hover:text-white shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {cards.map((card) => {
            const isT1 = card.tag === "T1";
            const isT2 = card.tag === "T2";

            return (
              <div
                key={card.id}
                className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer shrink-0 min-w-[178px] ${
                  isT1 || isT2
                    ? "bg-[#181109] border-[#ff8c2b] shadow-[0_0_12px_rgba(255,140,43,0.3)]"
                    : "bg-[#091120] border-[#132036] hover:border-[#1e3050]"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                  <img src={card.thumb} alt="thumb" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-white truncate">{card.title}</span>
                    {card.tag && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#ff8c2b] text-black">
                        {card.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">{card.date}</div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">{card.sub}</div>
                </div>
              </div>
            );
          })}

          <button className="p-1.5 rounded-xl bg-[#0a1222] border border-[#16233a] text-slate-400 hover:text-white shrink-0">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Right Backscatter Trend (AOI Mean) */}
      <div className="w-[300px] h-full rounded-2xl bg-[#08101e] border border-[#132036] p-2.5 flex flex-col justify-between shrink-0 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] text-white">Backscatter Trend (AOI Mean)</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-[#00e5ff]">
                <span className="w-2 h-2 rounded-full bg-[#00e5ff]" /> HH
              </span>
              <span className="flex items-center gap-1 text-[#ff8c2b]">
                <span className="w-2 h-2 rounded-full bg-[#ff8c2b]" /> HV
              </span>
            </div>
            <Maximize2 className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer ml-1" />
          </div>
        </div>

        {/* Dynamic Chart with γ0 (dB) Axis */}
        <div className="h-[62px] w-full flex items-center">
          {/* Y-Axis Label */}
          <div className="flex flex-col justify-between h-full text-[9px] font-mono text-slate-400 pr-1 select-none">
            <span>-10</span>
            <span>-15</span>
            <span>-20</span>
            <span>-25</span>
          </div>

          {/* SVG Canvas */}
          <div className="flex-1 h-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 220 62">
              {/* Grid Lines */}
              <line x1="0" y1="12" x2="220" y2="12" stroke="#16233a" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="28" x2="220" y2="28" stroke="#16233a" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="44" x2="220" y2="44" stroke="#16233a" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="220" y2="60" stroke="#16233a" strokeWidth="1" strokeDasharray="3 3" />

              {/* HH Blue Curve */}
              <path
                d="M 10 32 L 60 31 L 110 34 L 160 30 L 210 24"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2"
              />
              {/* HV Orange Curve */}
              <path
                d="M 10 46 L 60 44 L 110 47 L 160 45 L 210 42"
                fill="none"
                stroke="#ff8c2b"
                strokeWidth="2"
              />

              {/* HH Points */}
              <circle cx="10" cy="32" r="3" fill="#00e5ff" />
              <circle cx="60" cy="31" r="3" fill="#00e5ff" />
              <circle cx="110" cy="34" r="3" fill="#00e5ff" />
              <circle cx="160" cy="30" r="3" fill="#00e5ff" />
              <circle cx="210" cy="24" r="3" fill="#00e5ff" />

              {/* HV Points */}
              <circle cx="10" cy="46" r="3" fill="#ff8c2b" />
              <circle cx="60" cy="44" r="3" fill="#ff8c2b" />
              <circle cx="110" cy="47" r="3" fill="#ff8c2b" />
              <circle cx="160" cy="45" r="3" fill="#ff8c2b" />
              <circle cx="210" cy="42" r="3" fill="#ff8c2b" />
            </svg>
          </div>
        </div>

        {/* X-Axis Dates */}
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pl-5 pr-1">
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
