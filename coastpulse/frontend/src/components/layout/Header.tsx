"use client";

import React from "react";
import { Activity, Bell, Compass, Database, ShieldCheck, Terminal } from "lucide-react";
import { NAGAPATTINAM_STUDY_AREA } from "@/lib/mockData";

interface HeaderProps {
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTabTitle }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#080d1a]/90 backdrop-blur px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
          <span>{activeTabTitle}</span>
        </h1>
        <div className="h-4 w-px bg-slate-800 hidden md:block" />
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Compass className="h-3.5 w-3.5 text-cyan-400" />
          <span>{NAGAPATTINAM_STUDY_AREA.name}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">[79.6°E - 80.1°E, 10.2°N - 11.4°N]</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Verification status indicator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">L/S-Band Ingestion Ready</span>
        </div>

        {/* Scientific mode badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 px-3 py-1.5 rounded-full text-xs font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>Scientific Grounding: Strict</span>
        </div>
      </div>
    </header>
  );
};
