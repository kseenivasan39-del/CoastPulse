"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  Search,
  Activity,
  ChevronDown,
  Info,
  Radio,
  FileCheck,
  ThumbsDown,
  ThumbsUp,
  Sparkles,
} from "lucide-react";

export const GlobalCoastalEventWatchView: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [validationNote, setValidationNote] = useState<string>("");

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/event-watch/events");
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data);
        if (!selectedEvent && json.data.length > 0) {
          setSelectedEvent(json.data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load events", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTransition = async (newStatus: string) => {
    if (!selectedEvent) return;
    setIsTransitioning(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/event-watch/events/${selectedEvent.event_id}/transition`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            new_status: newStatus,
            validator_note: validationNote || `Status updated to ${newStatus} by operator.`,
          }),
        }
      );
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedEvent(json.data);
        setValidationNote("");
        fetchEvents();
      }
    } catch (e) {
      console.error("Status transition failed", e);
    } finally {
      setIsTransitioning(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (statusFilter !== "ALL" && ev.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && ev.event_type !== typeFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VALIDATED_CHANGE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">VALIDATED CHANGE</span>;
      case "NEEDS_VALIDATION":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff8c2b]/15 text-[#ff8c2b] border border-[#ff8c2b]/30">NEEDS VALIDATION</span>;
      case "POTENTIAL_EVENT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">POTENTIAL EVENT</span>;
      case "DISMISSED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">DISMISSED</span>;
      case "INSUFFICIENT_EVIDENCE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">INSUFFICIENT EVIDENCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex min-h-0 bg-[#03060c] text-slate-100 select-none overflow-hidden">
      {/* 1. Left Event Feed & Filter Deck */}
      <div className="w-[380px] bg-[#050a16] border-r border-[#121c2d] flex flex-col h-full shrink-0 z-10">
        {/* Header */}
        <div className="p-4 border-b border-[#121c2d] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ff8c2b] animate-pulse" />
              <h1 className="font-extrabold text-sm text-white">Global Coastal Event Watch</h1>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#00e5ff] bg-[#0c182c] px-2 py-0.5 rounded border border-[#182a45]">
              {filteredEvents.length} Events Tracked
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Evidence-based 7-stage validation lifecycle. Anomalies are never confirmed without multi-temporal verification.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
            {["ALL", "NEEDS_VALIDATION", "VALIDATED_CHANGE", "POTENTIAL_EVENT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? "bg-[#ff8c2b] text-white shadow-sm"
                    : "bg-[#0b1324] text-slate-400 hover:text-white"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Events List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-[#0c1424]">
          {filteredEvents.length === 0 ? (
            <div className="p-6 text-center space-y-2 rounded-xl bg-[#08101e] border border-[#121f36]">
              <Radio className="w-6 h-6 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">No events match filter</p>
              <p className="text-[10px] text-slate-500">
                Switch to ALL or run automated anomaly detection to scan satellite streams.
              </p>
            </div>
          ) : (
            filteredEvents.map((ev) => {
            const isSelected = selectedEvent?.event_id === ev.event_id;

            return (
              <div
                key={ev.event_id}
                onClick={() => setSelectedEvent(ev)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? "bg-[#0f1d38] border-[#00e5ff]/50 shadow-md shadow-[#00e5ff]/10"
                    : "bg-[#08101e] border-[#121f36] hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{ev.event_id}</span>
                  {getStatusBadge(ev.status)}
                </div>

                <h3 className="font-bold text-xs text-white leading-tight line-clamp-2">
                  {ev.title}
                </h3>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#121c2d]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#00e5ff]" />
                    {ev.country}
                  </span>
                  <span>{ev.affected_area_ha.toLocaleString()} ha affected</span>
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>

      {/* 2. Main Event Intelligence Workspace */}
      {selectedEvent ? (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#02050b] p-6 space-y-6">
          {/* Event Header Banner */}
          <div className="p-6 rounded-2xl bg-[#070e1c] border border-[#14233c] shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#00e5ff] font-bold bg-[#0c182c] px-2 py-0.5 rounded border border-[#1a2d4a]">
                  {selectedEvent.event_id}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  Detected: {selectedEvent.detection_utc}
                </span>
              </div>
              <div>{getStatusBadge(selectedEvent.status)}</div>
            </div>

            <h1 className="text-xl font-extrabold text-white">{selectedEvent.title}</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#101b2f] text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px]">Location:</span>
                <div className="font-bold text-white">{selectedEvent.region}, {selectedEvent.country}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Estimated Area Affected:</span>
                <div className="font-bold text-[#ff8c2b]">{selectedEvent.affected_area_ha.toLocaleString()} ha</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Confidence Level:</span>
                <div className="font-bold text-[#34d399]">{(selectedEvent.confidence_score * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Multi-Sensor Consensus:</span>
                <div className="font-bold text-white">
                  {selectedEvent.multi_sensor_verified ? "YES (Multi-Mission)" : "Single-Sensor"}
                </div>
              </div>
            </div>
          </div>

          {/* 4-Entity Strict Timestamp Provenance Deck */}
          <div className="p-4 rounded-2xl bg-[#070e1c] border border-[#14233c] space-y-2">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00e5ff]" />
              <span>Authoritative Temporal Lifecycle (Zero Timestamp Fabrication)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#0a1222] border border-[#16233a]">
                <div className="text-slate-400 text-[10px]">1. Orbital Overflight (Acquisition)</div>
                <div className="font-bold text-white mt-1">{selectedEvent.acquisition_utc}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0a1222] border border-[#16233a]">
                <div className="text-slate-400 text-[10px]">2. Space Agency Publication</div>
                <div className="font-bold text-white mt-1">{selectedEvent.publication_utc}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0a1222] border border-[#16233a]">
                <div className="text-slate-400 text-[10px]">3. Pipeline Execution</div>
                <div className="font-bold text-white mt-1">{selectedEvent.processing_utc}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0a1222] border border-[#16233a]">
                <div className="text-slate-400 text-[10px]">4. Automated Detection</div>
                <div className="font-bold text-[#ff8c2b] mt-1">{selectedEvent.detection_utc}</div>
              </div>
            </div>
          </div>

          {/* Evidence Manifest and Scientific Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Evidence Card */}
            <div className="p-4 rounded-2xl bg-[#070e1c] border border-[#14233c] space-y-3">
              <div className="font-bold text-xs text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#34d399]" />
                <span>Empirical Evidence & Method</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[11px]">Detection Algorithm:</span>
                  <div className="text-slate-200 mt-0.5">{selectedEvent.evidence?.detection_method}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Input Satellites:</span>
                  <div className="text-slate-200 mt-0.5">
                    {selectedEvent.evidence?.satellite_sources?.join(", ")}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Ground / In-Situ Confirmation:</span>
                  <div className="text-[#34d399] mt-0.5">
                    {selectedEvent.evidence?.independent_confirmation_notes || "Pending ground verification."}
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Constraints & Limitations */}
            <div className="p-4 rounded-2xl bg-[#070e1c] border border-[#14233c] space-y-3">
              <div className="font-bold text-xs text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Physical Constraints & Uncertainty</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[11px]">Radiometric Uncertainty:</span>
                  <div className="text-slate-200 mt-0.5">{selectedEvent.evidence?.uncertainty_description}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Methodological Constraint:</span>
                  <div className="text-slate-300 mt-0.5 leading-relaxed">{selectedEvent.limitations}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Operator Validation Decision Station */}
          <div className="p-5 rounded-2xl bg-[#070e1c] border border-[#14233c] space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00e5ff]" />
                <span>Operator Event Validation Workflow</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">7-Stage Lifecycle Enforcement</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={validationNote}
                onChange={(e) => setValidationNote(e.target.value)}
                placeholder="Enter scientific verification notes, ancillary data reference..."
                className="flex-1 bg-[#0b1322] border border-[#182844] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
              />

              <button
                onClick={() => handleTransition("VALIDATED_CHANGE")}
                disabled={isTransitioning}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Validate Change</span>
              </button>

              <button
                onClick={() => handleTransition("NEEDS_VALIDATION")}
                disabled={isTransitioning}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Request Validation</span>
              </button>

              <button
                onClick={() => handleTransition("DISMISSED")}
                disabled={isTransitioning}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </button>
            </div>

            {/* Audit History */}
            {selectedEvent.validation_notes?.length > 0 && (
              <div className="pt-2 border-t border-[#101b2f] space-y-1">
                <span className="text-[10px] font-mono text-slate-400">Audit History:</span>
                {selectedEvent.validation_notes.map((note: string, idx: number) => (
                  <div key={idx} className="text-[11px] font-mono text-slate-400">
                    • {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono">
          Select an event from the feed to inspect multi-sensor evidence.
        </div>
      )}
    </div>
  );
};
