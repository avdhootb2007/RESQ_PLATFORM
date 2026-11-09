import React from 'react';
import { Shield, AlertTriangle, Radio, Compass, PhoneCall } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSos: () => void;
  isSosActive: boolean;
  onOpenTools: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSos,
  isSosActive,
  onOpenTools,
  activeAlertsCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Hub' },
    { id: 'alerts', label: `Alerts (${activeAlertsCount})` },
    { id: 'services', label: 'Emergency Services' },
    { id: 'shelters', label: 'Shelters & Hospitals' },
    { id: 'incidents', label: 'Recent Incidents' },
    { id: 'tools', label: 'Emergency Kit & Guide' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-950">
              <Shield className="w-5 h-5" />
            </div>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="text-left font-bold text-xl tracking-tight text-white hover:text-rose-400 transition-colors whitespace-nowrap"
            >
              RESQ
            </button>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400 pl-1 border-l border-slate-800">
              Disaster Response OS
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'bg-slate-800 text-white font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary SOS trigger + Quick Utility action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenTools}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Open Emergency Toolkit (Flashlight, Siren, Safe Broadcast)"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Safety Tools</span>
            </button>

            <button
              onClick={onOpenSos}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shadow-lg ${
                isSosActive 
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-900/60 ring-2 ring-rose-400' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950 hover:shadow-rose-900/40'
              }`}
            >
              <AlertTriangle className="w-4 h-4 fill-white text-rose-600" />
              <span>{isSosActive ? 'SOS TRANSMITTING' : 'EMERGENCY SOS'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  isActive 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
