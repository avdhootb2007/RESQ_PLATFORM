import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Camera, Send } from 'lucide-react';
import { CommunityIncident, LocationData } from '../types/disaster';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  onSubmitIncident: (incident: CommunityIncident) => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  location,
  onSubmitIncident,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommunityIncident['category']>('FLOODING');
  const [severity, setSeverity] = useState<CommunityIncident['severity']>('HIGH');
  const [locationName, setLocationName] = useState(`Near ${location.regionName}`);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('Resident Citizen');
  const [hasPhoto, setHasPhoto] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newIncident: CommunityIncident = {
      id: `inc-${Date.now()}`,
      title: title.trim(),
      category,
      severity,
      locationName: locationName.trim(),
      coords: {
        lat: location.coords.lat + (Math.random() - 0.5) * 0.008,
        lng: location.coords.lng + (Math.random() - 0.5) * 0.008,
      },
      distanceKm: 0.8,
      reportedAt: 'Just now',
      reportedBy: reporterName.trim() || 'Verified Observer',
      isVerified: false,
      upvotes: 1,
      description: description.trim(),
    };

    onSubmitIncident(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Report Field Incident or Road Hazard
              </h3>
              <p className="text-xs text-slate-500">
                Broadcast vital road and safety conditions to local responders
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
              Incident Summary Headline:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Submerged Bridge, Fallen Tree, Power Grid Sparking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
                Hazard Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="FLOODING">Severe Flooding</option>
                <option value="ROAD_BLOCK">Road Obstructed / Inaccessible</option>
                <option value="HAZARD">Electrical Line / Gas Hazard</option>
                <option value="FIRE">Structural or Brush Fire</option>
                <option value="STRUCTURAL">Building Wall / Bridge Damage</option>
                <option value="MEDICAL">Stranded Civilians / First Aid</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
                Severity Level:
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="CRITICAL">Critical (Immediate Danger)</option>
                <option value="HIGH">High (Major Obstacle)</option>
                <option value="MEDIUM">Medium (Caution Required)</option>
                <option value="LOW">Low (Informational)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
              Location Landmark or Crossroad:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <MapPin className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Auto-anchored to GPS: {location.coords.lat.toFixed(5)}°, {location.coords.lng.toFixed(5)}°
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
              Detailed Observation / Safety Advice:
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe depth, blocked lanes, alternate routes, and immediate risks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-500" />
              <span className="text-slate-900 font-medium">Attach Verified Photo</span>
            </div>
            <button
              type="button"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`px-2.5 py-1 rounded text-xs border font-medium transition-colors ${
                hasPhoto 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {hasPhoto ? 'Photo Attached (1)' : 'Simulate Camera'}
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-slate-300" />
              <span>Broadcast Incident</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
