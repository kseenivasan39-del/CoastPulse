"use client";

import React, { useState } from "react";
import {
  Layers,
  Activity,
  Compass,
  FolderKanban,
  Clock,
  Database,
} from "lucide-react";

interface LeftRailProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({ activeTab, onSelectTab }) => {
  const items = [
    { id: "workspace", label: "Workspace", icon: FolderKanban },
    { id: "layers", label: "Layers", icon: Layers },
    { id: "observations", label: "Observations", icon: Activity },
    { id: "aois", label: "AOIs", icon: Compass },
    { id: "processing", label: "Processing", icon: Clock },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "datahub", label: "Data Hub", icon: Database },
  ];

  return (
    <div className="w-[68px] bg-[#050810] border-r border-[#151f32] flex flex-col items-center py-3 gap-2 select-none z-20 shrink-0">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`w-[54px] py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              isActive
                ? "bg-[#16120b] border border-[#ff7b1a] text-[#ff7b1a] shadow-[0_0_12px_rgba(255,123,26,0.25)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0c1322]"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Satellite illustration at bottom rail */}
      <div className="mt-auto flex flex-col items-center opacity-70">
        <div className="w-9 h-9 rounded-full bg-[#0a1120] border border-[#1b2b45] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#00e5ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
