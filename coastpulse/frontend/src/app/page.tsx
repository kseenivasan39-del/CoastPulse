"use client";

import React, { useState } from "react";
import { GlobalTopNav, GlobalNavigationDestination } from "@/components/layout/GlobalTopNav";
import { LeftSlimRail } from "@/components/layout/LeftSlimRail";
import { LeftDataDrawer } from "@/components/layout/LeftDataDrawer";
import { RightIntelligenceSuite } from "@/components/layout/RightIntelligenceSuite";
import { UnifiedObservationTimeline } from "@/components/layout/UnifiedObservationTimeline";
import { GlobalObservatoryMap } from "@/components/modules/GlobalObservatoryMap";
import { CentralSatelliteCanvas } from "@/components/modules/CentralSatelliteCanvas";
import { GlobalOverviewView } from "@/components/modules/GlobalOverviewView";
import { GlobalDataCatalogueView } from "@/components/modules/GlobalDataCatalogueView";
import { MyStudiesView } from "@/components/modules/MyStudiesView";
import { SatelliteUpdateMonitorView } from "@/components/modules/SatelliteUpdateMonitorView";
import { GlobalCoastalEventWatchView } from "@/components/modules/GlobalCoastalEventWatchView";
import { DedicatedComparisonWorkspace } from "@/components/modules/DedicatedComparisonWorkspace";
import { SARAnalysisWorkspaceView } from "@/components/modules/SARAnalysisWorkspaceView";
import { AIResearchAssistantView } from "@/components/modules/AIResearchAssistantView";
import { DashboardView } from "@/components/modules/DashboardView";
import { GLOBAL_COASTAL_OBSERVATORIES, CoastalLocation } from "@/lib/geoUtils";

