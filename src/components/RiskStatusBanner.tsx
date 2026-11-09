import React from 'react';
import { 
  AlertTriangle, 
  Wind, 
  ExternalLink,
  Flame,
  Waves
} from 'lucide-react';
import { LocationData, WeatherData } from '../types/disaster';

interface RiskStatusBannerProps {
  location: LocationData;
  weather: WeatherData;
  onViewEvacuationMap: () => void;
}

export const RiskStatusBanner: React.FC<RiskStatusBannerProps> = ({
  location,
  weather,
  onViewEvacuationMap,
}) => {
  const getHazardIcon = () => {
    switch (location.primaryHazard) {
      case 'CYCLONE':
        return <Wind className="w-5 h-5 text-slate-600" />;
      case 'FLOOD':
        return <Waves className="w-5 h-5 text-slate-600" />;
      case 'WILDFIRE':
        return <Flame className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-600" />;
    }
  };

  const isMandatory = location.evacuationStatus === 'MANDATORY';
  const isCritical = location.threatLevel === 'CRITICAL';

  return (
    <div className={`rounded-xl border p-4 sm:p-5 shadow-sm ${
      isCritical ? 'bg-red-50/60 border-red-200' : 'bg-white border-slate-200'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Hazard status & Evacuation protocol */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border font-mono ${
              isCritical
                ? 'bg-red-100 text-red-700 border-red-200'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              {location.threatLevel === 'CRITICAL' ? 'LEVEL 4 - CRITICAL HAZARD' :
               location.threatLevel === 'HIGH' ? 'LEVEL 3 - HIGH THREAT' :
               'LEVEL 2 - ADVISORY'}
            </span>

            <span className="text-xs text-slate-500">
              Primary Hazard: <strong className="text-slate-900 font-semibold">{location.primaryHazard}</strong>
            </span>

            <span className="text-slate-300">·</span>

            <span className={`text-xs font-semibold ${
              isMandatory ? 'text-red-600 underline decoration-red-400' : 'text-slate-800'
            }`}>
              Evacuation: {location.evacuationStatus}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {getHazardIcon()}
            <span>{weather.condition} in {location.regionName}</span>
          </h2>

          {location.evacuationZone && (
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              <span>Designated Sector: </span>
              <strong className="text-slate-900">{location.evacuationZone}</strong>. If you are in ground-level premises or flood fringe zones, initiate designated evacuation checklist.
            </p>
          )}
        </div>

        {/* Right: Key quantitative risk gauges & Evac action */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="px-2">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Flood Risk</div>
              <div className="text-sm sm:text-base font-bold font-mono text-red-600 tabular-nums">
                {weather.floodRiskScore}/100
              </div>
            </div>
            <div className="px-2 border-x border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Wind Peak</div>
              <div className="text-sm sm:text-base font-bold font-mono text-slate-900 tabular-nums">
                {weather.windGustKmh} <span className="text-[10px] font-normal text-slate-500">km/h</span>
              </div>
            </div>
            <div className="px-2">
              <div className="text-[10px] text-slate-500 uppercase font-mono">24h Precip</div>
              <div className="text-sm sm:text-base font-bold font-mono text-slate-900 tabular-nums">
                {weather.precipitationAccumulationMm} <span className="text-[10px] font-normal text-slate-500">mm</span>
              </div>
            </div>
          </div>

          <button
            onClick={onViewEvacuationMap}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <span>Evacuation Map & Shelters</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
