import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Radio, 
  Languages
} from 'lucide-react';
import { LocationData, SupportedLanguage } from '../types/disaster';
import { REGION_PRESETS } from '../data/mockDisasterData';
import { TRANSLATIONS } from '../utils/translations';

interface EnterpriseHeaderProps {
  location: LocationData;
  onSelectPreset: (presetId: string) => void;
  currentPresetId: string;
  role: 'citizen' | 'authority' | 'admin';
  setRole: (role: 'citizen' | 'authority' | 'admin') => void;
  onOpenSos: () => void;
  isSosActive: boolean;
  onOpenTools: () => void;
  activeAlertsCount: number;
  language: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  userMenu?: React.ReactNode;
}

export const EnterpriseHeader: React.FC<EnterpriseHeaderProps> = ({
  location,
  onSelectPreset,
  currentPresetId,
  role,
  setRole,
  onOpenSos,
  isSosActive,
  onOpenTools,
  activeAlertsCount,
  language,
  onSelectLanguage,
  userMenu,
}) => {
  const [timeString, setTimeString] = useState('');
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 select-none shadow-xs">
      
      {/* Left: Breadcrumbs & Active Hazard Sector */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
          <span className="font-mono text-slate-400 hidden md:inline">RESQ</span>
          <span className="hidden md:inline text-slate-300">/</span>
          <span className="font-semibold text-slate-900">{location.regionName}</span>
          <span className="text-slate-300">/</span>
          <span className={`font-mono text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${
            location.threatLevel === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
            location.threatLevel === 'HIGH' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {location.threatLevel} HAZARD
          </span>
        </div>

        {/* Disaster Scenario Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs">
          <span className="text-slate-500 text-[11px]">Scenario:</span>
          <select
            value={currentPresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
          >
            {REGION_PRESETS.map((p) => (
              <option key={p.id} value={p.id} className="bg-white text-slate-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Language Switcher, Telemetry Time, Safety Tools, and Tactical SOS Trigger */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Multilingual Selector (Feature #13: English / Hindi / Marathi) */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <select
            value={language}
            onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
            className="bg-transparent text-slate-800 text-xs font-semibold px-2 py-1 focus:outline-none cursor-pointer"
            title="Change Interface Language (English / हिंदी / मराठी)"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="mr">मराठी (MR)</option>
          </select>
        </div>

        {/* Live System Time */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 tabular-nums">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{timeString} UTC+7</span>
        </div>

        {/* Safety Tools & Checklist */}
        <button
          onClick={onOpenTools}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          title="Open Readiness Checklist & Survival Guide"
        >
          <Radio className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Safety Deck</span>
        </button>

        {/* Primary SOS Emergency Trigger */}
        <button
          onClick={onOpenSos}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-sm ${
            isSosActive
              ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 fill-white text-red-600 shrink-0" />
          <span>{isSosActive ? t.sosActive : t.emergencySos}</span>
        </button>

        {/* Role Pill Badge */}
        <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs">
          <span className="text-[10px] uppercase font-mono text-slate-400">Role:</span>
          <span className="font-mono font-bold uppercase text-slate-900">{role}</span>
        </div>

        {/* User Account Menu */}
        {userMenu && (
          <div className="pl-2 border-l border-slate-200">
            {userMenu}
          </div>
        )}

      </div>

    </header>
  );
};
