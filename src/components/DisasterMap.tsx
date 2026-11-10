import React, { useState } from 'react';
import { 
  Layers, 
  Building2, 
  HeartPulse, 
  AlertTriangle, 
  Navigation, 
  ZoomIn, 
  ZoomOut,
  Droplet,
  Route
} from 'lucide-react';
import { Facility, CommunityIncident, LocationData } from '../types/disaster';

interface DisasterMapProps {
  location: LocationData;
  facilities: Facility[];
  incidents: CommunityIncident[];
  onSelectFacility: (facility: Facility) => void;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  location,
  facilities,
  incidents,
  onSelectFacility,
}) => {
  const [activeLayers, setActiveLayers] = useState({
    threatZones: true,
    shelters: true,
    hospitals: true,
    bloodBanks: true,
    incidents: true,
    safeRoutes: true,
  });

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'facility' | 'incident' | 'user';
    data: any;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const userLat = location.coords.lat;
  const userLng = location.coords.lng;

  const getPositionStyle = (lat: number, lng: number) => {
    const deltaLat = (lat - userLat) * 3500 * zoomLevel;
    const deltaLng = (lng - userLng) * 3500 * zoomLevel;

    const left = 50 + deltaLng;
    const top = 50 - deltaLat;

    return {
      left: `${Math.max(8, Math.min(92, left))}%`,
      top: `${Math.max(8, Math.min(92, top))}%`,
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      
      {/* Top Map Header & Layer Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Interactive Live Risk Map & Asset Radar
            </h3>
            <p className="text-xs text-slate-500">
              Live spatial tracking of evacuation perimeters, shelters, blood banks, hazards & lower-risk routes
            </p>
          </div>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => toggleLayer('threatZones')}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              activeLayers.threatZones
                ? 'bg-red-50 border-red-200 text-red-700 font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600'
            }`}
          >
            Hazard Zones
          </button>
          <button
            onClick={() => toggleLayer('shelters')}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              activeLayers.shelters
                ? 'bg-slate-900 border-slate-900 text-white font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600'
            }`}
          >
            Shelters ({facilities.filter(f => f.type === 'SHELTER').length})
          </button>
          <button
            onClick={() => toggleLayer('hospitals')}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              activeLayers.hospitals
                ? 'bg-slate-900 border-slate-900 text-white font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600'
            }`}
          >
            Hospitals ({facilities.filter(f => f.type === 'HOSPITAL').length})
          </button>
          <button
            onClick={() => toggleLayer('bloodBanks')}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              activeLayers.bloodBanks
                ? 'bg-red-600 border-red-600 text-white font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600'
            }`}
          >
            Blood Banks ({facilities.filter(f => f.type === 'BLOOD_BANK').length})
          </button>
          <button
            onClick={() => toggleLayer('incidents')}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              activeLayers.incidents
                ? 'bg-slate-900 border-slate-900 text-white font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600'
            }`}
          >
            Hazards ({incidents.length})
          </button>
          <button
            onClick={() => toggleLayer('safeRoutes')}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              activeLayers.safeRoutes
                ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600'
            }`}
          >
            Safe Routes
          </button>
        </div>
      </div>

      {/* Main Tactical Map Viewport */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
        
        {/* Map Grid overlay lines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #94a3b8 1px, transparent 1px),
              linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Radar Range Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-48 h-48 rounded-full border border-slate-400" />
          <div className="w-80 h-80 rounded-full border border-slate-400 absolute" />
          <div className="w-[450px] h-[450px] rounded-full border border-slate-400 absolute" />
        </div>

        {/* Feature 8: Lower-Risk Safe Route Pathway Overlay (SVG) */}
        {activeLayers.safeRoutes && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Safe Route Polyline bypassing submerged underpasses */}
            <polyline
              points="280,240 320,200 370,180 430,160 480,120"
              fill="none"
              stroke="#059669"
              strokeWidth="4"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
            {/* Blocked Pathway Red Cross Marker */}
            <line x1="320" y1="260" x2="360" y2="290" stroke="#dc2626" strokeWidth="4" />
            <line x1="320" y1="290" x2="360" y2="260" stroke="#dc2626" strokeWidth="4" />
          </svg>
        )}

        {/* Simulated Hazard Threat Zone polygons */}
        {activeLayers.threatZones && (
          <>
            <div 
              className="absolute w-72 h-72 rounded-full bg-red-500/10 border-2 border-dashed border-red-500/60 pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ left: '55%', top: '48%' }}
            >
              <div className="absolute top-2 left-6 text-[10px] font-mono uppercase font-bold text-red-700 bg-white/90 px-2 py-0.5 rounded border border-red-200 shadow-xs">
                Evacuation Perimeter (Zone A - High Surge)
              </div>
            </div>

            <div 
              className="absolute w-60 h-28 -rotate-12 bg-slate-300/40 border border-slate-400/50 rounded-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ left: '42%', top: '65%' }}
            >
              <div className="absolute bottom-2 right-4 text-[9px] font-mono uppercase text-slate-600 bg-white/80 px-1 rounded">
                Storm Drainage Corridor (Surcharged)
              </div>
            </div>
          </>
        )}

        {/* User GPS Pin (Center) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
          style={getPositionStyle(location.coords.lat, location.coords.lng)}
          onClick={() => setSelectedEntity({ type: 'user', data: location })}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-slate-400/30 animate-ping absolute" />
            <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-md relative z-10" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-5 whitespace-nowrap bg-white text-[10px] font-mono font-bold text-slate-900 px-2 py-0.5 rounded border border-slate-200 shadow-xs">
            You ({location.coords.lat.toFixed(4)}°)
          </div>
        </div>

        {/* Shelter Markers */}
        {activeLayers.shelters && facilities.filter(f => f.type === 'SHELTER').map((shelter) => {
          const isSelected = selectedEntity?.data?.id === shelter.id;
          return (
            <div
              key={shelter.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 group"
              style={getPositionStyle(shelter.coords.lat, shelter.coords.lng)}
              onClick={() => setSelectedEntity({ type: 'facility', data: shelter })}
            >
              <div className={`p-1.5 rounded-lg text-white shadow-md transition-transform ${
                isSelected 
                  ? 'bg-slate-900 scale-125 ring-2 ring-slate-400' 
                  : 'bg-slate-800 hover:bg-slate-900 hover:scale-110'
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-8 whitespace-nowrap bg-white text-[10px] text-slate-900 px-2 py-1 rounded shadow-md border border-slate-200 z-30 font-semibold">
                <span>{shelter.name}</span> · {shelter.distanceKm}km
              </div>
            </div>
          );
        })}

        {/* Hospital Markers */}
        {activeLayers.hospitals && facilities.filter(f => f.type === 'HOSPITAL').map((hosp) => {
          const isSelected = selectedEntity?.data?.id === hosp.id;
          return (
            <div
              key={hosp.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 group"
              style={getPositionStyle(hosp.coords.lat, hosp.coords.lng)}
              onClick={() => setSelectedEntity({ type: 'facility', data: hosp })}
            >
              <div className={`p-1.5 rounded-lg text-slate-900 bg-white border border-slate-300 shadow-md transition-transform ${
                isSelected 
                  ? 'scale-125 ring-2 ring-slate-400' 
                  : 'hover:scale-110'
              }`}>
                <HeartPulse className="w-4 h-4 text-red-600" />
              </div>
              <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-8 whitespace-nowrap bg-white text-[10px] text-slate-900 px-2 py-1 rounded shadow-md border border-slate-200 z-30 font-semibold">
                <span>{hosp.name}</span> · {hosp.distanceKm}km
              </div>
            </div>
          );
        })}

        {/* Feature 7: Blood Bank Markers */}
        {activeLayers.bloodBanks && facilities.filter(f => f.type === 'BLOOD_BANK').map((bb) => {
          const isSelected = selectedEntity?.data?.id === bb.id;
          return (
            <div
              key={bb.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 group"
              style={getPositionStyle(bb.coords.lat, bb.coords.lng)}
              onClick={() => setSelectedEntity({ type: 'facility', data: bb })}
            >
              <div className={`p-1.5 rounded-lg text-white bg-red-600 shadow-md transition-transform ${
                isSelected 
                  ? 'scale-125 ring-2 ring-white' 
                  : 'hover:scale-110'
              }`}>
                <Droplet className="w-4 h-4" />
              </div>
              <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-8 whitespace-nowrap bg-white text-[10px] text-slate-900 px-2 py-1 rounded shadow-md border border-slate-200 z-30 font-semibold">
                <span>{bb.name}</span> (Blood Bank) · {bb.distanceKm}km
              </div>
            </div>
          );
        })}

        {/* Incident Hazard Markers */}
        {activeLayers.incidents && incidents.map((inc) => {
          const isSelected = selectedEntity?.data?.id === inc.id;
          return (
            <div
              key={inc.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 group"
              style={getPositionStyle(inc.coords.lat, inc.coords.lng)}
              onClick={() => setSelectedEntity({ type: 'incident', data: inc })}
            >
              <div className={`p-1.5 rounded-lg text-white shadow-md transition-transform ${
                isSelected 
                  ? 'bg-red-700 scale-125 ring-2 ring-red-400' 
                  : 'bg-red-600 hover:scale-110'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-8 whitespace-nowrap bg-white text-[10px] text-slate-900 px-2 py-1 rounded shadow-md border border-slate-200 z-30 font-semibold">
                <span>{inc.title}</span>
              </div>
            </div>
          );
        })}

        {/* Map On-Screen Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center transition-colors shadow-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center transition-colors shadow-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center transition-colors shadow-xs text-[10px] font-mono font-bold"
            title="Reset Zoom"
          >
            1x
          </button>
        </div>

        {/* Selected Entity Popup Sheet inside Map */}
        {selectedEntity && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-white/95 border border-slate-300 p-3.5 rounded-xl shadow-xl z-30 text-xs animate-fade-in text-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  {selectedEntity.type === 'user' ? 'Current User Location' :
                   selectedEntity.type === 'facility' ? selectedEntity.data.type : 'Hazard Incident'}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedEntity.type === 'user' ? selectedEntity.data.regionName :
                   selectedEntity.type === 'facility' ? selectedEntity.data.name : selectedEntity.data.title}
                </h4>
                {selectedEntity.type === 'facility' && (
                  <p className="text-slate-600 mt-0.5">
                    {selectedEntity.data.address} · {selectedEntity.data.distanceKm} km away ({selectedEntity.data.driveTimeMin} min drive)
                  </p>
                )}
                {selectedEntity.type === 'incident' && (
                  <div className="space-y-1.5 mt-1">
                    <p className="text-slate-600">{selectedEntity.data.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold">
                        Status: {selectedEntity.data.status || (selectedEntity.data.isVerified ? 'VERIFIED' : 'SUBMITTED')}
                      </span>
                      {selectedEntity.data.aiVerificationScore && (
                        <span className="text-emerald-700 font-semibold">
                          AI Confidence: {selectedEntity.data.aiVerificationScore}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {selectedEntity.type === 'facility' && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200">
                <button
                  onClick={() => onSelectFacility(selectedEntity.data)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-slate-300" />
                  <span>Get Safe Route</span>
                </button>
                <span className="font-mono text-slate-700 font-semibold">
                  {selectedEntity.data.type === 'BLOOD_BANK' ? 'Blood Reserves Online' : `${selectedEntity.data.capacityTotal - selectedEntity.data.capacityUsed} beds open`}
                </span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
