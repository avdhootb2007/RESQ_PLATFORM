import React, { useState } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  Flame, 
  HeartPulse, 
  LifeBuoy, 
  Anchor, 
  Biohazard, 
  Users, 
  Copy, 
  Check, 
  Clock, 
  Send 
} from 'lucide-react';
import { EmergencyServiceContact, LocationData } from '../types/disaster';
import { EMERGENCY_SERVICES } from '../data/mockDisasterData';

interface EmergencyServicesGridProps {
  location: LocationData;
}

export const EmergencyServicesGrid: React.FC<EmergencyServicesGridProps> = ({ location }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dispatchNotice, setDispatchNotice] = useState<{
    serviceName: string;
    ticketId: string;
    etaMinutes: number;
  } | null>(null);

  const getServiceIcon = (category: EmergencyServiceContact['category']) => {
    switch (category) {
      case 'POLICE':
        return <ShieldAlert className="w-5 h-5 text-slate-700" />;
      case 'FIRE_RESCUE':
        return <Flame className="w-5 h-5 text-red-600" />;
      case 'AMBULANCE':
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'DISASTER_FORCE':
        return <LifeBuoy className="w-5 h-5 text-slate-700" />;
      case 'COAST_GUARD':
        return <Anchor className="w-5 h-5 text-slate-700" />;
      case 'POISON_CONTROL':
        return <Biohazard className="w-5 h-5 text-slate-700" />;
      case 'WOMEN_CHILD_HELPLINE':
        return <Users className="w-5 h-5 text-slate-700" />;
      default:
        return <PhoneCall className="w-5 h-5 text-slate-700" />;
    }
  };

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone.replace('tel:', ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateDispatch = (service: EmergencyServiceContact) => {
    const randomTicket = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    setDispatchNotice({
      serviceName: service.name,
      ticketId: randomTicket,
      etaMinutes: service.averageResponseMinutes
    });
    setTimeout(() => {
      setDispatchNotice(null);
    }, 7000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Emergency Services & Hotlines
            </h3>
            <p className="text-xs text-slate-500">
              One-touch direct dialing and rapid dispatch relays
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Location: <span className="text-slate-900 font-mono font-semibold">{location.regionName}</span>
        </div>
      </div>

      {/* Live Dispatch Simulation Toast */}
      {dispatchNotice && (
        <div className="bg-slate-100 border border-slate-300 p-3 rounded-lg text-xs text-slate-900 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-slate-700 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">Dispatch Request Transmitted:</span>{' '}
              {dispatchNotice.serviceName} unit dispatched. Ticket #{dispatchNotice.ticketId}.
            </div>
          </div>
          <span className="font-mono text-slate-900 font-bold shrink-0">
            ETA: ~{dispatchNotice.etaMinutes} mins
          </span>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {EMERGENCY_SERVICES.map((srv) => {
          const isCopied = copiedId === srv.id;
          return (
            <div
              key={srv.id}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 space-y-3 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                      {getServiceIcon(srv.category)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {srv.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                          {srv.shortCode}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {srv.status === 'ONLINE' ? 'Standby Available' :
                           srv.status === 'DISPATCH_READY' ? 'Fast Response' : 'High Traffic'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleCopyPhone(srv.id, srv.shortCode, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-white transition-colors"
                    title="Copy phone number"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {srv.description}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3 opacity-70" />
                  <span>Est. Response: <strong className="text-slate-900 font-semibold">~{srv.averageResponseMinutes} mins</strong></span>
                </div>
              </div>

              {/* Action buttons: Direct Call & Relay Dispatch */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <a
                  href={srv.fullPhone}
                  className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Dial Now</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleSimulateDispatch(srv)}
                  className="py-2 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3 h-3 text-slate-500" />
                  <span>Request Unit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
