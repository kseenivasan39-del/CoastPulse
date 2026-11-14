"use client";

import React from "react";
import {
  Satellite,
  Compass,
  Layers,
  Activity,
  Waves,
  Map as MapIcon,
  GitCompare,
  FileText,
  Bot,
  Settings as SettingsIcon,
  ShieldAlert,
} from "lucide-react";
import { NavigationTab } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

const NAV_ITEMS: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "explorer", label: "Data Explorer", icon: Satellite },
  { id: "analysis", label: "SAR Analysis", icon: Layers },
  { id: "changedetection", label: "Change Detection", icon: GitCompare },
  { id: "coastal", label: "Coastal Intelligence", icon: Waves },
  { id: "map", label: "Interactive Map", icon: MapIcon },
  { id: "temporal", label: "Temporal Comparison", icon: Compass },
  { id: "reports", label: "Scientific Reports", icon: FileText },
  { id: "assistant", label: "AI Research Assistant", icon: Bot },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-[#070c18] flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Satellite className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-white text-base">COASTPULSE</span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">SAR Coastal Intelligence</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Provenance Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 m-3 rounded-lg border border-slate-800/60">
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-300">Zero Data Fabrication</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              All metrics validated against physical orbit and SAR backscatter bounds.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
