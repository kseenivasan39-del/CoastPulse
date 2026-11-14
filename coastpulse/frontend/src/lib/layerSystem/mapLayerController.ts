import * as maplibregl from "maplibre-gl";
import { LAYER_REGISTRY, LayerDefinition, NAGAPATTINAM_COORDS } from "./layerRegistry";
import { layerStore } from "./layerStore";

export class MapLayerController {
  private map: maplibregl.Map | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private addedLayers: Set<string> = new Set();
  private failedSources: Set<string> = new Set();

  constructor() {}

  public attach(map: maplibregl.Map) {
    this.map = map;
    this.syncAllLayers();

    // Listen to changes in the store
    this.unsubscribeStore = layerStore.subscribe(() => {
      this.syncAllLayers();
    });
  }

  public detach() {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    this.map = null;
    this.addedLayers.clear();
  }

  public zoomToLayerExtent(layerId: string) {
    if (!this.map) return;
    const def = LAYER_REGISTRY.find((l) => l.id === layerId);
    if (!def) return;

    if (def.coordinates) {
      // coordinates: [Top-Left, Top-Right, Bottom-Right, Bottom-Left]
      const tl = def.coordinates[0];
      const br = def.coordinates[2];
      const bounds = new maplibregl.LngLatBounds(
        [tl[0], br[1]], // minLng, minLat
        [br[0], tl[1]]  // maxLng, maxLat
      );
      this.map.fitBounds(bounds, { padding: 40, duration: 1200 });
    } else {
      // Standard Nagapattinam extent
      this.map.flyTo({ center: [79.8433, 10.7670], zoom: 10, duration: 1200 });
    }
  }

  public syncAllLayers() {
    if (!this.map || !this.map.isStyleLoaded()) return;

    const layerOrder = layerStore.getLayerOrder();
    
    // First, sync states
    for (const def of LAYER_REGISTRY) {
      this.syncSingleLayer(def);
    }

    // Second, enforce stacking order in MapLibre
    // Later items in layerOrder should be on top
    this.enforceLayerOrder(layerOrder);
  }

  private enforceLayerOrder(layerOrder: string[]) {
    if (!this.map) return;

    // Filter enabled layers
    const activeLayerIds = layerOrder.filter((id) => {
      const state = layerStore.getLayerState(id);
      return state.enabled;
    });

    // Move layers sequentially
    for (let i = 0; i < activeLayerIds.length; i++) {
      const lid = `layer-${activeLayerIds[i]}`;
      if (this.map.getLayer(lid)) {
        try {
          this.map.moveLayer(lid);
        } catch {
          // Ignore ordering boundary errors
        }
      }
    }
  }

  public syncSingleLayer(def: LayerDefinition) {
    if (!this.map || !this.map.isStyleLoaded()) return;

    const state = layerStore.getLayerState(def.id);

    // If disabled
    if (!state.enabled) {
      this.removeOrHideLayer(def);
      return;
    }

    // If enabled, ensure source and layer exist, and set visibility & rendering
    this.ensureAndShowLayer(def, state.opacity, state.rendering);
  }

  private removeOrHideLayer(def: LayerDefinition) {
    if (!this.map) return;
    const layerId = `layer-${def.id}`;

    if (this.map.getLayer(layerId)) {
      this.map.setLayoutProperty(layerId, "visibility", "none");
    }
    if (def.id === "ref-esri-imagery" && this.map.getLayer("satellite-layer")) {
      this.map.setLayoutProperty("satellite-layer", "visibility", "none");
    }
    if (def.id === "ref-district-boundary") {
      if (this.map.getLayer("boundary-dash")) {
        this.map.setLayoutProperty("boundary-dash", "visibility", "none");
      }
      if (this.map.getLayer("boundary-glow")) {
        this.map.setLayoutProperty("boundary-glow", "visibility", "none");
      }
    }
    if (def.id === "ref-sanctuary-reserve" && this.map.getLayer("point-calimere-ramsar")) {
      this.map.setLayoutProperty("point-calimere-ramsar", "visibility", "none");
    }
  }

  private ensureAndShowLayer(def: LayerDefinition, opacity: number, rendering?: any) {
    if (!this.map) return;
    const sourceId = `source-${def.id}`;
    const layerId = `layer-${def.id}`;

    // Handle reference layers with existing map structures
    if (def.id === "ref-esri-imagery") {
      if (this.map.getLayer("satellite-layer")) {
        this.map.setLayoutProperty("satellite-layer", "visibility", "visible");
        this.map.setPaintProperty("satellite-layer", "raster-opacity", opacity);
      }
      return;
    }

    if (def.id === "ref-district-boundary") {
      if (this.map.getLayer("boundary-dash")) {
        this.map.setLayoutProperty("boundary-dash", "visibility", "visible");
        this.map.setPaintProperty("boundary-dash", "line-opacity", opacity);
      }
      if (this.map.getLayer("boundary-glow")) {
        this.map.setLayoutProperty("boundary-glow", "visibility", "visible");
        this.map.setPaintProperty("boundary-glow", "line-opacity", opacity * 0.4);
      }
      return;
    }

    if (def.id === "ref-sanctuary-reserve") {
      this.ensureSanctuaryLayer();
      if (this.map.getLayer("point-calimere-ramsar")) {
        this.map.setLayoutProperty("point-calimere-ramsar", "visibility", "visible");
        this.map.setPaintProperty("point-calimere-ramsar", "line-opacity", opacity);
      }
      return;
    }

    // Raster image overlay layer
    if (def.sourceType === "raster_image" && def.coordinates) {
      if (!this.map.getSource(sourceId)) {
        try {
          this.map.addSource(sourceId, {
            type: "image",
            url: def.sourceUrl,
            coordinates: def.coordinates,
          });

          this.map.addLayer({
            id: layerId,
            type: "raster",
            source: sourceId,
            paint: {
              "raster-opacity": opacity,
              "raster-fade-duration": 200,
            },
          });

          this.addedLayers.add(def.id);
        } catch (err: any) {
          console.error(`Failed to add raster layer ${def.id}:`, err);
          return;
        }
      } else {
        // Source already exists
        if (this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, "visibility", "visible");
          this.map.setPaintProperty(layerId, "raster-opacity", opacity);

          // Apply color ramp / contrast stretch adjustments if supported
          if (rendering?.colorRamp === "grayscale") {
            this.map.setPaintProperty(layerId, "raster-saturation", -1);
          } else {
            this.map.setPaintProperty(layerId, "raster-saturation", 0);
          }

          // Dynamic brightness & contrast stretch support
          if (rendering?.stretch === "minmax") {
            this.map.setPaintProperty(layerId, "raster-contrast", 0.25);
          } else if (rendering?.stretch === "stddev") {
            this.map.setPaintProperty(layerId, "raster-contrast", 0.5);
          } else {
            this.map.setPaintProperty(layerId, "raster-contrast", 0);
          }
        }
      }
    }
  }

  private ensureSanctuaryLayer() {
    if (!this.map) return;
    const sourceId = "source-ref-sanctuary";
    const layerId = "point-calimere-ramsar";

    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { name: "Point Calimere Ramsar Wetland Sanctuary" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [79.78, 10.35],
                [79.88, 10.32],
                [79.86, 10.27],
                [79.80, 10.26],
                [79.74, 10.29],
                [79.78, 10.35],
              ],
            ],
          },
        },
      });

      this.map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": "#34d399",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });
    }
  }
}
