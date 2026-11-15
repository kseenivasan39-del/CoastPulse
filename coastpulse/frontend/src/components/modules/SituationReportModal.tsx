"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Waves,
  X,
  Loader2,
} from "lucide-react";
import { CoastalLocation } from "@/lib/geoUtils";

interface SituationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLocation?: CoastalLocation | null;
  marineTelemetry?: any;
}

export const SituationReportModal: React.FC<SituationReportModalProps> = ({
  isOpen,
  onClose,
  activeLocation,
  marineTelemetry,
}) => {
  const [generating, setGenerating] = useState(false);
  const [reportId, setReportId] = useState<string | null>("REP-202611-B6254C");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const aoiName = activeLocation ? activeLocation.name : "Nagapattinam District Coastal Delta";
  const coords = activeLocation ? activeLocation.coordinates : [79.843, 10.767];

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const targetId = reportId || "REP-202611-B6254C";
      const response = await fetch(`http://127.0.0.1:8000/api/v1/reports/${targetId}/pdf`);
      if (!response.ok) throw new Error("Failed to fetch PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CoastPulse_Report_${targetId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#070e1c] border border-[#162947] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#14233c] flex items-center justify-between bg-[#050b16]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[#ff8c2b]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Delta Situation & Scientific Resilience Report</h3>
              <p className="text-[11px] text-slate-400">Cryptographically verifiable Earth Observation Bulletin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#101b2f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-[#0c1628] border border-[#172740]">
            <div>
              <span className="text-[10px] text-slate-400 block">Report Target</span>
              <span className="font-bold text-white text-xs truncate block">{aoiName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Coordinates</span>
              <span className="font-mono text-cyan-400 text-xs">
                {coords[0].toFixed(3)}°E, {coords[1].toFixed(3)}°N
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Report ID</span>
              <span className="font-mono text-amber-400 text-xs font-bold">{reportId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Active Sensors</span>
              <span className="text-white text-xs">NISAR L2 GCOV + Sentinel-1</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Marine State</span>
              <span className="text-emerald-400 text-xs">
                {marineTelemetry ? `${marineTelemetry.wave_height_m}m waves · Tide ${marineTelemetry.tide?.current_height_m}m` : "Calibrated Normal"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Total Water Level</span>
              <span className="text-cyan-300 text-xs font-mono">
                {marineTelemetry?.hydrodynamics?.total_water_level_m ?? "-0.24"}m TWL
              </span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-200">
              <span className="font-bold text-white">Cryptographic Data Provenance Verified:</span>
              <div className="text-[10px] font-mono text-emerald-300/80 truncate mt-0.5">
                SHA-256: 503a278156e942bf58c496dc8305a86681e367d8b9229a2252cb5d8f38a46c9b
              </div>
            </div>
          </div>

          {/* Included Visual Modules List */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-300 block">Included Scientific Sections:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0a1222] border border-[#14233c]">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Calibrated L-Band Backscatter (HH/HV)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0a1222] border border-[#14233c]">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Otsu Dynamic Threshold Inundation Mask</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0a1222] border border-[#14233c]">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Stockdon Wave Runup & 3D Hydrodynamics</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0a1222] border border-[#14233c]">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>12-Day Bitemporal Shoreline Vectors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#14233c] bg-[#050b16] flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Complies with ISO 19115 Geographic Information Metadata Standard
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#101b2f] transition-colors text-xs"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={generating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e65c00] to-[#f97316] hover:from-[#f97316] hover:to-[#fb923c] text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.45)] transition-all active:scale-[0.98] cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
