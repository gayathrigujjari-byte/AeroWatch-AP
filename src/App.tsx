/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Sensor, Incident, ActionResource, BiogasStats, UserEcoProfile, LatLng, WindConfig } from "./types";
import MapContainer from "./components/MapContainer";
import CitizenPortal from "./components/CitizenPortal";
import CommandCenter from "./components/CommandCenter";
import AnalyticsPanel from "./components/AnalyticsPanel";
import { 
  ShieldAlert, Activity, Award, User, RefreshCw, BarChart2, 
  MapPin, Wind, Sparkles, AlertTriangle, Eye, Info 
} from "lucide-react";

export default function App() {
  // Global App View Mode
  const [tabMode, setTabMode] = useState<"command" | "citizen" | "analytics">("command");

  // Wind state for predictive plume dispersion model
  const [wind, setWind] = useState<WindConfig>({ angle: 120, speed: 12 });

  // Map Targets Selection
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  // Map click coords for citizen report placement
  const [clickedCoordinates, setClickedCoordinates] = useState<LatLng | null>(null);
  const [clickedAddress, setClickedAddress] = useState("MVP Colony Beach Road, Visakhapatnam");

  // In-Memory Synchronized States (Init with empty, loaded via API on mount)
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<ActionResource[]>([]);
  const [biogasStats, setBiogasStats] = useState<BiogasStats>({
    totalBiomassCollectedKg: 6850,
    totalBiogasProducedM3: 2740,
    carbonOffsetKg: 5010,
    energyGeneratedKwh: 8240
  });
  const [ecoProfile, setEcoProfile] = useState<UserEcoProfile>({
    name: "Gayathri Gujjari",
    email: "gayathrigujjari@gmail.com",
    points: 580,
    verifiedReports: 9,
    rank: "Atmospheric Champion",
    biomassContributedKg: 460
  });

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Active ticking clock for Professional Polish Design
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setDate(now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial Fetch & Periodic Polling
  const fetchData = async (isPoll = false) => {
    try {
      if (!isPoll) setIsLoading(true);

      const [resSensors, resIncidents, resBiogas, resProfile] = await Promise.all([
        fetch("/api/sensors").then(r => r.json()),
        fetch("/api/incidents").then(r => r.json()),
        fetch("/api/biogas").then(r => r.json()),
        fetch("/api/eco-profile").then(r => r.json())
      ]);

      setSensors(resSensors);
      setIncidents(resIncidents);
      setBiogasStats(resBiogas);
      setEcoProfile(resProfile);

      // Extract resources from local simulation state or define default layout if not in response
      // To keep simple, we sync resources from incidents as well
      const updatedResources: ActionResource[] = [
        { id: "res_sweeper_01", name: "Mechanical Sweeper Alpha", type: "mechanical_sweeper", coordinates: { lat: 17.7100, lng: 83.2900 }, status: "idle" },
        { id: "res_cannon_01", name: "Mist Sprinkler Cannon Unit 1", type: "water_cannon", coordinates: { lat: 17.7300, lng: 83.3200 }, status: "idle" },
        { id: "res_cannon_02", name: "Mist Sprinkler Cannon Unit 2", type: "water_cannon", coordinates: { lat: 17.7600, lng: 83.3400 }, status: "idle" },
        { id: "res_sanitation_01", name: "AP Scavengers & Biogas Unit 1", type: "sanitation_team", coordinates: { lat: 17.6850, lng: 83.2300 }, status: "idle" },
        { id: "res_fire_01", name: "Vizag Municipal Fire Watch Unit", type: "fire_watch", coordinates: { lat: 17.6900, lng: 83.2500 }, status: "idle" },
        { id: "res_inspect_01", name: "AP Pollution Board Inspector Team", type: "inspector", coordinates: { lat: 17.7400, lng: 83.3100 }, status: "idle" }
      ];

      // Update state resource assignment from active incidents
      resIncidents.forEach((inc: Incident) => {
        if (inc.assignedResourceId) {
          const matchingRes = updatedResources.find(r => r.id === inc.assignedResourceId);
          if (matchingRes) {
            matchingRes.status = "dispatched" as const;
            matchingRes.targetIncidentId = inc.id;
          }
        }
      });

      setResources(updatedResources);
      setFetchError("");
    } catch (err: any) {
      console.warn("Express backend API offline or starting. Booting client-side local emulator.", err);
      // Run in simulation backup mode if Express is compiling
      initializeFallbackData();
    } finally {
      if (!isPoll) setIsLoading(false);
    }
  };

  // Fallback data initialization when running client-only fallback
  const initializeFallbackData = () => {
    // Generate a set of static sensor configurations
    setSensors([
      { id: "sen_mvp_01", name: "MVP Colony Sector 2 Grid", type: "static", coordinates: { lat: 17.7420, lng: 83.3210 }, pm25: 64, pm10: 110, temperature: 30.5, humidity: 78, battery: 98, status: "active", lastUpdated: new Date().toISOString() },
      { id: "sen_gaj_02", name: "Gajuwaka Industrial Belt", type: "static", coordinates: { lat: 17.6920, lng: 83.2180 }, pm25: 185, pm10: 290, temperature: 33.1, humidity: 61, battery: 89, status: "active", lastUpdated: new Date().toISOString() },
      { id: "sen_bch_03", name: "Beach Road Tourist Hub", type: "static", coordinates: { lat: 17.7120, lng: 83.3150 }, pm25: 42, pm10: 75, temperature: 29.8, humidity: 82, battery: 94, status: "active", lastUpdated: new Date().toISOString() },
      { id: "sen_rsh_04", name: "Rushikonda Tech Zone", type: "static", coordinates: { lat: 17.7810, lng: 83.3550 }, pm25: 38, pm10: 60, temperature: 29.0, humidity: 84, battery: 99, status: "active", lastUpdated: new Date().toISOString() },
      { id: "sen_sci_05", name: "Scindia Shipyard Perimeter", type: "static", coordinates: { lat: 17.6750, lng: 83.2320 }, pm25: 145, pm10: 220, temperature: 31.5, humidity: 70, battery: 91, status: "active", lastUpdated: new Date().toISOString() },
      { id: "sen_vpt_06", name: "Visakhapatnam Port Trust", type: "static", coordinates: { lat: 17.6950, lng: 83.2850 }, pm25: 154, pm10: 240, temperature: 31.0, humidity: 74, battery: 92, status: "active", lastUpdated: new Date().toISOString() },
      { id: "sen_bus_101", name: "APS RTC Bus #AP-31-TA-4412", type: "mobile_bus", coordinates: { lat: 17.7200, lng: 83.3000 }, pm25: 78, pm10: 130, temperature: 31.2, humidity: 76, battery: 100, status: "active", lastUpdated: new Date().toISOString() }
    ]);

    setIncidents([
      {
        id: "inc_001",
        title: "Uncontrolled Port Excavation Dust",
        type: "construction_dust",
        severity: "medium",
        status: "action_dispatched",
        description: "Large dust clouds from coal-handling excavation work blowing across pedestrian walkways on Port Area Road.",
        detectedBy: "sensor_spike",
        locationName: "VPT Dock Gate 3 Corridor",
        coordinates: { lat: 17.7020, lng: 83.2810 },
        timestamp: new Date().toISOString(),
        proximityToSchool: 450,
        actionsHistory: [
          { time: new Date().toISOString(), message: "System detected PM10 spike of 240 ug/m3. Authorized Dispatch." }
        ],
        assignedResourceId: "res_sweeper_01"
      },
      {
        id: "inc_002",
        title: "Illegal Coastal Waste Fire Heap",
        type: "garbage_fire",
        severity: "high",
        status: "reported",
        description: "Severe toxic garbage fire containing dry organic wastes and municipal refuse. AP Scavengers alerted to salvage biomass.",
        detectedBy: "citizen_report",
        locationName: "Gajuwaka Industrial Back Alleyway",
        coordinates: { lat: 17.6890, lng: 83.2220 },
        timestamp: new Date().toISOString(),
        proximityToSchool: 180,
        biomassWeight: 320,
        biogasYield: 128,
        actionsHistory: [
          { time: new Date().toISOString(), message: "Citizen reported toxic garbage heap smoke. Awaiting dispatcher validation." }
        ]
      }
    ]);

    setResources([
      { id: "res_sweeper_01", name: "Mechanical Sweeper Alpha", type: "mechanical_sweeper", coordinates: { lat: 17.7100, lng: 83.2900 }, status: "dispatched", targetIncidentId: "inc_001" },
      { id: "res_cannon_01", name: "Mist Sprinkler Cannon Unit 1", type: "water_cannon", coordinates: { lat: 17.7300, lng: 83.3200 }, status: "idle" },
      { id: "res_sanitation_01", name: "AP Scavengers & Biogas Unit 1", type: "sanitation_team", coordinates: { lat: 17.6850, lng: 83.2300 }, status: "idle" },
      { id: "res_fire_01", name: "Vizag Municipal Fire Watch Unit", type: "fire_watch", coordinates: { lat: 17.6900, lng: 83.2500 }, status: "idle" }
    ]);
  };

  useEffect(() => {
    fetchData();

    // Set up rapid real-time telemetry polling interval for sensors
    const timer = setInterval(() => {
      fetchData(true);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Map Click handler to drop a report coordinate tag
  const handleMapClickCoordinates = (coords: LatLng, address: string) => {
    setClickedCoordinates(coords);
    setClickedAddress(address);
    // Auto toggle to citizen tab so they can submit "Snap & Report" immediately at that clicked coordinate
    setTabMode("citizen");
  };

  // Dispatch / Process / Action handler
  const handleTriggerIncidentAction = async (id: string, actionType: 'dispatch' | 'process_biogas' | 'clear' | 'flag_false_positive') => {
    try {
      const response = await fetch(`/api/incidents/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType })
      });

      if (!response.ok) {
        throw new Error("Failed to post smart workflow action.");
      }

      const data = await response.json();
      
      // Update local states
      setIncidents(prev => prev.map(inc => inc.id === id ? data.incident : inc));
      setBiogasStats(data.biogasStats);
      setEcoProfile(data.ecoProfile);
      
      // Sync selectedIncident details panel in sidebar
      if (selectedIncident?.id === id) {
        setSelectedIncident(data.incident);
      }
    } catch (err: any) {
      console.warn("API Error. Simulating workflow dispatch action client-side...", err);
      // Client-side simulation fallback
      setIncidents(prev => prev.map(inc => {
        if (inc.id !== id) return inc;
        const timestamp = new Date().toISOString();
        let status = inc.status;
        let actionsHistory = [...inc.actionsHistory];

        if (actionType === "dispatch") {
          status = "action_dispatched";
          actionsHistory.push({ time: timestamp, message: "Asset dispatched to location coordinates. Action status active." });
        } else if (actionType === "process_biogas") {
          if (inc.status !== "biogas_routing") {
            status = "biogas_routing";
            actionsHistory.push({
              time: timestamp,
              message: "AP Sanitation Scavengers and Biogas collection team dispatched to coordinate. Gathering organic biomass refuse and preparing safe container loading."
            });
          } else {
            status = "biogas_processed";
            actionsHistory.push({
              time: timestamp,
              message: "Biomass shipment successfully arrived at Vizag Anaerobic Bio-digester Plant. 100% of organic refuse digested to clean methane fuel. Dispatch units cleared."
            });
            // Increment fallback stats
            if (inc.biomassWeight) {
              setBiogasStats(b => ({
                ...b,
                totalBiomassCollectedKg: b.totalBiomassCollectedKg + inc.biomassWeight!,
                totalBiogasProducedM3: b.totalBiogasProducedM3 + (inc.biogasYield || Math.round(inc.biomassWeight! * 0.4)),
                carbonOffsetKg: b.carbonOffsetKg + Math.round(inc.biomassWeight! * 0.73),
                energyGeneratedKwh: b.energyGeneratedKwh + Math.round((inc.biogasYield || Math.round(inc.biomassWeight! * 0.4)) * 3.01)
              }));
              if (inc.detectedBy === "citizen_report") {
                setEcoProfile(p => ({
                  ...p,
                  biomassContributedKg: p.biomassContributedKg + inc.biomassWeight!,
                  points: p.points + Math.round(inc.biomassWeight! * 0.5) + 120
                }));
              }
            }
          }
        } else if (actionType === "clear") {
          status = "cleared";
          actionsHistory.push({ time: timestamp, message: "Incident resolved and archived." });
        } else if (actionType === "flag_false_positive") {
          status = "false_positive";
          actionsHistory.push({ time: timestamp, message: "Flagged as false positive." });
        }

        const updatedInc = { ...inc, status, actionsHistory };
        if (selectedIncident?.id === id) setSelectedIncident(updatedInc);
        return updatedInc;
      }));
    }
  };

  // Remote Telemetry calibration check
  const handleCalibrateSensor = async (id: string) => {
    try {
      const response = await fetch(`/api/sensors/${id}/calibrate`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Failed to trigger remote telemetry calibration.");
      }

      const data = await response.json();
      setSensors(prev => prev.map(s => s.id === id ? data.sensor : s));
      if (selectedSensor?.id === id) {
        setSelectedSensor(data.sensor);
      }
      console.log(data.message);
    } catch (err: any) {
      console.warn("API Error. Simulating calibration check client-side...", err);
      // Client-side simulation fallback
      setSensors(prev => prev.map(s => {
        if (s.id !== id) return s;
        const updatedS = { ...s, status: "active" as const, pm25: Math.round(s.pm25 * 0.85), pm10: Math.round(s.pm10 * 0.85), lastUpdated: new Date().toISOString() };
        if (selectedSensor?.id === id) setSelectedSensor(updatedS);
        return updatedS;
      }));
      console.log("Sensor telemetry recalibration sequence complete. Ground baseline re-established.");
    }
  };

  // Add newly reported citizen incident
  const handleNewIncidentReported = (newIncident: Incident) => {
    setIncidents(prev => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    setSelectedSensor(null);
    setTabMode("command"); // Switch to command view so dispatcher can dispatch resources
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white" id="aerowatch-app-root">
      
      {/* Premium Atmospheric Navigation Header - Professional Polish Theme */}
      <header className="h-20 md:h-16 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row items-center justify-between px-6 shrink-0 gap-3 sticky top-0 z-30 backdrop-blur-md" id="app-header-navigation">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AEROWATCH <span className="text-emerald-400">AP</span></span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-850 ml-2"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs ml-2">
            <span className="text-slate-400 font-medium uppercase tracking-widest text-[9px]">Active Region:</span>
            <select className="bg-transparent text-slate-200 font-bold outline-none border border-transparent hover:border-slate-800 focus:border-slate-700 px-1 py-0.5 rounded cursor-pointer text-[11px]">
              <option className="bg-slate-950 text-slate-300">Visakhapatnam - MVP Colony & Port</option>
              <option className="bg-slate-950 text-slate-300">Vijayawada - MG Road Hub</option>
              <option className="bg-slate-950 text-slate-300">Guntur - Industrial Zone B</option>
              <option className="bg-slate-950 text-slate-300">Tirupati - Foothills District</option>
              <option className="bg-slate-950 text-slate-300">Nellore - Coastal Perimeter</option>
              <option className="bg-slate-950 text-slate-300">Kurnool - Rayalaseema Sector</option>
            </select>
          </div>
        </div>

        {/* View Mode Tabs - Custom High Tech Overlays */}
        <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-850/80 shadow-inner" id="tabs-navigation-panel">
          <button
            onClick={() => setTabMode("command")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${tabMode === "command" ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
            id="tab-btn-command"
          >
            Command Center
          </button>
          <button
            onClick={() => setTabMode("citizen")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${tabMode === "citizen" ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
            id="tab-btn-citizen"
          >
            Citizen App
          </button>
          <button
            onClick={() => setTabMode("analytics")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${tabMode === "analytics" ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
            id="tab-btn-analytics"
          >
            Analytics & Policy
          </button>
        </div>

        {/* Active System Health overlay and clock */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-850">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">System Health</span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold font-bold">Optimized</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-bold text-slate-100 font-mono tracking-wider">{time || "14:22:10"}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest">{date || "24 Oct 2023"}</div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6" id="dashboard-grid-layout">
        
        {/* LEFT COLUMN: Map Area - takes 7 columns on high-res monitors */}
        <div className="xl:col-span-7 h-full min-h-[500px] flex flex-col" id="map-section-grid">
          <MapContainer
            sensors={sensors}
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
            selectedSensor={selectedSensor}
            onSelectSensor={setSelectedSensor}
            wind={wind}
            setWind={setWind}
            onMapClickCoordinates={handleMapClickCoordinates}
          />
        </div>

        {/* RIGHT COLUMN: Interactive Control Panels - takes 5 columns */}
        <div className="xl:col-span-5 flex flex-col" id="sidebar-section-grid">
          {tabMode === "command" && (
            <CommandCenter
              sensors={sensors}
              incidents={incidents}
              resources={resources}
              biogasStats={biogasStats}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              selectedSensor={selectedSensor}
              onSelectSensor={setSelectedSensor}
              onTriggerIncidentAction={handleTriggerIncidentAction}
              onCalibrateSensor={handleCalibrateSensor}
            />
          )}

          {tabMode === "citizen" && (
            <CitizenPortal
              ecoProfile={ecoProfile}
              setEcoProfile={setEcoProfile}
              onNewIncidentReported={handleNewIncidentReported}
              clickedCoordinates={clickedCoordinates}
              clickedAddress={clickedAddress}
              setClickedCoordinates={setClickedCoordinates}
              setTabMode={setTabMode}
            />
          )}

          {tabMode === "analytics" && (
            <AnalyticsPanel
              biogasStats={biogasStats}
            />
          )}
        </div>

      </main>

      {/* Dynamic atmospheric footer */}
      <footer className="bg-slate-900/40 border-t border-slate-850 py-5 px-6 mt-12 text-center text-xs text-slate-500" id="platform-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <span>AeroWatch AP — Environmental Intelligence & Biogas Dispatch Platform</span>
          <div className="flex items-center space-x-1">
            <span>© 2026 AeroWatch AP. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
