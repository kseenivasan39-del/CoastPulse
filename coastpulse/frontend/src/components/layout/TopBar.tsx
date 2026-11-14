"use client";

import React, { useState } from "react";
import {
  Compass,
  Search,
  Sliders,
  Layers,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Satellite,
  Split,
  Cpu,
  Bot,
  LayoutDashboard,
  CheckCircle2,
  Crosshair,
  Sparkles,
} from "lucide-react";
import { CoastalLocation } from "@/lib/geoUtils";

interface TopBarProps {
  currentAoiName: string;
  onSearchSelect: (location: CoastalLocation) => void;
  searchResults: CoastalLocation[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeView: "workspace" | "comparison" | "workbench" | "ai-studio" | "dashboard";
  onViewChange: (view: "workspace" | "comparison" | "workbench" | "ai-studio" | "dashboard") => void;
  leftPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  onQuickInspect: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentAoiName,
  onSearchSelect,
  searchResults,
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  leftPanelOpen,
  onToggleLeftPanel,
  rightPanelOpen,
  onToggleRightPanel,
  onQuickInspect,
}) => {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  return (
    <header className="h-14 bg-[#070b16] border-b border-[#18233c] px-4 flex items-center justify-between shrink-0 select-none text-xs relative z-30">
      {/* Brand & Joint Mission Identity (NASA Deep Blue + ISRO Saffron) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeftPanel}
          title={leftPanelOpen ? "Collapse Data Layers" : "Expand Data Layers"}
          className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 border text-xs font-semibold ${
            leftPanelOpen
              ? "bg-[#0f1d38] border-[#00e5ff]/40 text-[#00e5ff]"
              : "bg-[#0b1222] border-[#1e2e4f] text-slate-300 hover:text-white"
          }`}
        >
          {leftPanelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          <span className="hidden sm:inline font-mono">LAYERS</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Dual Mission Emblem Badge */}
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-[#0b3d91] to-[#041e42] border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.25)]">
            <Satellite className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#ff9933] border border-black shadow-[0_0_6px_#ff9933]" title="ISRO Active" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-widest text-white text-sm">COASTPULSE</span>
              <span className="text-[10px] bg-gradient-to-r from-[#0b3d91] to-[#ff9933] text-white font-extrabold px-1.5 py-0.2 rounded font-mono shadow-sm">
                NASA × ISRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-none">NISAR L2 Dual-Band (L+S) Mission</p>
          </div>
        </div>

        <div className="h-4 w-px bg-[#18233c] mx-1 hidden md:block" />

        {/* Selected AOI Context Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-[#0a1426] border border-[#1e2e4f] text-slate-200">
          <Compass className="h-3.5 w-3.5 text-[#ff9933]" />
          <span className="text-slate-400 text-[11px] font-mono">FOOTPRINT:</span>
          <span className="text-white font-bold text-[11px] truncate max-w-[200px]">{currentAoiName}</span>
        </div>
      </div>

      {/* Global Location Search */}
      <div className="relative w-56 sm:w-72 md:w-80 mx-2">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search coastal delta, coords..."
            className="w-full bg-[#0b1222] border border-[#1e2e4f] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/30 transition-all font-mono"
          />
        </div>

        {showSearchDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0b1424] border border-[#1e2e4f] rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-[#18233c]">
            {searchResults.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSearchSelect(loc);
                  setShowSearchDropdown(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#0f1d38] transition-colors flex flex-col group"
              >
                <span className="text-xs font-semibold text-slate-200 group-hover:text-[#00e5ff]">{loc.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {loc.region}, {loc.country} [{loc.coordinates[0].toFixed(2)}°, {loc.coordinates[1].toFixed(2)}°]
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Modes: NASA Deep Navy + ISRO Saffron Highlights */}
      <div className="hidden xl:flex items-center gap-1 bg-[#0b1222] p-1 rounded-lg border border-[#1e2e4f]">
        {[
          { id: "workspace", label: "Interactive Map", icon: Layers },
          { id: "comparison", label: "Repeat-Pass Swipe", icon: Split },
          { id: "workbench", label: "SAR Calibration", icon: Cpu },
          { id: "ai-studio", label: "AI Research Studio", icon: Bot },
          { id: "dashboard", label: "Mission Summary", icon: LayoutDashboard },
        ].map((tab) => {
          const isActive = activeView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#00e5ff] to-[#0b3d91] text-slate-950 shadow-md shadow-[#00e5ff]/20 font-black"
                  : "text-slate-300 hover:text-white hover:bg-[#111c34]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: One-Click Pixel Probe & Tool Panel Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onQuickInspect}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0f2d1e] hover:bg-[#133c28] border border-[#138808]/50 text-[#138808] text-xs font-bold transition-all shadow-sm"
          title="Probe live radiometric backscatter in Muthupet"
        >
          <Crosshair className="h-3.5 w-3.5 text-[#138808]" />
          <span className="text-[#34d399] font-mono">INSPECT PIXEL</span>
        </button>

        <button
          onClick={onToggleRightPanel}
          title={rightPanelOpen ? "Collapse Analytics & AI" : "Expand Analytics & AI"}
          className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 border text-xs font-semibold ${
            rightPanelOpen
              ? "bg-[#0f1d38] border-[#00e5ff]/40 text-[#00e5ff]"
              : "bg-[#0b1222] border-[#1e2e4f] text-slate-300 hover:text-white"
          }`}
        >
          <span className="hidden sm:inline font-mono">ANALYSIS & AI</span>
          {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};
