import React from 'react';
import { 
  MapPin, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  CloudRain, 
  Cloud,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export interface RegionalStation {
  country: string;
  district: string;
  condition: string;
  temp: number;
  icon: any;
  threatLevel: 'Low' | 'Moderate' | 'High';
  isCurrent?: boolean;
}

interface RightWeatherPanelProps {
  currentLocationName: string;
  temperatureC: number;
  condition: string;
  windSpeedMph: number;
  humidityPct: number;
  pressureKmh: number;
  onSelectStation: (station: RegionalStation) => void;
  role: 'citizen' | 'authority' | 'admin';
}

export const RightWeatherPanel: React.FC<RightWeatherPanelProps> = ({
  currentLocationName,
  temperatureC,
  condition,
  windSpeedMph,
  humidityPct,
  pressureKmh,
  onSelectStation,
  role,
}) => {
  const stations: RegionalStation[] = [
    { country: 'Indonesia', district: 'North Jakarta', condition: 'Storm Fringe', temp: 12, icon: CloudRain, threatLevel: 'Moderate' },
    { country: 'Indonesia', district: 'Bandung', condition: 'River Surge Flooding', temp: 10, icon: Cloud, threatLevel: 'High' },
    { country: 'Indonesia', district: 'South Jakarta', condition: 'Moderate Wind', temp: 14, icon: Sun, threatLevel: 'Low' },
  ];

  return (
    <div className="w-full lg:w-80 xl:w-88 flex flex-col gap-3.5 select-none shrink-0">
      
      {/* 1. Primary Highlight Location Card matching Screenshot */}
      <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-2xl text-white transition-all hover:bg-white/20">
        <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium mb-1">
          <MapPin className="w-4 h-4 text-white" />
          <span className="tracking-wide font-semibold">{currentLocationName}</span>
        </div>

        {/* Big Temperature Display */}
        <div className="flex items-baseline justify-between mt-2">
          <div className="text-5xl sm:text-6xl font-light font-mono tracking-tight text-white drop-shadow-md">
            {Math.round(temperatureC)}°C
          </div>
          <span className="text-xs text-white/70 font-medium capitalize max-w-[110px] text-right">
            {condition}
          </span>
        </div>

        {/* Telemetry pill values line: 19 mph, 40%, 15 km/h */}
        <div className="flex items-center justify-between text-xs text-white/80 font-mono mt-4 pt-3 border-t border-white/15">
          <div className="flex items-center gap-1.5" title="Wind Velocity">
            <Wind className="w-3.5 h-3.5 opacity-80" />
            <span>{windSpeedMph} mph</span>
          </div>

          <div className="flex items-center gap-1.5" title="Relative Humidity">
            <Droplets className="w-3.5 h-3.5 opacity-80" />
            <span>{humidityPct}%</span>
          </div>

          <div className="flex items-center gap-1.5" title="Barometric / Surface Flow">
            <Gauge className="w-3.5 h-3.5 opacity-80" />
            <span>{pressureKmh} km/h</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Locations Stack matching Screenshot */}
      <div className="flex flex-col gap-2.5">
        {stations.map((st) => {
          const Icon = st.icon;
          const isSelected = currentLocationName.toLowerCase().includes(st.district.toLowerCase());
          return (
            <button
              key={st.district}
              onClick={() => onSelectStation(st)}
              className={`w-full p-4 rounded-2xl backdrop-blur-xl border text-left transition-all flex items-center justify-between group ${
                isSelected
                  ? 'bg-white/25 border-white/35 shadow-lg shadow-black/20 text-white'
                  : 'bg-white/10 hover:bg-white/18 border-white/15 text-white/90'
              }`}
            >
              <div>
                <div className="text-[11px] text-white/60 uppercase font-mono tracking-wider">
                  {st.country}
                </div>
                <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                  <span>{st.district}</span>
                  {st.threatLevel === 'High' && (
                    <span className="w-2 h-2 rounded-full bg-rose-400" title="High Threat Alert" />
                  )}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  {st.condition}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-light font-mono text-white tabular-nums">
                  {st.temp}°
                </span>
                <Icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Role-specific quick status pill */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 text-xs text-white/80 space-y-2">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="uppercase text-white/60">System Mode</span>
          <span className="text-emerald-300 font-bold uppercase">{role}</span>
        </div>
        <div className="text-[11px] text-white/70 leading-relaxed">
          {role === 'citizen' && 'Civilian protection mode: Emergency SOS, safe evacuation routing & hotline dispatch enabled.'}
          {role === 'authority' && 'Responder Command: 3 Search & Rescue units active. Levee alert channel synchronized.'}
          {role === 'admin' && 'City Operations: All 14 meteorological and water sensor stations online with 99.8% uptime.'}
        </div>
      </div>

    </div>
  );
};
