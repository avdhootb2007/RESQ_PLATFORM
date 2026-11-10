import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Send,
  Radio,
  Clock,
  Truck,
  Check,
  AlertTriangle,
  Activity,
  Flame,
  Camera,
  Compass,
  Navigation,
  CheckSquare,
  Anchor,
  Zap,
  PackagePlus,
  Building2,
} from 'lucide-react';
import {
  CommunityIncident,
  LocationData,
  SupportedLanguage,
  LifecycleStage,
  Facility,
  SosBeaconRecord,
  DisasterAlert,
  MultiOrgResource,
  ResourceRequest,
} from '../types/disaster';
import { MOCK_IOT_SENSORS } from '../data/mockDisasterData';
import { TRANSLATIONS } from '../utils/translations';

interface AuthorityInterfaceProps {
  location: LocationData;
  incidents: CommunityIncident[];
  onUpdateIncidentStatus: (
    id: string,
    status: NonNullable<CommunityIncident['status']>,
    severity?: CommunityIncident['severity']
  ) => void;
  sosBeacons: SosBeaconRecord[];
  onDispatchSosBeacon: (beaconCode: string, unitName: string) => void;
  onAdvanceSosBeacon: (beaconCode: string) => void;
  lifecycleStage: LifecycleStage;
  onChangeLifecycleStage: (stage: LifecycleStage) => void;
  onBroadcastAlert: (alert: DisasterAlert) => void;
  facilities: Facility[];
  resources: MultiOrgResource[];
  resourceRequests: ResourceRequest[];
  onCreateResourceRequest: (req: ResourceRequest) => void;
  language?: SupportedLanguage;
}

interface FieldUnit {
  id: string;
  callsign: string;
  agency: 'NDRF' | 'SDRF' | 'EMS' | 'FIRE' | 'COAST_GUARD';
  unitType: string;
  commander: string;
  crewCount: number;
  status: 'ON_PATROL' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'STAGED';
  sector: string;
  radioFrequency: string;
  fuelBatteryPct: number;
  equipment: string[];
}

