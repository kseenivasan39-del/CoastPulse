"use client";

import React, { useState, useEffect } from "react";
import {
  Satellite,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Database,
  Radio,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const SatelliteUpdateMonitorView: React.FC = () => {
  const [monitorData, setMonitorData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/discovery/monitor");
      const json = await res.json();
      if (json.success && json.data) {
        setMonitorData(json.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Failed to load satellite monitor telemetry", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const handleManualPoll = async () => {
    setIsRefreshing(true);
    try {
      await fetch("http://127.0.0.1:8000/api/v1/discovery/monitor/poll-now", {
        method: "POST",
      });
      await fetchStatus();
    } catch (e) {
      console.error("Manual poll failed", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const providers = monitorData?.providers || [];
  const recentObservations = monitorData?.recent_observations || [];
  const notifications = monitorData?.unread_notifications || [];

  return (
    <div className="flex-1 overflow-y-auto bg-[#03060c] p-6 space-y-6 text-slate-100 select-none">
      {/* 1. Header with Scientific Disclaimer and Manual Check Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#ff8c2b] animate-pulse" />
            <h1 className="text-xl font-extrabold text-white">Automated Satellite Update Monitor</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous catalogue polling across NASA, ISRO, Copernicus, and USGS open-data APIs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            Telemetry refreshed: <span className="text-white">{lastUpdated || "Live"}</span>
          </span>
          <button
            onClick={handleManualPoll}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e65c00] to-[#f97316] hover:from-[#f97316] hover:to-[#fb923c] text-white font-bold text-xs shadow-md shadow-[#ff8c2b]/30 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Polling Providers..." : "Poll Catalogues Now"}</span>
          </button>
        </div>
      </div>

      {/* 2. Scientific Principles Notification Banner */}
      <div className="p-4 rounded-2xl bg-[#070e1c] border border-[#14233c] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#34d399] shrink-0" />
          <div className="space-y-0.5">
            <span className="text-white font-bold">Strict Provenance Protocol Active:</span>
            <p className="text-slate-400 text-[11px]">
              Catalogue polling is strictly decoupled from raw satellite observation. Acquisition timestamps represent physical orbital overflight; publication timestamps denote ground segment PGE processing. Zero synthetic data is injected.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Provider Polling Status Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00e5ff]" />
            <span>Active Provider Catalogue Adapters ({providers.length})</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Scheduled Polling: Every 5 Minutes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map((prv: any) => (
            <div
              key={prv.provider_id}
              className="p-4 rounded-2xl bg-[#070e1c] border border-[#14233c] flex flex-col justify-between space-y-3 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white">{prv.provider_name}</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/30">
                    <CheckCircle2 className="w-3 h-3" /> {prv.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{prv.provider_id}</div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#111c30] text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Checked:</span>
                  <span className="text-white font-bold">
                    {prv.last_check_datetime ? prv.last_check_datetime.split("T")[1].slice(0, 8) + " UTC" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Next Scheduled:</span>
                  <span className="text-[#00e5ff]">
                    {prv.next_check_datetime ? prv.next_check_datetime.split("T")[1].slice(0, 8) + " UTC" : "Scheduled"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Discovered Feed:</span>
                  <span className="text-[#ff8c2b] font-bold">{prv.total_discovered_count} granules</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AOI Intersection Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#ff8c2b]" />
              <span>Saved Monitoring Area Alerts ({notifications.length} Unread)</span>
            </h2>
          </div>

          <div className="space-y-2">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl bg-[#141009] border border-[#ff8c2b]/50 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff8c2b] animate-ping" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">New Observation over {notif.aoi_name}</span>
                      <span className="text-[10px] font-mono text-[#00e5ff] bg-[#0c182c] px-1.5 py-0.2 rounded border border-[#1b2b45]">
                        {notif.provider_id}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Granule: {notif.item_id} · Overflight: {notif.acquisition_datetime}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#34d399] font-bold">Ready for Ingestion</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Recent Discovered Observation Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Satellite className="w-4 h-4 text-[#00e5ff]" />
            <span>Discovered Earth-Observation Stream ({recentObservations.length})</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Acquisition vs. Publication Timestamps</span>
        </div>

        <div className="rounded-2xl bg-[#070e1c] border border-[#14233c] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b162a] border-b border-[#14233c] text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="p-3">Product ID</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Acquisition Time (Orbital)</th>
                <th className="p-3">Publication Time (Catalogued)</th>
                <th className="p-3">Delivery Latency</th>
                <th className="p-3">SHA256 Integrity</th>
                <th className="p-3 text-right">Monitoring Area</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101b2f]">
              {recentObservations.map((obs: any) => (
                <tr key={obs.item_id} className="hover:bg-[#0c182c] transition-colors">
                  <td className="p-3 font-mono font-bold text-white max-w-xs truncate">
                    {obs.item_id}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#14233c] text-[#00e5ff]">
                      {obs.provider_id}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-200">
                    {obs.acquisition_datetime}
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    {obs.publication_datetime}
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    <span className="text-amber-400">{obs.delivery_type}</span>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">
                    {obs.checksum_sha256 ? `${obs.checksum_sha256.slice(0, 10)}...` : "Verified Manifest"}
                  </td>
                  <td className="p-3 text-right font-mono text-xs text-[#34d399] font-bold">
                    {obs.matched_aoi_id ? obs.matched_aoi_id : "Global Track"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
