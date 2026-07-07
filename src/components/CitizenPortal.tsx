/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { POLLUTION_PRESETS, HEALTH_ADVISORY_LIST, PollutionPreset } from "../data/mockData";
import { LatLng, UserEcoProfile, Incident } from "../types";
import { 
  Camera, Upload, Sparkles, Heart, Award, AlertCircle, 
  Trash2, HelpCircle, CheckCircle2, ShieldAlert, ArrowRight, Loader2, Info
} from "lucide-react";

interface CitizenPortalProps {
  ecoProfile: UserEcoProfile;
  setEcoProfile: React.Dispatch<React.SetStateAction<UserEcoProfile>>;
  onNewIncidentReported: (incident: Incident) => void;
  clickedCoordinates: LatLng | null;
  clickedAddress: string;
  setClickedCoordinates: (coords: LatLng | null) => void;
  setTabMode: (tab: "citizen" | "command") => void;
}

export default function CitizenPortal({
  ecoProfile,
  setEcoProfile,
  onNewIncidentReported,
  clickedCoordinates,
  clickedAddress,
  setClickedCoordinates,
  setTabMode
}: CitizenPortalProps) {
  // Report Form state
  const [selectedPreset, setSelectedPreset] = useState<PollutionPreset | null>(null);
  const [userDescription, setUserDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [uploadError, setUploadError] = useState("");

  // Health Advisories state (based on selected AQI range)
  const [activeHealthId, setActiveHealthId] = useState("moderate");

  // Handle preset selection
  const handleSelectPreset = (preset: PollutionPreset) => {
    setSelectedPreset(preset);
    setUserDescription(`Spotted a major ${preset.name.toLowerCase()} here at ${preset.locationName}. Smoke is dispersing quickly.`);
    setAnalysisResult(null);
    setUploadError("");
  };

  // Handle custom image file upload
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5MB.");
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedPreset({
        id: "custom_upload",
        name: "Citizen Photo Upload",
        type: "other",
        severity: "medium",
        description: "Manually uploaded pollution photo.",
        locationName: clickedAddress || "Near current coordinates",
        proximityToSchool: 350,
        biomassWeight: 100,
        biogasYield: 40,
        imageUrl: base64,
        promptHint: "pollution source"
      });
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Submit report to server-side Gemini multi-modal engine
  const handleTriggerAIAnalysis = async () => {
    if (!selectedPreset) {
      setUploadError("Please select a preset scenario or upload a photo first.");
      return;
    }

    setIsAnalyzing(true);
    setUploadError("");

    try {
      const response = await fetch("/api/incidents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedPreset.imageUrl,
          userDescription,
          locationPreset: selectedPreset.locationName
        })
      });

      if (!response.ok) {
        throw new Error("Server analysis failed. Please verify API configuration.");
      }

      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        throw new Error(data.error || "Analysis was inconclusive.");
      }

    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Network error. Server could not process image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Finalize the verified report into the live system map
  const handleFinalizeReport = async () => {
    if (!analysisResult) return;

    try {
      const reportCoords = clickedCoordinates || { 
        lat: 17.72 + (Math.random() - 0.5) * 0.08, 
        lng: 83.28 + (Math.random() - 0.5) * 0.08 
      };

      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: analysisResult.title,
          type: analysisResult.type,
          severity: analysisResult.severity,
          description: analysisResult.description,
          locationName: analysisResult.locationSuggestion,
          coordinates: reportCoords,
          proximityToSchool: analysisResult.proximityToSchool,
          biomassWeight: analysisResult.biomassWeight
        })
      });

      if (!response.ok) {
        throw new Error("Failed to post report.");
      }

      const data = await response.json();
      if (data.incident) {
        onNewIncidentReported(data.incident);
        setEcoProfile(data.profileUpdate);
        
        // Reset state & show confirmation
        alert(`Successfully verified! ${analysisResult.biomassWeight > 0 ? `${analysisResult.biomassWeight}kg waste queued for Biogas routing. ` : ''}You earned 20 Eco-Points!`);
        setSelectedPreset(null);
        setUserDescription("");
        setAnalysisResult(null);
        setClickedCoordinates(null);
      }
    } catch (err: any) {
      setUploadError("Failed to finalize incident registration. " + err.message);
    }
  };

  const activeHealthAdvice = HEALTH_ADVISORY_LIST.find(h => h.id === activeHealthId) || HEALTH_ADVISORY_LIST[1];

  return (
    <div className="flex flex-col space-y-6" id="citizen-portal-root">
      
      {/* Gamification Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="eco-points-dashboard">
        {/* Eco Points */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Eco Score balance</span>
            <span className="text-2xl font-bold font-sans text-emerald-400 mt-1">{ecoProfile.points} pts</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Earned from verified citizen reviews</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Current Rank */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Municipal Badging</span>
            <span className="text-sm font-bold text-slate-200 mt-1.5">{ecoProfile.rank}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Top 5% environmental volunteer</span>
          </div>
          <div className="p-3 bg-sky-500/10 rounded-lg text-sky-400">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Verified Reports */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Verified submissions</span>
            <span className="text-2xl font-bold font-sans text-sky-400 mt-1">{ecoProfile.verifiedReports}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">100% resolution action rate</span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Biogas Biomass Generated */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Biomass diverted to Biogas</span>
            <span className="text-2xl font-bold font-sans text-amber-500 mt-1">{ecoProfile.biomassContributedKg} kg</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Prevented carbon fuel dump burn</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
            <Trash2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Layout Splitted */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Snap & Report Box */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-emerald-400 animate-pulse" />
              <div>
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Snap & Report (AI-Assisted Citizen Portal)</h2>
                <p className="text-xs text-slate-400">Submit local environmental infractions. Our multimodal AI checks coordinates and estimates biomass.</p>
              </div>
            </div>
          </div>

          {/* Preset scenarios selectors */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-semibold text-slate-300">Step 1: Choose a Visual Pollution Scenario Preset (or Upload Citizen Photo)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POLLUTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all h-[95px] ${selectedPreset?.id === preset.id ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/30' : 'bg-slate-950 border-slate-850 hover:border-slate-700'}`}
                  id={`btn-${preset.id}`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${preset.severity === 'critical' ? 'bg-purple-500/20 text-purple-400' : preset.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {preset.severity}
                  </span>
                  <span className="text-xs font-bold text-slate-200 mt-2 truncate w-full">{preset.name}</span>
                  <span className="text-[10px] text-slate-500 truncate w-full">{preset.locationName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates Alert */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping"></span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-300">Geo-tagging Position</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {clickedCoordinates 
                    ? `Coordinates Selected: [${clickedCoordinates.lat.toFixed(4)}, ${clickedCoordinates.lng.toFixed(4)}] - ${clickedAddress}`
                    : "No specific position tag selected on Map. Click any spot on the Visakhapatnam Map first!"
                  }
                </span>
              </div>
            </div>
            {clickedCoordinates && (
              <button 
                onClick={() => setClickedCoordinates(null)} 
                className="text-[10px] text-rose-400 hover:underline font-bold"
                id="btn-clear-coords"
              >
                Reset GPS
              </button>
            )}
          </div>

          {/* Custom description */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Step 2: Add local observations & custom tags (optional)</label>
            <textarea
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              placeholder="Provide context (e.g. plastic debris burning, heavy construction dust, children playing nearby...)"
              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 h-20 resize-none"
              id="citizen-description-input"
            />
          </div>

          {/* File input fallback */}
          <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-950 border border-slate-850 rounded-lg">
            <span className="text-slate-400">Want to test a real phone file?</span>
            <label className="flex items-center space-x-1.5 cursor-pointer text-emerald-400 hover:text-emerald-300 font-semibold">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Custom Photo</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCustomImageUpload} 
                className="hidden" 
                id="citizen-custom-file"
              />
            </label>
          </div>

          {uploadError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center space-x-2 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Trigger AI Analyze Action button */}
          <button
            onClick={handleTriggerAIAnalysis}
            disabled={isAnalyzing || !selectedPreset}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 border transition-all ${isAnalyzing ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400 hover:shadow-lg'}`}
            id="btn-trigger-ai-analysis"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <span>AI Brain Multimodal Verification...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-slate-950" />
                <span>Submit to Gemini (Multimodal AQI check)</span>
              </>
            )}
          </button>

          {/* AI Analysis Result Board */}
          {analysisResult && (
            <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 flex flex-col space-y-3 shadow-inner animate-fade-in" id="ai-analysis-feedback-board">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Gemini Environmental Assessment</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase">Verified True Pollution</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-500">AI Identified Threat Class</span>
                  <span className="font-bold text-slate-300 capitalize">{analysisResult.type.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-500">Severity Metric</span>
                  <span className={`font-bold uppercase ${analysisResult.severity === 'critical' ? 'text-purple-400' : analysisResult.severity === 'high' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {analysisResult.severity}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-500">Proximity to Schools / Parks</span>
                  <span className="font-bold text-slate-300">{analysisResult.proximityToSchool} meters</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-500">AI Location Recommendation</span>
                  <span className="font-bold text-slate-300">{analysisResult.locationSuggestion}</span>
                </div>
              </div>

              <div className="bg-slate-900/50 p-2.5 border border-slate-850 rounded-lg text-[11px] text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-400">AI Visual Observations:</span> {analysisResult.description}
              </div>

              {/* Biomass circular economy details */}
              {analysisResult.biomassWeight > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex flex-col space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                    <Trash2 className="h-4 w-4" />
                    <span>Durable Biogas Recovery Pathing</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                    This rubbish pile is estimated at <strong className="text-slate-100">{analysisResult.biomassWeight} kg</strong>. Standard city processing will route this to an Anaerobic Biogas Bio-digester, producing <strong className="text-emerald-400">{analysisResult.biogasYield} m³ of clean biogas fuel</strong> and securing your community bonus points!
                  </p>
                </div>
              )}

              {/* Final Submit action */}
              <button
                onClick={handleFinalizeReport}
                className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 mt-2"
                id="btn-finalize-report"
              >
                <span>Register Verified Incident to Command Map</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Personalized Health Concierge Sidebar */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Health Concierge */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-3" id="health-concierge">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Heart className="h-4.5 w-4.5 text-rose-500" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Health Concierge</h2>
            </div>

            {/* Quick selector of AQI ranges to check advice */}
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] text-slate-400 font-semibold">Select air level range to inspect precautions:</span>
              <div className="grid grid-cols-5 gap-1 text-[9px] font-mono font-bold">
                {HEALTH_ADVISORY_LIST.map((adv) => (
                  <button
                    key={adv.id}
                    onClick={() => setActiveHealthId(adv.id)}
                    className={`py-1 rounded border text-center transition-colors ${activeHealthId === adv.id ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-950 text-slate-500 border-slate-850 hover:text-slate-300'}`}
                    id={`btn-health-tab-${adv.id}`}
                  >
                    {adv.status.substring(0, 4)}..
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-3 border rounded-lg flex flex-col space-y-2 ${activeHealthAdvice.color}`}>
              <div className="flex items-center justify-between font-bold text-xs">
                <span>AQI: {activeHealthAdvice.range}</span>
                <span className="uppercase text-[10px] px-1.5 py-0.5 bg-black/5 rounded">{activeHealthAdvice.status}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                {activeHealthAdvice.advice.map((advice, idx) => (
                  <li key={idx}>{advice}</li>
                ))}
              </ul>
            </div>

            {/* Simulated Live Alert Notice */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex flex-col space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                <ShieldAlert className="h-4.5 w-4.5 animate-bounce" />
                <span>Localized Smoke Alert</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                <strong>Gajuwaka Residents:</strong> Active waste heap fire reported 180 meters southeast of Gajuwaka High School. Keep windows and air-dampers closed for the next 2 hours as smoke disperses.
              </p>
            </div>
          </div>

          {/* Circular Bio-Economy Scheme */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <span className="p-1 bg-amber-500/10 rounded-md text-amber-500 mr-2">🌱</span>
              Circular Bio-Energy Loop
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AeroWatch AI couples report actio8ns directly with city biogas plants. When a sanitation patrol clears piles of organic rubbish:
            </p>
            <div className="space-y-1.5 text-[10px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
              <div className="flex items-center space-x-1">
                <span className="text-amber-500">✔</span>
                <span>Garbage cleared and sorted locally</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-amber-500">✔</span>
                <span>Biomass processed in anaerobic digester</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-amber-500">✔</span>
                <span>Converts to clean methane gas for stoves</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-emerald-400">✔</span>
                <span>Diverts pollution & rewards you Eco-Points!</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
