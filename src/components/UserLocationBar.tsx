import React, { useState } from 'react';
import { MapPin, Navigation, Copy, Check, ChevronDown, Compass, AlertCircle } from 'lucide-react';
import { LocationData } from '../types/disaster';
import { REGION_PRESETS } from '../data/mockDisasterData';

interface UserLocationBarProps {
  location: LocationData;
  onUpdateLocation: (newLocation: LocationData) => void;
  onSelectPreset: (presetId: string) => void;
  currentPresetId: string;
}

export const UserLocationBar: React.FC<UserLocationBarProps> = ({
  location,
  onUpdateLocation,
  onSelectPreset,
  currentPresetId,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy, altitude } = pos.coords;
        onUpdateLocation({
          ...location,
          regionName: `Current GPS Fix (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
          zone: 'Local Geolocation Lock',
          coords: { lat: latitude, lng: longitude },
          accuracyMeters: Math.round(accuracy) || 8,
          elevationMeters: altitude ? Math.round(altitude) : 15,
          lastUpdated: 'Live GPS sync'
        });
        setGeoNotice('GPS Lock confirmed. Local hazard layers updated.');
        setTimeout(() => setGeoNotice(null), 4000);
      },
      (err) => {
        setIsLocating(false);
        setGeoNotice(`GPS access unavailable (${err.message}). Using disaster district simulation.`);
        setTimeout(() => setGeoNotice(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCopyCoords = () => {
    const coordString = `${location.coords.lat.toFixed(6)}, ${location.coords.lng.toFixed(6)}`;
    navigator.clipboard.writeText(coordString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Location summary & coordinates */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 border border-slate-700">
            <MapPin className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
              <span className="font-semibold text-slate-200 text-sm">{location.regionName}</span>
              <span>·</span>
              <span className="font-mono text-slate-400">{location.zone}</span>
              <span>·</span>
              <span>Elevation: <strong className="font-mono text-slate-300">{location.elevationMeters}m</strong></span>
              <span>·</span>
              <span>Updated: {location.lastUpdated}</span>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 tabular-nums">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>{location.coords.lat.toFixed(5)}°N, {location.coords.lng.toFixed(5)}°E</span>
                <span className="text-slate-500 text-[10px]">(&plusmn;{location.accuracyMeters}m)</span>
              </div>

              <button
                onClick={handleCopyCoords}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] transition-colors"
                title="Copy coordinates to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy GPS'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: GPS fetch button & Scenario/Region preset switcher */}
        <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 flex-wrap shrink-0">
          <button
            onClick={handleGetDeviceLocation}
            disabled={isLocating}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
          >
            <Navigation className={`w-3.5 h-3.5 text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Use My GPS'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Scenario:</span>
            <select
              value={currentPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {REGION_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {geoNotice && (
        <div className="mt-2 text-xs text-sky-300 bg-sky-950/40 border border-sky-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{geoNotice}</span>
        </div>
      )}
    </div>
  );
};
