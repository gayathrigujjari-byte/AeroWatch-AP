/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export type IncidentType = 'garbage_fire' | 'construction_dust' | 'industrial_emissions' | 'traffic_exhaust' | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'reported' | 'verifying' | 'verified' | 'action_dispatched' | 'cleared' | 'biogas_processed' | 'false_positive' | 'biogas_routing';

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  detectedBy: 'sensor_spike' | 'citizen_report' | 'satellite_anomaly';
  locationName: string;
  coordinates: LatLng;
  timestamp: string;
  imageUrl?: string;
  proximityToSchool: number; // in meters
  biomassWeight?: number; // Estimated biomass/waste in kg
  biogasYield?: number; // Estimated biogas production in cubic meters (m3)
  actionsHistory: {
    time: string;
    message: string;
  }[];
  assignedResourceId?: string;
}

export interface Sensor {
  id: string;
  name: string;
  type: 'static' | 'mobile_bus';
  coordinates: LatLng;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  battery: number;
  status: 'active' | 'maintenance_required' | 'offline';
  lastUpdated: string;
}

export interface ActionResource {
  id: string;
  name: string;
  type: 'water_cannon' | 'mechanical_sweeper' | 'sanitation_team' | 'fire_watch' | 'inspector';
  coordinates: LatLng;
  status: 'idle' | 'dispatched' | 'active';
  targetIncidentId?: string;
}

export interface BiogasStats {
  totalBiomassCollectedKg: number;
  totalBiogasProducedM3: number;
  carbonOffsetKg: number;
  energyGeneratedKwh: number;
}

export interface UserEcoProfile {
  name: string;
  email: string;
  points: number;
  verifiedReports: number;
  rank: 'Leaf Guardian' | 'Canopy Protector' | 'Atmospheric Champion' | 'Eco Visionary';
  biomassContributedKg: number;
}

export interface WindConfig {
  angle: number; // 0 is North, 90 East, 180 South, 270 West
  speed: number; // in km/h
}
