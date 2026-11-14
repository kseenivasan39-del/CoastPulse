"use client";

import React, { useState } from "react";
import {
  Layers,
  Eye,
  Sliders,
  ChevronDown,
  Search,
  Filter,
  Waves,
  Leaf,
  Activity,
  Image as ImageIcon,
  MapPin,
  Compass,
} from "lucide-react";
import { LayerConfig } from "@/components/layout/LeftSidebar";

interface LayerDeckProps {
  layers: LayerConfig[];
  onToggleLayer: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
}

export const LayerDeck: React.FC<LayerDeckProps> = ({
  layers,
  onToggleLayer,
  onChangeOpacity,
}) => {
  const [search, setSearch] = useState("");
  const [sarOpen, setSarOpen] = useState(true);

  // Grouped layer items
  const sarLayers = [
    {
      id: "nisar-hh",
      name: "NISAR L2 GCOV (HH)",
      date: "2026-10-30 | γ⁰ (dB)",
      thumb: "/data/thumbnails/t1_thumb.png",
      visible: true,
      opacity: 85,
    },
    {
      id: "nisar-hv",
      name: "NISAR L2 GCOV (HV)",
      date: "2026-11-11 | γ⁰ (dB)",
      thumb: "/data/thumbnails/t2_thumb.png",
      visible: true,
      opacity: 75,
    },
  ];

  const categories = [
    { id: "water", label: "Water Extent", icon: Waves },
    { id: "veg", label: "Vegetation Indices", icon: Leaf },
    { id: "change", label: "Coastal Change", icon: Activity },
    { id: "opt", label: "Optical Imagery", icon: ImageIcon },
    { id: "bounds", label: "Reference Boundaries", icon: MapPin },
  ];

  return (
    <div className="w-[300px] bg-[#070b13]/95 border-r border-[#151f32] flex flex-col h-full text-xs select-none backdrop-blur-md z-10 shrink-0">
      {/* Header */}
      <div className="p-4 pb-2 flex items-center justify-between border-b border-[#131b2c]">
        <span className="font-bold text-[14px] text-white">Layers</span>
        <span className="text-[#00e5ff] font-semibold text-[11px] bg-[#082238] border border-[#00e5ff]/30 px-2 py-0.5 rounded-full">
          4 Active
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search layers, datasets..."
            className="w-full bg-[#0d1524] border border-[#1b273d] rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]/60 transition-colors"
          />
        </div>
        <button className="p-2 rounded-lg bg-[#0d1524] border border-[#1b273d] text-slate-400 hover:text-white transition-colors">
          <Filter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
        {/* 1. SAR Backscatter Category */}
        <div className="rounded-xl bg-[#0b1220] border border-[#16233a] overflow-hidden">
          <button
            onClick={() => setSarOpen(!sarOpen)}
            className="w-full p-2.5 flex items-center justify-between text-left text-slate-200 hover:text-white font-semibold group transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00e5ff]" />
              <span className="text-xs font-bold text-slate-200 group-hover:text-white">SAR Backscatter</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                sarOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {sarOpen && (
            <div className="p-2 pt-0 space-y-2.5">
              {sarLayers.map((layer, idx) => (
                <div
                  key={layer.id}
                  className="p-2.5 rounded-lg bg-[#0f192b] border border-[#1b2b45] flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Checkbox with custom theme accent */}
                    <input
                      type="checkbox"
                      defaultChecked={layer.visible}
                      className="w-3.5 h-3.5 rounded bg-[#090f1a] border-slate-600 text-[#00e5ff] focus:ring-0 cursor-pointer accent-[#00e5ff]"
                    />

                    {/* Thumbnail preview */}
                    <div className="w-10 h-10 rounded bg-slate-900 overflow-hidden border border-slate-700 shrink-0">
                      <img
                        src={layer.thumb}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[11px] text-white truncate">{layer.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{layer.date}</div>
                    </div>
                  </div>

                  {/* Opacity slider */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#18263e]">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue={layer.opacity}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                    />
                    <span className="text-[10px] text-slate-300 font-mono w-6 text-right font-bold">
                      {layer.opacity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other categories */}
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="rounded-xl bg-[#0b1220] border border-[#16233a] p-2.5 flex items-center justify-between text-slate-300 hover:border-[#1d3050] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold">{cat.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
