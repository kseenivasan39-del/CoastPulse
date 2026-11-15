"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  Droplets,
  TreePine,
  Image as ImageIcon,
  Mountain,
  MapPin,
  Check,
  Satellite,
  Info,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  Loader2,
  X,
  ExternalLink,
  Sliders,
  Maximize2,
  Trash2,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Columns,
  Zap,
  Filter,
  Copy,
  RotateCcw,
  Edit2,
  Pin,
  PinOff,
} from "lucide-react";
import {
  LAYER_CATEGORIES,
  LAYER_REGISTRY,
  LayerDefinition,
  FilterChipCategory,
  ColorRampType,
  layerStore,
  observationStore,
  SatelliteObservationItem,
  LAYER_PRESETS,
} from "@/lib/layerSystem";

// Map lucide icons to category IDs
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  sar: Activity,
  water: Droplets,
  vegetation: TreePine,
  change: Activity,
  optical: ImageIcon,
  terrain: Mountain,
  reference: MapPin,
};

const FILTER_CHIPS: { id: FilterChipCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sar", label: "SAR" },
  { id: "optical", label: "Optical" },
  { id: "derived", label: "Derived" },
  { id: "terrain", label: "Terrain" },
  { id: "vector", label: "Vector" },
];

interface LeftDataDrawerProps {
  onObservationSelect?: (obs: SatelliteObservationItem) => void;
  onZoomToLayer?: (layerId: string) => void;
}

