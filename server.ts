/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import dotenv from "dotenv";
import { Incident, Sensor, ActionResource, BiogasStats, UserEcoProfile, IncidentType, IncidentSeverity } from "./src/types";

// Load environment variables
dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google Gen AI to prevent crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Gemini API Client successfully initialized.");
      } catch (err) {
        console.error("Failed to initialize Gemini API Client:", err);
      }
    } else {
      console.warn("GEMINI_API_KEY is not configured or holds default placeholder. AI features will run in simulation mode.");
    }
  }
  return aiClient;
}

// Global In-Memory Database for AeroWatch AI State (Visakhapatnam, AP, India)
let sensors: Sensor[] = [
  {
    id: "sen_mvp_01",
    name: "MVP Colony Sector 2 Grid",
    type: "static",
    coordinates: { lat: 17.7420, lng: 83.3210 },
    pm25: 64,
    pm10: 110,
    temperature: 30.5,
    humidity: 78,
    battery: 98,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sen_gaj_02",
    name: "Gajuwaka Industrial Belt",
    type: "static",
    coordinates: { lat: 17.6920, lng: 83.2180 },
    pm25: 185,
    pm10: 290,
    temperature: 33.1,
    humidity: 61,
    battery: 89,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sen_bch_03",
    name: "Beach Road Tourist Hub",
    type: "static",
    coordinates: { lat: 17.7120, lng: 83.3150 },
    pm25: 42,
    pm10: 75,
    temperature: 29.8,
    humidity: 82,
    battery: 94,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sen_rsh_04",
    name: "Rushikonda Tech Zone",
    type: "static",
    coordinates: { lat: 17.7810, lng: 83.3550 },
    pm25: 38,
    pm10: 60,
    temperature: 29.0,
    humidity: 84,
    battery: 99,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sen_sci_05",
    name: "Scindia Shipyard Perimeter",
    type: "static",
    coordinates: { lat: 17.6750, lng: 83.2320 },
    pm25: 145,
    pm10: 220,
    temperature: 31.5,
    humidity: 70,
    battery: 91,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sen_vpt_06",
    name: "Visakhapatnam Port Trust",
    type: "static",
    coordinates: { lat: 17.6950, lng: 83.2850 },
    pm25: 154,
    pm10: 240,
    temperature: 31.0,
    humidity: 74,
    battery: 92,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sen_bus_101",
    name: "APS RTC Bus #AP-31-TA-4412",
    type: "mobile_bus",
    coordinates: { lat: 17.7200, lng: 83.3000 },
    pm25: 78,
    pm10: 130,
    temperature: 31.2,
    humidity: 76,
    battery: 100,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sen_bus_102",
    name: "APS RTC Bus #AP-31-Y-8921",
    type: "mobile_bus",
    coordinates: { lat: 17.7010, lng: 83.2600 },
    pm25: 85,
    pm10: 145,
    temperature: 30.8,
    humidity: 75,
    battery: 100,
    status: "active",
    lastUpdated: new Date().toISOString()
  }
];

