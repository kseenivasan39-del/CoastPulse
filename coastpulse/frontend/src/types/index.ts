export type NavigationTab =
  | "dashboard"
  | "explorer"
  | "analysis"
  | "changedetection"
  | "coastal"
  | "map"
  | "temporal"
  | "reports"
  | "assistant"
  | "settings";

export type RadarBand = "L" | "S" | "C";
export type OrbitPass = "ASCENDING" | "DESCENDING";
export type Polarization = "HH" | "HV" | "VV" | "VH";
export type ProductTier = "L1_GCOV" | "L2_GEMA" | "L1_SLC" | "L1_GRD";

export interface SARGranule {
  id: string;
  mission: "NISAR-LSAR" | "NISAR-SSAR" | "SENTINEL-1A" | "SENTINEL-1B";
  productType: ProductTier;
  band: RadarBand;
  centerFrequencyGhz: number;
  orbitPass: OrbitPass;
  relativeOrbit: number;
  polarizations: Polarization[];
  acquisitionDate: string; // ISO string
  incidenceAngleNearDeg: number;
  incidenceAngleFarDeg: number;
  centerIncidenceAngleDeg: number;
  resolutionM: number;
  pixelSpacingM: number;
  coverageHectares: number;
  sourceSha256: string;
  isCalibrated: boolean;
  sampleStatus: "VALIDATED_SAMPLE_DATA" | "BENCHMARK_DEMO";
  thumbnailUrl?: string;
  summary: string;
}

export interface ProcessingJob {
  id: string;
  jobName: string;
  granuleId: string;
  algorithm: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progressPercent: number;
  startedAt: string;
  elapsedSec: number;
  parameters: Record<string, string | number | boolean>;
}

export interface ChangeAnalysisRecord {
  id: string;
  title: string;
  referenceGranuleId: string;
  secondaryGranuleId: string;
  dateReference: string;
  dateSecondary: string;
  polarizationChannel: Polarization;
  deltaIncidenceAngleDeg: number;
  waterAreaGainHa: number;
  waterAreaLossHa: number;
  vegetationBiomassShiftPct: number;
  meanDeltaDb: number;
  stdDeltaDb: number;
  uncertaintyMarginDb: number;
  confidenceScore: number;
  status: "COMPLETED";
}
