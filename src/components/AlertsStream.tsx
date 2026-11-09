import React, { useState } from 'react';
import { 
  Clock, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  Share2, 
  Check 
} from 'lucide-react';
import { DisasterAlert } from '../types/disaster';
import { audioBeacon } from '../utils/audioBeacon';

interface AlertsStreamProps {
  alerts: DisasterAlert[];
}

export const AlertsStream: React.FC<AlertsStreamProps> = ({ alerts }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(alerts[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity === 'ALL') return true;
    return alert.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: DisasterAlert['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          pill: 'bg-red-50 text-red-700 border-red-200',
          border: 'border-red-200 bg-red-50/30'
        };
      case 'WARNING':
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-200',
          border: 'border-slate-200 bg-white'
        };
      case 'WATCH':
      case 'ADVISORY':
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 border-slate-200',
          border: 'border-slate-200 bg-white'
        };
    }
  };

  const handleTestAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioBeacon.playAlertChirp();
  };

  const handleShareAlert = (alert: DisasterAlert, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🚨 RESQ ALERT: ${alert.headline} (${alert.severity}). Issued: ${alert.issuedAt}. Authority: ${alert.sourceAuthority}.`;
    navigator.clipboard.writeText(text);
    setCopiedId(alert.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Real-Time Hazard & Civil Alerts
            </h3>
            <p className="text-xs text-slate-500">
              Verified transmissions from National Disaster Command & Weather Bureaus
            </p>
          </div>
        </div>

        {/* Severity filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          {['ALL', 'CRITICAL', 'WARNING'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                filterSeverity === s
                  ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s === 'ALL' ? 'All Alerts' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-lg border border-slate-200">
          No active alerts matching current filter level.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isExpanded = expandedId === alert.id;
            const style = getSeverityBadge(alert.severity);

            return (
              <div
                key={alert.id}
                className={`rounded-xl border transition-all ${style.border}`}
              >
                {/* Header row (Click to expand) */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  className="p-3.5 sm:p-4 cursor-pointer hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${style.pill}`}>
                        {alert.severity}
                      </span>
                      <span className="text-slate-600 font-medium">{alert.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 opacity-70" />
                        {alert.issuedAt}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">Radius: {alert.affectedRadiusKm} km</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                      {alert.headline}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {alert.summary}
                    </p>
                  </div>

                  {/* Actions & expand toggle */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {alert.audioWarningAvailable && (
                      <button
                        onClick={handleTestAudio}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Broadcast alert siren sound"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleShareAlert(alert, e)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                      title="Share / Copy alert details"
                    >
                      {copiedId === alert.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    <button
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                      aria-label="Toggle alert details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded instructions & protocols */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-200 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                      <span>Source: <strong className="text-slate-900 font-semibold">{alert.sourceAuthority}</strong></span>
                      <span>Expires: <strong className="text-slate-900 font-semibold">{alert.expiresAt}</strong></span>
                    </div>

                    {/* DOs & DON'Ts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Immediate Actions (DO)</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-600">
                          {alert.instructions.do.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-slate-900 font-bold shrink-0">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-red-700 uppercase tracking-wide text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Prohibited Hazards (DON'T)</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-600">
                          {alert.instructions.dont.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-red-600 font-bold shrink-0">✕</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