let incidents: Incident[] = [
  {
    id: "inc_001",
    title: "Uncontrolled Port Excavation Dust",
    type: "construction_dust",
    severity: "medium",
    status: "action_dispatched",
    description: "Large dust clouds from coal-handling excavation work blowing across pedestrian walkways on Port Area Road. Dust water-sprinkler screens missing.",
    detectedBy: "sensor_spike",
    locationName: "VPT Dock Gate 3 Corridor",
    coordinates: { lat: 17.7020, lng: 83.2810 },
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    proximityToSchool: 450,
    actionsHistory: [
      { time: new Date(Date.now() - 45 * 60000).toISOString(), message: "System detected PM10 spike of 240 ug/m3. Cross-referenced with Port Trust sensor." },
      { time: new Date(Date.now() - 30 * 60000).toISOString(), message: "Smart routing matched incident with Construction Dust pattern. Dust suppressing dispatch authorized." },
      { time: new Date(Date.now() - 15 * 60000).toISOString(), message: "Mechanical Sweeper Resource 'Sweeper Alpha' dispatched to location." }
    ],
    assignedResourceId: "res_sweeper_01"
  },
  {
    id: "inc_002",
    title: "Illegal Coastal Waste Fire Heap",
    type: "garbage_fire",
    severity: "high",
    status: "reported",
    description: "Severe toxic garbage fire containing dry organic wastes and municipal refuse. AP Scavengers alerted to salvage biomass for anaerobic biogas digesters.",
    detectedBy: "citizen_report",
    locationName: "Gajuwaka Industrial Back Alleyway",
    coordinates: { lat: 17.6890, lng: 83.2220 },
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    proximityToSchool: 180,
    biomassWeight: 320, // 320kg
    biogasYield: 128, // 128m3
    actionsHistory: [
      { time: new Date(Date.now() - 10 * 60000).toISOString(), message: "Citizen reported toxic garbage heap smoke. Coords resolved near Scindia Road." },
      { time: new Date(Date.now() - 8 * 60000).toISOString(), message: "AeroWatch AI Engine verified: Combustion confirmed. AP Sanitation Scavengers scheduled for organic biomass harvest." }
    ]
  },
  {
    id: "inc_003",
    title: "Off-Hours Boiler Smog Release",
    type: "industrial_emissions",
    severity: "critical",
    status: "verified",
    description: "Boiler stack releasing dense sulphur smoke over Scindia Hills during off-peak hours. Exceeds standard density guidelines by 340%.",
    detectedBy: "satellite_anomaly",
    locationName: "Scindia Shipyard Perimeter Corridor",
    coordinates: { lat: 17.6710, lng: 83.2350 },
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    proximityToSchool: 820,
    actionsHistory: [
      { time: new Date(Date.now() - 120 * 60000).toISOString(), message: "Satellite Sentinel-5P NO2 plume anomaly detected over Scindia quadrant." },
      { time: new Date(Date.now() - 100 * 60000).toISOString(), message: "Stationary AQI sensor 'sen_sci_05' registered PM2.5 rise to 145 ug/m3. Correlation: 94%." },
      { time: new Date(Date.now() - 90 * 60000).toISOString(), message: "AeroWatch verified industrial emissions exceedance. Automated APPCB inspection citation generated." }
    ]
  }
];

let resources: ActionResource[] = [
  { id: "res_sweeper_01", name: "Mechanical Sweeper Alpha", type: "mechanical_sweeper", coordinates: { lat: 17.7100, lng: 83.2900 }, status: "dispatched", targetIncidentId: "inc_001" },
  { id: "res_cannon_01", name: "Mist Sprinkler Cannon Unit 1", type: "water_cannon", coordinates: { lat: 17.7300, lng: 83.3200 }, status: "idle" },
  { id: "res_cannon_02", name: "Mist Sprinkler Cannon Unit 2", type: "water_cannon", coordinates: { lat: 17.7600, lng: 83.3400 }, status: "idle" },
  { id: "res_sanitation_01", name: "AP Scavengers & Biogas Unit 1", type: "sanitation_team", coordinates: { lat: 17.6850, lng: 83.2300 }, status: "idle" },
  { id: "res_fire_01", name: "Vizag Municipal Fire Watch Unit", type: "fire_watch", coordinates: { lat: 17.6900, lng: 83.2500 }, status: "idle" },
  { id: "res_inspect_01", name: "AP Pollution Board Inspector Team", type: "inspector", coordinates: { lat: 17.7400, lng: 83.3100 }, status: "idle" }
];

let biogasStats: BiogasStats = {
  totalBiomassCollectedKg: 6850,
  totalBiogasProducedM3: 2740,
  carbonOffsetKg: 5010,
  energyGeneratedKwh: 8240
};

let ecoProfile: UserEcoProfile = {
  name: "Gayathri Gujjari",
  email: "gayathrigujjari@gmail.com",
  points: 580,
  verifiedReports: 9,
  rank: "Atmospheric Champion",
  biomassContributedKg: 460
};

// Simulation intervals for realistic IoT data fluctuation
setInterval(() => {
  sensors = sensors.map(sensor => {
    if (sensor.status === "offline") return sensor;

    // Standard hourly/minute fluctuations
    const delta = (Math.random() - 0.5) * 8;
    const pm25 = Math.max(10, Math.round(sensor.pm25 + delta));
    const pm10 = Math.max(15, Math.round(sensor.pm10 + delta * 1.5));

    // Mobile sensors (buses) simulated movement along a circuit in Visakhapatnam
    let coordinates = { ...sensor.coordinates };
    if (sensor.type === "mobile_bus") {
      coordinates.lat += (Math.random() - 0.5) * 0.002;
      coordinates.lng += (Math.random() - 0.5) * 0.002;
      // boundary check for Visakhapatnam area
      if (coordinates.lat < 17.62) coordinates.lat = 17.65;
      if (coordinates.lat > 17.82) coordinates.lat = 17.78;
      if (coordinates.lng < 83.15) coordinates.lng = 83.22;
      if (coordinates.lng > 83.38) coordinates.lng = 83.33;
    }

    // Battery slow discharge
    const battery = sensor.type === "static" ? Math.max(10, sensor.battery - (Math.random() > 0.95 ? 1 : 0)) : 100;

    return {
      ...sensor,
      pm25,
      pm10,
      coordinates,
      battery,
      lastUpdated: new Date().toISOString()
    };
  });
}, 8000);


