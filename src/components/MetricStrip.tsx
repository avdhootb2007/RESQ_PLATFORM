import React from 'react';
import { 
  Wind, 
  Droplets, 
  Gauge, 
  Waves,
  MapPin,
  Clock,
  Activity
} from 'lucide-react';
import { WeatherData, LocationData } from '../types/disaster';

interface MetricStripProps {
  weather: WeatherData;
  location: LocationData;
}

export const MetricStrip: React.FC<MetricStripProps> = ({ weather, location }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      {/* Top contextual row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">{location.regionName}</span>
          <span>·</span>
          <span className="font-mono text-slate-500">{location.zone}</span>
          <span>·</span>
          <span>Elev: <strong className="text-slate-900 font-mono">{location.elevationMeters}m</strong></span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <Clock className="w-3.5 h-3.5 opacity-70" />
          <span>Last telemetry sync: {location.lastUpdated}</span>
        </div>
      </div>

      {/* Structured metrics grid - unified text color slate-900 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        
        {/* Metric 1: Temp */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/90 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500">Surface Temp</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {weather.temperatureC.toFixed(1)}°C
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            H: {weather.highC}° / L: {weather.lowC}°
          </div>
        </div>

        {/* Metric 2: Wind */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/90 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
            <span>Wind Velocity</span>
            <Wind className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {weather.windSpeedKmh} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Gusts: {weather.windGustKmh} km/h ({weather.windDirection})
          </div>
        </div>

        {/* Metric 3: Rain Accumulation */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/90 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
            <span>24h Rainfall</span>
            <Droplets className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {weather.precipitationAccumulationMm} <span className="text-xs font-normal text-slate-500">mm</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Rain prob: {weather.precipitationChancePct}%
          </div>
        </div>

        {/* Metric 4: Barometer */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/90 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
            <span>Barometer</span>
            <Gauge className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {weather.barometricHpa} <span className="text-xs font-normal text-slate-500">hPa</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Rapid depression (Eye)
          </div>
        </div>

        {/* Metric 5: Flood Index (Critical indicator in red) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/90 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
            <span>Flood Risk</span>
            <Waves className="w-3 h-3 text-red-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-red-600 tabular-nums">
            {weather.floodRiskScore}<span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
          <div className="text-[10px] text-red-600 font-mono">
            High low-lying risk
          </div>
        </div>

        {/* Metric 6: Air Quality */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/90 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
            <span>Air Quality</span>
            <Activity className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {weather.aqi} AQI
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {weather.aqiStatus}
          </div>
        </div>

      </div>
    </div>
  );
};