export default function Home() {
  // Default to primary Global Explorer workspace
  const [activeDestination, setActiveDestination] = useState<GlobalNavigationDestination>("explore");
  const [activeRailNav, setActiveRailNav] = useState<string>("explore");

  // Selected Coastal Observatory / AOI (Null by default for global view)
  const [selectedLocation, setSelectedLocation] = useState<CoastalLocation | null>(null);

  // Dynamic Layer Visibility State
  const [hhVisible, setHhVisible] = useState<boolean>(true);
  const [hvVisible, setHvVisible] = useState<boolean>(true);
  const [inspectedPixel, setInspectedPixel] = useState<any>(null);

  // When an observatory is selected from Search or Studies
  const handleSelectObservatory = (loc: CoastalLocation) => {
    setSelectedLocation(loc);
    setActiveDestination("explore");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#02050b] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Global Navigation Top Header */}
      <GlobalTopNav
        activeDestination={activeDestination}
        onNavigate={(dest) => setActiveDestination(dest)}
      />

      {/* 2. Middle Main Workspace Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Far-Left Slim Navigation Rail */}
        <LeftSlimRail
          activeNav={activeDestination}
          onSelectNav={(navId) => {
            if (navId === "datahub") setActiveDestination("catalogue");
            else setActiveDestination(navId as any);
          }}
        />

        {/* Left Data & Layers Drawer (Shown during Explore / Map mode) */}
        {activeDestination === "explore" && (
          <LeftDataDrawer
            onObservationSelect={(obs) => {
              if (obs.satellite === "NISAR") {
                const naga = GLOBAL_COASTAL_OBSERVATORIES.find((l) => l.name.includes("Nagapattinam"));
                if (naga) setSelectedLocation(naga);
              }
            }}
            onZoomToLayer={(layerId) => {
              const naga = GLOBAL_COASTAL_OBSERVATORIES.find((l) => l.name.includes("Nagapattinam"));
              if (naga) setSelectedLocation(naga);
            }}
          />
        )}

        {/* Dynamic Center Work Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
          {/* Primary View: Explore World Map & Geospatial Canvas */}
          {activeDestination === "explore" && (
            <>
              {selectedLocation && selectedLocation.name.includes("Nagapattinam") ? (
                <CentralSatelliteCanvas
                  hhVisible={hhVisible}
                  hvVisible={hvVisible}
                  onPixelInspected={setInspectedPixel}
                />
              ) : (
                <GlobalObservatoryMap
                  selectedLocation={selectedLocation}
                  onSelectLocation={(loc) => setSelectedLocation(loc)}
                />
              )}
            </>
          )}

          {/* Primary View 2.5: Global Coastal Event Watch */}
          {activeDestination === "event-watch" && <GlobalCoastalEventWatchView />}
          {activeDestination === "compare" && (
            <DedicatedComparisonWorkspace
              dates={[
                { id: "nisar-t1", date: "2026-10-30", label: "NISAR L2 GCOV (Baseline)", granuleId: "NISAR_L2_PR_GCOV_034_084_A_20261030" },
                { id: "nisar-t2", date: "2026-11-11", label: "NISAR L2 GCOV (Repeat)", granuleId: "NISAR_L2_PR_GCOV_035_084_A_20261111" },
              ]}
              t1Index={0}
              t2Index={1}
              onT1Change={() => {}}
              onT2Change={() => {}}
              onBackToMap={() => setActiveDestination("explore")}
            />
          )}

          {/* Primary View 4: SAR Analysis Workbench */}
          {activeDestination === "analyse" && (
            <div className="flex-1 overflow-y-auto p-6 bg-[#040812]">
              <SARAnalysisWorkspaceView />
            </div>
          )}

          {/* Primary View 5: AI Research Studio */}
          {activeDestination === "research" && (
            <div className="flex-1 overflow-y-auto p-6 bg-[#040812]">
              <AIResearchAssistantView />
            </div>
          )}

          {/* Primary View 6: Global Data Catalogue */}
          {activeDestination === "catalogue" && <GlobalDataCatalogueView />}

          {/* Primary View 7: My Studies & Saved AOIs */}
          {activeDestination === "studies" && (
            <MyStudiesView
              onLoadStudy={(study) => {
                const match = GLOBAL_COASTAL_OBSERVATORIES.find((l) => l.name === study.name) || {
                  name: study.name,
                  region: study.region,
                  country: "Global",
                  type: "delta",
                  coordinates: [(study.min_lon + study.max_lon) / 2, (study.min_lat + study.max_lat) / 2],
                  bbox: [study.min_lon, study.min_lat, study.max_lon, study.max_lat],
                  category: "Coastal wetlands",
                  description: study.description,
                  recommendedSensors: ["Sentinel-1", "NISAR"],
                };
                handleSelectObservatory(match as any);
              }}
            />
          )}

          {/* Primary View 8: Reports & Dashboards */}
          {activeDestination === "reports" && (
            <div className="flex-1 overflow-y-auto p-6 bg-[#040812]">
              <DashboardView onNavigate={(tab) => setActiveDestination(tab as any)} />
            </div>
          )}

          {/* Primary View 9: Automated Satellite Monitor */}
          {activeDestination === "monitor" && <SatelliteUpdateMonitorView />}
        </div>

        {/* Right Intelligence Suite Panel (Shown during Explore mode) */}
        {activeDestination === "explore" && (
          <RightIntelligenceSuite inspectedPixel={inspectedPixel} />
        )}
      </div>

      {/* 3. Bottom Observation Timeline (Shown during Explore mode) */}
      {activeDestination === "explore" && <UnifiedObservationTimeline />}

      {/* 4. Global Scientific Status Footer Bar */}
      <footer className="relative h-7 bg-[#02050b] border-t border-[#101826] px-5 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none z-30 overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Platform: CoastPulse</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-300 truncate max-w-xs">
            AOI: {selectedLocation ? selectedLocation.name : "Global Planetary View"}
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-300">
            Observatories: <span className="text-[#00e5ff] font-semibold">{GLOBAL_COASTAL_OBSERVATORIES.length} Verified</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#34d399] font-medium">
            <span>🛡</span>
            <span>Zero Extrapolation Guarantee</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-400">
            EPSG:4326 Native Geodesic Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