export const LeftDataDrawer: React.FC<LeftDataDrawerProps> = ({
  onObservationSelect,
  onZoomToLayer,
}) => {
  const [, setStoreVersion] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [expandedLayerSettings, setExpandedLayerSettings] = useState<string | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelText, setEditLabelText] = useState<string>("");
  const [presetFeedback, setPresetFeedback] = useState<{ name: string; missing?: string[] } | null>(null);

  // Subscribe to layerStore and observationStore updates
  useEffect(() => {
    const unsubLayer = layerStore.subscribe(() => {
      setStoreVersion((v) => v + 1);
    });
    const unsubObs = observationStore.subscribe(() => {
      setStoreVersion((v) => v + 1);
    });

    observationStore.loadObservations();

    return () => {
      unsubLayer();
      unsubObs();
    };
  }, []);

  // Keyboard shortcut: Ctrl + / to focus search, Escape to clear/blur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "/" || e.code === "Slash")) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === "Escape") {
        if (layerStore.getInspectingLayerId()) {
          layerStore.setInspectingLayerId(null);
        } else if (document.activeElement === searchInputRef.current) {
          layerStore.setSearchQuery("");
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeTab = layerStore.getActiveTab();
  const activeFilterChip = layerStore.getActiveFilterChip();
  const searchQuery = layerStore.getSearchQuery();
  const inspectingLayerId = layerStore.getInspectingLayerId();
  const isPinned = layerStore.getIsPinned();
  const isCollapsed = layerStore.getIsCollapsed();

  const inspectingLayerDef = inspectingLayerId
    ? LAYER_REGISTRY.find((l) => l.id === inspectingLayerId)
    : null;

  const selectedObs = observationStore.getSelectedObservation();
  const observations = observationStore.getFilteredObservations(searchQuery);
  const isObsLoading = observationStore.isLoading();

  // Layer ordering
  const layerOrder = layerStore.getLayerOrder();

  // Active layers vs Available layers
  const activeLayers = useMemo(() => {
    return layerOrder
      .map((id) => LAYER_REGISTRY.find((l) => l.id === id))
      .filter((l): l is LayerDefinition => !!l && layerStore.getLayerState(l.id).enabled);
  }, [layerOrder, setStoreVersion]);

  // Filtered layers logic (Search + Filter Chips)
  const filteredLayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LAYER_REGISTRY.filter((layer) => {
      // Filter Chip match
      if (activeFilterChip !== "all" && layer.filterChip !== activeFilterChip) {
        return false;
      }
      // Text Search
      if (!q) return true;
      const matchName = layer.name.toLowerCase().includes(q);
      const matchSensor = layer.sensor.toLowerCase().includes(q);
      const matchCategory = layer.categoryId.toLowerCase().includes(q);
      const matchDesc = layer.description.toLowerCase().includes(q);
      const matchPol = layer.polarization?.toLowerCase().includes(q) || false;
      return matchName || matchSensor || matchCategory || matchDesc || matchPol;
    });
  }, [searchQuery, activeFilterChip]);

  // Group filtered layers by category
  const layersByCategory = useMemo(() => {
    const map = new Map<string, LayerDefinition[]>();
    for (const cat of LAYER_CATEGORIES) {
      map.set(cat.id, []);
    }
    for (const layer of filteredLayers) {
      const list = map.get(layer.categoryId) || [];
      list.push(layer);
      map.set(layer.categoryId, list);
    }
    return map;
  }, [filteredLayers]);

  // Diagnostic metrics
  const totalLayersCount = LAYER_REGISTRY.length;
  const activeLayersCount = activeLayers.length;
  const loadingLayersCount = LAYER_REGISTRY.filter((l) => layerStore.getLayerState(l.id).loading).length;
  const failedLayersCount = LAYER_REGISTRY.filter((l) => !!layerStore.getLayerState(l.id).error).length;

  // Approximate data size: sum of active native layers (~200KB each compressed preview or actual byte metric)
  const estimatedDataSizeMb = (activeLayersCount * 0.22).toFixed(1);

  // Handle Layer Toggle
  const handleToggleLayer = (layer: LayerDefinition) => {
    if (!layer.isAvailable) return;
    const nextState = !layerStore.getLayerState(layer.id).enabled;
    layerStore.toggleLayer(layer.id);

    // If enabling a layer, trigger zoom to layer extent so user sees it immediately
    if (nextState && onZoomToLayer) {
      onZoomToLayer(layer.id);
    }
  };

  // Handle Category Toggle
  const handleToggleCategory = (catId: string) => {
    layerStore.toggleCategory(catId);
  };

  // Handle Preset Execution
  const handleApplyPreset = (presetId: string) => {
    const res = layerStore.applyPreset(presetId);
    const p = LAYER_PRESETS.find((pr) => pr.id === presetId);
    setPresetFeedback({
      name: p?.name || "Preset",
      missing: res.missing.length > 0 ? res.missing : undefined,
    });
    setTimeout(() => setPresetFeedback(null), 4000);
  };

  // Handle Observation Click
  const handleSelectObservation = (obs: SatelliteObservationItem) => {
    observationStore.selectObservation(obs);
    if (onObservationSelect) {
      onObservationSelect(obs);
    }
  };

  const handleAddObservationToMap = (obs: SatelliteObservationItem) => {
    if (obs.correspondingLayerId) {
      layerStore.setLayerEnabled(obs.correspondingLayerId, true);
      layerStore.setActiveTab("layers");
    }
  };

  const handleStartRename = (layerId: string, currentLabel: string) => {
    setEditingLabelId(layerId);
    setEditLabelText(currentLabel);
  };

  const handleSaveRename = (layerId: string) => {
    layerStore.setLayerCustomLabel(layerId, editLabelText);
    setEditingLabelId(null);
  };

  // If panel is collapsed, show compact dock strip
  if (isCollapsed) {
    return (
      <div className="w-12 bg-[#050a16]/95 border-r border-[#10192a] flex flex-col items-center py-3 h-full select-none backdrop-blur-md z-10 shrink-0 space-y-4">
        <button
          onClick={() => layerStore.setIsCollapsed(false)}
          className="p-2 rounded-xl bg-[#09101f] border border-[#142036] text-slate-300 hover:text-white hover:bg-[#14233c] transition-colors"
          title="Expand Layer Panel"
        >
          <ChevronRight className="w-4 h-4 text-[#00e5ff]" />
        </button>

        <div className="w-6 h-px bg-slate-800" />

        <button
          onClick={() => {
            layerStore.setIsCollapsed(false);
            layerStore.setActiveTab("layers");
          }}
          className={`p-2 rounded-xl transition-colors ${
            activeTab === "layers" ? "bg-[#ff8c2b] text-black font-bold" : "text-slate-400 hover:text-white"
          }`}
          title="Layers"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            layerStore.setIsCollapsed(false);
            layerStore.setActiveTab("observations");
          }}
          className={`p-2 rounded-xl transition-colors ${
            activeTab === "observations" ? "bg-[#ff8c2b] text-black font-bold" : "text-slate-400 hover:text-white"
          }`}
          title="Observations"
        >
          <Satellite className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            layerStore.setIsCollapsed(false);
            layerStore.setActiveTab("quick-add");
          }}
          className={`p-2 rounded-xl transition-colors ${
            activeTab === "quick-add" ? "bg-[#ff8c2b] text-black font-bold" : "text-slate-400 hover:text-white"
          }`}
          title="Quick Add Presets"
        >
          <Zap className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <div className="text-[10px] font-mono text-cyan-400 font-semibold rotate-90 whitespace-nowrap mb-4">
          {activeLayersCount} LAYERS
        </div>
      </div>
    );
  }

  return (
    <div className="w-[330px] bg-[#050a16]/95 border-r border-[#10192a] flex flex-col h-full text-xs select-none backdrop-blur-md z-10 shrink-0 relative overflow-hidden transition-all duration-300">
      {/* 1. Top Header: Three Navigation Views + Pin & Collapse */}
      <div className="p-3 border-b border-[#0f1726] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#00e5ff]" />
            <span className="font-bold text-white text-xs uppercase tracking-wider">
              Layer Workspace
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => layerStore.setIsPinned(!isPinned)}
              className={`p-1 rounded hover:bg-[#14233c] transition-colors ${
                isPinned ? "text-[#00e5ff]" : "text-slate-500"
              }`}
              title={isPinned ? "Panel Pinned" : "Panel Unpinned"}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => layerStore.setIsCollapsed(true)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#14233c] transition-colors"
              title="Collapse Panel"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 p-1 bg-[#09101f] border border-[#142036] rounded-xl gap-1 text-[11px]">
          <button
            onClick={() => layerStore.setActiveTab("layers")}
            className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "layers"
                ? "bg-gradient-to-r from-[#e65c00] to-[#f97316] text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3 h-3" />
            Layers
          </button>
          <button
            onClick={() => layerStore.setActiveTab("observations")}
            className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "observations"
                ? "bg-gradient-to-r from-[#e65c00] to-[#f97316] text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Satellite className="w-3 h-3" />
            Observations
          </button>
          <button
            onClick={() => layerStore.setActiveTab("quick-add")}
            className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "quick-add"
                ? "bg-gradient-to-r from-[#e65c00] to-[#f97316] text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3 h-3" />
            Quick Add
          </button>
        </div>
      </div>

      {/* 2. Search Box with Ctrl / shortcut */}
      <div className="px-3 pt-2">
        <div className="relative flex items-center bg-[#0a1222] border border-[#16233a] focus-within:border-[#00e5ff]/50 rounded-xl px-2.5 py-1.5 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => layerStore.setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "layers"
                ? "Search layers, sensors, categories..."
                : activeTab === "observations"
                ? "Filter observations by satellite, sensor..."
                : "Search presets..."
            }
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs"
          />
          {searchQuery ? (
            <button
              onClick={() => layerStore.setSearchQuery("")}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono bg-[#111c30] px-1.5 py-0.5 rounded border border-[#1b2b45] pointer-events-none">
              Ctrl /
            </span>
          )}
        </div>
      </div>

      {/* 3. Category Filter Chips (Layers tab only) */}
      {activeTab === "layers" && (
        <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-[#0d1627]">
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilterChip === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => layerStore.setActiveFilterChip(chip.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50"
                    : "bg-[#09101f] text-slate-400 border border-[#142036] hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Preset Feedback Toast Banner */}
      {presetFeedback && (
        <div className="mx-3 my-1.5 p-2 rounded-lg bg-sky-950/70 border border-sky-500/40 text-[10px] text-sky-200 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">{presetFeedback.name}</span> preset activated.
            {presetFeedback.missing && (
              <div className="text-amber-400 mt-0.5">
                Note: {presetFeedback.missing.length} secondary dataset(s) currently uncollected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Body: LAYERS VIEW */}
      {activeTab === "layers" && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-none">
          {/* SECTION A: ACTIVE LAYERS (With Reordering & Advanced Settings) */}
          {activeLayers.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                <span className="flex items-center gap-1 font-bold text-sky-400">
                  <Layers className="w-3 h-3" />
                  ACTIVE LAYERS STACK ({activeLayers.length})
                </span>
                <span className="text-[9px] text-slate-500">Top renders above</span>
              </div>

              <div className="space-y-1.5">
                {activeLayers.map((layer, index) => {
                  const state = layerStore.getLayerState(layer.id);
                  const isSettingsOpen = expandedLayerSettings === layer.id;
                  const displayName = state.customLabel || layer.name;

                  return (
                    <div
                      key={layer.id}
                      className="rounded-xl bg-[#0b1424] border border-[#1a2c4a] p-2.5 transition-all shadow-md"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => layerStore.moveLayerUp(layer.id)}
                              disabled={index === 0}
                              className={`p-0.5 rounded hover:bg-[#152542] ${
                                index === 0 ? "opacity-20 cursor-not-allowed" : "text-slate-400 hover:text-white"
                              }`}
                              title="Move Up in Stacking Order"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => layerStore.moveLayerDown(layer.id)}
                              disabled={index === activeLayers.length - 1}
                              className={`p-0.5 rounded hover:bg-[#152542] ${
                                index === activeLayers.length - 1
                                  ? "opacity-20 cursor-not-allowed"
                                  : "text-slate-400 hover:text-white"
                              }`}
                              title="Move Down in Stacking Order"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Visibility Toggle Checkbox */}
                          <button
                            onClick={() => handleToggleLayer(layer)}
                            className="w-4 h-4 rounded bg-[#ff8c2b] text-black flex items-center justify-center shrink-0"
                            title="Toggle Visibility"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>

                          {/* Layer Title & Rename */}
                          <div className="min-w-0 flex-1">
                            {editingLabelId === layer.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editLabelText}
                                  onChange={(e) => setEditLabelText(e.target.value)}
                                  className="w-full bg-[#050a14] border border-[#00e5ff] rounded px-1.5 py-0.5 text-[11px] text-white"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveRename(layer.id);
                                    if (e.key === "Escape") setEditingLabelId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveRename(layer.id)}
                                  className="text-[10px] text-emerald-400 font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="font-bold text-[11px] text-white truncate" title={displayName}>
                                  {displayName}
                                </div>
                                <button
                                  onClick={() => handleStartRename(layer.id, displayName)}
                                  className="text-slate-500 hover:text-slate-300 p-0.5 shrink-0"
                                  title="Rename Display Label"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                            <div className="text-[9px] text-slate-400 font-mono truncate">
                              {layer.sensor} {layer.polarization ? `• ${layer.polarization}` : ""}
                            </div>
                          </div>
                        </div>

                        {/* Quick Control Icons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Zoom to Extent */}
                          <button
                            onClick={() => onZoomToLayer && onZoomToLayer(layer.id)}
                            className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-[#14233c]"
                            title="Zoom to Layer Extent"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>

                          {/* Metadata Info Drawer Trigger */}
                          <button
                            onClick={() => layerStore.setInspectingLayerId(layer.id)}
                            className="p-1 rounded text-slate-400 hover:text-[#00e5ff] hover:bg-[#14233c]"
                            title="Scientific Layer Metadata"
                          >
                            <Info className="w-3 h-3" />
                          </button>

                          {/* Settings Expand Toggle */}
                          <button
                            onClick={() =>
                              setExpandedLayerSettings(isSettingsOpen ? null : layer.id)
                            }
                            className={`p-1 rounded ${
                              isSettingsOpen
                                ? "text-[#ff8c2b] bg-[#14233c]"
                                : "text-slate-400 hover:text-slate-200 hover:bg-[#14233c]"
                            }`}
                            title="Visualization Settings"
                          >
                            <Sliders className="w-3 h-3" />
                          </button>

                          {/* Duplicate Config */}
                          <button
                            onClick={() => layerStore.duplicateLayerConfig(layer.id)}
                            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-[#14233c]"
                            title="Duplicate Layer Config"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          {/* Remove Layer */}
                          <button
                            onClick={() => layerStore.setLayerEnabled(layer.id, false)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#14233c]"
                            title="Remove from Active Stack"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Visualization Settings & Opacity Slider */}
                      {isSettingsOpen && (
                        <div className="mt-2.5 pt-2 border-t border-[#142540] space-y-2">
                          {/* Opacity Control */}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400 font-mono w-12">Opacity</span>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={state.opacity}
                              onChange={(e) =>
                                layerStore.setLayerOpacity(layer.id, parseFloat(e.target.value))
                              }
                              className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff8c2b]"
                            />
                            <span className="text-[9px] text-slate-400 font-mono w-8 text-right">
                              {Math.round(state.opacity * 100)}%
                            </span>
                          </div>

                          {/* Contrast / Stretch Setting */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[9px] text-slate-400 font-mono w-12">Stretch</span>
                            <div className="flex items-center gap-1 flex-1">
                              {(["minmax", "stddev", "linear"] as const).map((mode) => (
                                <button
                                  key={mode}
                                  onClick={() =>
                                    layerStore.setLayerRenderingOption(layer.id, { stretch: mode })
                                  }
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono capitalize transition-all ${
                                    state.rendering.stretch === mode
                                      ? "bg-[#00e5ff] text-black font-bold"
                                      : "bg-[#09101e] text-slate-400 hover:text-white border border-[#14233c]"
                                  }`}
                                >
                                  {mode}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Color Ramp Selection (Only for supported raster layers) */}
                          {layer.supportedRenders && layer.supportedRenders.length > 1 && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[9px] text-slate-400 font-mono w-12">Ramp</span>
                              <div className="flex items-center gap-1 flex-1">
                                {layer.supportedRenders.map((cr) => {
                                  const isSelected = state.rendering.colorRamp === cr;
                                  return (
                                    <button
                                      key={cr}
                                      onClick={() =>
                                        layerStore.setLayerRenderingOption(layer.id, { colorRamp: cr })
                                      }
                                      className={`px-2 py-0.5 rounded text-[9px] font-mono capitalize transition-all ${
                                        isSelected
                                          ? "bg-[#ff8c2b] text-black font-bold"
                                          : "bg-[#09101e] text-slate-400 hover:text-white border border-[#14233c]"
                                      }`}
                                    >
                                      {cr}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Reset Styling Action */}
                          <div className="flex items-center justify-between pt-1 border-t border-[#14233c]/60">
                            <button
                              onClick={() => layerStore.resetLayerStyling(layer.id)}
                              className="text-[9px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              Reset Styling
                            </button>
                            <span
                              className={`text-[8px] font-mono px-1 py-0.2 rounded border ${
                                layer.isNativeScienceData
                                  ? "text-emerald-400 border-emerald-900 bg-emerald-950/30"
                                  : "text-amber-400 border-amber-900 bg-amber-950/30"
                              }`}
                            >
                              {layer.isNativeScienceData ? "NATIVE SCIENCE DATA" : "ANALYSIS DERIVED"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION B: AVAILABLE LAYERS BY CATEGORY ACCORDION */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span className="font-bold text-slate-300">AVAILABLE CATALOGUE LAYERS</span>
              <span>{filteredLayers.length} shown</span>
            </div>

            {filteredLayers.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-2 bg-[#08101e] rounded-xl border border-[#142036]">
                <AlertTriangle className="w-5 h-5 mx-auto text-amber-400/80" />
                <div className="text-xs font-semibold text-slate-300">No matching layers found</div>
                <div className="text-[10px] text-slate-500">
                  No layer matches "{searchQuery}". Check filter chips or search term.
                </div>
                <button
                  onClick={() => {
                    layerStore.setSearchQuery("");
                    layerStore.setActiveFilterChip("all");
                  }}
                  className="mt-2 px-3 py-1 bg-[#0f1a2e] text-sky-400 rounded-lg text-[10px] border border-[#1a2c4a] hover:bg-[#152542]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              LAYER_CATEGORIES.map((cat) => {
                const catLayers = layersByCategory.get(cat.id) || [];
                if (catLayers.length === 0) return null;

                const isExpanded = searchQuery ? true : layerStore.isCategoryExpanded(cat.id);
                const Icon = CATEGORY_ICONS[cat.id] || Activity;
                const activeCount = catLayers.filter((l) => layerStore.getLayerState(l.id).enabled).length;

                return (
                  <div
                    key={cat.id}
                    className="rounded-xl bg-[#091120] border border-[#132036] overflow-hidden transition-colors"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => handleToggleCategory(cat.id)}
                      className="w-full p-2.5 flex items-center justify-between text-left group hover:bg-[#0d182b] transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span className="font-semibold text-slate-200 group-hover:text-white text-[11px]">
                          {cat.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({activeCount}/{catLayers.length})
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Category Layer Rows */}
                    {isExpanded && (
                      <div className="p-2 pt-0 space-y-1.5 border-t border-[#0e1726]/60">
                        {catLayers.map((layer) => {
                          const state = layerStore.getLayerState(layer.id);
                          return (
                            <div
                              key={layer.id}
                              className={`p-2 rounded-lg border transition-all ${
                                state.enabled
                                  ? "bg-[#0d182b] border-[#1e3458]"
                                  : "bg-[#070e1c] border-[#121c2e] hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                {/* Checkbox */}
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleLayer(layer);
                                  }}
                                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                                    state.enabled
                                      ? layer.id === "nisar-hv"
                                        ? "bg-[#00e5ff] text-black"
                                        : "bg-[#ff8c2b] text-black"
                                      : "bg-[#09111e] border border-slate-600 hover:border-slate-400"
                                  }`}
                                >
                                  {state.loading ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                                  ) : state.enabled ? (
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  ) : null}
                                </div>

                                {/* Thumbnail */}
                                {layer.thumbnailUrl && (
                                  <div className="w-8 h-8 rounded bg-slate-900 overflow-hidden border border-slate-700 shrink-0">
                                    <img
                                      src={layer.thumbnailUrl}
                                      alt={layer.name}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )}

                                {/* Layer Info Text */}
                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => handleToggleLayer(layer)}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="font-semibold text-[11px] text-white truncate">
                                      {layer.name}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        layerStore.setInspectingLayerId(layer.id);
                                      }}
                                      className="text-slate-400 hover:text-[#00e5ff] p-0.5"
                                      title="Layer Metadata"
                                    >
                                      <Info className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="text-[9px] text-slate-400 font-mono truncate">
                                    {layer.sensor} {layer.acquisitionDate ? `• ${layer.acquisitionDate}` : ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. Main Body: OBSERVATIONS VIEW */}
      {activeTab === "observations" && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-none">
          {/* Observation Filters */}
          <div className="space-y-1.5 pb-1">
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={observationStore.getFilterSatellite()}
                onChange={(e) => observationStore.setFilterSatellite(e.target.value)}
                className="bg-[#09101f] text-slate-300 border border-[#142036] rounded-lg p-1.5 text-[10px] focus:outline-none"
              >
                <option value="ALL">All Satellites</option>
                <option value="NISAR">NISAR (L & S-SAR)</option>
                <option value="Sentinel-1">Sentinel-1 (C-SAR)</option>
                <option value="Sentinel-2">Sentinel-2 (MSI Optical)</option>
              </select>

              <select
                value={observationStore.getFilterSensor()}
                onChange={(e) => observationStore.setFilterSensor(e.target.value)}
                className="bg-[#09101f] text-slate-300 border border-[#142036] rounded-lg p-1.5 text-[10px] focus:outline-none"
              >
                <option value="ALL">All Sensors</option>
                <option value="SAR">SAR Only</option>
                <option value="MSI">Optical MSI</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={observationStore.getFilterProductType()}
                onChange={(e) => observationStore.setFilterProductType(e.target.value)}
                className="bg-[#09101f] text-slate-300 border border-[#142036] rounded-lg p-1.5 text-[10px] focus:outline-none"
              >
                <option value="ALL">All Product Types</option>
                <option value="GCOV">GCOV (Covariance)</option>
                <option value="GRD">GRD (Ground Range)</option>
                <option value="MSI">MSIL2A (Reflectance)</option>
              </select>

              <select
                value={observationStore.getFilterDateRange()}
                onChange={(e) => observationStore.setFilterDateRange(e.target.value)}
                className="bg-[#09101f] text-slate-300 border border-[#142036] rounded-lg p-1.5 text-[10px] focus:outline-none"
              >
                <option value="ALL">All Acquisition Dates</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-04">April 2026</option>
              </select>
            </div>
          </div>

          {isObsLoading ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Loader2 className="w-5 h-5 mx-auto animate-spin text-[#00e5ff]" />
              <div className="text-xs">Querying satellite catalogues...</div>
            </div>
          ) : (
            <>
              {/* Selected Observation Inspection Drawer */}
              {selectedObs && (
                <div className="p-2.5 rounded-xl bg-[#081222] border border-[#00e5ff]/40 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#00e5ff] uppercase tracking-wider">
                      Selected Observation
                    </span>
                    <button
                      onClick={() => observationStore.selectObservation(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] font-bold text-white leading-tight">
                    {selectedObs.satellite} — {selectedObs.sensor}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono bg-[#050a14] p-2 rounded-lg border border-[#142036]">
                    <div>
                      <span className="text-slate-500">ACQ:</span>{" "}
                      <span className="text-slate-200">
                        {selectedObs.acquisitionDate?.split("T")[0] || selectedObs.acquisitionDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">POL:</span>{" "}
                      <span className="text-sky-300">{selectedObs.polarization}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">PRODUCT:</span>{" "}
                      <span className="text-amber-300">{selectedObs.productType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">LEVEL:</span>{" "}
                      <span className="text-slate-200">{selectedObs.processingLevel}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">PROVIDER:</span>{" "}
                      <span className="text-slate-300 truncate">{selectedObs.provider.split(" ")[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">STATUS:</span>{" "}
                      <span className="text-emerald-400">{selectedObs.status}</span>
                    </div>
                  </div>

                  {/* Add Observation to Map Button */}
                  {selectedObs.isMapSupported ? (
                    <button
                      onClick={() => handleAddObservationToMap(selectedObs)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#00e5ff] to-[#0284c7] text-black font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Add Observation As Map Layer
                    </button>
                  ) : (
                    <div className="text-[9px] text-slate-500 italic text-center p-1 bg-slate-900/40 rounded border border-slate-800">
                      Standard catalogue item • Raw granule download required for visualization
                    </div>
                  )}
                </div>
              )}

              {/* Observations List */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-slate-400 px-1 flex items-center justify-between">
                  <span>CATALOGUED ACQUISITIONS</span>
                  <span className="text-sky-400 font-bold">{observations.length} Found</span>
                </div>

                {observations.map((obs) => {
                  const isSelected = selectedObs?.id === obs.id;
                  const dateStr = obs.acquisitionDate ? obs.acquisitionDate.split("T")[0] : "Recent";

                  return (
                    <div
                      key={obs.id}
                      onClick={() => handleSelectObservation(obs)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0c182c] border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                          : "bg-[#091120] border-[#132036] hover:border-slate-600 hover:bg-[#0c1626]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Satellite className="w-3.5 h-3.5 text-sky-400" />
                          <span className="font-bold text-[11px] text-white">{obs.satellite}</span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-400/90 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                          {obs.productType}
                        </span>
                      </div>

                      <div className="mt-1 text-[10px] text-slate-300 font-medium truncate">
                        {obs.sensor}
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{dateStr}</span>
                        </div>
                        <span className="text-emerald-400">{obs.polarization}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* 6. Main Body: QUICK ADD PRESETS VIEW */}
      {activeTab === "quick-add" && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-none">
          <div className="text-[10px] font-mono text-slate-400 px-1">
            SCIENTIFIC COMBINATION PRESETS
          </div>

          <div className="space-y-2">
            {LAYER_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-3 rounded-xl bg-[#091120] border border-[#142036] hover:border-[#1e3458] transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-[11px]">{preset.name}</div>
                    <div className="text-[9px] font-mono text-[#00e5ff]">{preset.category}</div>
                  </div>
                  <button
                    onClick={() => handleApplyPreset(preset.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#ff8c2b] text-black font-bold text-[10px] hover:bg-[#ffa24d] transition-colors shrink-0 shadow-sm"
                  >
                    Activate
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed">
                  {preset.description}
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-[#121c2e]">
                  <span className="text-[8px] font-mono text-slate-500">Includes:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {preset.layerIds.map((lid) => {
                      const def = LAYER_REGISTRY.find((l) => l.id === lid);
                      return (
                        <span
                          key={lid}
                          className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#0e1728] border border-[#192842] text-slate-300"
                        >
                          {def?.name || lid}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Slide-over Scientific Layer Metadata Drawer */}
      {inspectingLayerDef && (
        <div className="absolute inset-0 bg-[#040813]/98 backdrop-blur-xl z-30 flex flex-col p-4 text-xs animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#00e5ff]" />
              <span className="font-bold text-white text-xs">Scientific Layer Metadata</span>
            </div>
            <button
              onClick={() => layerStore.setInspectingLayerId(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3 font-sans scrollbar-none">
            {/* Title & Sensor */}
            <div>
              <div className="font-extrabold text-white text-sm leading-tight">
                {inspectingLayerDef.name}
              </div>
              <div className="text-[11px] text-[#00e5ff] font-mono mt-0.5">
                {inspectingLayerDef.sensor} ({inspectingLayerDef.satellite})
              </div>
            </div>

            {/* Description */}
            <div className="text-[11px] text-slate-300 leading-relaxed bg-[#081120] p-2.5 rounded-xl border border-[#142238]">
              {inspectingLayerDef.description}
            </div>

            {/* Detailed Forensic Table */}
            <div className="space-y-1.5 bg-[#070e1c] p-2.5 rounded-xl border border-[#121c2e] font-mono text-[10px]">
              <div className="flex justify-between py-1 border-b border-[#10192a]">
                <span className="text-slate-500">Source Product ID:</span>
                <span className="text-slate-200 text-right truncate max-w-[170px]" title={inspectingLayerDef.sourceProductId}>
                  {inspectingLayerDef.sourceProductId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#10192a]">
                <span className="text-slate-500">Processing Level:</span>
                <span className="text-amber-400 text-right">{inspectingLayerDef.processingLevel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#10192a]">
                <span className="text-slate-500">CRS / Projection:</span>
                <span className="text-sky-300 text-right">{inspectingLayerDef.crs}</span>
              </div>
              {inspectingLayerDef.acquisitionDate && (
                <div className="flex justify-between py-1 border-b border-[#10192a]">
                  <span className="text-slate-500">Acquisition UTC:</span>
                  <span className="text-slate-200 text-right">{inspectingLayerDef.acquisitionDate}</span>
                </div>
              )}
              {inspectingLayerDef.polarization && (
                <div className="flex justify-between py-1 border-b border-[#10192a]">
                  <span className="text-slate-500">Polarization:</span>
                  <span className="text-emerald-400 text-right">{inspectingLayerDef.polarization}</span>
                </div>
              )}
              {inspectingLayerDef.units && (
                <div className="flex justify-between py-1 border-b border-[#10192a]">
                  <span className="text-slate-500">Physical Units:</span>
                  <span className="text-slate-200 text-right">{inspectingLayerDef.units}</span>
                </div>
              )}
              {inspectingLayerDef.resolutionM && (
                <div className="flex justify-between py-1 border-b border-[#10192a]">
                  <span className="text-slate-500">Spatial Resolution:</span>
                  <span className="text-slate-200 text-right">{inspectingLayerDef.resolutionM} meters</span>
                </div>
              )}
              {inspectingLayerDef.rasterDimensions && (
                <div className="flex justify-between py-1 border-b border-[#10192a]">
                  <span className="text-slate-500">Matrix Dimensions:</span>
                  <span className="text-slate-200 text-right">{inspectingLayerDef.rasterDimensions}</span>
                </div>
              )}
              {inspectingLayerDef.noDataValue && (
                <div className="flex justify-between py-1 border-b border-[#10192a]">
                  <span className="text-slate-500">NoData Value:</span>
                  <span className="text-rose-400 text-right">{inspectingLayerDef.noDataValue}</span>
                </div>
              )}
              {inspectingLayerDef.downloadSourceReference && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Catalogue Ref:</span>
                  <span className="text-slate-300 text-right truncate max-w-[170px]" title={inspectingLayerDef.downloadSourceReference}>
                    {inspectingLayerDef.downloadSourceReference}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions inside Drawer */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  layerStore.toggleLayer(inspectingLayerDef.id);
                }}
                className={`flex-1 py-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                  layerStore.getLayerState(inspectingLayerDef.id).enabled
                    ? "bg-rose-950/40 text-rose-300 border border-rose-800/40"
                    : "bg-[#ff8c2b] text-black shadow-md hover:bg-[#ffa24d]"
                }`}
              >
                {layerStore.getLayerState(inspectingLayerDef.id).enabled
                  ? "Disable Layer"
                  : "Enable on Map"}
              </button>
              <button
                onClick={() => onZoomToLayer && onZoomToLayer(inspectingLayerDef.id)}
                className="p-2 rounded-xl bg-[#09101f] border border-[#142036] text-slate-300 hover:text-white"
                title="Zoom to Extent"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Diagnostics & Status Footer */}
      <div className="p-2.5 border-t border-[#0e1726] bg-[#030712] space-y-1 font-mono text-[9px]">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                loadingLayersCount > 0
                  ? "bg-amber-400 animate-spin"
                  : failedLayersCount > 0
                  ? "bg-rose-500"
                  : "bg-emerald-400 animate-pulse"
              }`}
            />
            <span>Active Layers:</span>
          </div>
          <span className="text-sky-400 font-bold">
            {activeLayersCount} of {totalLayersCount} enabled
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span>Map Rendering: WebGL</span>
          <span>{loadingLayersCount > 0 ? `${loadingLayersCount} loading` : `${estimatedDataSizeMb} MB loaded`}</span>
        </div>

        {selectedObs && (
          <div className="text-[8px] text-slate-500 truncate pt-0.5 border-t border-[#0e1726]">
            Selected: <span className="text-slate-300">{selectedObs.satellite} ({selectedObs.acquisitionDate?.split("T")[0]})</span>
          </div>
        )}
      </div>
    </div>
  );
};
