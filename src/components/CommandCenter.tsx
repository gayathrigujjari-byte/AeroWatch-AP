/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sensor, Incident, ActionResource, BiogasStats } from "../types";
import { 
  ShieldAlert, Activity, Battery, CheckCircle2, AlertTriangle, 
  RefreshCw, Navigation, Zap, Trash2, HelpCircle, User, Star, MapPin, Compass
} from "lucide-react";

interface CommandCenterProps {
  sensors: Sensor[];
  incidents: Incident[];
  resources: ActionResource[];
  biogasStats: BiogasStats;
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  selectedSensor: Sensor | null;
  onSelectSensor: (sensor: Sensor | null) => void;
  onTriggerIncidentAction: (id: string, actionType: 'dispatch' | 'process_biogas' | 'clear' | 'flag_false_positive') => Promise<void>;
  onCalibrateSensor: (id: string) => Promise<void>;
}

export default function CommandCenter({
  sensors,
  incidents,
  resources,
  biogasStats,
  selectedIncident,
  onSelectIncident,
  selectedSensor,
  onSelectSensor,
  onTriggerIncidentAction,
  onCalibrateSensor
}: CommandCenterProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);

  // Filter incidents that are active (not archived)
  const activeIncidentsList = incidents.filter(inc => {
    if (inc.status === "cleared" || inc.status === "false_positive") return false;
    if (filterSeverity !== "all" && inc.severity !== filterSeverity) return false;
    return true;
  });

  const handleWorkflowClick = async (id: string, type: 'dispatch' | 'process_biogas' | 'clear' | 'flag_false_positive') => {
    setActionLoading(true);
    await onTriggerIncidentAction(id, type);
    setActionLoading(false);
  };

  const handleCalibrateClick = async (id: string) => {
    setActionLoading(true);
    await onCalibrateSensor(id);
    setActionLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="command-center-root">
      
      {/* Citywide Impact Analytics Cards (Top Column) */}
      <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4" id="citywide-impact-analytics">
        
        {/* Total Biomass */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Biomass Diverted</span>
            <span className="text-xl font-bold font-sans text-slate-100 mt-1">{biogasStats.totalBiomassCollectedKg.toLocaleString()} kg</span>
            <span className="text-[10px] text-emerald-400 mt-0.5">✔ Out of landfill cycle</span>
          </div>
          <span className="text-xl p-2 bg-slate-950 rounded-lg">🍂</span>
        </div>

        {/* Biogas Yield */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Biogas Generated</span>
            <span className="text-xl font-bold font-sans text-emerald-400 mt-1">{biogasStats.totalBiogasProducedM3.toLocaleString()} m³</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Clean fuel for stove networks</span>
          </div>
          <span className="text-xl p-2 bg-emerald-950/40 rounded-lg">🔥</span>
        </div>

        {/* CO2 offset */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Carbon Abated</span>
            <span className="text-xl font-bold font-sans text-sky-400 mt-1">{biogasStats.carbonOffsetKg.toLocaleString()} kg CO₂</span>
            <span className="text-[10px] text-sky-400 mt-0.5">Smoke dispersion averted</span>
          </div>
          <span className="text-xl p-2 bg-sky-950/40 rounded-lg">🌱</span>
        </div>

        {/* Power equivalents */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Clean Energy Yield</span>
            <span className="text-xl font-bold font-sans text-amber-400 mt-1">{biogasStats.energyGeneratedKwh.toLocaleString()} kWh</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Power grid supplement equivalency</span>
          </div>
          <span className="text-xl p-2 bg-amber-950/40 rounded-lg">⚡</span>
        </div>
      </div>

      {/* LEFT COLUMN: Lists (IoT Sensors & Active Incidents) */}
      <div className="lg:col-span-7 flex flex-col space-y-6">
        
        {/* ACTIVE INCIDENTS MONITOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-3" id="active-incidents-monitor">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Pollution Hotspots ({activeIncidentsList.length})</h2>
            </div>
            
            {/* Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-sky-500"
              id="filter-severity-dropdown"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>
          </div>

          {/* List */}
          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {activeIncidentsList.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No active pollution incidents matches filter criteria. City atmosphere is nominal.
              </div>
            ) : (
              activeIncidentsList.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                let severityColor = "border-l-amber-500";
                if (inc.severity === "high") severityColor = "border-l-rose-500";
                if (inc.severity === "critical") severityColor = "border-l-purple-500";
                if (inc.severity === "low") severityColor = "border-l-emerald-500";

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      onSelectIncident(inc);
                      onSelectSensor(null);
                    }}
                    className={`p-2.5 rounded-lg border bg-slate-950 hover:bg-slate-900/65 cursor-pointer border-slate-850 flex flex-col space-y-2 transition-colors border-l-4 ${severityColor} ${isSelected ? 'ring-1 ring-sky-500/50 bg-slate-900/40' : ''}`}
                    id={`incident-item-${inc.id}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-200">{inc.title}</span>
                          <span className="text-[9px] text-slate-500">({inc.detectedBy.replace('_', ' ')})</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{inc.locationName} • Proximity to School: {inc.proximityToSchool}m</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                          inc.status === 'reported' ? 'bg-rose-500/20 text-rose-400' : 
                          inc.status === 'biogas_processed' ? 'bg-emerald-500/20 text-emerald-400' : 
                          inc.status === 'biogas_routing' ? 'bg-amber-500/20 text-amber-400' :
                          inc.status === 'cleared' ? 'bg-slate-500/20 text-slate-400' :
                          'bg-sky-500/20 text-sky-400'
                        }`}>
                          {inc.status.replace('_', ' ')}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${inc.severity === 'critical' ? 'bg-purple-500/20 text-purple-400' : inc.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {inc.severity}
                        </span>
                      </div>
                    </div>

                    {inc.biomassWeight && (
                      <div className="pt-1.5 border-t border-slate-900/60 flex flex-col space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px]">Biogas Handoff Pipeline</span>
                          {inc.status === 'biogas_processed' ? (
                            <span className="text-emerald-400 font-bold text-[9px] flex items-center gap-0.5 animate-pulse">
                              🎉 Handoff Success! (+{Math.round(inc.biomassWeight * 0.5) + 120} pts)
                            </span>
                          ) : inc.status === 'biogas_routing' ? (
                            <span className="text-amber-400 font-bold text-[9px] animate-pulse">
                              🚚 Transporting ({inc.biomassWeight}kg)...
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium text-[9px]">
                              Awaiting Dispatch ({inc.biomassWeight}kg)
                            </span>
                          )}
                        </div>

                        {/* 3-Step Horizontal Stepper */}
                        <div className="grid grid-cols-3 gap-2 mt-0.5">
                          {/* Step 1: Collected */}
                          <div className="flex flex-col space-y-0.5">
                            <div className={`h-1 rounded-full ${
                              inc.status === 'biogas_processed' || inc.status === 'biogas_routing' || inc.status === 'reported' || inc.status === 'verified' || inc.status === 'action_dispatched'
                                ? 'bg-sky-500' : 'bg-slate-850'
                            }`} />
                            <span className="text-[7.5px] text-slate-500 font-mono font-medium">1. Collected</span>
                          </div>

                          {/* Step 2: Transit */}
                          <div className="flex flex-col space-y-0.5">
                            <div className={`h-1 rounded-full ${
                              inc.status === 'biogas_processed' || inc.status === 'biogas_routing'
                                ? 'bg-amber-500' : 'bg-slate-850'
                            } ${inc.status === 'biogas_routing' ? 'animate-pulse' : ''}`} />
                            <span className="text-[7.5px] text-slate-500 font-mono font-medium">2. In-Transit</span>
                          </div>

                          {/* Step 3: Digested */}
                          <div className="flex flex-col space-y-0.5">
                            <div className={`h-1 rounded-full ${
                              inc.status === 'biogas_processed'
                                ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-slate-850'
                            }`} />
                            <span className="text-[7.5px] text-slate-500 font-mono font-medium flex items-center gap-0.5">
                              3. Digested {inc.status === 'biogas_processed' && '✔'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* IOT SENSOR STATUS TELEMETRY */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-3" id="iot-sensor-status-panel">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">IoT Environmental Sensors ({sensors.length})</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
            {sensors.map((sensor) => {
              const isSelected = selectedSensor?.id === sensor.id;
              
              // Get AQI styling
              let aqiColor = "text-emerald-400";
              if (sensor.pm25 > 50 && sensor.pm25 <= 100) aqiColor = "text-amber-400";
              else if (sensor.pm25 > 100 && sensor.pm25 <= 200) aqiColor = "text-orange-400";
              else if (sensor.pm25 > 200) aqiColor = "text-rose-500";

              return (
                <div
                  key={sensor.id}
                  onClick={() => {
                    onSelectSensor(sensor);
                    onSelectIncident(null);
                  }}
                  className={`p-2 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900/60 cursor-pointer flex flex-col justify-between transition-colors ${isSelected ? 'ring-1 ring-sky-500/40 border-sky-500/30' : ''}`}
                  id={`sensor-grid-item-${sensor.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-200 truncate max-w-[130px]" title={sensor.name}>{sensor.name}</span>
                    <span className="text-[9px] text-slate-500 uppercase">{sensor.type.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-400">PM2.5: <strong className={aqiColor}>{sensor.pm25}</strong></span>
                      <span className="text-slate-500 font-mono">|</span>
                      <span className="text-slate-400 font-mono">PM10: {sensor.pm10}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Battery className={`h-3 w-3 ${sensor.battery < 50 ? 'text-rose-400 animate-pulse' : 'text-emerald-500'}`} />
                      <span className="text-[9px] text-slate-400 font-mono">{sensor.battery}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Workflow Operations Panel */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        
        {/* INTERACTIVE WORKFLOW MODULE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col space-y-4" id="workflow-operations-module">
          <div className="border-b border-slate-800 pb-2.5">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dynamic Response Dispatch Terminal</h2>
          </div>

          {/* Fallback state when nothing is selected */}
          {!selectedIncident && !selectedSensor && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-950/60 border border-slate-850 border-dashed rounded-xl h-full">
              <HelpCircle className="h-10 w-10 text-slate-700 animate-pulse mb-3" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Target Node Selected</h3>
              <p className="text-[11px] text-slate-500 max-w-[200px] mt-1 leading-relaxed">
                Click any flashing Incident pin or IoT sensor circle on the map to trigger smart municipal workflows.
              </p>
            </div>
          )}

          {/* INCIDENT WORKFLOW DETAIL CONTROL */}
          {selectedIncident && (
            <div className="flex-1 flex flex-col space-y-3 text-xs" id="workflow-incident-detail-board">
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm truncate max-w-[170px]" title={selectedIncident.title}>{selectedIncident.title}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[8px] px-1 py-0.5 rounded font-mono font-bold uppercase ${
                      selectedIncident.status === 'reported' ? 'bg-rose-500/20 text-rose-400' : 
                      selectedIncident.status === 'biogas_processed' ? 'bg-emerald-500/20 text-emerald-400' : 
                      selectedIncident.status === 'biogas_routing' ? 'bg-amber-500/20 text-amber-400' :
                      selectedIncident.status === 'cleared' ? 'bg-slate-500/20 text-slate-400' :
                      'bg-sky-500/20 text-sky-400'
                    }`}>
                      {selectedIncident.status.replace('_', ' ')}
                    </span>
                    <span className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase ${selectedIncident.severity === 'critical' ? 'bg-purple-500/20 text-purple-400' : selectedIncident.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {selectedIncident.severity}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{selectedIncident.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  <span>Detected: {selectedIncident.detectedBy.replace('_', ' ')}</span>
                  <span>GPS: {selectedIncident.coordinates.lat.toFixed(4)}, {selectedIncident.coordinates.lng.toFixed(4)}</span>
                  <span>School Margin: {selectedIncident.proximityToSchool} meters</span>
                  {selectedIncident.biomassWeight && (
                    <span className="text-amber-500 font-bold">Rubbish Weight: {selectedIncident.biomassWeight}kg</span>
                  )}
                </div>

                {selectedIncident.biomassWeight && (
                  <div className="mt-3 p-3 bg-slate-950 border border-slate-850 rounded-lg flex flex-col space-y-2.5" id="selected-incident-biogas-stepper">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Anaerobic Digest Handoff Pipeline</span>
                      <span className="text-[8px] text-emerald-400 font-semibold font-mono bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30">
                        {selectedIncident.status === "biogas_processed" ? "HANDOFF COMPLETED" : selectedIncident.status === "biogas_routing" ? "IN TRANSIT" : "PENDING DISPATCH"}
                      </span>
                    </div>

                    <div className="relative flex items-center justify-between mt-1 px-4">
                      {/* Connection Lines */}
                      <div className="absolute left-[12%] right-[12%] top-[12px] h-[2px] bg-slate-800 -z-0">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ 
                            width: selectedIncident.status === "biogas_processed" ? "100%" : selectedIncident.status === "biogas_routing" ? "50%" : "0%" 
                          }} 
                        />
                      </div>

                      {/* Step 1: Collected */}
                      <div className="flex flex-col items-center z-10 text-center w-[28%]">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-xs ${
                          selectedIncident.status === "biogas_processed" || selectedIncident.status === "biogas_routing" || selectedIncident.status === "reported" || selectedIncident.status === "verified" || selectedIncident.status === "action_dispatched"
                            ? "bg-sky-950 text-sky-400 border-sky-500" : "bg-slate-900 text-slate-600 border-slate-800"
                        }`}>
                          🍂
                        </div>
                        <span className="text-[8.5px] font-semibold text-slate-300 mt-1">1. Collected</span>
                        <span className="text-[7px] text-slate-500">Biomass Secured</span>
                      </div>

                      {/* Step 2: Transit */}
                      <div className="flex flex-col items-center z-10 text-center w-[28%]">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-xs ${
                          selectedIncident.status === "biogas_processed" || selectedIncident.status === "biogas_routing"
                            ? "bg-amber-950 text-amber-400 border-amber-500" : "bg-slate-900 text-slate-600 border-slate-800"
                        } ${selectedIncident.status === "biogas_routing" ? "animate-pulse" : ""}`}>
                          🚚
                        </div>
                        <span className="text-[8.5px] font-semibold text-slate-300 mt-1">2. In Transit</span>
                        <span className="text-[7px] text-slate-500">{selectedIncident.status === "biogas_routing" ? "AP Truck Moving" : "Awaiting Dispatch"}</span>
                      </div>

                      {/* Step 3: Bio-Digester Arrival */}
                      <div className="flex flex-col items-center z-10 text-center w-[28%]">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-xs ${
                          selectedIncident.status === "biogas_processed"
                            ? "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-900 text-slate-600 border-slate-800"
                        }`}>
                          🔥
                        </div>
                        <span className="text-[8.5px] font-semibold text-slate-300 mt-1">3. Digested</span>
                        <span className="text-[7px] text-slate-500">{selectedIncident.status === "biogas_processed" ? "Clean Methane!" : "Arrival Facility"}</span>
                      </div>
                    </div>

                    {/* Progress feedback message */}
                    <div className="mt-1 text-[10px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-850/60 leading-relaxed">
                      {selectedIncident.status === "biogas_processed" ? (
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            ✔ Bio-conversion Complete!
                          </span>
                          <span>
                            Dry garbage successfully delivered to **Vizag Anaerobic Digester Plant 4**. Digested into **{selectedIncident.biogasYield || Math.round(selectedIncident.biomassWeight * 0.4)} m³ of methane** for municipal cooking grids. **+{Math.round(selectedIncident.biomassWeight * 0.5) + 120} Eco-points** credited to reporter profile.
                          </span>
                        </div>
                      ) : selectedIncident.status === "biogas_routing" ? (
                        <span className="text-amber-400 font-semibold animate-pulse flex items-center gap-1">
                          🚚 AP Sanitation Scavengers are transport-routing {selectedIncident.biomassWeight}kg biomass refuse to the anaerobic digestion facility. Live GPS tracked on the map!
                        </span>
                      ) : (
                        <span>
                          Waste heap contains **{selectedIncident.biomassWeight}kg** of salvageable biomass. Dispatch sanitation scavengers to harvest and deliver to Bio-Digester Plant 4 to earn points.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action History Log */}
              <div className="flex flex-col space-y-1 bg-slate-950/70 p-2.5 border border-slate-850 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Incident Escalation Log:</span>
                <div className="max-h-[90px] overflow-y-auto space-y-1.5 text-[9px] pr-1 leading-relaxed">
                  {selectedIncident.actionsHistory.map((log, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-900/50 pb-1 last:border-0">
                      <span className="text-slate-500 font-mono">{new Date(log.time).toLocaleTimeString()}</span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION TERMINAL BUTTONS */}
              <div className="flex flex-col space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Operational Decisions:</span>
                
                {selectedIncident.status === "reported" && (
                  <button
                    onClick={() => handleWorkflowClick(selectedIncident.id, "dispatch")}
                    disabled={actionLoading}
                    className="w-full bg-sky-500 text-slate-950 hover:bg-sky-400 py-2 rounded-md font-bold transition-colors flex items-center justify-center space-x-1.5"
                    id="btn-dispatch-resource"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Authorize Emergency Asset Dispatch</span>
                  </button>
                )}

                {/* Biogas Circular loop action */}
                {selectedIncident.biomassWeight && (
                  <div className="flex flex-col space-y-2" id="biogas-workflow-container">
                    {selectedIncident.status === "biogas_routing" && (
                      <div className="p-3 bg-slate-950 border border-emerald-900/40 rounded-lg flex flex-col space-y-2" id="scavenger-dispatch-routing-details">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                            AP Scavengers En-Route
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">Unit: res_sanitation_01</span>
                        </div>
                        <div className="text-[10px] text-slate-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Gathering Load:</span>
                            <span className="text-slate-200 font-mono font-semibold">{selectedIncident.biomassWeight} kg organic mass</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected Clean Fuel:</span>
                            <span className="text-emerald-500 font-mono font-semibold">{selectedIncident.biogasYield || Math.round(selectedIncident.biomassWeight * 0.4)} m³ biogas</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Destination Plant:</span>
                            <span className="text-slate-200 font-semibold">Vizag Anaerobic Digester 4</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 mt-1 overflow-hidden">
                          <div className="bg-emerald-400 h-full w-2/3 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    )}

                    {selectedIncident.status === "biogas_processed" ? (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between" id="biogas-completed-notice">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-450 text-xs font-bold font-mono">✔</div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-emerald-400">Bio-conversion Complete</span>
                            <span className="text-[9px] text-slate-400">{selectedIncident.biomassWeight}kg turned into cooking fuel</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">+{Math.round(selectedIncident.biomassWeight * 0.5) + 120} pts</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleWorkflowClick(selectedIncident.id, "process_biogas")}
                        disabled={actionLoading}
                        className={`w-full ${selectedIncident.status === 'biogas_routing' ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'} py-2 rounded-md font-bold transition-all flex items-center justify-center space-x-1.5`}
                        id="btn-route-biogas"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-slate-950" />
                        <span>{selectedIncident.status === 'biogas_routing' ? 'Deliver to Bio-Digester & Convert' : 'Dispatch Scavengers for Biogas Harvesting'}</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleWorkflowClick(selectedIncident.id, "clear")}
                    disabled={actionLoading}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-850 py-2 rounded-md font-semibold text-emerald-400 text-center transition-colors flex items-center justify-center space-x-1"
                    id="btn-archive-clear"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Archive Clear</span>
                  </button>
                  <button
                    onClick={() => handleWorkflowClick(selectedIncident.id, "flag_false_positive")}
                    disabled={actionLoading}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-850 py-2 rounded-md font-semibold text-rose-400 text-center transition-colors flex items-center justify-center space-x-1"
                    id="btn-false-positive"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    <span>False Positive</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SENSOR DETAIL & TELEMETRY CALIBRATION CONTROL */}
          {selectedSensor && (
            <div className="flex-1 flex flex-col space-y-3 text-xs" id="workflow-sensor-detail-board">
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">{selectedSensor.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${selectedSensor.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {selectedSensor.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3 text-[11px] pt-1">
                  <div className="bg-slate-900 p-2 rounded-md text-center">
                    <span className="text-[9px] text-slate-500 block">PM2.5 AQI</span>
                    <strong className="text-sm text-slate-200 font-mono">{selectedSensor.pm25} ug/m³</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-md text-center">
                    <span className="text-[9px] text-slate-500 block">PM10 Level</span>
                    <strong className="text-sm text-slate-200 font-mono">{selectedSensor.pm10} ug/m³</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-md text-center">
                    <span className="text-[9px] text-slate-500 block">Core Temp</span>
                    <strong className="text-sm text-slate-200 font-mono">{selectedSensor.temperature}°C</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-md text-center">
                    <span className="text-[9px] text-slate-500 block">Core Humidity</span>
                    <strong className="text-sm text-slate-200 font-mono">{selectedSensor.humidity}%</strong>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 mt-3 flex items-center justify-between">
                  <span>Power: {selectedSensor.battery}%</span>
                  <span>Last Ping: {new Date(selectedSensor.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Description of Calibrations */}
              <div className="bg-slate-950 p-3 border border-slate-850 rounded-lg text-[11px] leading-relaxed text-slate-400">
                <strong className="text-slate-300 block mb-1">Cross-Calibration Strategy:</strong>
                If this sensor is registering suspiciously high counts while surrounding static grids show green baseline levels, click below to trigger a remote self-calibration test or flag for inspection.
              </div>

              {/* CALIBRATE BUTTON */}
              <button
                onClick={() => handleCalibrateClick(selectedSensor.id)}
                disabled={actionLoading || selectedSensor.status === "offline"}
                className="w-full bg-indigo-500 text-white hover:bg-indigo-400 py-2.5 rounded-md font-bold transition-colors flex items-center justify-center space-x-1.5 mt-auto"
                id="btn-calibrate-sensor"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Remote Telemetry Calibration Check</span>
              </button>
            </div>
          )}

          {/* ACTIVE RESOURCES TRACKER FLEET */}
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-850/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Municipal Dispatch Fleet Status</span>
            <div className="max-h-[105px] overflow-y-auto space-y-1.5 text-[10px]">
              {resources.map((res) => (
                <div key={res.id} className="flex items-center justify-between bg-slate-950 p-1.5 rounded border border-slate-900">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-emerald-400">●</span>
                    <span className="font-semibold text-slate-300">{res.name}</span>
                    <span className="text-slate-500 uppercase text-[8px]">({res.type.replace('_', ' ')})</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${res.status === 'idle' ? 'bg-slate-900 text-slate-500' : 'bg-amber-500/20 text-amber-400'}`}>
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
