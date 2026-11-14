"use client";

import React from "react";
import {
  Globe2,
  SlidersHorizontal,
  Layers,
  Activity,
  FileText,
  Search,
  Bell,
  User,
  MonitorCheck,
  Compass,
} from "lucide-react";

interface TopHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ activeTab, onTabChange }) => {
  const navTabs = [
    { id: "explore", label: "Explore", icon: Compass },
    { id: "analyse", label: "Analyse", icon: SlidersHorizontal },
    { id: "compare", label: "Compare", icon: Layers },
    { id: "monitor", label: "Monitor", icon: MonitorCheck },
    { id: "research", label: "Research", icon: Activity },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <header className="h-[58px] bg-[#040812]/95 border-b border-[#121c2d] px-5 flex items-center justify-between shrink-0 select-none z-30 relative shadow-xl backdrop-blur-md">
      {/* 1. Left Brand Identity */}
      <div className="flex items-center gap-3">
        {/* Swirling CoastPulse Icon Badge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-8 h-8 text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]" viewBox="0 0 32 32" fill="none">
            <path d="M5 16C5 9.925 9.925 5 16 5C20.8 5 24.8 8.1 26.2 12.5" stroke="#00e5ff" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M27 16C27 22.075 22.075 27 16 27C11.2 27 7.2 23.9 5.8 19.5" stroke="#ff8c2b" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3.5" fill="#00e5ff" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[17px] tracking-wide text-white">CoastPulse</span>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#0d1627] px-1.5 py-0.2 rounded border border-[#1b2a42]">v2.0</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Global Coastal Observation & Intelligence</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-[#19253b]">
          <span className="text-[#ff8c2b] font-mono text-xs font-bold">/</span>
          <span className="text-slate-300 text-xs font-medium">Space-based Insights for Coastal Resilience</span>
        </div>
      </div>

      {/* 2. Center Nav Pills with Orange Explore Glow */}
      <div className="flex items-center gap-1.5 bg-[#070e1c] p-1 rounded-full border border-[#142036] shadow-inner">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#e65c00] to-[#f97316] text-white shadow-[0_0_18px_rgba(249,115,22,0.5)] border border-[#ff8c38]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#101b2f]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Right Icons */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#0f1b2e] transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#0f1b2e] transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff8c2b] ring-2 ring-[#040812]" />
        </button>
        <button className="p-1 rounded-full hover:bg-[#0f1b2e] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0b3d91] to-[#00e5ff] flex items-center justify-center text-white border border-[#00e5ff]/40">
            <User className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </header>
  );
};
