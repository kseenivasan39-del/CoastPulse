"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Compass,
  Layers,
  Calendar,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface MyStudiesViewProps {
  onLoadStudy: (study: any) => void;
}

export const MyStudiesView: React.FC<MyStudiesViewProps> = ({ onLoadStudy }) => {
  const [studies, setStudies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load studies from database via API
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/study-areas");
        const data = await res.json();
        setStudies(data);
      } catch (err) {
        console.error("Failed to load study areas", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudies();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#03060c] p-6 space-y-6 text-slate-100 select-none">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#ff8c2b]" />
            <h1 className="text-xl font-extrabold text-white">My Coastal Studies & Saved AOIs</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independent geographic projects with custom bounding boxes, calibrated rasters, and processing workflows.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e65c00] to-[#f97316] text-white font-bold text-xs shadow-md shadow-[#ff8c2b]/30">
          <Plus className="w-4 h-4" />
          <span>New Study Area</span>
        </button>
      </div>

      {/* 2. Studies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studies.map((study) => {
          const isDemo = study.id === "AOI_NAGAPATTINAM_01";

          return (
            <div
              key={study.id}
              className={`p-5 rounded-2xl bg-[#070e1c] border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                isDemo
                  ? "border-[#00e5ff]/50 bg-gradient-to-br from-[#070e1c] to-[#0a182c]"
                  : "border-[#14233c] hover:border-slate-600"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#ff8c2b] bg-[#ff8c2b]/10 px-2 py-0.5 rounded">
                    {study.region}
                  </span>
                  {isDemo && (
                    <span className="text-[10px] font-mono font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                      Demonstration Study
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-white">{study.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{study.description}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#101b2f] text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px]">Total Area:</span>
                  <div className="font-bold text-white">
                    {study.total_area_ha ? `${(study.total_area_ha / 100).toLocaleString()} km²` : "Custom"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Wetland Extent:</span>
                  <div className="font-bold text-[#34d399]">
                    {study.wetland_area_ha ? `${(study.wetland_area_ha / 100).toLocaleString()} km²` : "N/A"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-slate-400">
                  [{study.min_lon.toFixed(1)}°, {study.min_lat.toFixed(1)}°] → [{study.max_lon.toFixed(1)}°, {study.max_lat.toFixed(1)}°]
                </span>

                <button
                  onClick={() => onLoadStudy(study)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e1c33] border border-[#1b2f50] text-[#00e5ff] hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
