"use client";

import React from "react";
import {
  Globe2,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  Database,
  Share2,
  Bell,
  User,
  Activity,
  Flame,
} from "lucide-react";

interface MissionTopNavProps {
  activeTab: "explore" | "analyse" | "compare" | "research" | "reports";
  onTabChange: (tab: "explore" | "analyse" | "compare" | "research" | "reports") => void;
}

export const MissionTopNav: React.FC<MissionTopNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="h-[60px] bg-[#070b13]/90 backdrop-blur-md border-b border-[#151f32] px-5 flex items-center justify-between shrink-0 select-none z-30 relative shadow-lg">
      {/* 1. Left Brand Identity */}
      <div className="flex items-center gap-3">
        {/* Swirling CoastPulse Vector Logo */}
        <div className="relative flex items-center justify-center">
          <svg className="w-8 h-8 text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 16C6 10.4772 10.4772 6 16 6C20.5 6 24.3 9 25.6 13.2" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M26 16C26 21.5228 21.5228 26 16 26C11.5 26 7.7 23 6.4 18.8" stroke="#ff9933" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3.5" fill="#00e5ff" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[17px] tracking-wide text-white font-sans">CoastPulse</span>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#101b2e] px-1.5 py-0.5 rounded border border-[#1d2d47]">v2.0</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Coastal Earth Observation Platform</span>
        </div>

        {/* Mission Subtitle Divider */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-[#1b273d]">
          <span className="text-[#ff9933] font-mono text-xs font-bold tracking-tight">/</span>
          <span className="text-slate-300 text-xs font-medium">Space Data for Coastal Resilience</span>
        </div>
      </div>

      {/* 2. Center Pill Tabs with Highlighted Explore Glow */}
      <div className="flex items-center gap-1.5 bg-[#090f1d] p-1 rounded-full border border-[#162238] shadow-inner">
        {[
          { id: "explore", label: "Explore", icon: Globe2 },
          { id: "analyse", label: "Analyse", icon: SlidersHorizontal },
          { id: "compare", label: "Compare", icon: Layers },
          { id: "research", label: "Research", icon: Activity },
          { id: "reports", label: "Reports", icon: Database },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#e65c00] to-[#f97316] text-white shadow-[0_0_15px_rgba(249,115,22,0.45)] border border-[#ff8c38]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#121c2e]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Right Status Icons & Earth Header Vignette */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#121c2e] transition-colors">
          <Database className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#121c2e] transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff9933] ring-2 ring-[#070b13]" />
        </button>
        <div className="h-6 w-px bg-[#19263e]" />
        <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#121c2e] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0b3d91] to-[#00e5ff] flex items-center justify-center text-white border border-[#00e5ff]/40">
            <User className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Earth Horizon Backdrop Glowing Corner */}
      <div 
        className="absolute top-0 right-0 w-[420px] h-[60px] pointer-events-none opacity-40 bg-no-repeat bg-right-top bg-contain mix-blend-screen"
        style={{ backgroundImage: "url('/space-bg.jpg')" }}
      />
    </header>
  );
};
