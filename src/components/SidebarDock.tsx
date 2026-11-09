import React from 'react';
import { 
  Waves, 
  LayoutGrid, 
  Radio, 
  Map, 
  Calendar, 
  Settings, 
  LogOut,
  Shield,
  LifeBuoy
} from 'lucide-react';

interface SidebarDockProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenTools: () => void;
  role: 'citizen' | 'authority' | 'admin';
  setRole: (role: 'citizen' | 'authority' | 'admin') => void;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  activeView,
  setActiveView,
  onOpenTools,
  role,
  setRole,
}) => {
  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview' },
    { id: 'radar', icon: Radio, label: 'Radar & Alerts' },
    { id: 'map', icon: Map, label: 'Map & Shelters' },
    { id: 'timeline', icon: Calendar, label: 'Timeline & Forecast' },
  ];

  const cycleRole = () => {
    if (role === 'citizen') setRole('authority');
    else if (role === 'authority') setRole('admin');
    else setRole('citizen');
  };

  return (
    <aside className="w-16 sm:w-20 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col items-center justify-between py-6 shrink-0 z-30 select-none">
      
      {/* Top Brand Spiral / Wave Logo */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setActiveView('overview')}
          className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all shadow-lg shadow-black/40 group"
          title="RESQ Disaster OS"
        >
          {/* Stylized circular wave spiral mark like in screenshot */}
          <div className="relative flex items-center justify-center">
            <Waves className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </div>
        </button>

        {/* Primary Navigation Icons */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-white/20 text-white border border-white/30 shadow-md shadow-black/20'
                    : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}

          <button
            onClick={onOpenTools}
            className="w-11 h-11 rounded-xl text-white/60 hover:text-white hover:bg-white/10 border border-transparent flex items-center justify-center transition-all"
            title="Safety Tools & Emergency Guides"
          >
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {/* Bottom Role Switch & Quick Action */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={cycleRole}
          className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all"
          title={`Active Interface: ${role.toUpperCase()} (Click to cycle)`}
        >
          <LogOut className="w-4 h-4 rotate-180" />
        </button>
      </div>

    </aside>
  );
};
