import React from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  Map, 
  PhoneCall, 
  Building2, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Users,
  ShieldAlert,
  Activity,
  Send,
  Network,
  Server,
  Droplet
} from 'lucide-react';
import { SupportedLanguage } from '../types/disaster';
import { TRANSLATIONS } from '../utils/translations';

interface NavigationSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: 'citizen' | 'authority' | 'admin';
  setRole: (role: 'citizen' | 'authority' | 'admin') => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeAlertsCount: number;
  language?: SupportedLanguage;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  setActiveTab,
  role,
  setRole,
  isCollapsed,
  setIsCollapsed,
  activeAlertsCount,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language];

  // Role-specific navigation sections
  const getNavSections = () => {
    if (role === 'citizen') {
      return [
        {
          title: 'Citizen Safety',
          items: [
            { id: 'dashboard', label: 'Safety Command Hub', icon: LayoutDashboard },
            { id: 'alerts', label: 'Active Alerts', icon: Radio, count: activeAlertsCount },
            { id: 'map', label: 'Live Map & Safe Routes', icon: Map },
            { id: 'incidents', label: 'Field Hazards', icon: AlertTriangle },
          ]
        },
        {
          title: 'Care & Safe Places',
          items: [
            { id: 'services', label: 'Emergency Hotlines', icon: PhoneCall },
            { id: 'shelters', label: 'Shelters & Blood Banks', icon: Building2 },
          ]
        },
        {
          title: 'Personal & Family',
          items: [
            { id: 'tools', label: 'Survival Toolkit & Go-Bag', icon: CheckSquare },
          ]
        }
      ];
    } else if (role === 'authority') {
      return [
        {
          title: 'EOC Operations',
          items: [
            { id: 'dashboard', label: 'EOC Incident Command', icon: LayoutDashboard },
            { id: 'alerts', label: 'Active Broadcasts', icon: Radio, count: activeAlertsCount },
            { id: 'map', label: 'Tactical Radar & Perimeter', icon: Map },
            { id: 'incidents', label: 'AI Verification Queue', icon: AlertTriangle },
          ]
        },
        {
          title: 'Emergency Response',
          items: [
            { id: 'services', label: 'Dispatch Helplines', icon: PhoneCall },
            { id: 'shelters', label: 'Shelter Evac Capacity', icon: Building2 },
          ]
        },
        {
          title: 'First Responder Tools',
          items: [
            { id: 'tools', label: 'Civil Radio & Siren Deck', icon: CheckSquare },
          ]
        }
      ];
    } else {
      return [
        {
          title: 'Logistics Grid',
          items: [
            { id: 'dashboard', label: 'Multi-Agency Grid', icon: LayoutDashboard },
            { id: 'alerts', label: 'System Directives', icon: Radio, count: activeAlertsCount },
            { id: 'map', label: 'Logistics Resource Map', icon: Map },
            { id: 'incidents', label: 'Reported Deficits', icon: AlertTriangle },
          ]
        },
        {
          title: 'Master Registries',
          items: [
            { id: 'services', label: 'Agency Helplines', icon: PhoneCall },
            { id: 'shelters', label: 'Hospital & Blood Registry', icon: Building2 },
          ]
        },
        {
          title: 'Infrastructure',
          items: [
            { id: 'tools', label: 'System Health & Protocols', icon: CheckSquare },
          ]
        }
      ];
    }
  };

  const navSections = getNavSections();

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-mono font-bold text-sm shadow-xs">
                R
              </div>
              <div>
                <div className="font-bold text-base text-slate-900 tracking-tight leading-none">
                  {t.appName}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  Unified Resilience System
                </div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-mono font-bold text-sm mx-auto">
              R
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Switcher in Sidebar (Citizen, Authority, Admin) */}
        <div className="p-3 border-b border-slate-200">
          {!isCollapsed ? (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                {t.activeConsole}
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setRole('citizen')}
                  className={`py-1 text-xs font-medium rounded transition-colors text-center ${
                    role === 'citizen'
                      ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Citizen Safety & SOS View"
                >
                  Citizen
                </button>
                <button
                  onClick={() => setRole('authority')}
                  className={`py-1 text-xs font-medium rounded transition-colors text-center ${
                    role === 'authority'
                      ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="First Responder & Authority Operations (EOC)"
                >
                  Authority
                </button>
                <button
                  onClick={() => setRole('admin')}
                  className={`py-1 text-xs font-medium rounded transition-colors text-center ${
                    role === 'admin'
                      ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Multi-Agency & Resource Network"
                >
                  Admin
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (role === 'citizen') setRole('authority');
                else if (role === 'authority') setRole('admin');
                else setRole('citizen');
              }}
              className="w-full py-1.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-center uppercase font-bold text-slate-900"
              title={`Switch Mode: Current is ${role}`}
            >
              {role[0].toUpperCase()}
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-2 space-y-4">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!isCollapsed && typeof item.count === 'number' && item.count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
        {!isCollapsed ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Core Network</span>
              <span className="text-slate-900 font-bold">ONLINE</span>
            </div>
            <div className="text-[10px] text-slate-400">Build: 2026.11-PROD · Latency 14ms</div>
          </div>
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto" title="Network Online" />
        )}
      </div>
    </aside>
  );
};