// API Endpoints

// 1. GET: Sensors
app.get("/api/sensors", (req, res) => {
  res.json(sensors);
});

// 2. POST: Trigger Calibration/Maintenance on a Sensor
app.post("/api/sensors/:id/calibrate", (req, res) => {
  const { id } = req.params;
  const sensor = sensors.find(s => s.id === id);
  if (!sensor) {
    return res.status(404).json({ error: "Sensor not found." });
  }

  sensor.status = "active";
  sensor.pm25 = Math.round(sensor.pm25 * 0.85); // Recalibrated downward if anomalous
  sensor.pm10 = Math.round(sensor.pm10 * 0.85);
  sensor.lastUpdated = new Date().toISOString();

  res.json({
    message: `Sensor '${sensor.name}' successfully recalibrated and placed online.`,
    sensor
  });
});

// 3. GET: Incidents
app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

// 4. GET: Biogas and Carbon stats
app.get("/api/biogas", (req, res) => {
  res.json(biogasStats);
});

// 5. GET: User profile
app.get("/api/eco-profile", (req, res) => {
  res.json(ecoProfile);
});

// 6. POST: Report citizen incident (Manual simulation fallback or quick validation)
app.post("/api/incidents", (req, res) => {
  const { title, type, severity, description, locationName, coordinates, proximityToSchool, biomassWeight } = req.body;

  if (!title || !type || !severity || !description) {
    return res.status(400).json({ error: "Missing required incident fields." });
  }

  // Calculate biomass yield if not provided
  const estBiomass = biomassWeight || (type === "garbage_fire" ? 120 : 0);
  const estBiogas = Math.round(estBiomass * 0.4);

  const newIncident: Incident = {
    id: `inc_${Math.floor(100 + Math.random() * 900)}`,
    title,
    type,
    severity,
    status: "reported",
    description,
    detectedBy: "citizen_report",
    locationName: locationName || "Custom Location",
    coordinates: coordinates || { lat: 17.72 + (Math.random() - 0.5) * 0.08, lng: 83.28 + (Math.random() - 0.5) * 0.08 },
    timestamp: new Date().toISOString(),
    proximityToSchool: proximityToSchool || Math.round(150 + Math.random() * 700),
    biomassWeight: estBiomass > 0 ? estBiomass : undefined,
    biogasYield: estBiogas > 0 ? estBiogas : undefined,
    actionsHistory: [
      { time: new Date().toISOString(), message: "Citizen successfully filed environmental report." }
    ]
  };

  incidents.unshift(newIncident);

  // Award eco-points for reporting
  ecoProfile.points += 20;
  ecoProfile.verifiedReports += 1;

  res.status(201).json({
    message: "Report logged successfully.",
    incident: newIncident,
    profileUpdate: ecoProfile
  });
});

