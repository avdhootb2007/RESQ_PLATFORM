import React, { useState } from 'react';
import { X, Navigation, Download, Check, ExternalLink } from 'lucide-react';
import { Facility, LocationData } from '../types/disaster';

interface DirectionsModalProps {
  facility: Facility | null;
  onClose: () => void;
  userLocation: LocationData;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  facility,
  onClose,
  userLocation,
}) => {
  const [offlineSaved, setOfflineSaved] = useState(false);

  if (!facility) return null;

  const mockSteps = [
    {
      instruction: `Head East along ${userLocation.zone.split('-')[0]} high ground toward Ridge Parkway.`,
      distance: '400 m',
      warning: null
    },
    {
      instruction: 'AVOID 4th Avenue Railway Underpass (submerged 0.9m). Turn left onto Highland Boulevard instead.',
      distance: '1.2 km',
      warning: 'Hazard Avoided: Flood Water'
    },
    {
      instruction: 'Cross the elevated North Causeway Bridge (open with police escort).',
      distance: '800 m',
      warning: null
    },
    {
      instruction: `Arrive at destination: ${facility.name} (${facility.address}). Enter through Gate B intake.`,
      distance: '200 m',
      warning: null
    }
  ];

  const handleSaveOffline = () => {
    setOfflineSaved(true);
    setTimeout(() => setOfflineSaved(false), 3000);
  };

  const externalMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.coords.lat},${userLocation.coords.lng}&destination=${facility.coords.lat},${facility.coords.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Navigation className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Safe Evacuation Navigation Route
              </h3>
              <p className="text-xs text-slate-500">
                Optimized to bypass flooded underpasses and fallen grid hazards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Destination Summary Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                  Target Destination
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                  {facility.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {facility.address}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {facility.distanceKm} km
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {facility.driveTimeMin} min drive / {facility.walkTimeMin} min walk
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600 text-[11px]">
              <span>Emergency Generator: <strong className="text-slate-900">{facility.features.backupGenerator ? 'Active' : 'N/A'}</strong></span>
              <span>Available Capacity: <strong className="text-slate-900">{facility.capacityTotal - facility.capacityUsed} beds open</strong></span>
            </div>
          </div>

          {/* Turn-by-Turn Route Steps */}
          <div>
            <h5 className="text-slate-700 font-semibold uppercase tracking-wider text-[11px] mb-2.5">
              Turn-by-Turn Safe Pathway:
            </h5>
            <div className="space-y-2">
              {mockSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-3 shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-slate-900 leading-relaxed font-medium">
                      {step.instruction}
                    </p>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500 font-mono">{step.distance}</span>
                      {step.warning && (
                        <span className="text-red-700 font-semibold font-mono bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                          {step.warning}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleSaveOffline}
              className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {offlineSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-slate-600" />}
              <span>{offlineSaved ? 'Route Cached for Offline Use' : 'Save Route for Offline GPS'}</span>
            </button>

            <a
              href={externalMapUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Launch External GPS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
