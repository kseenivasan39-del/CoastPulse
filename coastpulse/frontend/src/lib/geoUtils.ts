/**
 * Authoritative Global Coastal Reference Data and Geodesic Calculations for CoastPulse
 */

export interface CoastalLocation {
  name: string;
  region: string;
  country: string;
  type: "delta" | "wetland" | "estuary" | "mangrove" | "lagoon" | "city" | "barrier_island";
  coordinates: [number, number]; // [lng, lat]
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  category: "Mangroves" | "Coastal wetlands" | "Estuaries" | "Water extent" | "Inundation" | "Coastal erosion" | "Shoreline change" | "Coastal vegetation" | "Coastal ecosystem change";
  description: string;
  recommendedSensors: string[];
}

export const GLOBAL_COASTAL_OBSERVATORIES: CoastalLocation[] = [
  {
    name: "Sundarbans Delta Mangrove Biosphere",
    region: "West Bengal & Khulna",
    country: "India / Bangladesh",
    type: "mangrove",
    coordinates: [88.85, 21.95],
    bbox: [88.0, 21.5, 89.9, 22.5],
    category: "Mangroves",
    description: "The world's largest contiguous tidal mangrove ecosystem and critical carbon sequestration sink.",
    recommendedSensors: ["NASA-ISRO NISAR (L-band)", "Sentinel-1 (C-band)", "Sentinel-2 (MSI)"],
  },
  {
    name: "Florida Everglades Coastal Wetland",
    region: "Florida",
    country: "United States",
    type: "wetland",
    coordinates: [-80.9, 25.5],
    bbox: [-81.5, 25.0, -80.3, 26.0],
    category: "Coastal wetlands",
    description: "Subtropical wetland and coastal mangrove transition zone undergoing saltwater intrusion monitoring.",
    recommendedSensors: ["NISAR (L-band RTC)", "Sentinel-1 IW", "Landsat-9 OLI-2"],
  },
  {
    name: "Mekong River Coastal Delta",
    region: "Southern Vietnam",
    country: "Vietnam",
    type: "delta",
    coordinates: [105.78, 10.03],
    bbox: [104.5, 8.5, 106.8, 11.2],
    category: "Water extent",
    description: "Major Southeast Asian agricultural and mangrove delta facing intense seasonal flooding and subsidence.",
    recommendedSensors: ["Sentinel-1 (Dual-Pol)", "NISAR L2 GCOV", "Sentinel-2 L2A"],
  },
  {
    name: "Wadden Sea Intertidal Mudflats",
    region: "North Sea Coast",
    country: "Netherlands / Germany / Denmark",
    type: "barrier_island",
    coordinates: [6.5, 53.5],
    bbox: [4.7, 52.8, 8.6, 54.5],
    category: "Inundation",
    description: "World Heritage intertidal sand and mudflat system with dynamic twice-daily tidal inundation.",
    recommendedSensors: ["Sentinel-1 GRD", "TerraSAR-X", "Sentinel-2"],
  },
  {
    name: "Niger River Coastal Delta",
    region: "Gulf of Guinea",
    country: "Nigeria",
    type: "estuary",
    coordinates: [6.0, 5.0],
    bbox: [5.0, 4.2, 7.5, 5.8],
    category: "Coastal ecosystem change",
    description: "Extensive tropical mangrove network and estuarine channel system in West Africa.",
    recommendedSensors: ["NISAR L-band", "Sentinel-1 IW", "Landsat-8/9"],
  },
  {
    name: "Mississippi River Delta & Atchafalaya",
    region: "Louisiana",
    country: "United States",
    type: "delta",
    coordinates: [-89.25, 29.15],
    bbox: [-90.5, 28.8, -88.9, 30.2],
    category: "Coastal erosion",
    description: "Rapidly eroding river delta front with high subsidence and hurricane storm surge exposure.",
    recommendedSensors: ["Sentinel-1 InSAR", "NISAR L2 GCOV", "USGS Landsat"],
  },
  {
    name: "Great Barrier Reef Inshore Coastal Lagoons",
    region: "Queensland",
    country: "Australia",
    type: "lagoon",
    coordinates: [146.8, -19.2],
    bbox: [145.5, -20.5, 148.0, -18.0],
    category: "Coastal vegetation",
    description: "Coastal seagrass and fringe mangrove habitats buffering mainland agricultural runoff.",
    recommendedSensors: ["Sentinel-2 MSI", "Landsat-9", "Sentinel-1 VV+VH"],
  },
  {
    name: "Venice Lagoon & Northern Adriatic",
    region: "Veneto",
    country: "Italy",
    type: "lagoon",
    coordinates: [12.35, 45.43],
    bbox: [12.15, 45.2, 12.6, 45.6],
    category: "Shoreline change",
    description: "Historic enclosed coastal lagoon governed by MOSE tidal barriers and localized subsidence.",
    recommendedSensors: ["COSMO-SkyMed", "Sentinel-1 SLC", "Sentinel-2"],
  },
  {
    name: "Nagapattinam District Coastal Delta (Demonstration)",
    region: "Tamil Nadu",
    country: "India",
    type: "delta",
    coordinates: [79.843, 10.767],
    bbox: [79.6, 10.2, 80.1, 11.4],
    category: "Mangroves",
    description: "High-resolution case study with authoritative Float32 NISAR and Muthupet mangrove calibration.",
    recommendedSensors: ["NASA-ISRO NISAR L2 GCOV (Float32)", "Sentinel-1 IW"],
  },
];

export const GLOBAL_COASTAL_LOCATIONS = GLOBAL_COASTAL_OBSERVATORIES;

