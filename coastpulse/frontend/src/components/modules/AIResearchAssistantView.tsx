"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Database,
  ExternalLink,
  BookOpen,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { apiService } from "@/lib/apiClient";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  citations?: {
    granule_id: string;
    metric: string;
    uncertainty: string;
  }[];
  groundingManifest?: Record<string, any>;
}

export const AIResearchAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Hello! I am COASTPULSE-AI, your scientific radar remote sensing assistant. I interpret genuine NASA-ISRO NISAR L-band and S-band observations over Nagapattinam District, Tamil Nadu. I am programmatically restricted to verified physical backscatter calculations and will never invent observations or draw unsupported ecological conclusions.",
      timestamp: "10:00 AM",
      citations: [
        {
          granule_id: "NISAR_L2_PR_GCOV_034_084_A_007_4005_DHDH_A_20261030T001553",
          metric: "Baseline L-band GCOV (1.257 GHz)",
          uncertainty: "±0.42 dB Calibration Limit",
        },
      ],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const sampleQuestions = [
    "What changes were detected between these two NISAR observations?",
    "Can we compare L-band and S-band NISAR scenes directly?",
    "What is the status of the Muthupet mangrove canopy?",
    "What scientific uncertainties remain in the water delineation?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsThinking(true);

    try {
      // Connect to actual backend API endpoint
      const res = await apiService.queryAssistant(text);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: res.response_text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations: res.citations,
        groundingManifest: res.grounding_manifest,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `Error communicating with scientific reasoning backend: ${
          err instanceof Error ? err.message : "Service temporarily unavailable"
        }. Please ensure the FastAPI backend is running at http://localhost:8000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0a1122] p-5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              AI Scientific Research Assistant
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              Gemini Grounded Reasoning
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Evidence-Grounded Satellite Radar Interpretation
          </h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-3 py-1.5 rounded-full">
          <ShieldCheck className="h-4 w-4" />
          <span>Scientific Grounding: Strict</span>
        </div>
      </div>

      {/* Recommended Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono block">
          Recommended Scientific Queries:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-700/60 rounded-lg px-3 py-1.5 transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Viewport */}
      <div className="rounded-xl border border-slate-800 bg-[#070c18] p-5 h-[520px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed space-y-3 ${
                m.sender === "user"
                  ? "bg-cyan-600 text-white rounded-br-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between gap-4 font-mono text-[10px] opacity-75 border-b border-white/10 pb-1.5">
                <span className="font-semibold text-cyan-300">
                  {m.sender === "user" ? "Researcher" : "COASTPULSE-AI"}
                </span>
                <span>{m.timestamp}</span>
              </div>

              {/* Message text with Markdown formatting support */}
              <div className="whitespace-pre-wrap space-y-2">{m.text}</div>

              {/* Citations block */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5 font-mono text-[10px]">
                  <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                    <Database className="h-3 w-3" />
                    <span>Grounding Citations & Verified Granules:</span>
                  </span>
                  {m.citations.map((c, i) => (
                    <div
                      key={i}
                      className="bg-slate-950 p-2 rounded border border-slate-800/80 text-slate-300 space-y-0.5"
                    >
                      <div className="text-cyan-300 font-semibold truncate">{c.granule_id}</div>
                      <div className="text-slate-400">
                        Metric: {c.metric} • Uncertainty: {c.uncertainty}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse bg-slate-900/40 p-3 rounded-lg border border-slate-800 w-fit">
            <Sparkles className="h-4 w-4" />
            <span>Consulting NISAR radiometric manifest & evaluating scientific bounds...</span>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask a scientific question regarding Nagapattinam SAR observations..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isThinking}
          className="px-5 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>Send Query</span>
        </button>
      </div>
    </div>
  );
};
