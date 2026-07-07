/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Sensor, Incident, LatLng, WindConfig } from "../types";
import { 
  Wind, MapPin, Layers, Crosshair, HelpCircle, AlertTriangle, 
  Eye, RefreshCw, Compass, ShieldAlert, Zap
} from "lucide-react";

interface MapContainerProps {
  sensors: Sensor[];
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  selectedSensor: Sensor | null;
  onSelectSensor: (sensor: Sensor | null) => void;
  wind: WindConfig;
  setWind: (wind: WindConfig) => void;
  onMapClickCoordinates?: (coords: LatLng, address: string) => void;
}

export default function MapContainer({
  sensors,
  incidents,
  selectedIncident,
  onSelectIncident,
  selectedSensor,
  onSelectSensor,
  wind,
  setWind,
  onMapClickCoordinates
}: MapContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [showPlumePrediction, setShowPlumePrediction] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showRiverGrid, setShowRiverGrid] = useState(true);
  const [plumeFrame, setPlumeFrame] = useState(0);

  // Visakhapatnam coordinate bounds (Andhra Pradesh, India)
  const latMin = 17.62;
  const latMax = 17.82;
  const lngMin = 83.15;
  const lngMax = 83.38;

  // Project Lat/Lng to Canvas pixels
  const getXY = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * dimensions.width;
    const y = dimensions.height - ((lat - latMin) / (latMax - latMin)) * dimensions.height;
    return { x, y };
  };

  // Unproject Canvas pixels to Lat/Lng
  const getLatLng = (x: number, y: number) => {
    const lng = lngMin + (x / dimensions.width) * (lngMax - lngMin);
    const lat = latMin + ((dimensions.height - y) / dimensions.height) * (latMax - latMin);
    return { lat, lng };
  };

  // Handle ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ 
          width: Math.max(width, 300), 
          height: Math.max(height || 450, 350) 
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Frame animation for wind plumes
  useEffect(() => {
    let id = requestAnimationFrame(function animate() {
      setPlumeFrame(prev => (prev + 0.15) % 100);
      id = requestAnimationFrame(animate);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Draw the Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;

    // Clear background - high tech deep dark slate theme
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Bay of Bengal Coastline (Scenic blue ocean background element)
    if (showRiverGrid) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(14, 116, 144, 0.12)"; // Ocean blue backdrop
      
      // Southwest to Northeast coastline coordinate path
      const coastPoints = [
        { lat: 17.62, lng: 83.21 },
        { lat: 17.65, lng: 83.25 },
        { lat: 17.68, lng: 83.28 },
        { lat: 17.72, lng: 83.31 },
        { lat: 17.76, lng: 83.35 },
        { lat: 17.82, lng: 83.38 }
      ];

      // Build filled polygon for the ocean in Southeast half of viewport
      const pt0 = getXY(coastPoints[0].lat, coastPoints[0].lng);
      ctx.moveTo(pt0.x, pt0.y);
      for (let i = 1; i < coastPoints.length; i++) {
        const pt = getXY(coastPoints[i].lat, coastPoints[i].lng);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.lineTo(width, 0); // Northeast top-right edge
      ctx.lineTo(width, height); // Southeast bottom-right edge
      ctx.closePath();
      ctx.fill();

      // Coastline stroke
      ctx.beginPath();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(pt0.x, pt0.y);
      for (let i = 1; i < coastPoints.length; i++) {
        const pt = getXY(coastPoints[i].lat, coastPoints[i].lng);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Beach Road (Running parallel to coastline)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
      ctx.lineWidth = 2.5;
      const b0 = getXY(17.62, 83.19);
      const b1 = getXY(17.65, 83.23);
      const b2 = getXY(17.68, 83.26);
      const b3 = getXY(17.72, 83.29);
      const b4 = getXY(17.76, 83.33);
      const b5 = getXY(17.82, 83.36);
      ctx.moveTo(b0.x, b0.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(b3.x, b3.y);
      ctx.lineTo(b4.x, b4.y);
      ctx.lineTo(b5.x, b5.y);
      ctx.stroke();

      // Draw NH16 Highway (Inland transport corridor)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.16)";
      ctx.lineWidth = 4;
      const p1 = getXY(17.62, 83.15);
      const p2 = getXY(17.70, 83.20);
      const p3 = getXY(17.82, 83.28);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
    }

    // RENDER INCIDENTS & PLUMES
    incidents.forEach((inc) => {
      if (inc.status === "false_positive" || inc.status === "cleared") return;

      const { x, y } = getXY(inc.coordinates.lat, inc.coordinates.lng);
      const isSelected = selectedIncident?.id === inc.id;

      // Draw predictive dispersion plume plume using current wind speed and wind angle
      if (showPlumePrediction) {
        // Wind Angle in radians. wind.angle: 0 is North (upwards), 90 East (right), etc.
        // We subtract 90 degrees to align with standard unit circle
        const angleRad = (wind.angle - 90) * (Math.PI / 180);
        
        // Calculate plume parameters based on severity & wind speed
        let plumeLength = 40 + wind.speed * 2.2;
        let plumeSpread = 0.35 + (30 - wind.speed) * 0.005; // slower wind = spreads wider; faster = narrower stream
        let opacity = 0.18;

        if (inc.severity === "high") {
          plumeLength *= 1.4;
          opacity = 0.23;
        } else if (inc.severity === "critical") {
          plumeLength *= 2.0;
          opacity = 0.28;
        } else if (inc.severity === "low") {
          plumeLength *= 0.7;
          opacity = 0.12;
        }

        // Color based on incident type
        let plumeColor = "251, 146, 60"; // construction dust (orange/brown)
        if (inc.type === "garbage_fire") plumeColor = "244, 63, 94"; // toxic smoke (red/pink)
        if (inc.type === "industrial_emissions") plumeColor = "192, 132, 252"; // industrial chemical (purple)
        if (inc.type === "traffic_exhaust") plumeColor = "148, 163, 184"; // gray smog (gray)

        // Draw multiple layered overlapping smoke waves for a fluid animated look
        for (let step = 0; step < 3; step++) {
          const frameOffset = (plumeFrame + step * 33) % 100;
          const currentLength = plumeLength * (0.3 + 0.7 * (frameOffset / 100));
          const currentWidth = currentLength * Math.tan(plumeSpread);
          const endX = x + Math.cos(angleRad) * currentLength;
          const endY = y + Math.sin(angleRad) * currentLength;

          // Perpendicular vectors to draw the cone width
          const perpAngle = angleRad + Math.PI / 2;
          const leftX = endX + Math.cos(perpAngle) * currentWidth;
          const leftY = endY + Math.sin(perpAngle) * currentWidth;
          const rightX = endX - Math.cos(perpAngle) * currentWidth;
          const rightY = endY - Math.sin(perpAngle) * currentWidth;

          // Draw cone gradient
          const grad = ctx.createRadialGradient(x, y, 4, endX, endY, currentWidth * 1.5);
          const stepOpacity = opacity * (1 - frameOffset / 100);
          grad.addColorStop(0, `rgba(${plumeColor}, ${stepOpacity * 1.5})`);
          grad.addColorStop(0.5, `rgba(${plumeColor}, ${stepOpacity * 0.4})`);
          grad.addColorStop(1, `rgba(${plumeColor}, 0)`);

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(leftX, leftY);
          ctx.lineTo(rightX, rightY);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Pulse warning perimeter for school locations inside dispersion cone
        if (inc.proximityToSchool < 300) {
          ctx.beginPath();
          ctx.arc(x, y, 45, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(239, 68, 68, 0.2)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]); // clear dash
        }
      }

      // Draw Incident Pin
      let pinColor = "#f97316"; // orange
      if (inc.severity === "high") pinColor = "#ef4444"; // red
      if (inc.severity === "critical") pinColor = "#a855f7"; // purple

      // Highlight rings
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, 16 + Math.sin(plumeFrame * 0.1) * 3, 0, 2 * Math.PI);
        ctx.strokeStyle = pinColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Small pulsing outer ring for unaddressed critical reports
      if (inc.status === "reported") {
        ctx.beginPath();
        ctx.arc(x, y, 12 + Math.sin(plumeFrame * 0.08) * 4, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw solid marker
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = pinColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pin Type Letter/Icon inside
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const char = inc.type === "garbage_fire" ? "F" : inc.type === "construction_dust" ? "D" : inc.type === "industrial_emissions" ? "I" : "T";
      ctx.fillText(char, x, y);

      // Label
      if (isSelected || isHovered === inc.id) {
        ctx.font = "500 11px Inter, sans-serif";
        const labelText = inc.title;
        const textWidth = ctx.measureText(labelText).width;
        
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(x - textWidth / 2 - 6, y - 28, textWidth + 12, 18);
        ctx.strokeStyle = pinColor;
        ctx.strokeRect(x - textWidth / 2 - 6, y - 28, textWidth + 12, 18);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(labelText, x, y - 19);
      }
    });

    // RENDER SENSORS
    if (showSensors) {
      sensors.forEach((sensor) => {
        const { x, y } = getXY(sensor.coordinates.lat, sensor.coordinates.lng);
        const isSelected = selectedSensor?.id === sensor.id;

        // Choose color based on AQI (PM2.5 value)
        let color = "#10b981"; // safe green (0-50)
        let pulseGlow = "rgba(16, 185, 129, 0.15)";
        if (sensor.pm25 > 50 && sensor.pm25 <= 100) {
          color = "#eab308"; // moderate amber
          pulseGlow = "rgba(234, 179, 8, 0.15)";
        } else if (sensor.pm25 > 100 && sensor.pm25 <= 200) {
          color = "#f97316"; // poor orange
          pulseGlow = "rgba(249, 115, 22, 0.15)";
        } else if (sensor.pm25 > 200) {
          color = "#ef4444"; // severe red
          pulseGlow = "rgba(239, 68, 68, 0.25)";
        }
        if (sensor.status !== "active") {
          color = "#94a3b8"; // offline slate
          pulseGlow = "transparent";
        }

        // Pulse glow
        ctx.beginPath();
        ctx.arc(x, y, 10 + Math.sin(plumeFrame * 0.08) * 3, 0, 2 * Math.PI);
        ctx.fillStyle = pulseGlow;
        ctx.fill();

        // Selected indicator ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, 2 * Math.PI);
          ctx.strokeStyle = "#38bdf8"; // cyan focus border
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw outer ring
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillStyle = "#0f172a";
        ctx.fill();
        ctx.stroke();

        // Draw inner dot (flashes slightly if mobile bus)
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = sensor.type === "mobile_bus" && Math.round(plumeFrame) % 10 < 5 ? "#38bdf8" : color;
        ctx.fill();

        // Label for PM2.5 above sensor node
        if (isSelected || isHovered === sensor.id) {
          ctx.font = "600 10px JetBrains Mono, monospace";
          const labelText = `${sensor.name} (PM2.5: ${sensor.pm25})`;
          const textWidth = ctx.measureText(labelText).width;

          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.fillRect(x - textWidth / 2 - 5, y + 10, textWidth + 10, 16);
          ctx.strokeStyle = color;
          ctx.strokeRect(x - textWidth / 2 - 5, y + 10, textWidth + 10, 16);

          ctx.fillStyle = "#ffffff";
          ctx.fillText(labelText, x, y + 18);
        }
      });
    }

    // Always draw the Bio-Digester Plant 4 on the map to anchor the circular economy infrastructure!
    if (showRiverGrid) {
      const plantXY = getXY(17.6850, 83.2300);
      // Draw a subtle icon or colored circle with glow
      ctx.beginPath();
      ctx.arc(plantXY.x, plantXY.y, 14 + Math.sin(plumeFrame * 0.05) * 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(plantXY.x, plantXY.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.font = "bold 8px sans-serif";
      ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
      ctx.textAlign = "center";
      ctx.fillText("BIO-DIGESTER PLANT 4", plantXY.x, plantXY.y - 10);
    }

    // Render dynamic route lines and animated vehicles for active biogas harvesting
    incidents.forEach((inc) => {
      if (inc.status === "biogas_routing") {
        const { x: incX, y: incY } = getXY(inc.coordinates.lat, inc.coordinates.lng);
        const { x: destX, y: destY } = getXY(17.6850, 83.2300);

        // Draw dotted green path
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.65)";
        ctx.lineWidth = 1.8;
        ctx.moveTo(incX, incY);
        ctx.lineTo(destX, destY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw animated scavenger truck moving along the route
        const progress = (plumeFrame % 100) / 100; // 0 to 1
        const truckX = incX + (destX - incX) * progress;
        const truckY = incY + (destY - incY) * progress;

        ctx.beginPath();
        ctx.arc(truckX, truckY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#f59e0b"; // Amber color for scavenger truck
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Small floating tag
        ctx.font = "bold 7px Inter, sans-serif";
        ctx.fillStyle = "#f59e0b";
        ctx.textAlign = "center";
        ctx.fillText("AP TRUCK", truckX, truckY - 7);
      }
    });

    // Compass graphic overlay (subtle in bottom right)
    ctx.save();
    ctx.translate(width - 50, height - 50);
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // wind angle pointer
    const windAngleRad = (wind.angle - 90) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(windAngleRad) * 16, Math.sin(windAngleRad) * 16);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Wind label N/S/E/W
    ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
    ctx.font = "bold 8px sans-serif";
    ctx.fillText("N", 0, -23);
    ctx.restore();

  }, [dimensions, sensors, incidents, selectedIncident, selectedSensor, wind, plumeFrame, showPlumePrediction, showSensors, showRiverGrid, isHovered]);

  // Click on map - select elements or report coordinate
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check hit on incidents
    for (let inc of incidents) {
      if (inc.status === "false_positive" || inc.status === "cleared") continue;
      const { x, y } = getXY(inc.coordinates.lat, inc.coordinates.lng);
      const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      if (dist < 10) {
        onSelectIncident(inc);
        onSelectSensor(null);
        return;
      }
    }

    // Check hit on sensors
    if (showSensors) {
      for (let sensor of sensors) {
        const { x, y } = getXY(sensor.coordinates.lat, sensor.coordinates.lng);
        const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
        if (dist < 10) {
          onSelectSensor(sensor);
          onSelectIncident(null);
          return;
        }
      }
    }

    // Otherwise, register coordinates for a custom citizen report pin if provided
    if (onMapClickCoordinates) {
      const coords = getLatLng(clickX, clickY);
      // Generate a descriptive mock sub-neighborhood street address based on layout quadrant in Visakhapatnam
      let address = "Beach Road Bypass";
      if (coords.lat > 17.72 && coords.lng < 83.25) address = "MVP Colony Sector 4";
      else if (coords.lat > 17.74 && coords.lng > 83.28) address = "Rushikonda Tech Park Perimeter";
      else if (coords.lat < 17.69 && coords.lng > 83.25) address = "Gajuwaka Industrial Belt";
      else if (coords.lat < 17.71 && coords.lng < 83.22) address = "Scindia Port Area Layout";

      onMapClickCoordinates(coords, address);
    }
  };

  // Hover detection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check hit on incidents
    for (let inc of incidents) {
      if (inc.status === "false_positive" || inc.status === "cleared") continue;
      const { x, y } = getXY(inc.coordinates.lat, inc.coordinates.lng);
      const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      if (dist < 10) {
        setIsHovered(inc.id);
        canvas.style.cursor = "pointer";
        return;
      }
    }

    // Check hit on sensors
    if (showSensors) {
      for (let sensor of sensors) {
        const { x, y } = getXY(sensor.coordinates.lat, sensor.coordinates.lng);
        const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
        if (dist < 10) {
          setIsHovered(sensor.id);
          canvas.style.cursor = "pointer";
          return;
        }
      }
    }

    setIsHovered(null);
    canvas.style.cursor = "crosshair";
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Control overlay header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">Visakhapatnam Digital Twin Platform</span>
        </div>

        {/* Map Toggles */}
        <div className="flex items-center space-x-3 text-xs">
          <button 
            onClick={() => setShowPlumePrediction(!showPlumePrediction)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${showPlumePrediction ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-850 text-slate-400 border border-transparent'}`}
            id="map-toggle-plume"
          >
            Plume Forecast
          </button>
          <button 
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${showSensors ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-850 text-slate-400 border border-transparent'}`}
            id="map-toggle-sensors"
          >
            IoT Sensors
          </button>
          <button 
            onClick={() => {
              onSelectIncident(null);
              onSelectSensor(null);
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Reset Map Target"
            id="map-reset"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="relative flex-1 bg-slate-950 min-h-[350px]">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="block h-full w-full"
          id="digital-twin-canvas"
        />

        {/* Quick legend overlay */}
        <div className="absolute bottom-3 left-3 flex flex-col space-y-1 bg-slate-950/95 border border-slate-800/80 p-2.5 rounded-lg text-[10px] text-slate-400 shadow-lg pointer-events-none">
          <div className="font-semibold text-slate-300 mb-1 border-b border-slate-800 pb-0.5 uppercase tracking-wider">Legend</div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-950"></span>
            <span>Garbage Fire / Biomass</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-orange-950"></span>
            <span>Construction Dust Zone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500 ring-2 ring-purple-950"></span>
            <span>Industrial Stack Violator</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Live Air Sensor (AQI OK)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            <span>Live Air Sensor (AQI Moderate)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
            <span>Live Air Sensor (AQI Severe)</span>
          </div>
        </div>

        {/* Floating Instructions */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-800 text-[10px] text-slate-400 pointer-events-none">
          💡 Click any point to select report coordinates
        </div>
      </div>

      {/* Wind Control Panel footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wind Angle */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center">
                <Compass className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
                Dispersion Wind Direction
              </span>
              <span className="font-mono text-slate-300 font-bold">{wind.angle}° ( {wind.angle >= 337.5 || wind.angle < 22.5 ? 'North' : wind.angle >= 22.5 && wind.angle < 67.5 ? 'North-East' : wind.angle >= 67.5 && wind.angle < 112.5 ? 'East' : wind.angle >= 112.5 && wind.angle < 157.5 ? 'South-East' : wind.angle >= 157.5 && wind.angle < 202.5 ? 'South' : wind.angle >= 202.5 && wind.angle < 247.5 ? 'South-West' : wind.angle >= 247.5 && wind.angle < 292.5 ? 'West' : 'North-West'} )</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="359" 
              value={wind.angle}
              onChange={(e) => setWind({ ...wind, angle: parseInt(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
              id="wind-angle-slider"
            />
          </div>

          {/* Wind Speed */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center">
                <Wind className="h-3.5 w-3.5 mr-1.5 text-sky-400 animate-pulse" />
                Dispersion Velocity (Force)
              </span>
              <span className="font-mono text-slate-300 font-bold">{wind.speed} km/h</span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="50" 
              value={wind.speed}
              onChange={(e) => setWind({ ...wind, speed: parseInt(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
              id="wind-speed-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