export function parseCoordinateQuery(query: string): [number, number] | null {
  const parts = query.split(/[,;\s]+/).map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
  if (parts.length === 2) {
    const [a, b] = parts;
    // Guess lat/lon vs lon/lat
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
      return [b, a]; // return [lng, lat]
    } else if (Math.abs(a) <= 180 && Math.abs(b) <= 90) {
      return [a, b];
    }
  }
  return null;
}

export function calculateGeodesicArea(coords: number[][]): { areaHa: number; areaKm2: number; ha: number; km2: number } {
  if (!coords || coords.length < 3) return { areaHa: 0, areaKm2: 0, ha: 0, km2: 0 };
  let area = 0;
  const numPoints = coords.length;
  for (let i = 0; i < numPoints; i++) {
    const j = (i + 1) % numPoints;
    const xi = (coords[i][0] * Math.PI) / 180;
    const yi = (coords[i][1] * Math.PI) / 180;
    const xj = (coords[j][0] * Math.PI) / 180;
    const yj = (coords[j][1] * Math.PI) / 180;
    area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
  }
  area = (Math.abs(area) * 6378137.0 * 6378137.0) / 4.0;
  const areaKm2 = area / 1000000.0;
  const areaHa = area / 10000.0;
  const valKm2 = parseFloat(areaKm2.toFixed(2));
  const valHa = parseFloat(areaHa.toFixed(2));
  return { areaHa: valHa, areaKm2: valKm2, ha: valHa, km2: valKm2 };
}

export interface MonitoringCategoryDef {
  id: string;
  name: string;
  icon: string;
  suitableSensors: string[];
  limitations: string;
  recommendedPolarization: string;
}

export const GLOBAL_MONITORING_CATEGORIES: MonitoringCategoryDef[] = [
  {
    id: "mangroves",
    name: "Mangroves",
    icon: "TreePine",
    suitableSensors: ["NASA-ISRO NISAR (L-band)", "ALOS-2 PALSAR-2", "Sentinel-1 (C-band)"],
    limitations: "C-band saturates in dense closed canopies; L-band volumetric scattering (HV) is strictly required for biomass & sub-canopy inundation.",
    recommendedPolarization: "L-band Dual-Pol (HH + HV)",
  },
  {
    id: "wetlands",
    name: "Coastal Wetlands",
    icon: "Layers",
    suitableSensors: ["Sentinel-1", "NISAR L2 GCOV", "Landsat-8/9"],
    limitations: "Tidal variations affect emergent vegetation backscatter; temporal multi-pass baseline required.",
    recommendedPolarization: "Cross-Pol HV + Co-Pol HH",
  },
  {
    id: "estuaries",
    name: "Estuaries",
    icon: "Waves",
    suitableSensors: ["Sentinel-1 IW", "Sentinel-2 MSI", "NISAR"],
    limitations: "Wind-induced surface roughness can mimic emergent vegetation on single-date SAR acquisitions.",
    recommendedPolarization: "VV / VH or HH / HV",
  },
  {
    id: "water_extent",
    name: "Water Extent",
    icon: "Droplets",
    suitableSensors: ["Sentinel-1 (C-band)", "NISAR L2 GCOV (L-band)"],
    limitations: "Specular reflection threshold requires dynamic Otsu or Bivariate calibration to avoid confusion with smooth runways or dry sand.",
    recommendedPolarization: "HH or VV",
  },
  {
    id: "inundation",
    name: "Inundation & Flood",
    icon: "Activity",
    suitableSensors: ["NISAR (L-band)", "Sentinel-1", "RADARSAT Constellation"],
    limitations: "Sub-canopy standing water causes double-bounce backscatter enhancement; bare soil inundation causes specular drop.",
    recommendedPolarization: "L-band HH (double-bounce)",
  },
  {
    id: "coastal_erosion",
    name: "Coastal Erosion Indicators",
    icon: "TrendingDown",
    suitableSensors: ["Sentinel-1 InSAR / Amplitude", "Sentinel-2", "PlanetScope"],
    limitations: "Requires high temporal frequency and tidal stage normalization to separate erosion from normal astronomical tides.",
    recommendedPolarization: "Co-Pol Amplitude + Phase",
  },
  {
    id: "shoreline_change",
    name: "Shoreline Change",
    icon: "Compass",
    suitableSensors: ["Sentinel-2 MSI (MNDWI)", "Landsat-9", "Sentinel-1"],
    limitations: "Tidal stage at acquisition time strongly dictates apparent waterline position.",
    recommendedPolarization: "Optical NIR/SWIR or SAR Amplitude",
  },
  {
    id: "vegetation",
    name: "Coastal Vegetation",
    icon: "Leaf",
    suitableSensors: ["Sentinel-2 (NDVI, NDRE)", "NISAR (RVI)", "Sentinel-1 (RVI)"],
    limitations: "Optical indices obscured by tropical cloud cover; dual-pol SAR RVI provides all-weather baseline.",
    recommendedPolarization: "4*HV / (HH + HV)",
  },
  {
    id: "urbanisation",
    name: "Coastal Urbanisation",
    icon: "Building2",
    suitableSensors: ["Sentinel-1 Coherence", "NISAR L-band", "High-Res Optical"],
    limitations: "High persistent scatterer density can saturate detectors; multi-temporal coherence required.",
    recommendedPolarization: "Interferometric Coherence (γ)",
  },
  {
    id: "ecosystem_change",
    name: "Coastal Ecosystem Change",
    icon: "Sparkles",
    suitableSensors: ["Multi-Sensor Fusion (NISAR + S1 + S2)"],
    limitations: "Cross-sensor calibration required; never extrapolate local change statistics globally.",
    recommendedPolarization: "Calibrated Radiometric Terrain Corrected",
  },
];
