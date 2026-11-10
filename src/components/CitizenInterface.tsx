import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Users,
  ShieldCheck,
  Activity,
  HelpCircle,
  Sparkles,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  MessageSquare,
  Radio,
  Compass,
  Truck,
} from 'lucide-react';
import {
  Facility,
  LocationData,
  WeatherData,
  DisasterAlert,
  LifecycleStage,
  MultiOrgResource,
  ActiveSosState,
  SupportedLanguage,
  FamilyMember,
  CommunityIncident,
} from '../types/disaster';
import {
  MOCK_FAMILY_MEMBERS,
  MOCK_CLIMATE_HEALTH_RISKS,
  ACTIONABLE_GUIDANCE,
  computeExplainableRisk,
} from '../data/mockDisasterData';
import { TRANSLATIONS } from '../utils/translations';
import { EmergencyServicesGrid } from './EmergencyServicesGrid';
import { DisasterMap } from './DisasterMap';
import { SheltersHospitalsView } from './SheltersHospitalsView';
import { IncidentsFeed } from './IncidentsFeed';

const FAMILY_STORAGE_KEY = 'resq_family_circle_v1';

interface CitizenInterfaceProps {
  onOpenSos: () => void;
  isSosActive: boolean;
  sosState: ActiveSosState;
  facilities: Facility[];
  onSelectFacility: (facility: Facility) => void;
  onOpenReportModal: () => void;
  onOpenTools: () => void;
  location: LocationData;
  weather: WeatherData;
  alerts: DisasterAlert[];
  lifecycleStage: LifecycleStage;
  resources: MultiOrgResource[];
  language?: SupportedLanguage;
  incidents: CommunityIncident[];
  onUpvoteIncident: (id: string) => void;
  isOffline: boolean;
  onToggleOfflineSim: () => void;
  offlineQueueCount: number;
  onSyncOfflineQueue: () => void;
}

