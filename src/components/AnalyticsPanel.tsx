/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BiogasStats } from "../types";
import { 
  TrendingUp, BarChart2, AlertTriangle, ShieldCheck, 
  Clock, Activity, Eye, FileText, ArrowUpRight, Zap, Info
} from "lucide-react";

interface AnalyticsPanelProps {
  biogasStats: BiogasStats;
}

export default function AnalyticsPanel({ biogasStats }: AnalyticsPanelProps) {
  
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
