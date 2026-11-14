import { LAYER_REGISTRY, LayerDefinition, FilterChipCategory, LayerRenderingOptions, ColorRampType } from "./layerRegistry";

export interface LayerState {
  enabled: boolean;
  opacity: number;
  loading: boolean;
  error: string | null;
  rendering: LayerRenderingOptions;
  customLabel?: string;
}

export type LayerStoreListener = () => void;

export interface LayerPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  layerIds: string[];
  unavailableWarning?: string;
}

export const LAYER_PRESETS: LayerPreset[] = [
  {
    id: "preset-sar-composite",
    name: "SAR Composite (HH + HV)",
    category: "SAR Multi-Polarization",
    description: "Activates calibrated NISAR L-band dual-polarization pair (co-pol surface rough structure + cross-pol volumetric vegetation scattering).",
    layerIds: ["nisar-hh", "nisar-hv"],
  },
  {
    id: "preset-water-extent",
    name: "Water Extent & Hydrology",
    category: "Inundation Dynamics",
    description: "Deploys surface water mask alongside Vedaranyam tidal channels for coastal inundation and estuary monitoring.",
    layerIds: ["water-inundation", "tidal-wetland-flow"],
  },
  {
    id: "preset-mangrove-monitoring",
    name: "Mangrove Monitoring (Muthupet)",
    category: "Biophysical Canopy",
    description: "Overlay Muthupet Radar Vegetation Index (RVI) with protected Point Calimere Ramsar sanctuary vector boundary.",
    layerIds: ["mangrove-rvi", "ref-sanctuary-reserve"],
  },
  {
    id: "preset-coastal-change",
    name: "Coastal Change & Shoreline",
    category: "Geomorphology",
    description: "Activates NISAR 12-day repeat orbit bitemporal change heatmap and shoreline displacement vector.",
    layerIds: ["nisar-bitemporal-change", "shoreline-erosion-vector"],
  },
  {
    id: "preset-multidate-comparison",
    name: "Multi-date Comparison (T1 vs T2)",
    category: "Temporal Audit",
    description: "Simultaneously mounts Oct 30 (Baseline) and Nov 11 (Repeat) NISAR scenes for comparative analysis.",
    layerIds: ["nisar-hh", "nisar-hv", "nisar-bitemporal-change"],
  },
  {
    id: "preset-terrain-analysis",
    name: "Terrain & Elevation Vulnerability",
    category: "Topography",
    description: "Renders Copernicus GLO-30 30-meter digital elevation model with coastal administrative boundary contours.",
    layerIds: ["copernicus-dem", "ref-district-boundary"],
  },
];

class LayerStore {
  private states: Map<string, LayerState> = new Map();
  private layerOrder: string[] = []; // Top to bottom layer stacking
  private expandedCategories: Set<string> = new Set(["sar"]);
  private activeTab: "layers" | "observations" | "quick-add" | "analytics" = "layers";
  private activeFilterChip: FilterChipCategory = "all";
  private searchQuery: string = "";
  private selectedObservationId: string | null = null;
  private inspectingLayerId: string | null = null;
  private inspectingStatsLayerId: string | null = null;
  
  // Panel Pin & Collapse
  private isPinned: boolean = true;
  private isCollapsed: boolean = false;

  // Comparison Swipe / Split State
  private comparisonMode: "none" | "swipe" | "split" = "none";
  private comparisonSwipeRatio: number = 0.5; // 0.0 to 1.0
  private comparisonLeftLayerId: string = "nisar-hh";
  private comparisonRightLayerId: string = "nisar-hv";

  private listeners: Set<LayerStoreListener> = new Set();

  constructor() {
    this.initializeDefaults();
    this.loadFromStorage();
  }

