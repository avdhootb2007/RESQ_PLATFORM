import React, { useState } from 'react';
import { 
  CloudRain, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  CloudLightning, 
  Eye, 
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';
import { WeatherData } from '../types/disaster';

interface WeatherWidgetProps {
  weather: WeatherData;
  onOpenRadar: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  onOpenRadar,
}) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'HOURLY'>('METRICS');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Atmospheric & Storm Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              Barometric, Doppler radar & hydrological indexes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              activeTab === 'METRICS'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Readings
          </button>
          <button
            onClick={() => setActiveTab('HOURLY')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              activeTab === 'HOURLY'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hourly Wave
          </button>
          <button
            onClick={onOpenRadar}
            className="px-2.5 py-1 text-xs font-semibold text-sky-400 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/80 rounded transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Radar View</span>
          </button>
        </div>
      </div>

      {/* Main Temperature and Primary Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400">
            <CloudLightning className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                {weather.temperatureC.toFixed(1)}°C
              </span>
              <span className="text-xs text-slate-400 font-mono">
                H: {weather.highC}° / L: {weather.lowC}°
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">
              {weather.condition}
            </div>
          </div>
        </div>

        {/* Precipitation probability highlight */}
        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
          <div className="text-right sm:text-left">
            <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Rain Probability
            </div>
            <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">
              {weather.precipitationChancePct}%
            </div>
          </div>
          <div className="text-right sm:text-left pl-3 border-l border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Precip 24h
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {weather.precipitationAccumulationMm} <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'METRICS' ? (
        /* Detailed Metric Grid */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span>Sustained Wind</span>
            </div>
            <div className="text-base font-bold font-mono text-white tabular-nums">
              {weather.windSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h ({weather.windDirection})</span>
            </div>
            <div className="text-[11px] text-amber-300 font-mono">
              Gusts up to {weather.windGustKmh} km/h
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Humidity</span>
            </div>
            <div className="text-base font-bold font-mono text-white tabular-nums">
              {weather.humidityPct}%
            </div>
            <div className="text-[11px] text-slate-400">
              Dewpoint saturated
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-violet-400" />
              <span>Barometer</span>
            </div>
            <div className="text-base font-bold font-mono text-white tabular-nums">
              {weather.barometricHpa} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <div className="text-[11px] text-rose-400 font-mono">
              Rapid pressure fall
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Air Quality (AQI)</span>
            </div>
            <div className="text-base font-bold font-mono text-white tabular-nums">
              {weather.aqi}
            </div>
            <div className={`text-[11px] font-semibold ${
              weather.aqiStatus === 'Good' ? 'text-emerald-400' :
              weather.aqiStatus === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {weather.aqiStatus}
            </div>
          </div>

        </div>
      ) : (
        /* Hourly wave view */
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {weather.hourlyForecast.map((hour, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center space-y-1"
            >
              <div className="text-[11px] text-slate-400 font-mono">{hour.hour}</div>
              <div className="text-sm font-bold font-mono text-white tabular-nums">{hour.tempC}°</div>
              <div className="text-[11px] font-mono text-sky-400">{hour.precipChance}% rain</div>
              <div className="text-[10px] text-slate-400 truncate">{hour.condition}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
