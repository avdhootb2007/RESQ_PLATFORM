import React, { useState } from 'react';
import { 
  CloudRain, 
  CloudLightning, 
  Sun, 
  Cloud, 
  Wind, 
  Sparkles 
} from 'lucide-react';

export interface DayForecast {
  day: string;
  temp: number;
  condition: string;
  icon: any;
  threatLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  windKmh: number;
  precipChance: number;
}

interface WaveForecastChartProps {
  onSelectDay?: (day: DayForecast) => void;
}

export const WaveForecastChart: React.FC<WaveForecastChartProps> = ({ onSelectDay }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(3); // Wednesday by default as in screenshot

  const forecastDays: DayForecast[] = [
    { day: 'Sunday', temp: 11, condition: 'Intermittent Rain', icon: CloudRain, threatLevel: 'Moderate', windKmh: 24, precipChance: 65 },
    { day: 'Monday', temp: 13, condition: 'Heavy Showers', icon: CloudRain, threatLevel: 'Moderate', windKmh: 30, precipChance: 80 },
    { day: 'Tuesday', temp: 14, condition: 'Squall Lines', icon: CloudLightning, threatLevel: 'High', windKmh: 45, precipChance: 90 },
    { day: 'Wednesday', temp: 10, condition: 'Severe Storm & Lightning', icon: CloudLightning, threatLevel: 'Severe', windKmh: 68, precipChance: 95 },
    { day: 'Thursday', temp: 19, condition: 'Clearing Clouds', icon: Sun, threatLevel: 'Low', windKmh: 18, precipChance: 20 },
    { day: 'Friday', temp: 12, condition: 'Passing Showers', icon: Cloud, threatLevel: 'Low', windKmh: 14, precipChance: 35 },
  ];

  // SVG coordinate path math for 6 points across width
  // Width 600, Height 140
  // Peak amplitudes corresponding to temperatures and wave visual in screenshot
  const points = [
    { x: 50, y: 95 },
    { x: 150, y: 78 },
    { x: 250, y: 68 },
    { x: 350, y: 98 },
    { x: 450, y: 48 },
    { x: 550, y: 88 },
  ];

  // Catmull-Rom or cubic bezier curve through points
  const pathD = `
    M ${points[0].x} ${points[0].y}
    C 100 85, 120 78, ${points[1].x} ${points[1].y}
    C 180 78, 220 68, ${points[2].x} ${points[2].y}
    C 280 68, 320 98, ${points[3].x} ${points[3].y}
    C 380 98, 420 48, ${points[4].x} ${points[4].y}
    C 480 48, 520 88, ${points[5].x} ${points[5].y}
  `;

  // Area under path for soft glow gradient fill
  const areaD = `${pathD} L 550 140 L 50 140 Z`;

  const selectedPoint = points[selectedIndex];
  const activeDay = forecastDays[selectedIndex];

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    if (onSelectDay) {
      onSelectDay(forecastDays[idx]);
    }
  };

  return (
    <div className="w-full select-none pt-2 pb-1">
      
      {/* Wave Curve Graphic */}
      <div className="relative h-28 sm:h-32 w-full">
        <svg
          viewBox="0 0 600 140"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shaded Area Under Wave */}
          <path d={areaD} fill="url(#waveGlow)" />

          {/* Smooth Glowing Line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glowFilter)"
          />

          {/* Soft secondary ambient line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="8"
            strokeLinecap="round"
            className="blur-sm"
          />

          {/* Vertical light beam at selected point like in screenshot */}
          <line
            x1={selectedPoint.x}
            y1={0}
            x2={selectedPoint.x}
            y2={140}
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Glowing Beacon Star at Selected Point */}
          <circle
            cx={selectedPoint.x}
            cy={selectedPoint.y}
            r="6"
            fill="#ffffff"
            className="filter drop-shadow-[0_0_8px_rgba(255,255,255,1)]"
          />
          <circle
            cx={selectedPoint.x}
            cy={selectedPoint.y}
            r="12"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="animate-pulse"
          />
        </svg>

        {/* Temperature Badges overlay above curve */}
        <div className="absolute inset-x-0 top-1 flex justify-between px-2 sm:px-6 pointer-events-none">
          {forecastDays.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = item.icon;
            return (
              <div
                key={item.day}
                className={`flex flex-col items-center transition-all ${
                  isSelected ? 'scale-110' : 'opacity-80'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-base sm:text-lg font-bold font-mono text-white tracking-tight drop-shadow-md">
                    {item.temp}°
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-white/80'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Days of Week horizontal labels */}
      <div className="flex justify-between items-center px-1 sm:px-5 mt-1 border-t border-white/10 pt-2.5">
        {forecastDays.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={item.day}
              onClick={() => handleSelect(idx)}
              className={`text-xs sm:text-sm font-medium transition-colors cursor-pointer px-1 py-0.5 rounded ${
                isSelected
                  ? 'text-white font-bold underline decoration-white/80 underline-offset-4'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {item.day}
            </button>
          );
        })}
      </div>

    </div>
  );
};
