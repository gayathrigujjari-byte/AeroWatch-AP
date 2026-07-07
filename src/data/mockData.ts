/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncidentType, IncidentSeverity } from "../types";

export interface PollutionPreset {
  id: string;
  name: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  locationName: string;
  proximityToSchool: number;
  biomassWeight: number; // in kg
  biogasYield: number; // in m3
  imageUrl: string; // Base64 or standard asset url
  promptHint: string;
}

export const POLLUTION_PRESETS: PollutionPreset[] = [
  {
    id: "preset_garbage",
    name: "Illegal Waste Combustion",
    type: "garbage_fire",
    severity: "high",
    description: "Illegal landfill combustion involving organic refuse, plastics, and dry vegetation. Thick grey-blue fumes dispersing over residential zone. AP Scavengers stand by to salvage biomass for anaerobic biogas digesters.",
    locationName: "Gajuwaka Back Alleyway near Highway",
    proximityToSchool: 150,
    biomassWeight: 320, // 320kg garbage
    biogasYield: 128, // 128 m3 biogas potential
    promptHint: "waste burning fire, thick toxic grey smoke, residential area",
    imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCcaidAAAALVBMVEUAAAD/7s3/7s3/7s3/7s3/7s3/7s3/7s3/7s3/7s3/7s3/7s3/7s3/7s3/7s3///9zJtNFAAAADnRSTlMAERITFBUWFxgZGhscHR7u2s0AAAAnSURBVFhH7cEBAQAAAIIg/69uSE8gAAAAAAAAAAAAAAAAAAAAAKALbLgAAf512pAAAAAElFTkSuQmCC" // mini dark base64 png
  },
  {
    id: "preset_dust",
    name: "Unsprinkled Excavation Dust",
    type: "construction_dust",
    severity: "medium",
    description: "Major flyover construction digging without dust barricades or water spray cannons. Heavy brown particulate matter billowing onto main bypass road.",
    locationName: "Visakhapatnam Port Road Outer Ring Sector 3",
    proximityToSchool: 480,
    biomassWeight: 0,
    biogasYield: 0,
    promptHint: "construction site, excavator digging, huge brown dust clouds, road",
    imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCcaidAAAALVBMVEUAAABgYGD/zMz/zMz/zMz/zMz/zMz/zMz/zMz/zMz/zMz/zMz/zMz/zMz/zMz////ZofvDAAAADnRSTlMAERITFBUWFxgZGhscHR7u2s0AAAAnSURBVFhH7cEBAQAAAIIg/69uSE8gAAAAAAAAAAAAAAAAAAAAAKALbLgAAf512pAAAAAElFTkSuQmCC" // mini sandy base64 png
  },
  {
    id: "preset_industrial",
    name: "Off-Hours Stack Emissions",
    type: "industrial_emissions",
    severity: "critical",
    description: "Boiler stack venting dense yellow-black sulfurous plume in violation of curfew. Local sensor 'sen_sci_05' spiking to 145 ug/m3 PM2.5.",
    locationName: "Scindia Shipyard Perimeter Corridor",
    proximityToSchool: 790,
    biomassWeight: 0,
    biogasYield: 0,
    promptHint: "industrial smokestack, chemical boiler, thick yellow black smoke plume, night sky",
    imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCcaidAAAALVBMVEUAAABISEj/7sz/7sz/7sz/7sz/7sz/7sz/7sz/7sz/7sz/7sz/7sz/7sz/7sz////WffT8AAAADnRSTlMAERITFBUWFxgZGhscHR7u2s0AAAAnSURBVFhH7cEBAQAAAIIg/69uSE8gAAAAAAAAAAAAAAAAAAAAAKALbLgAAf512pAAAAAElFTkSuQmCC" // mini industrial base64 png
  },
  {
    id: "preset_traffic",
    name: "Peak Hour Congestion Smog",
    type: "traffic_exhaust",
    severity: "medium",
    description: "Severe traffic backup at gridlocked highway junction. Tailpipe emissions creating stagnant ground-level particulate smog, lowering visibility.",
    locationName: "MVP Colony Beach Road Crossing",
    proximityToSchool: 320,
    biomassWeight: 0,
    biogasYield: 0,
    promptHint: "gridlock traffic jam, cars and public buses, gray exhaust fumes, urban smog",
    imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCcaidAAAALVBMVEUAAABERET/99b/99b/99b/99b/99b/99b/99b/99b/99b/99b/99b/99b/99b////m+2o7AAAADnRSTlMAERITFBUWFxgZGhscHR7u2s0AAAAnSURBVFhH7cEBAQAAAIIg/69uSE8gAAAAAAAAAAAAAAAAAAAAAKALbLgAAf512pAAAAAElFTkSuQmCC" // mini smog base64 png
  }
];

export interface HealthAdvice {
  id: string;
  range: string;
  status: string;
  color: string;
  advice: string[];
}

export const HEALTH_ADVISORY_LIST: HealthAdvice[] = [
  {
    id: "good",
    range: "0 - 50",
    status: "Good",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    advice: [
      "Air quality is ideal for outdoor activities.",
      "Completely safe for children and senior citizens.",
      "Open windows to ventilate homes with fresh outdoor atmosphere."
    ]
  },
  {
    id: "moderate",
    range: "51 - 100",
    status: "Moderate",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    advice: [
      "Extremely sensitive individuals should consider reducing heavy outdoor exertion.",
      "Keep standard air purifiers on low setting if respiratory irritation begins.",
      "Safe to commute, but check hyper-local alerts for any localized plumes."
    ]
  },
  {
    id: "poor",
    range: "101 - 200",
    status: "Poor",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    advice: [
      "Sensitive groups (asthma, children, elderly) should restrict outdoor exposure.",
      "Close windows facing main streets during high traffic/construction rush hours.",
      "Wear N95 protective masks when walking near construction excavation sites."
    ]
  },
  {
    id: "severe",
    range: "201 - 300",
    status: "Severe",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    advice: [
      "Avoid prolonged outdoor activity. Exercise indoors where possible.",
      "Keep windows and doors tightly shut to prevent particulate matter ingress.",
      "Ensure school air purification clusters are operating at maximum capacity."
    ]
  },
  {
    id: "critical",
    range: "300+",
    status: "Hazardous / Critical",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    advice: [
      "Extreme atmospheric hazard. Avoid all outdoor physical activity.",
      "Mandatory mask-wearing for emergency services and municipal team workers.",
      "Activate continuous indoor air scrubbers and close all fresh-air dampers."
    ]
  }
];