export const CitizenInterface: React.FC<CitizenInterfaceProps> = ({
  onOpenSos,
  isSosActive,
  sosState,
  facilities,
  onSelectFacility,
  onOpenReportModal,
  onOpenTools,
  location,
  weather,
  alerts,
  lifecycleStage,
  resources,
  language = 'en',
  incidents,
  onUpvoteIncident,
  isOffline,
  onToggleOfflineSim,
  offlineQueueCount,
  onSyncOfflineQueue,
}) => {
  const t = TRANSLATIONS[language];

  // Auto-align initial guidance phase with EOC Authority's Closed-Loop Lifecycle stage
  const defaultPhase: 'PRE' | 'DURING' | 'POST' =
    lifecycleStage === 'PREDICT' || lifecycleStage === 'EXPLAIN'
      ? 'PRE'
      : lifecycleStage === 'RECOVER'
      ? 'POST'
      : 'DURING';

  const [activeGuidanceTab, setActiveGuidanceTab] = useState<'PRE' | 'DURING' | 'POST'>(defaultPhase);

  useEffect(() => {
    setActiveGuidanceTab(defaultPhase);
  }, [defaultPhase]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(FAMILY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return MOCK_FAMILY_MEMBERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(familyMembers));
    } catch {}
  }, [familyMembers]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Parent');
  const [newMemberPhone, setNewMemberPhone] = useState('+91 98201 00000');
  const [isAddingFamily, setIsAddingFamily] = useState(false);
  const [showRiskExplainer, setShowRiskExplainer] = useState(false);
  const [safeBroadcastSent, setSafeBroadcastSent] = useState(false);

  const verifiedCount = incidents.filter((i) => i.isVerified).length;
  const explainableRisk = computeExplainableRisk(location, weather, verifiedCount);
  const latestAlert = alerts[0];
  const localizedAlertHeadline =
    latestAlert && language !== 'en' && latestAlert.translations?.[language]?.headline
      ? latestAlert.translations[language]!.headline
      : latestAlert?.headline;

  const deployedRelief = resources.filter((r) => r.status === 'DEPLOYED' || r.status === 'EN_ROUTE');

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: newMemberName.trim(),
      relation: newMemberRelation,
      status: 'SAFE',
      lastKnownLocation: `${location.regionName} (GPS Connected)`,
      batteryPct: 95,
      lastUpdated: 'Just now',
      phone: newMemberPhone.trim() || '+91 98000 00000',
    };
    setFamilyMembers((prev) => [...prev, newMember]);
    setNewMemberName('');
    setIsAddingFamily(false);
  };

  const handleBroadcastSafeToFamily = () => {
    setSafeBroadcastSent(true);
    setTimeout(() => setSafeBroadcastSent(false), 4500);
  };

  const smsSafeBody = `RESQ SAFE CHECK-IN: I am safe in ${location.regionName} (GPS ${location.coords.lat.toFixed(4)}, ${location.coords.lng.toFixed(4)}).`;

  return (
    <div className="space-y-6 pt-1">
      {/* 0. Interconnected Status Strip: EOC Lifecycle Phase + Offline-Ready Communication Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1.5 font-mono font-bold uppercase text-[10px] px-2.5 py-1 rounded bg-slate-900 text-white">
            <Compass className="w-3.5 h-3.5" />
            EOC Phase: {lifecycleStage}
          </span>
          {latestAlert && (
            <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded font-medium">
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-md">{localizedAlertHeadline}</span>
            </span>
          )}
        </div>

        {/* Feature #12: Offline-Ready & SMS Fallback Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] font-semibold ${
              isOffline
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'OFFLINE MODE (QUEUING)' : 'NETWORK ONLINE'}</span>
          </div>

          {offlineQueueCount > 0 && (
            <button
              onClick={onSyncOfflineQueue}
              disabled={isOffline}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-mono text-[11px] font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Sync {offlineQueueCount} Queued
            </button>
          )}

          <button
            onClick={onToggleOfflineSim}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700"
            title="Test Offline Queue & SMS Fallback behavior"
          >
            {isOffline ? 'Restore Connection' : 'Simulate Offline'}
          </button>

          <a
            href={`sms:?&body=${encodeURIComponent(smsSafeBody)}`}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1"
            title="Cellular SMS Fallback when mobile internet is unavailable"
          >
            <MessageSquare className="w-3 h-3 text-slate-500" />
            SMS Fallback
          </a>
        </div>
      </div>

      {/* 1. Action Row: SOS Trigger & Quick Safety Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Main SOS Button (synced with Authority EOC Triage Queue) */}
        <button
          onClick={onOpenSos}
          className={`sm:col-span-1 p-4 rounded-xl border text-left transition-all flex flex-col justify-between shadow-sm ${
            isSosActive
              ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white animate-pulse'
              : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-red-100">
              {t.emergencySos}
            </span>
            <AlertTriangle className="w-5 h-5 fill-white text-red-600" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-white">
              {isSosActive ? `SOS ${sosState.workflowStage || 'ACTIVE'}` : 'Trigger Distress SOS'}
            </div>
            <div className="text-xs text-red-100 mt-0.5">
              {isSosActive
                ? `${sosState.assignedUnit || 'Pending EOC Triage'}${
                    typeof sosState.etaMinutes === 'number' && sosState.etaMinutes > 0
                      ? ` · ETA ${sosState.etaMinutes}m`
                      : ''
                  }`
                : 'Direct relay to Authority EOC triage with GPS lock & live tracking'}
            </div>
          </div>
        </button>

        {/* Family Check-in "I'm Safe" */}
        <button
          onClick={handleBroadcastSafeToFamily}
          className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-left transition-all flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider">
              {t.familyGroup} Check-In
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-slate-900">Broadcast "I'm Safe"</div>
            <div className="text-xs text-slate-500 mt-0.5">
              1-click SMS & push notification to {familyMembers.length} family members
            </div>
          </div>
        </button>

        {/* Report Field Hazard */}
        <button
          onClick={onOpenReportModal}
          className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-left transition-all flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider">
              Citizen–Authority Bridge
            </span>
            <PlusCircle className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-slate-900">{t.reportIncident}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Photo + GPS hazard report sent to Authority verification & safe routing
            </div>
          </div>
        </button>
      </div>

      {safeBroadcastSent && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              "I Am Safe" broadcast transmitted with GPS coordinates to {familyMembers.length} family members.
            </span>
          </div>
          <button
            onClick={onOpenTools}
            className="font-mono text-emerald-800 underline font-bold shrink-0"
          >
            Open SMS/Kit Deck
          </button>
        </div>
      )}

      {/* 2. One-Touch Emergency Services Grid */}
      <EmergencyServicesGrid location={location} />

      {/* 3. Feature #2: AI-Driven Explainable Risk Assessment (Dynamic) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                <span>{t.explainableRisk}</span>
                <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Live Multi-Factor Model
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Rainfall, elevation, verified field hazards ({verifiedCount}), and exposure breakdown
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRiskExplainer(!showRiskExplainer)}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 border border-slate-300 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>{showRiskExplainer ? 'Hide Explanation' : 'Why am I at risk?'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-mono uppercase text-slate-500">Composite Risk Score</div>
            <div className="text-2xl font-bold font-mono text-red-600 tabular-nums">
              {explainableRisk.overallScore}/100
            </div>
            <div className="text-[10px] text-red-600 font-medium">{location.threatLevel} Threat</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-mono uppercase text-slate-500">Flood Inundation Risk</div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {explainableRisk.floodRiskPct}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Runoff vs capacity</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-mono uppercase text-slate-500">Landslide / Soil-Slip</div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {explainableRisk.landslideRiskPct}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Terrain & saturation</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] font-mono uppercase text-slate-500">Heat-Stress Risk</div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {explainableRisk.heatwaveRiskPct}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">{weather.temperatureC.toFixed(1)}°C Ambient</div>
          </div>
        </div>

        {showRiskExplainer && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs animate-fade-in">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <p className="text-slate-700 leading-relaxed font-medium">
                {explainableRisk.explanationText}
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold">
                Underlying Data Factors:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {explainableRisk.factors.map((factor, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                      <span>{factor.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          factor.impact === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {factor.impact}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-700">{factor.value}</div>
                    <p className="text-[11px] text-slate-500 leading-tight">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Feature #14: Family Safety Group */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {t.familyGroup} & Circle Monitoring
              </h3>
              <p className="text-xs text-slate-500">
                Real-time safety status, location sync, and emergency notification broadcasting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingFamily(!isAddingFamily)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>Add Member</span>
            </button>
            <button
              onClick={handleBroadcastSafeToFamily}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ping All Safe</span>
            </button>
          </div>
        </div>

        {isAddingFamily && (
          <form onSubmit={handleAddFamilyMember} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2.5 items-end text-xs animate-fade-in">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-slate-600 font-semibold mb-1">Member Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Ananya Sharma"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-slate-600 font-semibold mb-1">Phone:</label>
              <input
                type="tel"
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-slate-600 font-semibold mb-1">Relationship:</label>
              <select
                value={newMemberRelation}
                onChange={(e) => setNewMemberRelation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Relative / Neighbor">Relative / Neighbor</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-colors w-full sm:w-auto"
            >
              Save to Circle
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      member.status === 'SAFE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : member.status === 'EVACUATING'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{member.relation} · {member.phone}</div>
                <p className="text-xs text-slate-700 flex items-start gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate">{member.lastKnownLocation}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                <span>Battery: <strong className="text-slate-900 font-semibold">{member.batteryPct}%</strong></span>
                <span>Synced {member.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Active NGO / Multi-Agency Relief Supplies Deployed (from Admin Network) */}
      {deployedRelief.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              Active Community Relief & NGO Deployments (Live from Multi-Org Grid)
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {deployedRelief.length} convoys active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {deployedRelief.map((r) => (
              <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{r.orgName}</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">{r.status}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">{r.availableQty}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">Sector: {r.assignedToSector}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Interactive Live Map with Lower-Risk Safe Route Navigation */}
      <DisasterMap
        location={location}
        facilities={facilities}
        incidents={incidents}
        onSelectFacility={onSelectFacility}
      />

      {/* 7. Safe Places (Shelters, Hospitals & Blood Banks — live capacity from Admin) */}
      <SheltersHospitalsView
        facilities={facilities}
        onSelectFacilityForDirections={onSelectFacility}
      />

      {/* 8. Feature #15: Climate -> Health Risk Awareness */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {t.climateHealth}
              </h3>
              <p className="text-xs text-slate-500">
                Waterborne pathogen and heat-stress prevention indicators
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Preventive Advisory</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_CLIMATE_HEALTH_RISKS.map((risk) => (
            <div key={risk.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{risk.diseaseName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    risk.riskLevel === 'HIGH'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {risk.riskLevel} Risk
                </span>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                <strong>Transmission:</strong> {risk.transmissionVector}
              </p>

              <div className="space-y-1 pt-1 border-t border-slate-200">
                <div className="text-[10px] font-mono uppercase font-semibold text-slate-500">
                  Precautionary Actions:
                </div>
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {risk.preventiveIndicators.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-900 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 italic font-mono border-t border-slate-200">
                {risk.disclaimer}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Feature #17: Actionable Disaster Guidance */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {t.actionableGuidance}
              </h3>
              <p className="text-xs text-slate-500">
                Synced to EOC phase ({lifecycleStage}) · Pre, during, and post-disaster precautions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
            {(
              [
                { id: 'PRE', label: t.preDisaster },
                { id: 'DURING', label: t.duringDisaster },
                { id: 'POST', label: t.postDisaster },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveGuidanceTab(tab.id)}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeGuidanceTab === tab.id
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ACTIONABLE_GUIDANCE[activeGuidanceTab].map((guide, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{guide.title}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">{guide.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Community Field Incidents Feed */}
      <IncidentsFeed
        incidents={incidents}
        onOpenReportModal={onOpenReportModal}
        onUpvoteIncident={onUpvoteIncident}
      />
    </div>
  );
};
