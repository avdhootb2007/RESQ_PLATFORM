import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Radio, 
  Clock, 
  Truck, 
  Check, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Flame, 
  MapPin, 
  Camera,
  RefreshCw,
  Compass,
  Navigation,
  PhoneCall,
  Sliders,
  CheckSquare,
  Users,
  Anchor,
  Zap,
  Filter
} from 'lucide-react';
import { CommunityIncident, LocationData, SupportedLanguage, LifecycleStage, Facility } from '../types/disaster';
import { MOCK_IOT_SENSORS } from '../data/mockDisasterData';
import { TRANSLATIONS } from '../utils/translations';

interface AuthorityInterfaceProps {
  location: LocationData;
  incidents: CommunityIncident[];
  onVerifyIncident: (id: string) => void;
  language?: SupportedLanguage;
}

interface IncomingSosBeacon {
  id: string;
  beaconCode: string;
  caller: string;
  emergencyType: string;
  locationName: string;
  coords: { lat: number; lng: number };
  peopleCount: number;
  medicalNotes: string;
  status: 'PENDING' | 'DISPATCHED' | 'IN_TRANSIT' | 'ON_SCENE';
  timeAgo: string;
  assignedUnit?: string;
  etaMinutes?: number;
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
  onVerifyIncident,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language];
  const [currentLifecycleStage, setCurrentLifecycleStage] = useState<LifecycleStage>('RESPOND');
  const [tacticalMapFilter, setTacticalMapFilter] = useState<'ALL' | 'SOS' | 'FLEET' | 'HAZARDS'>('ALL');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Incoming Citizen SOS Distress Beacons Queue
  const [sosBeacons, setSosBeacons] = useState<IncomingSosBeacon[]>([
    {
      id: 'beacon-1',
      beaconCode: 'RESQ-SOS-8821',
      caller: 'Priya Verma (Citizen ID #8891)',
      emergencyType: 'Trapped by Rapid Flood Water (0.8m depth)',
      locationName: '42 Riverbank Road, Ground Floor Apt 2',
      coords: { lat: location.coords.lat + 0.008, lng: location.coords.lng + 0.006 },
      peopleCount: 3,
      medicalNotes: 'Elderly occupant on oxygen concentrator. Water rising.',
      status: 'PENDING',
      timeAgo: '4 mins ago'
    },
    {
      id: 'beacon-2',
      beaconCode: 'RESQ-SOS-4190',
      caller: 'Marcus Chen',
      emergencyType: 'Severe Medical Trauma & Debris Collapse',
      locationName: 'Industrial Yard Gate 6',
      coords: { lat: location.coords.lat - 0.005, lng: location.coords.lng - 0.008 },
      peopleCount: 1,
      medicalNotes: 'Crush injury to lower extremity. Tourniquet applied.',
      status: 'DISPATCHED',
      timeAgo: '12 mins ago',
      assignedUnit: 'Trauma EMS Unit #7',
      etaMinutes: 4
    },
    {
      id: 'beacon-3',
      beaconCode: 'RESQ-SOS-1104',
      caller: 'Sunil Patil',
      emergencyType: 'Hillside Slope Slippage / House Creaking',
      locationName: 'Ghat Foothill Lane 3',
      coords: { lat: location.coords.lat - 0.012, lng: location.coords.lng + 0.011 },
      peopleCount: 4,
      medicalNotes: 'Infant + 2 adults. Pathway blocked by fallen boulder.',
      status: 'IN_TRANSIT',
      timeAgo: '18 mins ago',
      assignedUnit: 'NDRF Hill Extraction Team #2',
      etaMinutes: 7
    }
  ]);

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
      equipment: ['Inflatable Zodiac', 'Life Jackets x20', 'Throw Bags', 'First Aid Trauma Kit']
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
      equipment: ['Defibrillator / AED', 'Ventilator', 'C-Spine Collars', 'Blood Plasma Cooler']
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
      equipment: ['Jaws of Life', '3000L Water Tank', 'Thermal Imager', 'High-Output Bilge Pump']
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
      equipment: ['FLIR Camera Pod', 'Winch Hoist Cable', 'Relief Drop Packs x12']
    }
  ]);

  // EAS Broadcast State
  const [broadcastZone, setBroadcastZone] = useState('Zone 4 - Vulnerable Coastal Plain');
  const [broadcastDirective, setBroadcastDirective] = useState('MANDATORY_EVACUATION');
  const [broadcastHeadline, setBroadcastHeadline] = useState('Mandatory Evacuation Order: Surge Barrier Inundation Imminent');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Tactical Checkpoints / Roadblocks
  const [roadblocks, setRoadblocks] = useState([
    { id: 'rb-1', name: 'Causeway Low-Bridge #2', status: 'CLOSED_WATERLOGGED', sector: 'Sector 2' },
    { id: 'rb-2', name: 'Hillside Bypass Ghat KM 14', status: 'RESTRICTED_EMERGENCY_ONLY', sector: 'Sector 7' },
    { id: 'rb-3', name: 'Underpass North Metro Exit', status: 'BARRICADED', sector: 'Sector 4' },
  ]);

  const handleDispatchBeacon = (id: string, unitName: string) => {
    setSosBeacons(prev => prev.map(b => b.id === id ? {
      ...b,
      status: 'DISPATCHED',
      assignedUnit: unitName,
      etaMinutes: 6
    } : b));
  };

  const handleAdvanceBeaconStatus = (id: string) => {
    setSosBeacons(prev => prev.map(b => {
      if (b.id !== id) return b;
      if (b.status === 'DISPATCHED') return { ...b, status: 'IN_TRANSIT', etaMinutes: 3 };
      if (b.status === 'IN_TRANSIT') return { ...b, status: 'ON_SCENE', etaMinutes: 0 };
      return b;
    }));
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 5000);
  };

  const lifecycleStages: Array<{ stage: LifecycleStage; label: string; desc: string; sop: string }> = [
    { 
      stage: 'PREDICT', 
      label: '1. PREDICT', 
      desc: 'IoT sensors & meteorological models',
      sop: 'Activate automated sensor polling at 1.2s intervals. Monitor river crest ultrasonic levels and landslide slope inclinometers for anomaly thresholds.'
    },
    { 
      stage: 'EXPLAIN', 
      label: '2. EXPLAIN', 
      desc: 'Explainable AI risk scoring',
      sop: 'Review composite risk metrics (flood runoff 88%, soil-slip 76%). Validate algorithmic risk weights with district meteorological officer before public dissemination.'
    },
    { 
      stage: 'ALERT', 
      label: '3. ALERT', 
      desc: 'Multi-lingual EAS siren & SMS dispatch',
      sop: 'Issue mandatory evacuation sirens on civil broadcast radio 104.2 FM, activate roadside siren arrays, and push cell-broadcast SMS across English, Hindi, and Marathi.'
    },
    { 
      stage: 'REPORT', 
      label: '4. REPORT', 
      desc: 'Citizen field scouts & photo validation',
      sop: 'Triage citizen-submitted GPS photos through computer vision verification queue. Confirm road closures, downed lines, and localized inundation.'
    },
    { 
      stage: 'RESPOND', 
      label: '5. RESPOND', 
      desc: 'Tactical unit dispatch & resource deployment',
      sop: 'Deploy NDRF swiftwater boats, EMS mobile ICUs, and fire pumpers. Prioritize high-occupancy SOS distress beacons with life-support dependencies.'
    },
    { 
      stage: 'RECOVER', 
      label: '6. RECOVER', 
      desc: 'Shelter welfare, damage audits & repair',
      sop: 'Mobilize NGO dry rations and clean water tankers to evacuation centers. Conduct structural safety audits of schools, hospitals, and transit bridges.'
    },
  ];

  const activeStageInfo = lifecycleStages.find(s => s.stage === currentLifecycleStage) || lifecycleStages[4];

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
                End-to-end incident lifecycle progression from predictive detection to tactical recovery
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>Active EOC Phase: <strong className="text-slate-900 uppercase">{currentLifecycleStage}</strong></span>
          </div>
        </div>

        {/* 6 Lifecycle Steps Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {lifecycleStages.map((item) => {
            const isActive = currentLifecycleStage === item.stage;
            return (
              <button
                key={item.stage}
                onClick={() => setCurrentLifecycleStage(item.stage)}
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

        {/* Operational SOP Directive Banner for selected Phase */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-start gap-2.5">
          <CheckSquare className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-slate-700 mr-2">
              Phase {currentLifecycleStage} Operational Mandate:
            </span>
            <span className="text-slate-700 leading-relaxed font-medium">
              {activeStageInfo.sop}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Operations KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-mono text-slate-500">Pending SOS Distress</div>
          <div className="text-2xl font-bold font-mono text-red-600 tabular-nums">
            {sosBeacons.filter(b => b.status === 'PENDING').length} Active
          </div>
          <div className="text-[11px] text-slate-500">Triage Queue: Priority 1</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-mono text-slate-500">Active Field Units</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {fieldFleet.length} Crews
          </div>
          <div className="text-[11px] text-slate-500">NDRF, SDRF, EMS, Fire</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-mono text-slate-500">Evacuation Intake</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            1,245 Safe
          </div>
          <div className="text-[11px] text-slate-500">Across 5 designated shelters</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-mono text-slate-500">Civil EAS Relay</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            Synchronized
          </div>
          <div className="text-[11px] text-slate-500">Radio 104.2 FM / Cell SMS</div>
        </div>
      </div>

      {/* 3. EOC Dedicated Tactical Radar & Operational Perimeter Map */}
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
                Real-time incident clusters, exclusion zone perimeters, fleet positioning & road blockades
              </p>
            </div>
          </div>

          {/* Tactical Layer Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTacticalMapFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                tacticalMapFilter === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setTacticalMapFilter('SOS')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                tacticalMapFilter === 'SOS' ? 'bg-white text-red-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SOS Beacons
            </button>
            <button
              onClick={() => setTacticalMapFilter('FLEET')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                tacticalMapFilter === 'FLEET' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fleet Units
            </button>
            <button
              onClick={() => setTacticalMapFilter('HAZARDS')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                tacticalMapFilter === 'HAZARDS' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hazards
            </button>
          </div>
        </div>

        {/* Tactical Map Display */}
        <div className="relative w-full h-80 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden select-none">
          {/* Tactical Grid Background */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Simulated River / Waterway polygon */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 0,220 Q 240,160 500,210 T 1000,190 L 1000,320 L 0,320 Z"
              fill="#bfdbfe"
              opacity="0.35"
            />
            {/* Exclusion / High Hazard Perimeter Polygon */}
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

          {/* Compass Rose */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center gap-1 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>N 340° TACTICAL GRID</span>
          </div>

          {/* EOC Command Post Marker (Center) */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
            title="EOC Headquarters"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <span className="bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow-sm font-bold mt-1">
              EOC BASE
            </span>
          </div>

          {/* Active Field Fleet Unit Pins */}
          {(tacticalMapFilter === 'ALL' || tacticalMapFilter === 'FLEET') && (
            <>
              {/* Unit 1: Boat in river */}
              <div 
                onClick={() => setSelectedUnitId('unit-1')}
                className="absolute left-[38%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-blue-700 border-2 border-white text-white flex items-center justify-center shadow-md animate-pulse">
                  <Anchor className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/95 border border-slate-300 text-slate-900 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-xs font-bold mt-0.5 whitespace-nowrap">
                  🚤 NDRF-BOAT-03
                </div>
              </div>

              {/* Unit 2: EMS Mobile ICU */}
              <div 
                onClick={() => setSelectedUnitId('unit-2')}
                className="absolute left-[62%] top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-md">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/95 border border-slate-300 text-slate-900 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-xs font-bold mt-0.5 whitespace-nowrap">
                  🚑 EMS-TRAUMA-07
                </div>
              </div>

              {/* Unit 3: Fire Pumper */}
              <div 
                onClick={() => setSelectedUnitId('unit-3')}
                className="absolute left-[24%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-amber-600 border-2 border-white text-white flex items-center justify-center shadow-md">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/95 border border-slate-300 text-slate-900 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-xs font-bold mt-0.5 whitespace-nowrap">
                  🚒 FIRE-PUMPER-12
                </div>
              </div>
            </>
          )}

          {/* SOS Distress Beacons Pins */}
          {(tacticalMapFilter === 'ALL' || tacticalMapFilter === 'SOS') && (
            <>
              {sosBeacons.map((beacon, idx) => {
                const positions = [
                  { left: '46%', top: '28%' },
                  { left: '72%', top: '55%' },
                  { left: '18%', top: '70%' },
                ];
                const pos = positions[idx % positions.length];
                return (
                  <div
                    key={beacon.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
                    style={{ left: pos.left, top: pos.top }}
                  >
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white border-2 border-white flex items-center justify-center shadow-lg animate-ping absolute" />
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white border-2 border-white flex items-center justify-center shadow-lg relative">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span className="bg-red-700 text-white font-mono text-[8px] font-bold px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap shadow-xs">
                      {beacon.beaconCode} ({beacon.peopleCount}p)
                    </span>
                  </div>
                );
              })}
            </>
          )}

          {/* Roadblock Barricades */}
          {(tacticalMapFilter === 'ALL' || tacticalMapFilter === 'HAZARDS') && (
            <div className="absolute left-[54%] top-[72%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                ⛔ ROADBLOCK: CAUSEWAY BRIDGE
              </span>
            </div>
          )}

          {/* Tactical Status Overlay Bar */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2 shadow-xs">
            <div className="flex items-center gap-3">
              <span>GPS Sector: <strong className="text-slate-900">{location.coords.lat.toFixed(4)}°N, {location.coords.lng.toFixed(4)}°E</strong></span>
              <span className="text-slate-300">|</span>
              <span>Active Buffer: <strong className="text-red-700">Zone 4 (2.4 km radius)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-700 font-semibold">Live GPS Telemetry Locked</span>
            </div>
          </div>
        </div>

        {/* Selected Unit Quick Inspector Bar */}
        {selectedUnitId && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-in">
            {(() => {
              const u = fieldFleet.find(f => f.id === selectedUnitId);
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

      {/* 4. Active Field Unit Fleet Tracker */}
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
                Live crew status, radio frequencies, fuel telemetry, and specialized equipment loadouts
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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      unit.agency === 'NDRF' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      unit.agency === 'EMS' ? 'bg-red-50 text-red-700 border-red-200' :
                      unit.agency === 'FIRE' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {unit.agency}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{unit.callsign}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    unit.status === 'DISPATCHED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    unit.status === 'ON_SCENE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
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

                {/* Equipment Badges */}
                <div className="pt-1 flex flex-wrap gap-1">
                  {unit.equipment.map((eq, i) => (
                    <span key={i} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-600 font-mono">
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
                  onClick={() => alert(`Radio frequency ping dispatched to ${unit.callsign} on ${unit.radioFrequency}`)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded font-semibold text-[11px] transition-colors shadow-xs"
                >
                  Radio Hail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Real-Time & Predictive IoT Monitoring Streams */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
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

          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Telemetry Rate: 1.2s Poll
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_IOT_SENSORS.map((sensor) => (
            <div
              key={sensor.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                  {sensor.sensorType.replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase border ${
                  sensor.status === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                  sensor.status === 'WARNING' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {sensor.status}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 truncate">
                {sensor.name}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {sensor.currentReading}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Trend: <strong>{sensor.trend}</strong>
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                📍 {sensor.location}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Main Split: SOS Distress Triage Queue (Left) & Evacuation Broadcast Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Incoming SOS Triage Queue */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Active SOS Citizen Beacons (Triage & Route)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold">
              Priority 1 Queue
            </span>
          </div>

          <div className="space-y-2.5">
            {sosBeacons.map((beacon) => (
              <div
                key={beacon.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mb-0.5">
                      <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {beacon.beaconCode}
                      </span>
                      <span>·</span>
                      <span className="text-slate-900 font-semibold">{beacon.caller}</span>
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
                      📍 {beacon.locationName}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase shrink-0 ${
                    beacon.status === 'PENDING'
                      ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                      : beacon.status === 'DISPATCHED'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {beacon.status}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div>Trapped Occupants: <strong className="text-slate-900">{beacon.peopleCount} individuals</strong></div>
                  <div>Medical Notes: <span className="text-slate-900 font-medium">{beacon.medicalNotes}</span></div>
                  {beacon.assignedUnit && (
                    <div className="text-emerald-700 font-mono font-semibold pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>✓ Unit Assigned: {beacon.assignedUnit}</span>
                      <span>ETA: ~{beacon.etaMinutes} min</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                  {beacon.status === 'PENDING' ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleDispatchBeacon(beacon.id, 'NDRF Swiftwater Boat Unit #3')}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch NDRF Boat</span>
                      </button>
                      <button
                        onClick={() => handleDispatchBeacon(beacon.id, 'Trauma Ambulance EMS #4')}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span>Dispatch Ambulance</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdvanceBeaconStatus(beacon.id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-md text-xs font-semibold transition-colors"
                    >
                      Advance Status ({beacon.status === 'DISPATCHED' ? 'Mark In-Transit' : 'Mark On-Scene'})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evacuation Broadcast Command Console */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                  Civil Evacuation Transmitter (Multilingual EAS)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">EAS / SMS Relay</span>
            </div>

            {broadcastSent && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Civil Alert broadcast transmitted to {broadcastZone} across English, Hindi & Marathi!</span>
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
                  onChange={(e) => setBroadcastDirective(e.target.value)}
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
                <span>Transmit Official EAS Alert (Siren + Push + SMS)</span>
              </button>
            </form>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
            Automatically triggers cellular cell-broadcast fallback in areas where mobile data networks are severed.
          </div>
        </div>

      </div>

      {/* 7. Citizen-Authority Bridge (Field Incidents AI Verification Queue) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-600" />
            <span className="uppercase tracking-wider font-mono text-slate-700 font-bold">
              Citizen Field Reports & AI Verification Queue
            </span>
          </div>
          <span className="text-slate-500 font-mono">{incidents.length} Reports Logged</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {inc.category}
                    </span>
                    <span className="font-semibold text-slate-900">{inc.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {inc.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    inc.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {inc.severity}
                  </span>
                  {inc.aiVerificationScore && (
                    <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">
                      AI Confidence: {inc.aiVerificationScore}%
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                <span>By: {inc.reportedBy} ({inc.reportedAt})</span>
                <button
                  onClick={() => onVerifyIncident(inc.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono shrink-0 transition-colors ${
                    inc.isVerified
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-white font-semibold'
                  }`}
                >
                  {inc.isVerified ? '✓ Validated by Authority' : 'Approve & Validate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
