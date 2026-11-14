"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Share2,
  Printer,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { NAGAPATTINAM_STUDY_AREA, SAMPLE_SAR_GRANULES } from "@/lib/mockData";

export const ScientificReportsView: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "JSON">("PDF");

  const handleExport = () => {
    alert(
      `Generating reproducible peer-reviewed report (${selectedFormat}) with SHA-256 cryptographic provenance manifests...`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Scientific Reports
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Peer-Review Reproducible Format
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Automated Environmental Observation & Provenance Report
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setSelectedFormat("PDF")}
              className={`px-3 py-1.5 rounded transition-colors ${
                selectedFormat === "PDF"
                  ? "bg-cyan-950 text-cyan-300 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              PDF Document
            </button>
            <button
              onClick={() => setSelectedFormat("JSON")}
              className={`px-3 py-1.5 rounded transition-colors ${
                selectedFormat === "JSON"
                  ? "bg-cyan-950 text-cyan-300 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              JSON Manifest
            </button>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950"
          >
            <Download className="h-4 w-4" />
            <span>Generate {selectedFormat}</span>
          </button>
        </div>
      </div>

      {/* Styled Scientific Document Preview */}
      <div className="rounded-xl border border-slate-800 bg-[#090e1c] p-8 md:p-12 space-y-8 max-w-4xl mx-auto shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 space-y-2">
          <div className="flex justify-between items-start text-xs font-mono text-slate-400">
            <span>COASTPULSE TECHNICAL REPORT • TR-2026-SAR-06</span>
            <span>Date: 2026-04-14</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight pt-2">
            Multi-Temporal NISAR SAR Backscatter Characterization of Coastal Wetlands and Mangrove Forests in Nagapattinam District, India
          </h1>
          <p className="text-xs text-slate-400">
            Authors: Geospatial Intelligence Engineering Team • NASA Space Apps Challenge 2026
          </p>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider font-mono">
            1. Executive Summary & Objective
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            This report evaluates surface water inundation shifts and mangrove canopy stability across the Nagapattinam delta, Tamil Nadu, India. By exploiting calibrated 10m L-band and S-band NISAR Geocoded Polarimetric Covariance (GCOV) products, backscatter fluctuations are tracked between April 01, 2026 and April 13, 2026. Strict geometric and polarimetric compatibility constraints were verified prior to change quantification.
          </p>
        </div>

        {/* Study Area & Geographic Bounds */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider font-mono">
            2. Study Area Description
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">District</span>
              <span className="text-slate-200">Nagapattinam</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Geographic Bounds</span>
              <span className="text-slate-200">79.6°E - 80.1°E, 10.2°N - 11.4°N</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Mangrove Reserve</span>
              <span className="text-slate-200">Muthupet (48,600 ha)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Reference Datum</span>
              <span className="text-slate-200">WGS84 / EPSG:4326</span>
            </div>
          </div>
        </div>

        {/* Ingested Granule Provenance Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider font-mono">
            3. Satellite Dataset Provenance & Cryptographic Hashes
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 text-[10px]">
                <tr>
                  <th className="p-3">Product ID</th>
                  <th className="p-3">Band</th>
                  <th className="p-3">Orbit</th>
                  <th className="p-3">Center Angle</th>
                  <th className="p-3">SHA-256 Digest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                {SAMPLE_SAR_GRANULES.slice(0, 2).map((g) => (
                  <tr key={g.id}>
                    <td className="p-3 font-semibold text-cyan-300">{g.id.substring(0, 28)}...</td>
                    <td className="p-3">{g.band}-band</td>
                    <td className="p-3">{g.orbitPass} (Trk {g.relativeOrbit})</td>
                    <td className="p-3">{g.centerIncidenceAngleDeg}°</td>
                    <td className="p-3 text-slate-500">{g.sourceSha256.substring(0, 16)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scientific Observations */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider font-mono">
            4. Analytical Results & Observations
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              <strong>Surface Water Fluctuations:</strong> Net increase of +1,420 hectares in delineated surface water, primarily driven by tidal cycle changes in the Vedaranyam lagoon.
            </li>
            <li>
              <strong>Mangrove Canopy Resilience:</strong> Muthupet core mangrove canopy showed stable HV backscatter (&Delta;&gamma;⁰ = -0.12 dB, well within the &plusmn;0.42 dB calibration uncertainty), indicating healthy canopy structure.
            </li>
            <li>
              <strong>Radiometric Consistency:</strong> No significant anomalous drift detected. Mean difference across stable ground targets: +0.35 dB.
            </li>
          </ul>
        </div>

        {/* Limitations & Uncertainty */}
        <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-4 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>5. Scientific Uncertainty & Limitations Disclosure</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Backscatter measurements are subject to speckle noise and local surface wind roughness. InSAR ground deformation was not derived in this analysis, preserving the strict scientific boundary between backscatter intensity change and interferometric phase subsidence.
          </p>
        </div>
      </div>
    </div>
  );
};
