import React, { useState } from 'react';
import { 
  Building2, 
  Check, 
  Server, 
  Network, 
  Droplet, 
  Truck, 
  HeartHandshake, 
  Share2, 
  Database, 
  Layers, 
  Plus, 
  Edit3,
  Shield,
  Key,
  Radio,
  BarChart3,
  Cpu,
  AlertTriangle,
  HardDrive
} from 'lucide-react';
import { Facility, MultiOrgResource, SupportedLanguage } from '../types/disaster';
import { MOCK_MULTI_ORG_RESOURCES } from '../data/mockDisasterData';
import { TRANSLATIONS } from '../utils/translations';

interface AdminInterfaceProps {
  facilities: Facility[];
  onUpdateFacility: (updated: Facility) => void;
  language?: SupportedLanguage;
}

export const AdminInterface: React.FC<AdminInterfaceProps> = ({
  facilities,
  onUpdateFacility,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language];
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [editTotalCapacity, setEditTotalCapacity] = useState<number>(500);
  const [editUsedCapacity, setEditUsedCapacity] = useState<number>(300);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [resources, setResources] = useState<MultiOrgResource[]>(MOCK_MULTI_ORG_RESOURCES);

  // Damage Assessment & Relief Optimizer simulation state
  const [simulatedInundationDepth, setSimulatedInundationDepth] = useState<number>(1.2);
  const [droneCorridors, setDroneCorridors] = useState([
    { id: 'DRN-A1', callsign: 'Recon Sky-1', corridor: 'Sector 2 Floodplain Path', batteryPct: 78, status: 'MAPPING', resolution: '4K FLIR' },
    { id: 'DRN-B3', callsign: 'Heavy Lifter-3', corridor: 'Ghat Landslide Corridor', batteryPct: 91, status: 'AIRDROP_READY', resolution: 'LiDAR Terrain' },
    { id: 'DRN-C2', callsign: 'Relief Relay-2', corridor: 'Coastal Harbor Approach', batteryPct: 62, status: 'RADIO_MESH', resolution: 'HD Optical' },
  ]);

  // Infrastructure Telemetry Sensors
  const [infrastructureSensors, setInfrastructureSensors] = useState([
    { id: 'pmp-1', name: 'Harbor Stormwater Pump Station #1', status: 'ONLINE', capacity: '95% Flow', health: 'Nominal', interlock: 'RUNNING' },
    { id: 'gst-1', name: 'Cedar River Crest Ultrasonic Gauge #4', status: 'WARNING', capacity: '+3.2m Peak', health: 'Warning', interlock: 'MONITORING' },
    { id: 'brr-1', name: 'Coastal Surge Barrier Sea Gate', status: 'DEPLOYED', capacity: '100% Barrier', health: 'Secured', interlock: 'LOCKED' },
    { id: 'pwr-1', name: 'Substation 3B Power Grid Interlock', status: 'ISOLATED', capacity: 'De-energized', health: 'Safety Lock', interlock: 'ISOLATED' },
  ]);

  // Agency RBAC & Authorization Directory
  const rbacAgencies = [
    { agency: 'National Disaster Response Force (NDRF)', clearance: 'Level 1 (Full Operational)', keyId: 'API-NDRF-9901', frequency: 'VHF 156.800 MHz (Ch 16)', nodes: 14 },
    { agency: 'State Disaster Management Authority (SDMA)', clearance: 'Level 1 (Full Operational)', keyId: 'API-SDMA-4412', frequency: 'VHF 154.280 MHz', nodes: 28 },
    { agency: 'Indian Red Cross Society / Khalsa Aid', clearance: 'Level 2 (Relief Logistics)', keyId: 'API-NGO-1029', frequency: 'Civil HF 7.150 MHz', nodes: 8 },
    { agency: 'City Municipal Public Works & Water Dept', clearance: 'Level 2 (Civil Infrastructure)', keyId: 'API-MCGM-7721', frequency: 'VHF 153.860 MHz', nodes: 12 },
  ];

  const handleStartEdit = (f: Facility) => {
    setEditingFacilityId(f.id);
    setEditTotalCapacity(f.capacityTotal);
    setEditUsedCapacity(f.capacityUsed);
  };

  const handleSaveFacility = (f: Facility) => {
    const updated: Facility = {
      ...f,
      capacityTotal: editTotalCapacity,
      capacityUsed: editUsedCapacity,
      status: editUsedCapacity >= editTotalCapacity ? 'FULL' : editUsedCapacity >= editTotalCapacity * 0.85 ? 'NEAR_CAPACITY' : 'OPEN'
    };
    onUpdateFacility(updated);
    setEditingFacilityId(null);
    setSaveNotice(`Facility "${f.name}" capacity and reserves synchronized.`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleAdjustBlood = (facilityId: string, group: 'O+' | 'O-' | 'A+' | 'B+' | 'AB+', delta: number) => {
    const fac = facilities.find(f => f.id === facilityId);
    if (!fac || !fac.bloodStock) return;
    const current = fac.bloodStock[group] || 0;
    const updatedStock = {
      ...fac.bloodStock,
      [group]: Math.max(0, current + delta)
    };
    onUpdateFacility({
      ...fac,
      bloodStock: updatedStock
    });
    setSaveNotice(`Updated ${group} reserves at ${fac.name}`);
    setTimeout(() => setSaveNotice(null), 2500);
  };

  const handleAllocateResource = (id: string, targetSector: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, status: 'DEPLOYED', assignedToSector: targetSector } : r));
    setSaveNotice('Resource matched and assigned to target sector.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleTogglePump = (sensorId: string) => {
    setInfrastructureSensors(prev => prev.map(s => {
      if (s.id !== sensorId) return s;
      const nextInterlock = s.interlock === 'RUNNING' ? 'STANDBY' : 'RUNNING';
      return { ...s, interlock: nextInterlock };
    }));
    setSaveNotice('Infrastructure command acknowledged by supervisory control interlock.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  // Calculated estimates based on inundation depth slider
  const estimatedDisplaced = Math.round(simulatedInundationDepth * 28500);
  const estimatedShelterBedsNeeded = Math.round(estimatedDisplaced * 0.35);

  return (
    <div className="space-y-6 pt-1">
      
      {/* 1. Infrastructure Supervisory Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {infrastructureSensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] uppercase text-slate-500 truncate max-w-[140px]">
                {sensor.name.split(' ')[0]}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                sensor.status === 'WARNING'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {sensor.status}
              </span>
            </div>

            <div className="text-sm font-bold text-slate-900 truncate">
              {sensor.name}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200">
              <span>Metric: {sensor.capacity}</span>
              <button
                onClick={() => handleTogglePump(sensor.id)}
                className="text-slate-900 font-semibold hover:underline text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded"
              >
                [{sensor.interlock}]
              </button>
            </div>
          </div>
        ))}
      </div>

      {saveNotice && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* 2. Data-Assisted Damage Assessment & Relief Deployment Planner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Data-Assisted Damage Assessment & Relief Deployment Intelligence
              </h3>
              <p className="text-xs text-slate-500">
                Inundation footprint modeling, displaced population forecasts & aerial drone survey corridors
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            GIS Algorithmic Model v3.1
          </div>
        </div>

        {/* Predictive Simulator Slider */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-mono text-slate-700 font-bold uppercase text-[10px]">
              Simulate Water Crest / Surge Inundation Depth:
            </label>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              +{simulatedInundationDepth.toFixed(1)} meters
            </span>
          </div>

          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={simulatedInundationDepth}
            onChange={(e) => setSimulatedInundationDepth(parseFloat(e.target.value))}
            className="w-full accent-slate-900 cursor-pointer"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Estimated Displaced</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {estimatedDisplaced.toLocaleString()} people
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Shelter Beds Required</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {estimatedShelterBedsNeeded.toLocaleString()} beds
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Critical Structures At Risk</div>
              <div className="text-lg font-bold text-red-600 tabular-nums">
                {Math.round(simulatedInundationDepth * 14)} buildings
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Recommended Staging</div>
              <div className="text-xs font-bold text-slate-900 pt-1">
                Plateau Ridge Grounds
              </div>
            </div>
          </div>
        </div>

        {/* Aerial Survey Drone Corridors */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold text-slate-600 uppercase flex items-center justify-between">
            <span>Aerial UAV Survey & Mesh Flight Corridors</span>
            <span>3 Drones Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {droneCorridors.map((drone) => (
              <div key={drone.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-slate-900">{drone.callsign}</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                    {drone.status}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] truncate">Path: {drone.corridor}</div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                  <span>Sensor: {drone.resolution}</span>
                  <span>Battery: <strong>{drone.batteryPct}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Multi-Organization Network Coordination (Authorities, Hospitals, NGOs, Suppliers) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {t.multiOrg} (Resource Matching Matrix)
              </h3>
              <p className="text-xs text-slate-500">
                Cross-agency coordination: Authorities, Hospitals, NGOs, and Food/Water Logistics
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            5 Active Coalition Nodes
          </span>
        </div>

        {/* Resource Allocation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase border ${
                    res.orgType === 'AUTHORITY' ? 'bg-slate-200 text-slate-800 border-slate-300' :
                    res.orgType === 'HOSPITAL' ? 'bg-red-50 text-red-700 border-red-200' :
                    res.orgType === 'NGO' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {res.orgType}
                  </span>
                  <span className={`font-mono text-[10px] font-bold ${
                    res.status === 'DEPLOYED' ? 'text-emerald-700' :
                    res.status === 'EN_ROUTE' ? 'text-amber-700' : 'text-slate-600'
                  }`}>
                    ● {res.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 pt-0.5">
                  {res.orgName}
                </h4>
                <div className="text-xs font-mono font-semibold text-slate-800">
                  {res.availableQty}
                </div>
                <div className="text-[11px] text-slate-500">
                  Target Sector: <strong className="text-slate-800">{res.assignedToSector}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleAllocateResource(res.id, 'Sector 2 Floodplain Core')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition-colors shadow-xs"
                >
                  Re-assign Sector
                </button>
                <span className="text-[10px] text-slate-400 font-mono">Matched</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Safe Places & Blood Bank Registry & Capacity Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Master Facilities, Shelters & Blood Bank Registry
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {facilities.length} Registered Infrastructure Nodes
          </span>
        </div>

        <div className="space-y-3">
          {facilities.map((fac) => {
            const isEditing = editingFacilityId === fac.id;
            const occupancyPct = Math.round((fac.capacityUsed / fac.capacityTotal) * 100);

            return (
              <div
                key={fac.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                        fac.type === 'BLOOD_BANK' ? 'bg-red-50 text-red-700 border-red-200' :
                        fac.type === 'HOSPITAL' ? 'bg-slate-200 text-slate-800 border-slate-300' :
                        'bg-white text-slate-700 border-slate-200'
                      }`}>
                        {fac.type}
                      </span>
                      <span>·</span>
                      <span className="text-sm font-bold text-slate-900">{fac.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {fac.address} · Phone: {fac.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-slate-900 font-semibold tabular-nums">
                      {fac.capacityUsed} / {fac.capacityTotal} Capacity ({occupancyPct}%)
                    </span>
                    <button
                      onClick={() => isEditing ? handleSaveFacility(fac) : handleStartEdit(fac)}
                      className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold transition-colors ${
                        isEditing
                          ? 'bg-slate-900 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                      }`}
                    >
                      {isEditing ? 'Save Limits' : 'Edit Limits'}
                    </button>
                  </div>
                </div>

                {/* If blood bank, show interactive blood reserves adjustment */}
                {fac.bloodStock && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-red-600" />
                        Blood & Plasma Inventory Controls:
                      </span>
                      <button
                        onClick={() => alert(`Emergency Blood Drive Notification broadcast to registered donors in ${fac.name} zone.`)}
                        className="text-[10px] font-mono text-red-700 hover:text-red-800 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded"
                      >
                        + Issue Urgent Blood Call
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                      {(['O+', 'O-', 'A+', 'B+', 'AB+'] as const).map((group) => {
                        const units = fac.bloodStock ? fac.bloodStock[group] : 0;
                        const isCritical = units < 15;
                        return (
                          <div key={group} className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase">{group}</span>
                            <span className={`text-base font-bold my-0.5 ${isCritical ? 'text-red-600' : 'text-slate-900'}`}>
                              {units} u
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleAdjustBlood(fac.id, group, -1)}
                                className="w-5 h-5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleAdjustBlood(fac.id, group, 1)}
                                className="w-5 h-5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 bg-white p-3 rounded-lg">
                    <div>
                      <label className="block text-slate-600 text-[10px] font-mono uppercase mb-1 font-semibold">
                        Total Capacity (Beds / Units):
                      </label>
                      <input
                        type="number"
                        value={editTotalCapacity}
                        onChange={(e) => setEditTotalCapacity(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-[10px] font-mono uppercase mb-1 font-semibold">
                        Occupied Intake:
                      </label>
                      <input
                        type="number"
                        value={editUsedCapacity}
                        onChange={(e) => setEditUsedCapacity(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                    <span>Power Generator: <strong className="text-slate-900">{fac.features.backupGenerator ? 'Active' : 'N/A'}</strong></span>
                    <span>Clean Water: <strong className="text-slate-900">{fac.features.cleanWater ? 'Supplied' : 'Pending'}</strong></span>
                    <span>Medical Staff: <strong className="text-slate-900">{fac.features.medicalStaff ? 'On Duty' : 'On Call'}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Agency Role-Based Access Control (RBAC) & VHF Radio Directory */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Agency Role-Based Access Control (RBAC) & VHF Frequency Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Encrypted responder credential tokens, API gateways, and emergency radio spectrum allocations
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
            TLS 1.3 / mTLS Enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 font-mono text-[10px] uppercase text-slate-500">
                <th className="pb-2 font-semibold">Authorized Agency / Org</th>
                <th className="pb-2 font-semibold">Clearance Tier</th>
                <th className="pb-2 font-semibold">Radio Channel</th>
                <th className="pb-2 font-semibold">Mesh Nodes</th>
                <th className="pb-2 font-semibold">API Gateway Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rbacAgencies.map((agency) => (
                <tr key={agency.agency} className="text-slate-700">
                  <td className="py-2.5 font-bold text-slate-900 pr-2">{agency.agency}</td>
                  <td className="py-2.5 font-mono text-[11px] text-slate-600">{agency.clearance}</td>
                  <td className="py-2.5 font-mono text-[11px] font-bold text-slate-800">{agency.frequency}</td>
                  <td className="py-2.5 font-mono text-[11px] text-slate-600">{agency.nodes} connected</td>
                  <td className="py-2.5 font-mono text-[10px] text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {agency.keyId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Platform Resiliency, Offline Sync & Cellular Gateways */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
          <span className="uppercase text-slate-700 flex items-center gap-1.5 font-bold">
            <Server className="w-3.5 h-3.5 text-slate-600" />
            RESQ Platform Health, Offline Sync & Cellular Gateways
          </span>
          <span className="text-emerald-700 font-bold">All 6 Gateway Clusters Healthy</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
          EAS Broadcast Latency: 120ms · Offline Sync Engine: 0 items pending · Geolocation Accuracy: ±5m · Cellular SMS Fallback: 100% Ready.
        </p>
      </div>

    </div>
  );
};
