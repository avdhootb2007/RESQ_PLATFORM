import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle,
  ThumbsUp,
  PlusCircle,
  Waves,
  Zap,
  Flame,
  Truck,
  Mountain,
} from 'lucide-react';
import { CommunityIncident } from '../types/disaster';

interface IncidentsFeedProps {
  incidents: CommunityIncident[];
  onOpenReportModal: () => void;
  onUpvoteIncident: (incidentId: string) => void;
}

export const IncidentsFeed: React.FC<IncidentsFeedProps> = ({
  incidents,
  onOpenReportModal,
  onUpvoteIncident,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [upvotedSet, setUpvotedSet] = useState<Set<string>>(new Set());

  const handleUpvote = (id: string) => {
    if (upvotedSet.has(id)) return;
    setUpvotedSet(new Set(upvotedSet).add(id));
    onUpvoteIncident(id);
  };

  const filtered = incidents.filter((inc) => {
    if (filterCategory === 'ALL') return true;
    return inc.category === filterCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FLOODING':
        return <Waves className="w-4 h-4 text-slate-600" />;
      case 'HAZARD':
        return <Zap className="w-4 h-4 text-slate-600" />;
      case 'FIRE':
        return <Flame className="w-4 h-4 text-red-600" />;
      case 'ROAD_BLOCK':
        return <Truck className="w-4 h-4 text-slate-600" />;
      case 'LANDSLIDE':
        return <Mountain className="w-4 h-4 text-amber-700" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getSeverityBadge = (sev: CommunityIncident['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'MEDIUM':
      case 'LOW':
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const getLifecycleBadge = (inc: CommunityIncident) => {
    const status = inc.status ?? (inc.isVerified ? 'VERIFIED' : 'SUBMITTED');
    switch (status) {
      case 'RESOLVED':
        return { label: 'Resolved', cls: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'RESPONDING':
        return { label: 'Responders En Route', cls: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'VERIFIED':
        return { label: 'Authority Verified', cls: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      default:
        return { label: 'Submitted · Pending Review', cls: 'text-amber-800 bg-amber-50 border-amber-200' };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Recent Local Incidents & Citizen–Authority Tracking
            </h3>
            <p className="text-xs text-slate-500">
              Track field reports from submission → AI/Authority verification → response → resolution
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-300" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: 'All Incidents' },
          { id: 'FLOODING', label: 'Flooding' },
          { id: 'ROAD_BLOCK', label: 'Road Blocks' },
          { id: 'LANDSLIDE', label: 'Landslides' },
          { id: 'HAZARD', label: 'Electrical / Gas' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
              filterCategory === c.id
                ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Incident Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
            No incidents reported under this category.
          </div>
        ) : (
          filtered.map((inc) => {
            const hasUpvoted = upvotedSet.has(inc.id);
            const lifecycle = getLifecycleBadge(inc);
            return (
              <div
                key={inc.id}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 sm:p-4 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {getCategoryIcon(inc.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-0.5">
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(inc.severity)}`}>
                          {inc.severity}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono text-slate-900 font-semibold">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {inc.locationName}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-500">{inc.distanceKm} km away</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {inc.title}
                      </h4>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-semibold border px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${lifecycle.cls}`}>
                    <CheckCircle className="w-3 h-3" />
                    {lifecycle.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                  {inc.description}
                </p>

                {inc.photoUrl && (
                  <div className="pl-10">
                    <img
                      src={inc.photoUrl}
                      alt={inc.title}
                      className="h-28 w-44 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}

                {/* Footer metadata & Upvote button */}
                <div className="flex items-center justify-between pl-10 pt-1 text-xs text-slate-500 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 opacity-70" />
                      {inc.reportedAt}
                    </span>
                    <span>·</span>
                    <span>Reported by: <strong className="text-slate-900 font-semibold">{inc.reportedBy}</strong></span>
                  </div>

                  <button
                    onClick={() => handleUpvote(inc.id)}
                    className={`px-2.5 py-1 rounded border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                      hasUpvoted
                        ? 'bg-slate-900 border-slate-900 text-white font-bold'
                        : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                    }`}
                    title="Confirm this incident is active"
                  >
                    <ThumbsUp className="w-3 h-3 text-slate-500" />
                    <span>Confirm ({inc.upvotes})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