// 7. POST: Analyze Citizen Upload with Server-side Gemini API
app.post("/api/incidents/analyze", async (req, res) => {
  const { imageBase64, userDescription, locationPreset } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "No image content supplied for multi-modal analysis." });
  }

  const ai = getGeminiClient();

  // If Gemini Client is missing (key not in secrets), perform premium deterministic simulation
  if (!ai) {
    console.log("No Gemini API client initialized. Falling back to structured intelligence mock.");
    // Simulate smart detection based on userDescription clues
    const desc = (userDescription || "").toLowerCase();
    let type: IncidentType = "other";
    let title = "Urban Smoke Haze Detected";
    let severity: IncidentSeverity = "medium";
    let biomassWeight = 0;
    let locationName = locationPreset || "Visakhapatnam Beach Road Bypass";

    if (desc.includes("burn") || desc.includes("fire") || desc.includes("garbage") || desc.includes("waste")) {
      type = "garbage_fire";
      title = "Illegal Garbage Pile Combustion";
      severity = "high";
      biomassWeight = 240; // in kg
    } else if (desc.includes("dust") || desc.includes("construction") || desc.includes("cement") || desc.includes("dig")) {
      type = "construction_dust";
      title = "Unsuppressed Construction Dust Storm";
      severity = "medium";
      biomassWeight = 0;
    } else if (desc.includes("factory") || desc.includes("smoke") || desc.includes("chimney") || desc.includes("industry")) {
      type = "industrial_emissions";
      title = "Unauthorized Stack Gas Emissions";
      severity = "critical";
      biomassWeight = 0;
    } else if (desc.includes("traffic") || desc.includes("exhaust") || desc.includes("congestion") || desc.includes("vehicles")) {
      type = "traffic_exhaust";
      title = "Peak Hours Traffic Smog Spill";
      severity = "medium";
      biomassWeight = 0;
    }

    const proximityToSchool = Math.round(120 + Math.random() * 500);
    const biogasYield = Math.round(biomassWeight * 0.4);

    const simulatedAnalysis = {
      isPollution: true,
      type,
      title,
      severity,
      detectedObjects: ["haze", "particulate clouds", "source combustion cues"],
      description: `[Simulated AI Analysis] Visually identified active environmental transgression matching ${type.replace("_", " ")}. User observation: "${userDescription || 'None'}"`,
      locationSuggestion: locationName,
      biomassWeight,
      biogasYield,
      proximityToSchool,
      recommendedAction: type === "garbage_fire" 
        ? "Quench immediately with mist sprinkler and load remnant biomass to anaerobic biogas reactor." 
        : "Activate mechanical sweepers and inspect water spray shields."
    };

    return res.json({ success: true, mode: "simulation", analysis: simulatedAnalysis });
  }

  try {
    // Premium Mode: Execute real Multimodal check using gemini-3.5-flash
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
      }
    };

    const promptText = `
      You are AeroWatch AI, the core "Multi-Modal Brain" for a state-of-the-art smart-city Urban Environmental Intelligence (UEI) platform.
      Analyze this image uploaded by a citizen, alongside this user-provided text description: "${userDescription || 'No description provided'}"
      
      Determine if there is a visual sign of environmental pollution or illegal activity.
      Classify the incident type, severity level, objects detected, proximity calculations, and estimate biomass if it is a solid organic waste or garbage pile fire.

      Provide a structured JSON output with the exact schema matching this structure:
      {
        "isPollution": boolean,
        "type": "garbage_fire" | "construction_dust" | "industrial_emissions" | "traffic_exhaust" | "other",
        "title": "A short descriptive title (e.g. Illegal Landfill Waste Incineration)",
        "severity": "low" | "medium" | "high" | "critical",
        "detectedObjects": string[],
        "description": "A very precise, highly technical description of visual markers, smoke color, density, and hazards observed (e.g. PVC burning smoke, construction fine sand dust).",
        "locationSuggestion": "A localized neighborhood name or landmark (e.g. Connaught Place Circle Gate 4)",
        "biomassWeight": number, // Estimate biomass weight in kg if it contains organic waste, garbage, crop residues, or firewood being burned. Set to 0 if construction, traffic, or factory emissions. Range: 50-1000kg.
        "biogasYield": number, // Calculated biogas production in cubic meters (approx 0.4 m3 of biogas per 1 kg of municipal biomass waste). Set to 0 if not waste-burning.
        "proximityToSchool": number, // Estimate school proximity in meters, randomly assign or guess between 80 to 900 based on scene context.
        "recommendedAction": "Actionable command for city dispatchers (e.g., dispatch water cannons or sanitation team for biogas plant routing)."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "isPollution", "type", "title", "severity", "detectedObjects", 
            "description", "locationSuggestion", "biomassWeight", 
            "biogasYield", "proximityToSchool", "recommendedAction"
          ],
          properties: {
            isPollution: { type: Type.BOOLEAN },
            type: { type: Type.STRING, description: "Classification of pollution" },
            title: { type: Type.STRING },
            severity: { type: Type.STRING },
            detectedObjects: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: { type: Type.STRING },
            locationSuggestion: { type: Type.STRING },
            biomassWeight: { type: Type.NUMBER, description: "Weight of waste biomass in kg" },
            biogasYield: { type: Type.NUMBER, description: "Expected biogas in cubic meters (m3)" },
            proximityToSchool: { type: Type.NUMBER },
            recommendedAction: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const cleanJson = JSON.parse(text.trim());
    res.json({ success: true, mode: "api", analysis: cleanJson });

  } catch (error: any) {
    console.error("Gemini Multi-Modal analysis failed:", error);
    res.status(500).json({ error: "Failed to perform AI analysis. " + error.message });
  }
});

// 8. POST: Smart Workflow Action (Dispatch a Resource or Process Biogas)
app.post("/api/incidents/:id/action", (req, res) => {
  const { id } = req.params;
  const { actionType } = req.body; // 'dispatch' | 'process_biogas' | 'clear' | 'flag_false_positive'

  const incident = incidents.find(inc => inc.id === id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found." });
  }

  const timestamp = new Date().toISOString();

  if (actionType === "dispatch") {
    // Find an appropriate idle resource of corresponding type
    let resourceType: 'water_cannon' | 'mechanical_sweeper' | 'sanitation_team' | 'fire_watch' | 'inspector' = "inspector";
    if (incident.type === "construction_dust") resourceType = "mechanical_sweeper";
    else if (incident.type === "garbage_fire") resourceType = "fire_watch";
    else if (incident.type === "industrial_emissions") resourceType = "inspector";
    else if (incident.type === "traffic_exhaust") resourceType = "water_cannon";

    // Find first idle resource of this type or any idle
    let resource = resources.find(r => r.type === resourceType && r.status === "idle");
    if (!resource) {
      resource = resources.find(r => r.status === "idle");
    }

    if (resource) {
      resource.status = "dispatched";
      resource.targetIncidentId = incident.id;
      incident.assignedResourceId = resource.id;
      incident.status = "action_dispatched";
      incident.actionsHistory.push({
        time: timestamp,
        message: `Dispatched municipal asset '${resource.name}' (${resource.type.replace('_', ' ')}) to GPS coordinates: [${incident.coordinates.lat.toFixed(4)}, ${incident.coordinates.lng.toFixed(4)}].`
      });
    } else {
      incident.status = "action_dispatched";
      incident.actionsHistory.push({
        time: timestamp,
        message: `Dispatched automated municipal request. Alerted mechanical sweepers cluster nearby.`
      });
    }

    // Award Eco-Points to gayathri's active user since report escalated to municipal action
    if (incident.detectedBy === "citizen_report") {
      ecoProfile.points += 50;
    }

  } else if (actionType === "process_biogas") {
    if (incident.status !== "biogas_routing") {
      // Step 1: Dispatch sanitation scavengers
      incident.status = "biogas_routing";
      
      // Auto assign the sanitation scavenger team if available
      const scavengers = resources.find(r => r.id === "res_sanitation_01");
      if (scavengers) {
        scavengers.status = "dispatched";
        scavengers.targetIncidentId = incident.id;
        incident.assignedResourceId = scavengers.id;
      }

      incident.actionsHistory.push({
        time: timestamp,
        message: "AP Sanitation Scavengers and Biogas collection team dispatched to coordinate. Gathering organic biomass refuse and preparing safe container loading."
      });
    } else {
      // Step 2: Biomass arrived at plant, successfully processed to biogas
      if (incident.biomassWeight) {
        const addedBiomass = incident.biomassWeight;
        const addedBiogas = incident.biogasYield || Math.round(addedBiomass * 0.4);
        
        biogasStats.totalBiomassCollectedKg += addedBiomass;
        biogasStats.totalBiogasProducedM3 += addedBiogas;
        biogasStats.carbonOffsetKg += Math.round(addedBiomass * 0.73);
        biogasStats.energyGeneratedKwh += Math.round(addedBiogas * 3.01);

        if (incident.detectedBy === "citizen_report") {
          ecoProfile.biomassContributedKg += addedBiomass;
          ecoProfile.points += Math.round(addedBiomass * 0.5) + 120; // reward high points
        }
      }

      incident.status = "biogas_processed";
      incident.actionsHistory.push({
        time: timestamp,
        message: "Biomass shipment successfully arrived at Vizag Anaerobic Bio-digester Plant. 100% of organic refuse digested to clean methane fuel for cooking grids. Dispatch units cleared."
      });

      // Reset assigned resources to idle
      if (incident.assignedResourceId) {
        const resObj = resources.find(r => r.id === incident.assignedResourceId);
        if (resObj) {
          resObj.status = "idle";
          resObj.targetIncidentId = undefined;
        }
      }
    }

  } else if (actionType === "clear") {
    incident.status = "cleared";
    incident.actionsHistory.push({
      time: timestamp,
      message: `Incident verified clear. Atmosphere levels back within target thresholds. Incident archived.`
    });

    // Reset resource to idle if assigned
    if (incident.assignedResourceId) {
      const resObj = resources.find(r => r.id === incident.assignedResourceId);
      if (resObj) {
        resObj.status = "idle";
        resObj.targetIncidentId = undefined;
      }
    }

  } else if (actionType === "flag_false_positive") {
    incident.status = "false_positive";
    incident.actionsHistory.push({
      time: timestamp,
      message: `Checked nearby cameras and cross-calibrated. High temperature cue identified as laundry steam vent. Filtered as false positive.`
    });
  }

  res.json({
    message: `Workflow state updated for incident ${id}`,
    incident,
    biogasStats,
    ecoProfile,
    resources
  });
});

// Start server using Vite middleware in dev and static express route in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AeroWatch AI Server] Live on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
