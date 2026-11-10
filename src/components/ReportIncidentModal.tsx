import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Camera, Send, WifiOff, Trash2 } from 'lucide-react';
import { CommunityIncident, LocationData } from '../types/disaster';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  reporterLabel?: string;
  isOffline?: boolean;
  onSubmitIncident: (incident: CommunityIncident) => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  location,
  reporterLabel = 'Resident Citizen',
  isOffline = false,
  onSubmitIncident,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommunityIncident['category']>('FLOODING');
  const [severity, setSeverity] = useState<CommunityIncident['severity']>('HIGH');
  const [locationName, setLocationName] = useState(`Near ${location.regionName}`);
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Heuristic AI verification confidence based on photo + description detail + GPS
    const aiScore = Math.min(
      98,
      72 + (photoDataUrl ? 18 : 0) + (description.trim().length > 40 ? 6 : 2)
    );

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
      distanceKm: 0.6,
      reportedAt: 'Just now',
      reportedBy: reporterLabel,
      isVerified: false,
      status: 'SUBMITTED',
      upvotes: 1,
      description: description.trim(),
      photoUrl: photoDataUrl ?? undefined,
      aiVerificationScore: aiScore,
    };

    onSubmitIncident(newIncident);
    setTitle('');
    setDescription('');
    setPhotoDataUrl(null);
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
                Sent directly to Authority AI Verification Queue & Lower-Risk Routing
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
          {isOffline && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Offline Mode active — your report will be saved locally and auto-synced to Authorities when connectivity returns.
              </span>
            </div>
          )}

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
                onChange={(e) => setCategory(e.target.value as CommunityIncident['category'])}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="FLOODING">Severe Flooding</option>
                <option value="ROAD_BLOCK">Road Obstructed / Inaccessible</option>
                <option value="LANDSLIDE">Landslide / Slope Slip</option>
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
                onChange={(e) => setSeverity(e.target.value as CommunityIncident['severity'])}
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

          {/* Real Photo Upload / Camera Capture */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="text-slate-900 font-medium">Attach Hazard Photograph</span>
              </div>
              <label className="px-2.5 py-1 rounded text-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer transition-colors">
                {photoDataUrl ? 'Replace Photo' : 'Upload / Take Photo'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {photoDataUrl && (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
                <img
                  src={photoDataUrl}
                  alt="Incident preview"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl(null)}
                  className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-md hover:bg-slate-900"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
              <span>{isOffline ? 'Queue Report Offline' : 'Broadcast Incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