export const AuthorityInterface: React.FC<AuthorityInterfaceProps> = ({
  location,
  incidents,
  onUpdateIncidentStatus,
  sosBeacons,
  onDispatchSosBeacon,
  onAdvanceSosBeacon,
  lifecycleStage,
  onChangeLifecycleStage,
  onBroadcastAlert,
  facilities,
  resources,
  resourceRequests,
  onCreateResourceRequest,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language];
  const [tacticalMapFilter, setTacticalMapFilter] = useState<'ALL' | 'SOS' | 'FLEET' | 'HAZARDS'>('ALL');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [livePolling, setLivePolling] = useState(true);
  const [sensorTick, setSensorTick] = useState(0);

  useEffect(() => {
    if (!livePolling) return;
    const timer = setInterval(() => setSensorTick((s) => (s + 1) % 6), 3000);
    return () => clearInterval(timer);
  }, [livePolling]);

  // Active Tactical Field Rescue Units Fleet Tracker
  const [fieldFleet, setFieldFleet] = useState<FieldUnit[]>([
    {
      id: 'unit-1',
      callsign: 'NDRF-BOAT-03',
      agency: 'NDRF',
      unitType: 'Swiftwater Rescue Zodiac Boat',
      commander: 'Capt. R. Deshmukh',
      crewCount: 6,
      status: 'DISPATCHED',
      sector: 'Sector 2 Floodplain Core',
      radioFrequency: 'VHF 156.800 MHz (Ch 16)',
      fuelBatteryPct: 88,
      equipment: ['Inflatable Zodiac', 'Life Jackets x20', 'Throw Bags', 'First Aid Trauma Kit'],
    },
    {
      id: 'unit-2',
      callsign: 'EMS-TRAUMA-07',
      agency: 'EMS',
      unitType: 'Advanced Life Support Mobile ICU',
      commander: 'Dr. S. Nair',
      crewCount: 4,
      status: 'EN_ROUTE',
      sector: 'Industrial Sector 6',
      radioFrequency: 'VHF 154.280 MHz (Medical 1)',
      fuelBatteryPct: 92,
      equipment: ['Defibrillator / AED', 'Ventilator', 'C-Spine Collars', 'Blood Plasma Cooler'],
    },
    {
      id: 'unit-3',
      callsign: 'FIRE-PUMPER-12',
      agency: 'FIRE',
      unitType: 'Heavy Water Pumper & Cutting Crew',
      commander: 'Insp. A. Kadam',
      crewCount: 5,
      status: 'ON_SCENE',
      sector: 'Harbor Terminal 3',
      radioFrequency: 'VHF 153.860 MHz (Fire Ops)',
      fuelBatteryPct: 76,
      equipment: ['Jaws of Life', '3000L Water Tank', 'Thermal Imager', 'High-Output Bilge Pump'],
    },
    {
      id: 'unit-4',
      callsign: 'SDRF-HELO-01',
      agency: 'SDRF',
      unitType: 'Aerial Hoist & Reconnaissance Drone',
      commander: 'Lt. K. Mehta',
      crewCount: 3,
      status: 'ON_PATROL',
      sector: 'Coastal Ridge & Mountain Pass',
      radioFrequency: 'VHF 121.500 MHz (Airband Guard)',
      fuelBatteryPct: 64,
      equipment: ['FLIR Camera Pod', 'Winch Hoist Cable', 'Relief Drop Packs x12'],
    },
  ]);

  // EAS Broadcast State
  const [broadcastZone, setBroadcastZone] = useState('Zone 4 - Vulnerable Coastal Plain');
  const [broadcastDirective, setBroadcastDirective] = useState<'MANDATORY_EVACUATION' | 'VOLUNTARY_EVACUATION' | 'SHELTER_IN_PLACE' | 'ALL_CLEAR'>('MANDATORY_EVACUATION');
  const [broadcastHeadline, setBroadcastHeadline] = useState(
    'Mandatory Evacuation Order: Surge Barrier Inundation Imminent'
  );
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Logistics Request to Admin State
  const [reqCategory, setReqCategory] = useState<MultiOrgResource['resourceCategory']>('DRINKING_WATER');
  const [reqSector, setReqSector] = useState('Sector 2 Floodplain Core');
  const [reqQty, setReqQty] = useState('4,000 Liters Potable Water');
  const [reqUrgency, setReqUrgency] = useState<ResourceRequest['urgency']>('CRITICAL');
  const [reqSentToast, setReqSentToast] = useState(false);

  const handleDispatchAndUpdateFleet = (beaconCode: string, unitName: string) => {
    onDispatchSosBeacon(beaconCode, unitName);
    setFieldFleet((prev) =>
      prev.map((u) => (unitName.includes(u.agency) ? { ...u, status: 'DISPATCHED' } : u))
    );
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastHeadline.trim()) return;

    const severity: DisasterAlert['severity'] =
      broadcastDirective === 'MANDATORY_EVACUATION'
        ? 'CRITICAL'
        : broadcastDirective === 'VOLUNTARY_EVACUATION'
        ? 'WARNING'
        : broadcastDirective === 'SHELTER_IN_PLACE'
        ? 'WATCH'
        : 'ADVISORY';

    const newAlert: DisasterAlert = {
      id: `ALT-EOC-${Date.now()}`,
      headline: broadcastHeadline.trim(),
      severity,
      category: location.primaryHazard,
      issuedAt: 'Just now (EOC Live)',
      expiresAt: 'In 6 hours',
      affectedRadiusKm: 25,
      sourceAuthority: `EOC Command (${broadcastZone})`,
      summary: `Official directive [${broadcastDirective.replace('_', ' ')}] issued for ${broadcastZone}. Cellular SMS fallback active across English, Hindi, and Marathi.`,
      instructions: {
        do: [
          'Follow verified lower-risk evacuation corridors shown on the RESQ Live Map.',
          'Keep battery-powered civil radio tuned to 104.2 FM and carry 72h survival kit.',
        ],
        dont: [
          'Do not cross barricaded bridges, flooded underpasses, or landslide slopes.',
        ],
      },
      audioWarningAvailable: true,
      translations: {
        hi: {
          headline: `[EOC अलर्ट] ${broadcastHeadline.trim()}`,
          summary: `${broadcastZone} के लिए आधिकारिक निर्देश जारी। सुरक्षित मार्गों का उपयोग करें।`,
        },
        mr: {
          headline: `[EOC सूचना] ${broadcastHeadline.trim()}`,
          summary: `${broadcastZone} साठी अधिकृत आपत्ती सूचना जारी. सुरक्षित मार्गाचा वापर करा.`,
        },
      },
    };

    onBroadcastAlert(newAlert);
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 5000);
  };

  const handleSubmitLogisticsRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqQty.trim()) return;
    const newReq: ResourceRequest = {
      id: `req-${Date.now()}`,
      requestedBy: 'EOC Tactical Command',
      sector: reqSector,
      resourceCategory: reqCategory,
      neededQty: reqQty.trim(),
      urgency: reqUrgency,
      notes: `Triggered during EOC phase ${lifecycleStage}`,
      status: 'OPEN',
      createdAt: 'Just now',
    };
    onCreateResourceRequest(newReq);
    setReqSentToast(true);
    setTimeout(() => setReqSentToast(false), 3500);
  };

  const lifecycleStages: Array<{ stage: LifecycleStage; label: string; desc: string; sop: string }> = [
    {
      stage: 'PREDICT',
      label: '1. PREDICT',
      desc: 'IoT sensors & models',
      sop: 'Activate automated sensor polling. Monitor river crest ultrasonic levels and landslide slope inclinometers.',
    },
    {
      stage: 'EXPLAIN',
      label: '2. EXPLAIN',
      desc: 'Explainable AI scoring',
      sop: 'Validate composite risk weights with meteorological telemetry before public risk advisories update.',
    },
    {
      stage: 'ALERT',
      label: '3. ALERT',
      desc: 'Multilingual EAS + SMS',
      sop: 'Issue evacuation alerts via Citizen interface, 104.2 FM, and cellular SMS fallback in EN/HI/MR.',
    },
    {
      stage: 'REPORT',
      label: '4. REPORT',
      desc: 'Citizen photo bridge',
      sop: 'Triage Citizen photo reports via AI confidence queue. Verified road blocks immediately update Lower-Risk Routing.',
    },
    {
      stage: 'RESPOND',
      label: '5. RESPOND',
      desc: 'Unit dispatch & triage',
      sop: 'Deploy NDRF boats, EMS ICUs, and request NGO/Supplier logistics from Admin Multi-Org Grid.',
    },
    {
      stage: 'RECOVER',
      label: '6. RECOVER',
      desc: 'Shelter & relief audits',
      sop: 'Coordinate NGO rations and clean water tankers with Admin. Citizens automatically see Post-Disaster recovery guidance.',
    },
  ];

  const activeStageInfo = lifecycleStages.find((s) => s.stage === lifecycleStage) || lifecycleStages[4];
  const openBedsTotal = facilities
    .filter((f) => f.type === 'SHELTER' || f.type === 'HOSPITAL')
    .reduce((sum, f) => sum + Math.max(0, f.capacityTotal - f.capacityUsed), 0);

  const activeSosList = sosBeacons.filter((b) => b.isActive);
  const pendingSosCount = activeSosList.filter((b) => b.workflowStage === 'BROADCASTED').length;

  return (
    <div className="space-y-6 pt-1">
      {/* 1. Closed-Loop Disaster Lifecycle Command Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {t.closedLoop} Command Console
              </h3>
              <p className="text-xs text-slate-500">
                Updating the active lifecycle phase propagates live across Citizen & Admin dashboards
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>
              Active EOC Phase: <strong className="text-slate-900 uppercase">{lifecycleStage}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {lifecycleStages.map((item) => {
            const isActive = lifecycleStage === item.stage;
            return (
              <button
                key={item.stage}
                onClick={() => onChangeLifecycleStage(item.stage)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {item.label}
                </div>
                <div className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-start gap-2.5">
          <CheckSquare className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-slate-700 mr-2">
              Phase {lifecycleStage} Operational Mandate:
            </span>
            <span className="text-slate-700 leading-relaxed font-medium">{activeStageInfo.sop}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Operations KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-mono text-slate-500">Unassigned SOS Beacons</div>
          <div className="text-2xl font-bold font-mono text-red-600 tabular-nums">
            {pendingSosCount} Pending
          </div>
          <div className="text-[11px] text-slate-500">{activeSosList.length} total active beacons</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-mono text-slate-500">Citizen Field Reports</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {incidents.filter((i) => !i.isVerified).length} Unverified
          </div>
          <div className="text-[11px] text-slate-500">{incidents.length} total reports in queue</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-mono text-slate-500">Open Shelter/Hospital Beds</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {openBedsTotal} Open
          </div>
          <div className="text-[11px] text-slate-500">Live from Admin Facility Registry</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-mono text-slate-500">Multi-Org Requests</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {resourceRequests.filter((r) => r.status === 'OPEN').length} Open
          </div>
          <div className="text-[11px] text-slate-500">
            {resources.filter((r) => r.status === 'DEPLOYED').length} convoys deployed
          </div>
        </div>
      </div>

      {/* 3. EOC Dedicated Tactical Radar Map (Live Citizen SOS + Hazards + Fleet) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                EOC Tactical Radar Map & Incident Perimeters
              </h3>
              <p className="text-xs text-slate-500">
                Displays live Citizen SOS beacons, fleet positioning, and verified Citizen roadblock hazards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {(['ALL', 'SOS', 'FLEET', 'HAZARDS'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTacticalMapFilter(f)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  tacticalMapFilter === f
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f === 'ALL' ? 'All Layers' : f === 'SOS' ? 'SOS Beacons' : f === 'FLEET' ? 'Fleet Units' : 'Hazards'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full h-80 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden select-none">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,220 Q 240,160 500,210 T 1000,190 L 1000,320 L 0,320 Z" fill="#bfdbfe" opacity="0.35" />
            <polygon
              points="180,80 340,60 420,170 260,200 150,150"
              fill="#fecaca"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.5"
            />
            <text x="210" y="130" fill="#b91c1c" fontSize="10" fontFamily="monospace" fontWeight="bold">
              ZONE 4: INUNDATION PERIMETER
            </text>
          </svg>

          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center gap-1 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>N 340° TACTICAL GRID</span>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <span className="bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow-sm font-bold mt-1">
              EOC BASE
            </span>
          </div>

          {(tacticalMapFilter === 'ALL' || tacticalMapFilter === 'FLEET') && (
            <>
              <div
                onClick={() => setSelectedUnitId('unit-1')}
                className="absolute left-[38%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-blue-700 border-2 border-white text-white flex items-center justify-center shadow-md animate-pulse">
                  <Anchor className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/95 border border-slate-300 text-slate-900 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-xs font-bold mt-0.5">
                  🚤 NDRF-BOAT-03
                </div>
              </div>

              <div
                onClick={() => setSelectedUnitId('unit-2')}
                className="absolute left-[62%] top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-md">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/95 border border-slate-300 text-slate-900 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-xs font-bold mt-0.5">
                  🚑 EMS-TRAUMA-07
                </div>
              </div>

              <div
                onClick={() => setSelectedUnitId('unit-3')}
                className="absolute left-[24%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-amber-600 border-2 border-white text-white flex items-center justify-center shadow-md">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/95 border border-slate-300 text-slate-900 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-xs font-bold mt-0.5">
                  🚒 FIRE-PUMPER-12
                </div>
              </div>
            </>
          )}

          {/* Live SOS Distress Beacons Pins */}
          {(tacticalMapFilter === 'ALL' || tacticalMapFilter === 'SOS') &&
            activeSosList.map((beacon, idx) => {
              const positions = [
                { left: '46%', top: '28%' },
                { left: '72%', top: '55%' },
                { left: '18%', top: '70%' },
                { left: '54%', top: '34%' },
              ];
              const pos = positions[idx % positions.length];
              return (
                <div
                  key={beacon.beaconCode}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
                  style={{ left: pos.left, top: pos.top }}
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white border-2 border-white flex items-center justify-center shadow-lg animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white border-2 border-white flex items-center justify-center shadow-lg relative">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <span className="bg-red-700 text-white font-mono text-[8px] font-bold px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap shadow-xs">
                    {beacon.beaconCode} ({beacon.peopleCount}p · {beacon.workflowStage})
                  </span>
                </div>
              );
            })}

          {/* Verified / Reported Roadblock Hazards */}
          {(tacticalMapFilter === 'ALL' || tacticalMapFilter === 'HAZARDS') &&
            incidents.slice(0, 3).map((inc, idx) => {
              const positions = [
                { left: '54%', top: '72%' },
                { left: '32%', top: '52%' },
                { left: '78%', top: '28%' },
              ];
              const pos = positions[idx % positions.length];
              return (
                <div
                  key={inc.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                  style={{ left: pos.left, top: pos.top }}
                >
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs max-w-[160px] truncate">
                    ⛔ {inc.category}: {inc.locationName.split(',')[0]}
                  </span>
                </div>
              );
            })}

          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2 shadow-xs">
            <div className="flex items-center gap-3">
              <span>
                GPS Sector: <strong className="text-slate-900">{location.coords.lat.toFixed(4)}°N, {location.coords.lng.toFixed(4)}°E</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>Active Buffer: <strong className="text-red-700">{location.zone}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-700 font-semibold">Live Citizen + Sensor Feed Synced</span>
            </div>
          </div>
        </div>

        {selectedUnitId && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-in">
            {(() => {
              const u = fieldFleet.find((f) => f.id === selectedUnitId);
              if (!u) return null;
              return (
                <>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{u.callsign} ({u.unitType})</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        {u.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Commander: {u.commander} · Radio: {u.radioFrequency} · Sector: {u.sector}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUnitId(null)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-[11px] font-semibold"
                  >
                    Close Inspector
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* 4. Main Split: Live SOS Triage Queue (Left) & Multilingual EAS Transmitter (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Incoming SOS Triage Queue (Connected live to Citizen SOS triggers!) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Live SOS Citizen Beacons (Triage & Unit Dispatch)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold">
              {activeSosList.length} Active Beacons
            </span>
          </div>

          <div className="space-y-2.5">
            {activeSosList.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                No active SOS beacons. Trigger an SOS from Citizen View to see it appear here instantaneously.
              </div>
            ) : (
              activeSosList.map((beacon) => (
                <div key={beacon.beaconCode} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mb-0.5">
                        <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {beacon.beaconCode}
                        </span>
                        <span>·</span>
                        <span className="text-slate-900 font-semibold">{beacon.callerName}</span>
                        <span>·</span>
                        <span className="text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 opacity-70" />
                          {beacon.timeAgo}
                        </span>
                      </div>

                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                        {beacon.emergencyType}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        📍 {beacon.locationName} ({beacon.coords.lat.toFixed(4)}°, {beacon.coords.lng.toFixed(4)}°)
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase shrink-0 ${
                        beacon.workflowStage === 'BROADCASTED'
                          ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                          : beacon.workflowStage === 'DISPATCHED'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {beacon.workflowStage}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <div>
                      Occupants: <strong className="text-slate-900">{beacon.peopleCount}</strong> · Blood Type:{' '}
                      <strong className="text-red-700 font-mono">{beacon.bloodType}</strong>
                    </div>
                    <div>
                      Medical Notes: <span className="text-slate-900 font-medium">{beacon.medicalNotes || 'None specified'}</span>
                    </div>
                    {beacon.assignedUnit && beacon.workflowStage !== 'BROADCASTED' && (
                      <div className="text-emerald-700 font-mono font-semibold pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>✓ Unit Assigned: {beacon.assignedUnit}</span>
                        <span>ETA: ~{beacon.etaMinutes ?? 0} min</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                    {beacon.workflowStage === 'BROADCASTED' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() =>
                            handleDispatchAndUpdateFleet(beacon.beaconCode, 'NDRF Swiftwater Boat Unit #3')
                          }
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch NDRF Boat</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDispatchAndUpdateFleet(beacon.beaconCode, 'Trauma Ambulance EMS #7')
                          }
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
                        >
                          Dispatch Ambulance
                        </button>
                      </div>
                    ) : beacon.workflowStage !== 'ON_SCENE' ? (
                      <button
                        onClick={() => onAdvanceSosBeacon(beacon.beaconCode)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-md text-xs font-semibold transition-colors"
                      >
                        Advance Status ({beacon.workflowStage === 'DISPATCHED' ? 'Mark In-Transit' : 'Mark On-Scene'})
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-700 font-bold">
                        ✓ Rescue Team On Scene
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Civil Evacuation Broadcast Console (Live Push to Citizens & Admins) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                  Civil Evacuation Transmitter (Multilingual EAS)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Push + SMS Relay</span>
            </div>

            {broadcastSent && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live alert published to Citizen & Admin dashboards across EN/HI/MR!</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-mono uppercase text-[10px] mb-1 font-semibold">
                  Target Geographic Sector:
                </label>
                <select
                  value={broadcastZone}
                  onChange={(e) => setBroadcastZone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="Zone 4 - Vulnerable Coastal Plain">Zone 4 - Vulnerable Coastal Plain</option>
                  <option value="Sector 2 - Floodplain Core">Sector 2 - Floodplain Core</option>
                  <option value="Sector 7 - Mountain Soil-Slip Incline">Sector 7 - Mountain Soil-Slip Incline</option>
                  <option value="All City Sectors (General Civil Broadcast)">All City Sectors (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-mono uppercase text-[10px] mb-1 font-semibold">
                  Directive & Broadcast Channels:
                </label>
                <select
                  value={broadcastDirective}
                  onChange={(e) => setBroadcastDirective(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="MANDATORY_EVACUATION">Mandatory Evacuation (Immediate Danger)</option>
                  <option value="VOLUNTARY_EVACUATION">Voluntary Evacuation (High Vulnerability)</option>
                  <option value="SHELTER_IN_PLACE">Shelter in Place (Interior Room Only)</option>
                  <option value="ALL_CLEAR">All Clear / Threat Diminished</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-mono uppercase text-[10px] mb-1 font-semibold">
                  Official Warning Headline (Auto-Translated EN/HI/MR):
                </label>
                <textarea
                  rows={2}
                  value={broadcastHeadline}
                  onChange={(e) => setBroadcastHeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 text-slate-300" />
                <span>Publish Live EAS Alert to Citizens & Network</span>
              </button>
            </form>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
            Broadcasts update the Citizen Alert Stream immediately and trigger cellular SMS fallback where data fails.
          </div>
        </div>
      </div>

      {/* 5. Citizen–Authority Bridge (AI Verification, Prioritization & Resolution Queue) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-600" />
            <span className="uppercase tracking-wider font-mono text-slate-700 font-bold">
              Citizen–Authority Bridge: AI Verification & Prioritization Queue
            </span>
          </div>
          <span className="text-slate-500 font-mono">{incidents.length} Field Reports</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {incidents.map((inc) => {
            const curStatus = inc.status ?? (inc.isVerified ? 'VERIFIED' : 'SUBMITTED');
            return (
              <div key={inc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] uppercase font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {inc.category}
                      </span>
                      <span className="font-semibold text-slate-900">{inc.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{inc.description}</p>
                    <p className="text-[10px] font-mono text-slate-500">📍 {inc.locationName}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    {inc.aiVerificationScore && (
                      <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">
                        AI Score: {inc.aiVerificationScore}%
                      </div>
                    )}
                  </div>
                </div>

                {inc.photoUrl && (
                  <img
                    src={inc.photoUrl}
                    alt={inc.title}
                    className="h-24 w-full object-cover rounded-lg border border-slate-200"
                  />
                )}

                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-200 flex-wrap">
                  <span>
                    {inc.reportedBy} · <strong>{curStatus}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {curStatus === 'SUBMITTED' && (
                      <button
                        onClick={() => onUpdateIncidentStatus(inc.id, 'VERIFIED', 'CRITICAL')}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold"
                      >
                        Verify & Prioritize
                      </button>
                    )}
                    {(curStatus === 'SUBMITTED' || curStatus === 'VERIFIED') && (
                      <button
                        onClick={() => onUpdateIncidentStatus(inc.id, 'RESPONDING')}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                      >
                        Dispatch Crew
                      </button>
                    )}
                    {curStatus !== 'RESOLVED' && (
                      <button
                        onClick={() => onUpdateIncidentStatus(inc.id, 'RESOLVED')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Authority → Admin Multi-Organization Logistics Request & Shelter Capacity Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-900">
                Request Supplies / NGOs from Admin Multi-Org Network
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Authority → Admin</span>
          </div>

          {reqSentToast && (
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Logistics request transmitted to Admin Multi-Organization Network!</span>
            </div>
          )}

          <form onSubmit={handleSubmitLogisticsRequest} className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 font-semibold mb-1">
                  Resource Category
                </label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                >
                  <option value="DRINKING_WATER">Drinking Water</option>
                  <option value="TRAUMA_KITS">Trauma Kits / Blood Units</option>
                  <option value="FOOD_RATIONS">Food Rations</option>
                  <option value="BLANKETS_COTS">Blankets & Cots</option>
                  <option value="HEAVY_EQUIPMENT">Heavy Rescue Equipment</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 font-semibold mb-1">
                  Urgency
                </label>
                <select
                  value={reqUrgency}
                  onChange={(e) => setReqUrgency(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 font-semibold mb-1">
                  Target Sector
                </label>
                <input
                  type="text"
                  value={reqSector}
                  onChange={(e) => setReqSector(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-600 font-semibold mb-1">
                  Quantity Needed
                </label>
                <input
                  type="text"
                  value={reqQty}
                  onChange={(e) => setReqQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-colors"
            >
              Send Request to Admin Coalition Grid
            </button>
          </form>

          {/* Live status of requests fulfilled by Admin */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500">
              Active Logistics Queue ({resourceRequests.length})
            </div>
            {resourceRequests.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">
                    {r.resourceCategory.replace('_', ' ')} · {r.neededQty}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {r.sector} {r.matchedOrgName ? `→ Matched: ${r.matchedOrgName}` : ''}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${
                    r.status === 'OPEN'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Shelter Capacity Monitor (Read-only view from Admin Master Registry) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-900">
                Shelter & Hospital Evacuation Capacity (Synced with Admin)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{openBedsTotal} beds open</span>
          </div>

          <div className="space-y-2">
            {facilities.slice(0, 5).map((f) => {
              const pct = Math.round((f.capacityUsed / f.capacityTotal) * 100);
              return (
                <div key={f.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{f.name}</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700 shrink-0">
                      {f.capacityUsed}/{f.capacityTotal} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 85 ? 'bg-red-500' : 'bg-slate-800'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Real-Time & Predictive IoT Monitoring Streams */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {t.iotSensors} (Real-Time Early Warning Network)
              </h3>
              <p className="text-xs text-slate-500">
                Ground slope tiltmeters, soil-moisture gauges, and ultrasonic river crest monitors
              </p>
            </div>
          </div>

          <button
            onClick={() => setLivePolling((p) => !p)}
            className="text-[10px] font-mono text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 font-semibold"
          >
            {livePolling ? `● Live Poll Active (Cycle #${sensorTick + 1})` : '○ Polling Paused'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_IOT_SENSORS.map((sensor) => (
            <div key={sensor.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                  {sensor.sensorType.replace('_', ' ')}
                </span>
                <span
                  className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase border ${
                    sensor.status === 'CRITICAL'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : sensor.status === 'WARNING'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {sensor.status}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">{sensor.name}</div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {sensor.currentReading}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Trend: <strong>{sensor.trend}</strong>
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">📍 {sensor.location}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Active Field Unit Fleet Tracker */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Active Tactical Field Fleet Tracker (Responders & Marine Crews)
              </h3>
              <p className="text-xs text-slate-500">
                Live crew status, VHF frequencies, fuel telemetry, and specialized equipment loadouts
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg">
            {fieldFleet.length} Units Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fieldFleet.map((unit) => (
            <div
              key={unit.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        unit.agency === 'NDRF'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : unit.agency === 'EMS'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : unit.agency === 'FIRE'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {unit.agency}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{unit.callsign}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-slate-100 text-slate-700 border-slate-200">
                    {unit.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700 font-medium">
                  {unit.unitType} · Commander: <strong className="text-slate-900">{unit.commander}</strong>
                </div>

                <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                  <div>Radio Channel: <strong className="text-slate-800">{unit.radioFrequency}</strong></div>
                  <div>Assigned Sector: <strong className="text-slate-800">{unit.sector}</strong></div>
                  <div>Crew Headcount: <strong className="text-slate-800">{unit.crewCount} personnel</strong></div>
                </div>

                <div className="pt-1 flex flex-wrap gap-1">
                  {unit.equipment.map((eq, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-600 font-mono"
                    >
                      ✓ {eq}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-slate-600">
                  <Zap className="w-3.5 h-3.5 text-slate-500" />
                  Fuel/Battery: <strong className="text-slate-900">{unit.fuelBatteryPct}%</strong>
                </span>
                <button
                  onClick={() => setSelectedUnitId(unit.id)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded font-semibold text-[11px] transition-colors shadow-xs"
                >
                  Inspect Unit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
