"use client";

import React from "react";
import {
  Home,
  Compass,
  SlidersHorizontal,
  Layers,
  MonitorCheck,
  Activity,
  FileText,
  Database,
  Settings,
} from "lucide-react";

interface LeftSlimRailProps {
  activeNav: string;
  onSelectNav: (id: string) => void;
}

export const LeftSlimRail: React.FC<LeftSlimRailProps> = ({ activeNav, onSelectNav }) => {
  const items = [
    { id: "explore", label: "Explore", icon: Compass },
    { id: "event-watch", label: "Events", icon: Activity },
    { id: "analyse", label: "Analyse", icon: SlidersHorizontal },
    { id: "compare", label: "Compare", icon: Layers },
    { id: "monitor", label: "Monitor", icon: MonitorCheck },
    { id: "research", label: "Research", icon: Activity },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "datahub", label: "Data Hub", icon: Database },
  ];

  return (
    <div className="w-[64px] bg-[#03060e] border-r border-[#101826] flex flex-col items-center py-2.5 gap-1.5 select-none z-20 shrink-0">
      {items.map((item) => {
        const isActive = activeNav === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSelectNav(item.id)}
            className={`w-[52px] py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              isActive
                ? "bg-[#181109] border border-[#ff8c2b] text-[#ff8c2b] shadow-[0_0_12px_rgba(255,140,43,0.3)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#09111e]"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Settings at bottom */}
      <div className="mt-auto w-full flex flex-col items-center pb-2">
        <button
          onClick={() => onSelectNav("settings")}
          className={`w-[52px] py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeNav === "settings"
              ? "bg-[#181109] border border-[#ff8c2b] text-[#ff8c2b]"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#09111e]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] font-semibold tracking-tight">Settings</span>
        </button>
      </div>
    </div>
  );
};
