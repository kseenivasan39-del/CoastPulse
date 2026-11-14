"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Layers,
  Activity,
  SlidersHorizontal,
  FolderKanban,
  Database,
  BarChart2,
  FileText,
  Globe2,
  Search,
  Bell,
  User,
  Radio,
  Waves,
  Wind,
} from "lucide-react";

export type GlobalNavigationDestination =
  | "explore"
  | "event-watch"
  | "analyse"
  | "compare"
  | "monitor"
  | "research"
  | "catalogue"
  | "studies"
  | "reports"
  | "settings";

interface GlobalTopNavProps {
  activeDestination: GlobalNavigationDestination;
  onNavigate: (destination: GlobalNavigationDestination) => void;
}

export const GlobalTopNav: React.FC<GlobalTopNavProps> = ({
  activeDestination,
  onNavigate,
}) => {
  const [marineTelemetry, setMarineTelemetry] = useState<{
    wave_height_m: number;
    wind_speed_kmh: number;
    sea_roughness_state: string;
  } | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/marine/current")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setMarineTelemetry(data);
      })
      .catch(() => {});
  }, []);

  const destinations: Array<{
    id: GlobalNavigationDestination;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "explore", label: "Explore", icon: Compass },
    { id: "event-watch", label: "Event Watch", icon: Radio },
    { id: "analyse", label: "Analyse", icon: SlidersHorizontal },
    { id: "compare", label: "Compare", icon: Layers },
    { id: "monitor", label: "Satellite Monitor", icon: Activity },
    { id: "research", label: "Research", icon: Activity },
    { id: "catalogue", label: "Data Catalogue", icon: Database },
    { id: "studies", label: "My Studies", icon: FolderKanban },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <header className="h-[60px] bg-[#040812]/95 border-b border-[#121c2d] px-5 flex items-center justify-between shrink-0 select-none z-30 relative shadow-xl backdrop-blur-md">
      {/* 1. Brand Logo & Global Platform Designation */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <svg className="w-8 h-8 text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]" viewBox="0 0 32 32" fill="none">
            <path d="M5 16C5 9.925 9.925 5 16 5C20.8 5 24.8 8.1 26.2 12.5" stroke="#00e5ff" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M27 16C27 22.075 22.075 27 16 27C11.2 27 7.2 23.9 5.8 19.5" stroke="#ff8c2b" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3.5" fill="#00e5ff" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[16px] tracking-wide text-white">CoastPulse</span>
            <span className="text-[10px] font-mono font-bold text-sky-400/80 bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-800/40">
              v2.0
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Multi-Sensor Coastal Resilience Platform</span>
        </div>
      </div>

      {/* 2. Destination Tabs Carousel */}
      <div className="hidden xl:flex items-center gap-1 bg-[#070e1c] p-1 rounded-full border border-[#142036] shadow-inner overflow-x-auto">
        {destinations.map((tab) => {
          const isActive = activeDestination === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-[#e65c00] to-[#f97316] text-white shadow-[0_0_14px_rgba(249,115,22,0.45)] border border-[#ff8c38]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#101b2f]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Right Icons & Live Marine Telemetry */}
      <div className="flex items-center gap-2.5">
        {marineTelemetry && (
          <div
            title={`Live Oceanographic Telemetry: ${marineTelemetry.sea_roughness_state}`}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#081222] border border-[#14233c] text-[10px] font-mono text-slate-300"
          >
            <span className="flex items-center gap-1 text-[#00e5ff]">
              <Waves className="w-3.5 h-3.5" />
              <span>{marineTelemetry.wave_height_m}m</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-[#ff8c2b]">
              <Wind className="w-3.5 h-3.5" />
              <span>{marineTelemetry.wind_speed_kmh} km/h</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        <button
          onClick={() => onNavigate("catalogue")}
          title="Satellite Data Discovery"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d182b] border border-[#1a2d4a] text-slate-300 hover:text-white text-xs font-mono"
        >
          <Database className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="hidden sm:inline">DISCOVERY</span>
        </button>

        <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#0f1b2e] transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff8c2b] ring-2 ring-[#040812]" />
        </button>

        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0b3d91] to-[#00e5ff] flex items-center justify-center text-white border border-[#00e5ff]/40">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    </header>
  );
};
