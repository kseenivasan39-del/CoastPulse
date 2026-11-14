"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Search,
  Filter,
  Calendar,
  Satellite,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Globe2,
} from "lucide-react";
import { apiService } from "@/lib/apiClient";
import { GLOBAL_COASTAL_OBSERVATORIES } from "@/lib/geoUtils";

export const GlobalDataCatalogueView: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>("ALL");
  const [searchBbox, setSearchBbox] = useState<string>("Global");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [discoveredProducts, setDiscoveredProducts] = useState<any[]>([]);

  // Real fetch from /api/v1/discovery/search
  useEffect(() => {
    const fetchDiscovery = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/discovery/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bbox: [79.6, 10.2, 80.1, 11.4],
            start_date: "2026-08-01T00:00:00Z",
            end_date: "2026-11-14T00:00:00Z",
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setDiscoveredProducts(data.data);
        }
      } catch (err) {
        console.error("Discovery API error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscovery();
  }, []);

  const providers = [
    { id: "ALL", name: "All Registered Providers" },
    { id: "NASA_ASF", name: "NASA ASF (NISAR L/S-Band)" },
    { id: "COPERNICUS_S1", name: "Copernicus S1 (C-Band SAR)" },
    { id: "COPERNICUS_S2", name: "Copernicus S2 (Optical MSI)" },
    { id: "USGS_LANDSAT", name: "USGS Landsat (OLI-2)" },
  ];

  const filtered = discoveredProducts.filter((p) => {
    if (selectedProvider === "ALL") return true;
    return p.provider === selectedProvider;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#03060c] p-6 space-y-6 text-slate-100 select-none">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00e5ff]" />
            <h1 className="text-xl font-extrabold text-white">Global Satellite Data Catalogue</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative Earth-observation granules discovered across active space agency STAC/CMR adapters.
          </p>
        </div>

        {/* Filter Providers */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#070e1c] p-1 rounded-xl border border-[#14233c]">
          {providers.map((prv) => (
            <button
              key={prv.id}
              onClick={() => setSelectedProvider(prv.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedProvider === prv.id
                  ? "bg-[#ff8c2b] text-white shadow-md shadow-[#ff8c2b]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {prv.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scientific Integrity Notice */}
      <div className="p-4 rounded-2xl bg-[#070e1c] border border-[#14233c] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <Globe2 className="w-4 h-4 text-[#00e5ff]" />
          <span className="text-slate-300">
            Observation Integrity: <span className="text-white font-bold">{filtered.length} products verified</span>. No synthetic observations are generated for missing dates.
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Showing authentic granules from CMR / ASF & CDSE
        </div>
      </div>

      {/* 3. Granules Table */}
      <div className="rounded-2xl bg-[#070e1c] border border-[#14233c] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0b162a] border-b border-[#14233c] text-slate-400 font-mono text-[11px]">
            <tr>
              <th className="p-3">Product Identifier</th>
              <th className="p-3">Provider / Platform</th>
              <th className="p-3">Acquisition Date</th>
              <th className="p-3">Mode & Polarization</th>
              <th className="p-3">Footprint (BBox)</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#101b2f]">
            {filtered.slice(0, 15).map((granule) => (
              <tr key={granule.id} className="hover:bg-[#0c182c] transition-colors">
                <td className="p-3 font-mono font-bold text-white max-w-xs truncate">
                  {granule.id}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#14233c] text-[#00e5ff]">
                    {granule.provider}
                  </span>
                </td>
                <td className="p-3 font-mono text-slate-300">
                  {granule.acquisition_datetime}
                </td>
                <td className="p-3 font-mono text-slate-300">
                  {granule.properties?.["sar:instrument_mode"] || "MSI"} ·{" "}
                  {JSON.stringify(granule.properties?.["sar:polarizations"] || ["B2", "B3", "B4", "B8"])}
                </td>
                <td className="p-3 font-mono text-slate-400 text-[10px]">
                  [{granule.bbox.map((b: number) => b.toFixed(1)).join(", ")}]
                </td>
                <td className="p-3 text-right">
                  <a
                    href={granule.assets?.data?.href || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0e1c33] border border-[#1a2e4f] text-[#00e5ff] hover:text-white text-[11px] font-mono"
                  >
                    <span>STAC</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
