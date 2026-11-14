"use client";

import React, { useState } from "react";
import {
  Layers,
  Satellite,
  FolderKanban,
  Clock,
  Eye,
  EyeOff,
  Sliders,
  Trash2,
  Waves,
  TreePine,
  Activity,
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface LayerConfig {
  id: string;
  name: string;
  category: "SAR Backscatter" | "Water Extent" | "Vegetation Indices" | "Coastal Change" | "Optical Imagery" | "Reference Boundaries";
  visible: boolean;
  opacity: number;
  date?: string;
  sensor?: string;
  units?: string;
  badge?: string;
}

interface LeftSidebarProps {
  layers: LayerConfig[];
  onToggleLayer: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onRemoveLayer: (id: string) => void;
  acquisitions: any[];
  selectedAcquisitionId?: string;
  onSelectAcquisition: (granule: any) => void;
  savedAois: any[];
  onSelectAoi: (aoi: any) => void;
  activeSidebarTab: "layers" | "observations" | "studies" | "history";
  onSidebarTabChange: (tab: "layers" | "observations" | "studies" | "history") => void;
  jobs: any[];
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  layers,
  onToggleLayer,
  onChangeOpacity,
  onRemoveLayer,
  acquisitions,
  selectedAcquisitionId,
  onSelectAcquisition,
  savedAois,
  onSelectAoi,
  activeSidebarTab,
  onSidebarTabChange,
  jobs,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "SAR Backscatter": true,
    "Water Extent": true,
    "Vegetation Indices": true,
    "Coastal Change": true,
    "Reference Boundaries": true,
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const categories = [
    "SAR Backscatter",
    "Water Extent",
    "Vegetation Indices",
    "Coastal Change",
    "Reference Boundaries",
  ] as const;

  return (
    <div className="w-80 bg-[#070b16] border-r border-[#18233c] flex flex-col h-full select-none text-xs">
      {/* Sidebar Navigation Tabs (NASA Blue / ISRO Saffron theme) */}
      <div className="flex border-b border-[#18233c] bg-[#091020] p-1 gap-1">
        {[
          { id: "layers", label: "Layers", count: layers.filter((l) => l.visible).length, icon: Layers },
          { id: "observations", label: "Scenes", count: acquisitions.length, icon: Satellite },
          { id: "studies", label: "AOIs", count: savedAois.length, icon: FolderKanban },
          { id: "history", label: "Jobs", count: jobs.length, icon: Clock },
        ].map((tab) => {
          const isActive = activeSidebarTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onSidebarTabChange(tab.id as any)}
              className={`flex-1 py-2 px-1 rounded-md font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                isActive
                  ? "bg-gradient-to-r from-[#00e5ff] to-[#0b3d91] text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-[#111c34]"
              }`}
            >
              <div className="flex items-center gap-1">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-mono uppercase">{tab.label}</span>
              </div>
              <span className={`text-[9px] font-mono leading-none ${isActive ? "text-slate-950 font-black" : "text-slate-500"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Layers Management Panel */}
      {activeSidebarTab === "layers" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between text-slate-400 px-1 font-mono text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ff9933]" />
              <span>GEOSPATIAL LAYERS</span>
            </span>
            <span className="text-[#00e5ff] font-bold">{layers.filter((l) => l.visible).length} visible</span>
          </div>

          {categories.map((category) => {
            const catLayers = layers.filter((l) => l.category === category);
            if (catLayers.length === 0) return null;
            const isExpanded = expandedCategories[category] ?? true;

            return (
              <div key={category} className="rounded-lg border border-[#1e2e4f] bg-[#0b1222] overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#0e1930] hover:bg-[#122040] transition-colors font-bold text-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {category === "SAR Backscatter" && <Satellite className="h-3.5 w-3.5 text-[#00e5ff]" />}
                    {category === "Water Extent" && <Waves className="h-3.5 w-3.5 text-blue-400" />}
                    {category === "Vegetation Indices" && <TreePine className="h-3.5 w-3.5 text-[#138808]" />}
                    {category === "Coastal Change" && <Activity className="h-3.5 w-3.5 text-[#ff9933]" />}
                    {category === "Reference Boundaries" && <Compass className="h-3.5 w-3.5 text-purple-400" />}
                    <span>{category}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div className="divide-y divide-[#18233c] p-1.5 space-y-1">
                    {catLayers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`p-2.5 rounded-md transition-all space-y-2 ${
                          layer.visible ? "bg-[#111d38] border border-[#1e3258]" : "hover:bg-[#0e1628] opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <button
                              onClick={() => onToggleLayer(layer.id)}
                              className={`p-1 rounded transition-colors ${
                                layer.visible
                                  ? "bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/30"
                                  : "bg-slate-800 text-slate-500 hover:text-slate-300"
                              }`}
                              title={layer.visible ? "Hide layer" : "Show layer"}
                            >
                              {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </button>
                            <span className={`text-xs font-semibold truncate ${layer.visible ? "text-white" : "text-slate-400 line-through"}`}>
                              {layer.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {layer.units && (
                              <span className="text-[10px] font-mono text-[#00e5ff] bg-[#041e42] border border-[#0b3d91] px-1.5 py-0.5 rounded font-bold">
                                {layer.units}
                              </span>
                            )}
                            <button
                              onClick={() => onRemoveLayer(layer.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                              title="Remove layer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {layer.visible && (
                          <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-300">
                            <span className="text-slate-400">Opacity:</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={layer.opacity}
                              onChange={(e) => onChangeOpacity(layer.id, parseInt(e.target.value))}
                              className="w-full accent-[#00e5ff] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                            />
                            <span className="w-8 text-right font-bold text-[#00e5ff]">{layer.opacity}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Satellite Scenes Catalogue */}
      {activeSidebarTab === "observations" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono">
          <div className="text-[11px] text-slate-400 px-1 flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#00e5ff]" />
              <span>NISAR SAR SCENES</span>
            </span>
            <span className="text-[#ff9933] font-bold">{acquisitions.length} Granules</span>
          </div>

          <div className="space-y-2">
            {acquisitions.map((acq) => {
              const isSelected = selectedAcquisitionId === (acq.id || acq.granule_id);
              const dateStr = acq.acquisition_date || acq.acquisitionDate || "2026-10-30";
              const isNisar = (acq.id || "").includes("NISAR") || (acq.sensor || "").includes("NISAR");

              return (
                <div
                  key={acq.id || acq.granule_id}
                  onClick={() => onSelectAcquisition(acq)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0d1d3c] border-[#00e5ff] text-white shadow-md shadow-[#00e5ff]/15"
                      : "bg-[#0b1222] border-[#1e2e4f] hover:border-slate-600 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#041e42] text-[#00e5ff] font-extrabold border border-[#0b3d91]">
                      {isNisar ? "NISAR L2 GCOV (NASA/ISRO)" : "SENTINEL-1 C-SAR"}
                    </span>
                    <span className="text-[10px] text-[#ff9933] font-extrabold">
                      {new Date(dateStr).toISOString().substring(0, 10)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white mt-1.5 truncate">
                    {acq.id || acq.granule_id}
                  </p>

                  <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-slate-400">
                    <span>Track {acq.relative_orbit || acq.relativeOrbit || "084"}</span>
                    <span>•</span>
                    <span>{acq.orbit_pass || acq.orbitPass || "ASCENDING"}</span>
                    <span>•</span>
                    <span>{Array.isArray(acq.polarizations) ? acq.polarizations.join("/") : "HH/HV"}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] border-t border-[#18233c] pt-1.5">
                    <span className="text-[#34d399] flex items-center gap-1 font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Calibrated Float32 γ⁰</span>
                    </span>
                    <span className="text-slate-400">170.9m grid</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Saved Studies & AOIs */}
      {activeSidebarTab === "studies" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-[11px] text-slate-400 px-1 font-mono">PRIMARY MISSION REGION</div>

          <div className="space-y-2">
            {savedAois.map((aoi) => (
              <div
                key={aoi.id}
                onClick={() => onSelectAoi(aoi)}
                className="p-3.5 rounded-lg bg-[#0b1222] border border-[#1e2e4f] hover:border-[#00e5ff]/60 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white truncate">{aoi.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#0f2d1e] text-[#34d399] border border-[#138808]/60 font-bold font-mono">
                    ACTIVE AOI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{aoi.description || aoi.region}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#00e5ff] border-t border-[#18233c] pt-1.5 font-bold">
                  <span>Area: {(aoi.total_area_ha || aoi.totalAreaHa || 271500).toLocaleString()} ha</span>
                  <span>Coastline: {aoi.coastal_length_km || aoi.coastalLengthKm || 187.9} km</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Processing History */}
      {activeSidebarTab === "history" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono">
          <div className="text-[11px] text-slate-400 px-1 flex items-center justify-between">
            <span className="font-bold text-white">JOB EXECUTION LOGS</span>
            <span className="text-[#00e5ff] font-bold">{jobs.length} Executed</span>
          </div>

          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="p-3 rounded-lg bg-[#0b1222] border border-[#1e2e4f] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{job.job_name || job.jobName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#0f2d1e] text-[#34d399] border border-[#138808] font-bold">
                    {job.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">ID: {job.id}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-[#18233c] pt-1">
                  <span>Alg: {job.algorithm}</span>
                  <span className="text-[#ff9933] font-bold">{job.completed_at ? "Completed" : "Active"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