  private initializeDefaults() {
    this.layerOrder = LAYER_REGISTRY.map((l) => l.id);
    for (const def of LAYER_REGISTRY) {
      if (!this.states.has(def.id)) {
        this.states.set(def.id, {
          enabled: def.defaultVisible,
          opacity: def.defaultOpacity,
          loading: false,
          error: null,
          rendering: {
            colorRamp: def.supportedRenders?.[0] || "grayscale",
            stretch: "minmax",
            noDataTransparent: true,
          },
        });
      }
    }
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("coastpulse_adv_layer_store_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.states && typeof parsed.states === "object") {
          for (const [id, state] of Object.entries(parsed.states)) {
            if (this.states.has(id)) {
              const current = this.states.get(id)!;
              const s = state as any;
              this.states.set(id, {
                ...current,
                enabled: typeof s.enabled === "boolean" ? s.enabled : current.enabled,
                opacity: typeof s.opacity === "number" ? s.opacity : current.opacity,
                rendering: s.rendering ? { ...current.rendering, ...s.rendering } : current.rendering,
                customLabel: typeof s.customLabel === "string" ? s.customLabel : undefined,
              });
            }
          }
        }
        if (Array.isArray(parsed.layerOrder)) {
          const existingSet = new Set(parsed.layerOrder);
          const remaining = LAYER_REGISTRY.map((l) => l.id).filter((id) => !existingSet.has(id));
          this.layerOrder = [...parsed.layerOrder, ...remaining];
        }
        if (Array.isArray(parsed.expandedCategories)) {
          this.expandedCategories = new Set(parsed.expandedCategories);
        }
        if (["layers", "observations", "quick-add", "analytics"].includes(parsed.activeTab)) {
          this.activeTab = parsed.activeTab;
        }
        if (typeof parsed.isPinned === "boolean") {
          this.isPinned = parsed.isPinned;
        }
      }
    } catch {
      // Ignore local storage errors
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      const serializableStates: Record<string, any> = {};
      this.states.forEach((state, id) => {
        serializableStates[id] = {
          enabled: state.enabled,
          opacity: state.opacity,
          rendering: state.rendering,
          customLabel: state.customLabel,
        };
      });
      localStorage.setItem(
        "coastpulse_adv_layer_store_v2",
        JSON.stringify({
          states: serializableStates,
          layerOrder: this.layerOrder,
          expandedCategories: Array.from(this.expandedCategories),
          activeTab: this.activeTab,
          isPinned: this.isPinned,
        })
      );
    } catch {
      // Ignore local storage errors
    }
  }

  public subscribe(listener: LayerStoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  // --- Layer Controls ---
  public getLayerState(layerId: string): LayerState {
    const s = this.states.get(layerId);
    if (!s) {
      return {
        enabled: false,
        opacity: 1.0,
        loading: false,
        error: null,
        rendering: { colorRamp: "grayscale", stretch: "minmax", noDataTransparent: true },
      };
    }
    return { ...s };
  }

  public getAllStates(): Map<string, LayerState> {
    return new Map(this.states);
  }

  public setLayerEnabled(layerId: string, enabled: boolean) {
    const current = this.states.get(layerId);
    if (!current) return;
    this.states.set(layerId, { ...current, enabled, error: null });
    this.notify();
  }

  public toggleLayer(layerId: string) {
    const current = this.states.get(layerId);
    if (!current) return;
    this.setLayerEnabled(layerId, !current.enabled);
  }

  public setLayerOpacity(layerId: string, opacity: number) {
    const current = this.states.get(layerId);
    if (!current) return;
    this.states.set(layerId, { ...current, opacity: Math.max(0, Math.min(1, opacity)) });
    this.notify();
  }

  public setLayerRenderingOption(layerId: string, opts: Partial<LayerRenderingOptions>) {
    const current = this.states.get(layerId);
    if (!current) return;
    this.states.set(layerId, {
      ...current,
      rendering: { ...current.rendering, ...opts },
    });
    this.notify();
  }

  public setLayerCustomLabel(layerId: string, label: string) {
    const current = this.states.get(layerId);
    if (!current) return;
    this.states.set(layerId, { ...current, customLabel: label.trim() || undefined });
    this.notify();
  }

  public resetLayerStyling(layerId: string) {
    const def = LAYER_REGISTRY.find((l) => l.id === layerId);
    if (!def) return;
    const current = this.states.get(layerId);
    if (!current) return;
    this.states.set(layerId, {
      ...current,
      opacity: def.defaultOpacity,
      rendering: {
        colorRamp: def.supportedRenders?.[0] || "grayscale",
        stretch: "minmax",
        noDataTransparent: true,
      },
      customLabel: undefined,
    });
    this.notify();
  }

  public duplicateLayerConfig(layerId: string) {
    const state = this.getLayerState(layerId);
    const def = LAYER_REGISTRY.find((l) => l.id === layerId);
    if (!def) return;
    // Activate layer if not active and give customized duplicate label
    this.setLayerEnabled(layerId, true);
    this.setLayerCustomLabel(layerId, `${def.name} (Copy)`);
  }

  public setLayerLoading(layerId: string, loading: boolean) {
    const current = this.states.get(layerId);
    if (!current) return;
    this.states.set(layerId, { ...current, loading });
    this.notify();
  }

  public setLayerError(layerId: string, error: string | null) {
    const current = this.states.get(layerId);
    if (!current) return;
    this.states.set(layerId, { ...current, error, loading: false, enabled: error ? false : current.enabled });
    this.notify();
  }

  // --- Layer Ordering & Drag-and-Drop ---
  public getLayerOrder(): string[] {
    return [...this.layerOrder];
  }

  public moveLayer(fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      fromIndex >= this.layerOrder.length ||
      toIndex < 0 ||
      toIndex >= this.layerOrder.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const updated = [...this.layerOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    this.layerOrder = updated;
    this.notify();
  }

  public moveLayerUp(layerId: string) {
    const idx = this.layerOrder.indexOf(layerId);
    if (idx > 0) {
      this.moveLayer(idx, idx - 1);
    }
  }

  public moveLayerDown(layerId: string) {
    const idx = this.layerOrder.indexOf(layerId);
    if (idx >= 0 && idx < this.layerOrder.length - 1) {
      this.moveLayer(idx, idx + 1);
    }
  }

  // --- Presets ---
  public applyPreset(presetId: string): { applied: string[]; missing: string[] } {
    const preset = LAYER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return { applied: [], missing: [] };

    const applied: string[] = [];
    const missing: string[] = [];

    for (const lid of preset.layerIds) {
      const def = LAYER_REGISTRY.find((l) => l.id === lid);
      if (def && def.isAvailable) {
        const current = this.states.get(lid);
        if (current) {
          this.states.set(lid, { ...current, enabled: true, error: null });
        }
        applied.push(lid);
      } else {
        missing.push(lid);
      }
    }
    this.notify();
    return { applied, missing };
  }

  // --- Category Accordion State ---
  public isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  public toggleCategory(categoryId: string) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
    this.notify();
  }

  public setCategoryExpanded(categoryId: string, expanded: boolean) {
    if (expanded) {
      this.expandedCategories.add(categoryId);
    } else {
      this.expandedCategories.delete(categoryId);
    }
    this.notify();
  }

  // --- UI Tab & Filter Chips ---
  public getActiveTab(): "layers" | "observations" | "quick-add" | "analytics" {
    return this.activeTab;
  }

  public setActiveTab(tab: "layers" | "observations" | "quick-add" | "analytics") {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.notify();
    }
  }

  public getInspectingStatsLayerId(): string | null {
    return this.inspectingStatsLayerId;
  }

  public setInspectingStatsLayerId(id: string | null) {
    this.inspectingStatsLayerId = id;
    this.notify();
  }

  public getActiveFilterChip(): FilterChipCategory {
    return this.activeFilterChip;
  }

  public setActiveFilterChip(chip: FilterChipCategory) {
    if (this.activeFilterChip !== chip) {
      this.activeFilterChip = chip;
      this.notify();
    }
  }

  public getSearchQuery(): string {
    return this.searchQuery;
  }

  public setSearchQuery(q: string) {
    this.searchQuery = q;
    this.notify();
  }

  public getSelectedObservationId(): string | null {
    return this.selectedObservationId;
  }

  public setSelectedObservationId(id: string | null) {
    this.selectedObservationId = id;
    this.notify();
  }

  // Panel Pin / Collapse
  public getIsPinned(): boolean {
    return this.isPinned;
  }

  public setIsPinned(pinned: boolean) {
    this.isPinned = pinned;
    this.notify();
  }

  public getIsCollapsed(): boolean {
    return this.isCollapsed;
  }

  public setIsCollapsed(collapsed: boolean) {
    this.isCollapsed = collapsed;
    this.notify();
  }

  // Metadata Inspector Drawer
  public getInspectingLayerId(): string | null {
    return this.inspectingLayerId;
  }

  public setInspectingLayerId(id: string | null) {
    this.inspectingLayerId = id;
    this.notify();
  }

  // Comparison Workspace
  public getComparisonMode(): "none" | "swipe" | "split" {
    return this.comparisonMode;
  }

  public setComparisonMode(mode: "none" | "swipe" | "split") {
    this.comparisonMode = mode;
    this.notify();
  }

  public getComparisonSwipeRatio(): number {
    return this.comparisonSwipeRatio;
  }

  public setComparisonSwipeRatio(ratio: number) {
    this.comparisonSwipeRatio = Math.max(0, Math.min(1, ratio));
    this.notify();
  }

  public getComparisonLayers(): { left: string; right: string } {
    return { left: this.comparisonLeftLayerId, right: this.comparisonRightLayerId };
  }

  public setComparisonLayers(left: string, right: string) {
    this.comparisonLeftLayerId = left;
    this.comparisonRightLayerId = right;
    this.notify();
  }
}

export const layerStore = new LayerStore();
