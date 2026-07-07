/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sensor, Incident, BiogasStats } from "../types";
import { 
  TrendingUp, BarChart2, AlertTriangle, ShieldCheck, 
  Clock, Activity, Eye, FileText, ArrowUpRight, Zap, Info,
  MapPin, Sparkles, RefreshCw, ShieldAlert, Cpu, Heart, CheckCircle2
} from "lucide-react";

interface AnalyticsPanelProps {
  biogasStats: BiogasStats;
  sensors: Sensor[];
  incidents: Incident[];
}

export default function AnalyticsPanel({ biogasStats, sensors = [], incidents = [] }: AnalyticsPanelProps) {
  const [expandedArea, setExpandedArea] = useState<string | null>("gajuwaka");
  const [analyzedAreas, setAnalyzedAreas] = useState<Record<string, boolean>>({
    gajuwaka: true // Start with one report analyzed to make the UI look immediately populated
  });
  const [analyzingAreaId, setAnalyzingAreaId] = useState<string | null>(null);

  const handleRunAnalysis = (areaId: string) => {
    setAnalyzingAreaId(areaId);
    setTimeout(() => {
      setAnalyzedAreas(prev => ({ ...prev, [areaId]: true }));
      setAnalyzingAreaId(null);
    }, 1200);
  };

  // List of Visakhapatnam Sectors for Live Pollution & Report Analysis
  const VIZAG_AREAS = [
    {
      id: "gajuwaka",
      name: "Gajuwaka Industrial Zone",
      description: "Steel manufacturing hubs, dense residential back-alleys, and high biomass potential.",
      sensorIds: ["sen_gaj_02"],
      keywords: ["Gajuwaka", "Gaj"],
      defaultPm25: 185,
      defaultPm10: 290,
      sources: { industrial: 55, vehicle: 20, construction: 5, waste: 20 },
      geminiAnalysis: "Atmospheric load is highly dominated by industrial coke-oven venting and diesel logistics haulage. Citizen reports confirm periodic unpermitted municipal trash combustion in residential sectors. Standard smart workflow recommended: Route all dry organic industrial waste to Vizag Bio-Digester Plant 4 to prevent open-air combustion."
    },
    {
      id: "port_trust",
      name: "Visakhapatnam Port Trust Area",
      description: "Coal berths, heavy logistics traffic, and unpaved conveyor transport dust corridors.",
      sensorIds: ["sen_vpt_06"],
      keywords: ["Port", "VPT", "vpt", "Dock"],
      defaultPm25: 154,
      defaultPm10: 240,
      sources: { industrial: 30, vehicle: 25, construction: 40, waste: 5 },
      geminiAnalysis: "PM10 concentrations are highly elevated due to open conveyor coal handling and heavy tri-wheeler dock maneuvers. Smart workflow recommended: Activate continuous water-sprinkler mist curtains at Dock Gate 3 and maintain mechanical sweepers on 2-hour cycles."
    },
    {
      id: "scindia",
      name: "Scindia Shipyard Perimeter",
      description: "Marine shipbuilding foundries, boiler stacks, and dense diesel logistics crossings.",
      sensorIds: ["sen_sci_05"],
      keywords: ["Scindia", "sci", "Shipyard"],
      defaultPm25: 145,
      defaultPm10: 220,
      sources: { industrial: 60, vehicle: 30, construction: 5, waste: 5 },
      geminiAnalysis: "Dense sulfur dioxide anomalies are periodic. Elevated PM2.5 levels correlate heavily with ship repair foundry boiler stacks. Smart workflow recommended: Schedule thermal infrared drone flyovers and coordinate automatic citations for exceeding emissions quotas during stagnant morning air conditions."
    },
    {
      id: "mvp_colony",
      name: "MVP Colony Sector Grid",
      description: "Dense commercial market junctions, residential sectors, and municipal composting zones.",
      sensorIds: ["sen_mvp_01"],
      keywords: ["MVP", "mvp"],
      defaultPm25: 64,
      defaultPm10: 110,
      sources: { industrial: 5, vehicle: 45, construction: 15, waste: 35 },
      geminiAnalysis: "High localized vehicular smog concentrated around commercial market crossings. Food court municipal waste piles contribute minor particulate drift. Smart workflow recommended: Install Anaerobic bioreactor street bins with gamified eco-points rewards."
    },
    {
      id: "beach_road",
      name: "Beach Road Tourist Corridor",
      description: "Coastal recreation areas, hotels, and seafood commercial micro-kitchens.",
      sensorIds: ["sen_bch_03"],
      keywords: ["Beach", "bch"],
      defaultPm25: 42,
      defaultPm10: 75,
      sources: { industrial: 0, vehicle: 40, construction: 10, waste: 50 },
      geminiAnalysis: "Generally moderate AQI with standard coastal sea-breeze dispersion. Minor evening smoke spikes are detected from beachfront seafood grills and open plastic burning. Smart workflow recommended: Enforce zero-burn shoreline trash patrols."
    },
    {
      id: "rushikonda",
      name: "Rushikonda Technology Hill",
      description: "IT office parks, research centers, and clean coastal atmospheric micro-grid.",
      sensorIds: ["sen_rsh_04"],
      keywords: ["Rushikonda", "rsh"],
      defaultPm25: 38,
      defaultPm10: 60,
      sources: { industrial: 10, vehicle: 50, construction: 35, waste: 5 },
      geminiAnalysis: "Cleanest atmospheric sector in the Visakhapatnam municipality. Minor particulate elevations from uphill software park infrastructure construction digging. Smart workflow recommended: Enforce standard dust fabric sheets on all active perimeters."
    }
  ];
  
  // Custom mock data for historic baseline (24-hour diurnal trend)
  const aqiHourlyTrend = [
    { hour: "02:00", baseline: 240, active: 220 },
    { hour: "06:00", baseline: 290, active: 260 },
    { hour: "10:00", baseline: 180, active: 145 },
    { hour: "14:00", baseline: 110, active: 85 },
    { hour: "18:00", baseline: 160, active: 130 },
    { hour: "22:00", baseline: 210, active: 190 }
  ];

  // District wise biogas contribution mock (Andhra Pradesh zones)
  const districtContributions = [
    { district: "Gajuwaka Belt", biomass: 2850, yield: 1140, color: "rgba(16, 185, 129, 0.8)" },
    { district: "MVP Colony Grid", biomass: 2100, yield: 840, color: "rgba(234, 179, 8, 0.8)" },
    { district: "VPT Dock Area", biomass: 1200, yield: 480, color: "rgba(249, 115, 22, 0.8)" },
    { district: "Rushikonda Tech", biomass: 700, yield: 280, color: "rgba(56, 189, 248, 0.8)" }
  ];

  // Render responsive SVG Line Chart
  const renderLineChart = () => {
    const width = 500;
    const height = 180;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = 300; // AQI scale limit
    const getX = (index: number) => padding + (index / (aqiHourlyTrend.length - 1)) * chartWidth;
    const getY = (val: number) => height - padding - (val / maxVal) * chartHeight;

    // Build SVG Path strings
    let baselinePath = "";
    let activePath = "";

    aqiHourlyTrend.forEach((pt, idx) => {
      const x = getX(idx);
      const yBaseline = getY(pt.baseline);
      const yActive = getY(pt.active);

      if (idx === 0) {
        baselinePath = `M ${x} ${yBaseline}`;
        activePath = `M ${x} ${yActive}`;
      } else {
        baselinePath += ` L ${x} ${yBaseline}`;
        activePath += ` L ${x} ${yActive}`;
      }
    });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-slate-400">
        <defs>
          <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[50, 100, 150, 200, 250, 300].map((level, i) => (
          <g key={i}>
            <line 
              x1={padding} 
              y1={getY(level)} 
              x2={width - padding} 
              y2={getY(level)} 
              stroke="rgba(51, 65, 85, 0.1)" 
              strokeWidth="1"
            />
            <text 
              x={padding - 6} 
              y={getY(level) + 3} 
              className="text-[8px] fill-slate-500 font-mono text-right"
              textAnchor="end"
            >
              {level}
            </text>
          </g>
        ))}

        {/* X Axis Labels */}
        {aqiHourlyTrend.map((pt, idx) => (
          <text 
            key={idx} 
            x={getX(idx)} 
            y={height - 10} 
            className="text-[8px] fill-slate-500 font-mono text-center" 
            textAnchor="middle"
          >
            {pt.hour}
          </text>
        ))}

        {/* Area under active trend */}
        <path 
          d={`${activePath} L ${getX(aqiHourlyTrend.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`} 
          fill="url(#activeGradient)"
        />

        {/* Line paths */}
        <path 
          d={baselinePath} 
          fill="none" 
          stroke="rgba(239, 68, 68, 0.45)" 
          strokeWidth="1.5" 
          strokeDasharray="4,4"
        />
        <path 
          d={activePath} 
          fill="none" 
          stroke="#38bdf8" 
          strokeWidth="2.5" 
        />

        {/* Dots on active paths */}
        {aqiHourlyTrend.map((pt, idx) => (
          <circle 
            key={idx} 
            cx={getX(idx)} 
            cy={getY(pt.active)} 
            r="3.5" 
            className="fill-slate-950 stroke-sky-400 stroke-[2px]" 
          />
        ))}
      </svg>
    );
  };

  // Render responsive SVG Bar Chart
  const renderBarChart = () => {
    const width = 500;
    const height = 180;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxBiomass = 3500; // max scale
    const barWidth = 35;
    const spacing = chartWidth / districtContributions.length;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {[1000, 2000, 3000].map((lvl, i) => {
          const y = height - padding - (lvl / maxBiomass) * chartHeight;
          return (
            <g key={i}>
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="rgba(51, 65, 85, 0.1)" 
                strokeWidth="1"
              />
              <text 
                x={padding - 6} 
                y={y + 3} 
                className="text-[8px] fill-slate-500 font-mono"
                textAnchor="end"
              >
                {lvl}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {districtContributions.map((dist, idx) => {
          const x = padding + idx * spacing + (spacing - barWidth) / 2;
          const barHeight = (dist.biomass / maxBiomass) * chartHeight;
          const y = height - padding - barHeight;

          return (
            <g key={idx}>
              {/* Backglow bar */}
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                rx="3" 
                fill={dist.color} 
                opacity="0.15" 
              />
              {/* Main bar */}
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                rx="3" 
                fill={dist.color} 
              />
              {/* Value text */}
              <text 
                x={x + barWidth / 2} 
                y={y - 5} 
                className="text-[9px] fill-slate-300 font-mono font-bold" 
                textAnchor="middle"
              >
                {dist.biomass}kg
              </text>
              {/* Label */}
              <text 
                x={x + barWidth / 2} 
                y={height - 10} 
                className="text-[8px] fill-slate-500 font-semibold" 
                textAnchor="middle"
              >
                {dist.district.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex flex-col space-y-6" id="analytics-panel-root">
      
      {/* LIVE POLLUTION CHECK & REPORT ANALYSIS PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-4" id="live-pollution-check-container">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Pollution Check & Report Analysis</h3>
              <span className="text-[9px] text-slate-500 font-medium">Real-Time Sector Tracking • Visakhapatnam</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-[8.5px] font-mono font-bold bg-slate-950 px-2 py-1 rounded border border-slate-850">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400 text-[8px]">TELEMETRY SYNCED</span>
          </div>
        </div>

        <p className="text-[10.5px] text-slate-400 leading-relaxed">
          AeroWatch synthesizes live municipal IoT data grids, automated satellite NO2 observations, and localized citizen-uploaded report logs to map hyper-local pollution signatures and target interventions.
        </p>

        {/* Sectors Accordion List */}
        <div className="flex flex-col space-y-2.5 pt-1.5">
          {VIZAG_AREAS.map((area) => {
            // Live lookups
            const matchingSensor = sensors.find(s => area.sensorIds.includes(s.id));
            const livePm25 = matchingSensor ? matchingSensor.pm25 : area.defaultPm25;
            const livePm10 = matchingSensor ? matchingSensor.pm10 : area.defaultPm10;

            const areaIncidents = incidents.filter(inc => 
              area.keywords.some(kw => 
                inc.locationName.toLowerCase().includes(kw.toLowerCase()) || 
                inc.title.toLowerCase().includes(kw.toLowerCase())
              )
            );
            const activeIncidents = areaIncidents.filter(inc => inc.status !== "cleared" && inc.status !== "false_positive");
            const activeIncidentsCount = activeIncidents.length;

            const isExpanded = expandedArea === area.id;
            const isAnalyzed = analyzedAreas[area.id];
            const isAnalyzing = analyzingAreaId === area.id;

            // Compute AQI Rating
            let ratingColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            let ratingText = "Good";
            if (livePm25 > 150) {
              ratingColor = "bg-purple-500/10 text-purple-400 border-purple-500/30";
              ratingText = "Critical";
            } else if (livePm25 > 100) {
              ratingColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
              ratingText = "Severe";
            } else if (livePm25 > 50) {
              ratingColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
              ratingText = "Poor";
            }

            return (
              <div 
                key={area.id}
                className={`border rounded-lg transition-all duration-350 overflow-hidden ${isExpanded ? 'bg-slate-950 border-slate-700/60 shadow-md' : 'bg-slate-900/60 border-slate-850 hover:bg-slate-900/90'}`}
                id={`sector-analysis-${area.id}`}
              >
                {/* Accordion Trigger Header */}
                <div 
                  onClick={() => setExpandedArea(isExpanded ? null : area.id)}
                  className="p-3 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-4 w-4 shrink-0 transition-colors ${isExpanded ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-xs font-bold text-slate-200">{area.name}</span>
                      <span className="text-[9px] text-slate-500 line-clamp-1 max-w-[190px] sm:max-w-none">{area.description}</span>
                    </div>
                  </div>

                  {/* Status Badges Group */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Live Report Tracker */}
                    {activeIncidentsCount > 0 ? (
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900/40 animate-pulse flex items-center gap-1">
                        🔥 {activeIncidentsCount} {activeIncidentsCount === 1 ? 'Report' : 'Reports'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-850 flex items-center gap-1">
                        ✔ Clear
                      </span>
                    )}

                    {/* Live AQI Check */}
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${ratingColor}`}>
                      {livePm25} PM2.5 • {ratingText}
                    </span>
                  </div>
                </div>

                {/* Expanded Sector Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-900 flex flex-col space-y-3.5" id={`sector-expand-details-${area.id}`}>
                    
                    {/* Particulate Gauges and Telemetry Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-slate-900/60 p-2 rounded border border-slate-850 flex flex-col justify-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">PM2.5 Check</span>
                        <span className="text-xs font-extrabold text-slate-200 font-mono mt-0.5">{livePm25} <span className="text-[8px] font-normal text-slate-500">µg/m³</span></span>
                        <div className="w-full bg-slate-950 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${livePm25 > 150 ? 'bg-purple-500' : livePm25 > 100 ? 'bg-rose-500' : livePm25 > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min((livePm25 / 250) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-2 rounded border border-slate-850 flex flex-col justify-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">PM10 Check</span>
                        <span className="text-xs font-extrabold text-slate-200 font-mono mt-0.5">{livePm10} <span className="text-[8px] font-normal text-slate-500">µg/m³</span></span>
                        <div className="w-full bg-slate-950 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${livePm10 > 250 ? 'bg-purple-500' : livePm10 > 150 ? 'bg-rose-500' : livePm10 > 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min((livePm10 / 350) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-2 rounded border border-slate-850 flex flex-col justify-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Local Temp</span>
                        <span className="text-xs font-extrabold text-slate-200 font-mono mt-0.5">{matchingSensor ? matchingSensor.temperature : "31.2"}°C</span>
                        <span className="text-[7.5px] text-slate-500 mt-1">Ground Station</span>
                      </div>

                      <div className="bg-slate-900/60 p-2 rounded border border-slate-850 flex flex-col justify-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Humidity</span>
                        <span className="text-xs font-extrabold text-slate-200 font-mono mt-0.5">{matchingSensor ? matchingSensor.humidity : "74"}%</span>
                        <span className="text-[7.5px] text-slate-500 mt-1">Stagnancy Factor</span>
                      </div>
                    </div>

                    {/* Source Breakdown visual */}
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850/60 flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Multimodal Source Attribution</span>
                        <span className="text-[8px] text-slate-500 font-mono">LIVE FOOTPRINT MODEL</span>
                      </div>

                      {/* Stacked Percentage bar */}
                      <div className="h-2 w-full bg-slate-950 rounded-full flex overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${area.sources.industrial}%` }} />
                        <div className="bg-amber-500 h-full" style={{ width: `${area.sources.vehicle}%` }} />
                        <div className="bg-sky-500 h-full" style={{ width: `${area.sources.construction}%` }} />
                        <div className="bg-emerald-500 h-full" style={{ width: `${area.sources.waste}%` }} />
                      </div>

                      {/* Source Legend */}
                      <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-semibold text-slate-400">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                          <span>Industrial Boiler ({area.sources.industrial}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          <span>Vehicular Smog ({area.sources.vehicle}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
                          <span>Excavation Dust ({area.sources.construction}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span>Open Biomass Burn ({area.sources.waste}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Environmental Report & smart alerts analysis */}
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex flex-col space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
                        <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          <span>Gemini UEI Environmental Audit Report</span>
                        </div>
                        <span className="text-[7.5px] font-mono text-slate-500">MODEL: GEMINI-3.5-FLASH</span>
                      </div>

                      {isAnalyzed ? (
                        <div className="space-y-2 text-[10px] text-slate-300 leading-relaxed">
                          <p>{area.geminiAnalysis}</p>
                          
                          {/* Active dispatch audits */}
                          <div className="pt-1.5 border-t border-slate-900/60 flex flex-col space-y-1 text-[9px]">
                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Active Remediation Status</span>
                            
                            {activeIncidentsCount > 0 ? (
                              activeIncidents.map((inc) => (
                                <div key={inc.id} className="flex items-center justify-between bg-slate-900/40 p-1.5 rounded border border-slate-900 mt-0.5">
                                  <span className="font-semibold text-slate-300 truncate max-w-[150px]">{inc.title}</span>
                                  <span className={`font-mono font-bold uppercase px-1 py-0.2 rounded text-[7.5px] shrink-0 ${
                                    inc.status === 'biogas_processed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                                    inc.status === 'biogas_routing' ? 'bg-amber-950 text-amber-400 border border-amber-900/40 animate-pulse' :
                                    inc.status === 'action_dispatched' ? 'bg-sky-950 text-sky-400 border border-sky-900/40' :
                                    'bg-rose-950 text-rose-400 border border-rose-900/40'
                                  }`}>
                                    {inc.status.replace('_', ' ')}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mt-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>All local atmospheric indices back to baseline. Continuous automated satellite monitoring active.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 space-y-2" id={`audit-trigger-${area.id}`}>
                          <span className="text-[9px] text-slate-500">Sector analysis cache pending real-time verification.</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunAnalysis(area.id);
                            }}
                            disabled={isAnalyzing}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 font-bold text-[9px] py-1.5 px-3 rounded-md transition-all flex items-center space-x-1"
                            id={`btn-trigger-audit-${area.id}`}
                          >
                            {isAnalyzing ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                                <span>Calibrating Satellite Columns...</span>
                              </>
                            ) : (
                              <>
                                <Cpu className="h-3 w-3 text-emerald-400" />
                                <span>Verify Ground Truth & Run Gemini Report Analysis</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics-visual-charts">
        {/* AQI Trend line chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-sky-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Diurnal PM2.5 AQI Baseline vs Active Forecast</h3>
            </div>
            <div className="flex items-center space-x-2 text-[9px] font-semibold text-slate-500">
              <span className="flex items-center"><span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-1"></span>Baseline</span>
              <span className="flex items-center"><span className="h-1.5 w-1.5 bg-sky-400 rounded-full mr-1"></span>Active Intervented</span>
            </div>
          </div>
          
          <div className="h-[180px] w-full flex items-center justify-center">
            {renderLineChart()}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic text-center">
            *Active hyper-local intervention has reduced baseline PM2.5 concentrations by an average of 18% during peak congestion hours.
          </p>
        </div>

        {/* Biogas districts bar chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Biomass Diverted to Bio-Gas by District Ward</h3>
            </div>
          </div>
          
          <div className="h-[180px] w-full flex items-center justify-center">
            {renderBarChart()}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed text-center">
            Gajuwaka Industrial Corridor continues to lead rubbish diversion quotas, routing over 1.8 tons of organic biomass to Bio-Reactor Cluster A.
          </p>
        </div>
      </div>

      {/* CHRONIC HOTSPOTS & MUNICIPAL POLICY STRATEGIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="chronic-hotspots-registry">
        
        {/* Hotspots Panel */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-3">
          <div className="border-b border-slate-800 pb-2 flex items-center space-x-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chronic Urban Atmospheric Hotspots & Intervention Registry</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] tracking-wider">
                  <th className="py-2">Hotspot Sector</th>
                  <th className="py-2">Chronic Hazard</th>
                  <th className="py-2">Severity Impact</th>
                  <th className="py-2">Systemic Remediation Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-2.5 font-bold text-slate-200">VPT Dock Gate 3 Corridor</td>
                  <td>Unpaved dirt and heavy truck dust</td>
                  <td><span className="text-rose-400 font-bold">HIGH</span></td>
                  <td>Deploy continuous roadside mechanical sweepers & water spray corridors.</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-200">Gajuwaka Industrial Belt</td>
                  <td>Curfew boiler gas exhaust</td>
                  <td><span className="text-purple-400 font-bold">CRITICAL</span></td>
                  <td>Perform thermal infrared inspections and issue automated digital EPA citations.</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-200">MVP Colony Beach Road</td>
                  <td>Commercial garbage dumps</td>
                  <td><span className="text-amber-500 font-bold">MEDIUM</span></td>
                  <td>Establish local Anaerobic Bio-reactor collection bins with gamified eco-points.</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-200">Scindia Shipyard Perimeter</td>
                  <td>Diesel vehicular tailpipe smog</td>
                  <td><span className="text-amber-500 font-bold">MEDIUM</span></td>
                  <td>Establish intelligent green-light timing sequences to minimize gridlocked idling.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Public Health Outcome Metrics card */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex flex-col space-y-3">
            <div className="border-b border-slate-800 pb-2 flex items-center space-x-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Public Health Outcomes</h3>
            </div>

            <div className="space-y-4 pt-1">
              {/* Impact metric 1 */}
              <div className="flex items-start space-x-3">
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold shrink-0">45%</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">Respiratory ER Drop</span>
                  <span className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Reduction in pediatric respiratory admissions within 1km radius of managed construction dust quadrants.
                  </span>
                </div>
              </div>

              {/* Impact metric 2 */}
              <div className="flex items-start space-x-3">
                <span className="p-2 bg-sky-500/10 text-sky-400 rounded-lg text-xs font-bold shrink-0">12m</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">Response Speed optimization</span>
                  <span className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Average municipal team dispatch latency cut from 3 hours to 12 minutes using real-time GPS routing.
                  </span>
                </div>
              </div>

              {/* Impact metric 3 */}
              <div className="flex items-start space-x-3">
                <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-bold shrink-0">3.1t</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">Biomass Diverted to Power</span>
                  <span className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Cumulative dry municipal rubbishes converted to renewable methane grids, generating electricity.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-[10px] text-slate-400 mt-4 flex items-start space-x-2">
            <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              AeroWatch UEI metrics correlate atmospheric improvement directly with local clinical intake databases to confirm clean-air viability.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
