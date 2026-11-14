import { apiService, fetchFromApi } from "@/lib/apiClient";

export interface SatelliteObservationItem {
  id: string;
  item_id: string;
  provider: string;
  satellite: string;
  sensor: string;
  polarization: string;
  productType: string;
  acquisitionDate: string;
  publicationDate: string;
  deliveryType: string;
  status: string;
  resolutionM?: number;
  centerFrequencyGhz?: number;
  spatialBounds?: [number, number, number, number];
  rawMetadata?: any;
  isMapSupported: boolean;
  correspondingLayerId?: string;
  processingLevel: string;
}

export type ObservationStoreListener = () => void;

class ObservationStore {
  private observations: SatelliteObservationItem[] = [];
  private selectedObservation: SatelliteObservationItem | null = null;
  private loading: boolean = false;
  private error: string | null = null;
  private listeners: Set<ObservationStoreListener> = new Set();
  private fetched: boolean = false;

  // Filters
  private filterSatellite: string = "ALL";
  private filterSensor: string = "ALL";
  private filterProductType: string = "ALL";
  private filterDateRange: string = "ALL"; // ALL, 2026-11, 2026-10, 2026-04

  constructor() {}

  public subscribe(listener: ObservationStoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getObservations(): SatelliteObservationItem[] {
    return this.observations;
  }

  public getFilteredObservations(searchQuery: string = ""): SatelliteObservationItem[] {
    const q = searchQuery.trim().toLowerCase();
    return this.observations.filter((obs) => {
      // Satellite filter
      if (this.filterSatellite !== "ALL" && obs.satellite !== this.filterSatellite) {
        return false;
      }
      // Sensor filter
      if (this.filterSensor !== "ALL" && !obs.sensor.toLowerCase().includes(this.filterSensor.toLowerCase())) {
        return false;
      }
      // Product Type filter
      if (this.filterProductType !== "ALL" && !obs.productType.toLowerCase().includes(this.filterProductType.toLowerCase())) {
        return false;
      }
      // Date filter
      if (this.filterDateRange !== "ALL" && !obs.acquisitionDate.startsWith(this.filterDateRange)) {
        return false;
      }
      // Text Search
      if (q) {
        const matchSatellite = obs.satellite.toLowerCase().includes(q);
        const matchSensor = obs.sensor.toLowerCase().includes(q);
        const matchProvider = obs.provider.toLowerCase().includes(q);
        const matchProduct = obs.productType.toLowerCase().includes(q);
        const matchDate = obs.acquisitionDate.toLowerCase().includes(q);
        const matchId = obs.item_id.toLowerCase().includes(q);
        if (!matchSatellite && !matchSensor && !matchProvider && !matchProduct && !matchDate && !matchId) {
          return false;
        }
      }
      return true;
    });
  }

  public getFilterSatellite(): string {
    return this.filterSatellite;
  }

  public setFilterSatellite(sat: string) {
    this.filterSatellite = sat;
    this.notify();
  }

  public getFilterSensor(): string {
    return this.filterSensor;
  }

  public setFilterSensor(sensor: string) {
    this.filterSensor = sensor;
    this.notify();
  }

  public getFilterProductType(): string {
    return this.filterProductType;
  }

  public setFilterProductType(pt: string) {
    this.filterProductType = pt;
    this.notify();
  }

  public getFilterDateRange(): string {
    return this.filterDateRange;
  }

  public setFilterDateRange(range: string) {
    this.filterDateRange = range;
    this.notify();
  }

  public getSelectedObservation(): SatelliteObservationItem | null {
    return this.selectedObservation;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public getError(): string | null {
    return this.error;
  }

  public selectObservation(obs: SatelliteObservationItem | null) {
    this.selectedObservation = obs;
    this.notify();
  }

  public async loadObservations(force: boolean = false) {
    if (this.fetched && !force) return;
    this.loading = true;
    this.error = null;
    this.notify();

    try {
      // 1. Fetch from acquisitions endpoint
      const acqRes = await apiService.getAcquisitions().catch(() => []);
      
      // 2. Fetch from discovery monitor feed
      const monitorRes = await fetchFromApi<any>("/discovery/monitor").catch(() => null);

      const items: SatelliteObservationItem[] = [];

      // Process database acquisitions
      if (Array.isArray(acqRes)) {
        for (const a of acqRes) {
          const isLsar = a.dataset_id?.includes("LSAR") || a.id?.includes("LSAR");
          const isSsar = a.dataset_id?.includes("SSAR");
          const sensorName = isLsar
            ? "NISAR L-SAR (1.257 GHz)"
            : isSsar
            ? "NISAR S-SAR (3.200 GHz)"
            : a.dataset_id?.includes("SENTINEL")
            ? "Sentinel-1 C-SAR (5.405 GHz)"
            : "SAR Sensor";

          const isT1 = a.acquisition_date?.includes("2026-10-30") || a.id?.includes("20261030");
          const isT2 = a.acquisition_date?.includes("2026-11-11") || a.id?.includes("20261111");

          items.push({
            id: a.id,
            item_id: a.id,
            provider: isLsar || isSsar ? "NASA ASF DAAC / ISRO Bhoonidhi" : "Copernicus Dataspace",
            satellite: isLsar || isSsar ? "NISAR" : "Sentinel-1A",
            sensor: sensorName,
            polarization: (a.polarizations || ["HH", "HV"]).join(" / "),
            productType: a.product_level || "L2_GCOV",
            processingLevel: a.product_level ? `Level-${a.product_level}` : "Level-2 GCOV",
            acquisitionDate: a.acquisition_date,
            publicationDate: a.acquisition_date,
            deliveryType: "Standard Science PGE",
            status: a.is_sample_fixture ? "FIXTURE_VERIFIED" : "AUTHORITATIVE_FLOAT32",
            resolutionM: a.spatial_resolution_m || 10,
            centerFrequencyGhz: a.center_frequency_ghz || 1.2575,
            spatialBounds: [79.6, 10.2, 80.1, 11.4],
            rawMetadata: a,
            isMapSupported: isT1 || isT2,
            correspondingLayerId: isT1 ? "nisar-hh" : isT2 ? "nisar-hv" : undefined,
          });
        }
      }

      // Process discovered monitor feed if available
      const discoveredItems = monitorRes?.data?.recent_observations || [];
      if (Array.isArray(discoveredItems)) {
        for (const d of discoveredItems) {
          if (!items.some((i) => i.item_id === d.item_id)) {
            const isS1 = d.collection?.includes("s1");
            const isS2 = d.collection?.includes("s2");

            items.push({
              id: d.item_id,
              item_id: d.item_id,
              provider: d.provider_id || "Global Satellite Feed",
              satellite: d.collection?.includes("nisar")
                ? "NISAR"
                : isS1
                ? "Sentinel-1"
                : isS2
                ? "Sentinel-2"
                : "Earth Observation Satellite",
              sensor: d.collection?.toUpperCase() || "Multi-Spectral / SAR",
              polarization: isS1 ? "VV / VH" : "HH / HV",
              productType: d.collection || "Calibrated Product",
              processingLevel: isS1 ? "Level-1 GRD" : isS2 ? "Level-2A BOA" : "Level-2 Covariance",
              acquisitionDate: d.acquisition_datetime,
              publicationDate: d.publication_datetime || d.discovered_at,
              deliveryType: d.delivery_type || "Routine Delivery",
              status: d.is_downloaded ? "DOWNLOADED" : "CATALOGUE_DISCOVERED",
              spatialBounds: [d.min_lon, d.min_lat, d.max_lon, d.max_lat],
              rawMetadata: d,
              isMapSupported: isS1 || isS2,
              correspondingLayerId: isS1 ? "sentinel1-grd" : isS2 ? "sentinel2-truecolor" : undefined,
            });
          }
        }
      }

      this.observations = items;
      this.fetched = true;
      this.loading = false;
      this.notify();
    } catch (err: any) {
      this.error = err?.message || "Failed to load observations";
      this.loading = false;
      this.notify();
    }
  }
}

export const observationStore = new ObservationStore();
