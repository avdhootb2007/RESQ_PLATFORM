import React, { useState } from 'react';

interface TelemetryPoint {
  day: string;
  date: string;
  temp: number;
  rainMm: number;
  rainChance: number;
  windGustKmh: number;
  condition: string;
  threat: 'Low' | 'Moderate' | 'High' | 'Severe';
}

export const TelemetryChart: React.FC = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(3); // Wednesday

  const dataset: TelemetryPoint[] = [
    { day: 'Sun', date: 'Nov 8', temp: 11, rainMm: 18, rainChance: 65, windGustKmh: 38, condition: 'Showers', threat: 'Moderate' },
    { day: 'Mon', date: 'Nov 9', temp: 13, rainMm: 32, rainChance: 80, windGustKmh: 52, condition: 'Heavy Rain', threat: 'Moderate' },
    { day: 'Tue', date: 'Nov 10', temp: 14, rainMm: 64, rainChance: 90, windGustKmh: 74, condition: 'Gale Squall', threat: 'High' },
    { day: 'Wed', date: 'Nov 11', temp: 10, rainMm: 98, rainChance: 98, windGustKmh: 94, condition: 'Severe Storm Surge', threat: 'Severe' },
    { day: 'Thu', date: 'Nov 12', temp: 19, rainMm: 8, rainChance: 25, windGustKmh: 28, condition: 'Clearing', threat: 'Low' },
    { day: 'Fri', date: 'Nov 13', temp: 12, rainMm: 4, rainChance: 20, windGustKmh: 22, condition: 'Overcast', threat: 'Low' },
  ];

  const activePoint = dataset[selectedDayIndex];

  // Coordinates: Width 600, Height 160
  const minTemp = 8;
  const maxTemp = 22;
  const getX = (i: number) => 50 + i * 100;
  const getY = (t: number) => 135 - ((t - minTemp) / (maxTemp - minTemp)) * 95;

  const pointsStr = dataset.map((d, i) => `${getX(i)},${getY(d.temp)}`).join(' ');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase text-slate-500 tracking-wider">
              Hydrological & Storm Telemetry
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Doppler Radar Station #4</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            6-Day Hazard & Rainfall Accumulation Model
          </h3>
        </div>

        {/* Selected Point Badge */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-500">Focused:</span>
          <span className="font-semibold text-slate-900">{activePoint.day}, {activePoint.date}</span>
          <span className="text-slate-300">·</span>
          <span className={`font-mono font-bold uppercase text-[11px] ${
            activePoint.threat === 'Severe' ? 'text-red-600' : 'text-slate-600'
          }`}>
            {activePoint.threat} Threat
          </span>
        </div>
      </div>

      {/* SVG Chart with Grid lines and Axis */}
      <div className="relative w-full h-44 sm:h-52 bg-slate-50/70 rounded-lg p-2 border border-slate-200 select-none">
        
        {/* Horizontal reference grid lines */}
        <div className="absolute inset-x-8 inset-y-6 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-slate-200 w-full" />
          <div className="border-b border-slate-200 w-full" />
          <div className="border-b border-slate-200 w-full" />
        </div>

        <svg viewBox="0 0 600 170" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Rainfall bars in background */}
          {dataset.map((d, i) => {
            const barHeight = (d.rainMm / 110) * 85;
            const x = getX(i) - 18;
            const y = 145 - barHeight;
            const isSelected = selectedDayIndex === i;
            return (
              <rect
                key={`bar-${i}`}
                x={x}
                y={y}
                width={36}
                height={barHeight}
                rx={4}
                className={`transition-all ${
                  isSelected ? 'fill-slate-300' : 'fill-slate-200/80'
                }`}
              />
            );
          })}

          {/* Spline Area Fill */}
          <polygon
            points={`50,145 ${pointsStr} 550,145`}
            className="fill-slate-200/30"
          />

          {/* Temperature Polyline */}
          <polyline
            points={pointsStr}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {dataset.map((d, i) => {
            const x = getX(i);
            const y = getY(d.temp);
            const isSelected = selectedDayIndex === i;
            return (
              <g key={`pt-${i}`} className="cursor-pointer" onClick={() => setSelectedDayIndex(i)}>
                {isSelected && (
                  <line
                    x1={x}
                    y1={10}
                    x2={x}
                    y2={150}
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4}
                  className={`transition-all ${
                    isSelected ? 'fill-red-600 stroke-2 stroke-white' : 'fill-slate-900 stroke-2 stroke-white'
                  }`}
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className={`text-[12px] font-mono font-bold ${
                    isSelected ? 'fill-red-600' : 'fill-slate-900'
                  }`}
                >
                  {d.temp}°
                </text>
              </g>
            );
          })}
        </svg>

        {/* X-Axis Day Buttons */}
        <div className="absolute inset-x-2 bottom-1 flex justify-between px-3 sm:px-6">
          {dataset.map((d, i) => {
            const isSelected = selectedDayIndex === i;
            return (
              <button
                key={d.day}
                onClick={() => setSelectedDayIndex(i)}
                className={`flex flex-col items-center py-1 px-2 rounded transition-colors text-center ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="text-xs font-mono">{d.day}</span>
                <span className="text-[10px] text-slate-500 font-mono">{d.rainMm}mm</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Telemetry Diagnostics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
          <div className="text-slate-500 text-[10px] uppercase">Condition</div>
          <div className="text-slate-900 font-semibold truncate mt-0.5">{activePoint.condition}</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
          <div className="text-slate-500 text-[10px] uppercase">Rain Probability</div>
          <div className="text-slate-900 font-bold tabular-nums mt-0.5">{activePoint.rainChance}% ({activePoint.rainMm} mm)</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
          <div className="text-slate-500 text-[10px] uppercase">Peak Gusts</div>
          <div className="text-slate-900 font-bold tabular-nums mt-0.5">{activePoint.windGustKmh} km/h</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
          <div className="text-slate-500 text-[10px] uppercase">Civil Protocol</div>
          <div className={`font-semibold truncate mt-0.5 ${
            activePoint.threat === 'Severe' ? 'text-red-600 font-bold' : 'text-slate-900'
          }`}>
            {activePoint.threat === 'Severe' ? 'Mandatory Evacuation' :
             activePoint.threat === 'High' ? 'Standby Advisory' : 'Surveillance Only'}
          </div>
        </div>
      </div>
    </div>
  );
};
