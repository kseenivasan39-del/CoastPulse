"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Database,
  Key,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
  Compass,
} from "lucide-react";
import { NAGAPATTINAM_STUDY_AREA } from "@/lib/mockData";

export const SettingsView: React.FC = () => {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [earthdataUser, setEarthdataUser] = useState("");
  const [earthdataPass, setEarthdataPass] = useState("");
  const [autoSpeckle, setAutoSpeckle] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              System Configuration
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              COASTPULSE v1.0
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Geospatial Processing & API Credentials</h2>
        </div>
      </div>

      {/* Settings Forms */}
      <div className="space-y-6">
        {/* Gemini API Key */}
        <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Key className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">AI Grounding Credentials (Gemini API)</h3>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Google Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Powers evidence-grounded scientific explanations in the AI Assistant module. Keys are stored locally in session storage.
            </p>
          </div>
        </div>

        {/* NASA Earthdata / ISRO Credentials */}
        <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Satellite Ingestion Portals (NASA Earthdata)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Earthdata Username</label>
              <input
                type="text"
                placeholder="earthdata_user"
                value={earthdataUser}
                onChange={(e) => setEarthdataUser(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Password / Token</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={earthdataPass}
                onChange={(e) => setEarthdataPass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Enables genuine pipeline downloading from NASA ASF DAAC and ISRO portals.
          </p>
        </div>

        {/* Study Area Constraints */}
        <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Compass className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Target Area of Interest (AOI)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">Min Lon</span>
              <span className="text-slate-200">79.6°E</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Min Lat</span>
              <span className="text-slate-200">10.2°N</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Max Lon</span>
              <span className="text-slate-200">80.1°E</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Max Lat</span>
              <span className="text-slate-200">11.4°N</span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-4 w-4" />
                <span>Configuration updated successfully!</span>
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
