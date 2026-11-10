import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  Volume2, 
  VolumeX, 
  Share2, 
  Check, 
  MapPin, 
  HeartPulse, 
  Waves, 
  Flame, 
  Home, 
  Radio, 
  ShieldAlert
} from 'lucide-react';
import { ActiveSosState, LocationData } from '../types/disaster';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  sosState: ActiveSosState;
  onActivateSos: (data: {
    emergencyType: string;
    bloodType: string;
    medicalNotes: string;
    peopleCount: number;
  }) => void;
  onDeactivateSos: () => void;
  onToggleSiren: () => void;
  onToggleStrobe: () => void;
}

const EMERGENCY_TYPES = [
  { id: 'TRAPPED_FLOOD', label: 'Trapped by Flood / Water', icon: Waves },
  { id: 'MEDICAL_CRITICAL', label: 'Critical Medical Emergency', icon: HeartPulse },
  { id: 'FIRE_SMOKE', label: 'Fire / Heavy Smoke Entrapment', icon: Flame },
  { id: 'STRUCTURAL_COLLAPSE', label: 'Building Structural Collapse', icon: Home },
  { id: 'GENERAL_RESCUE', label: 'General Life Threat / Extraction', icon: ShieldAlert }
];

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  location,
  sosState,
  onActivateSos,
  onDeactivateSos,
  onToggleSiren,
  onToggleStrobe,
}) => {
  const [selectedType, setSelectedType] = useState('TRAPPED_FLOOD');
  const [bloodType, setBloodType] = useState('O+');
  const [medicalNotes, setMedicalNotes] = useState('Diabetic, carrying infant. Cell battery 45%.');
  const [peopleCount, setPeopleCount] = useState(2);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      onActivateSos({
        emergencyType: selectedType,
        bloodType,
        medicalNotes,
        peopleCount
      });
    }
    return () => clearTimeout(timer);
  }, [countdown, selectedType, bloodType, medicalNotes, peopleCount, onActivateSos]);

  if (!isOpen) return null;

  const startCountdown = () => {
    setCountdown(3);
  };

  const cancelCountdown = () => {
    setCountdown(null);
  };

  const handleShareSos = () => {
    const text = `🚨 RESQ EMERGENCY SOS: Beacon #${sosState.beaconId || 'ACT-911'}. Location: ${location.coords.lat.toFixed(5)}, ${location.coords.lng.toFixed(5)} (${location.regionName}). Status: Dispatch alerted.`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 fill-white text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {sosState.isActive ? 'Active Emergency Distress Beacon' : 'Emergency SOS Dispatch'}
              </h2>
              <p className="text-xs text-slate-500">
                Direct satellite relay to Civil Defense & First Responders
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-900">
          
          {countdown !== null ? (
            /* Countdown Abort Safeguard screen */
            <div className="text-center py-8 space-y-5">
              <div className="text-xs uppercase tracking-widest text-red-600 font-mono font-bold">
                Initiating Priority Emergency Broadcast
              </div>
              <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-500 mx-auto flex items-center justify-center text-4xl font-bold font-mono text-red-600 animate-pulse">
                {countdown}
              </div>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Transmitting GPS coordinates and distress packet to First Responders and designated family safety contacts.
              </p>
              <button
                onClick={cancelCountdown}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg transition-colors"
              >
                Cancel / False Alarm
              </button>
            </div>
          ) : sosState.isActive ? (
            /* ACTIVE SOS VIEW */
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
                <div className="text-xs font-mono text-red-700 uppercase tracking-widest font-bold">
                  Distress Beacon Active · {sosState.workflowStage || 'BROADCASTED'}
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 tracking-wider">
                  {sosState.beaconId}
                </div>
                <div className="text-xs text-slate-600">
                  {sosState.workflowStage && sosState.workflowStage !== 'BROADCASTED' ? (
                    <>
                      Assigned Unit: <strong className="text-emerald-700">{sosState.assignedUnit}</strong>
                      {typeof sosState.etaMinutes === 'number' && sosState.etaMinutes > 0 && (
                        <> · ETA <strong className="text-slate-900">{sosState.etaMinutes} mins</strong></>
                      )}
                    </>
                  ) : (
                    <>Transmitting every 30s · Routed to Authority EOC Triage Queue</>
                  )}
                </div>

                {/* Live 4-step workflow tracker synced with Authority */}
                <div className="grid grid-cols-4 gap-1 pt-2 text-[10px] font-mono">
                  {(['BROADCASTED', 'DISPATCHED', 'IN_TRANSIT', 'ON_SCENE'] as const).map((st, idx) => {
                    const order = ['BROADCASTED', 'DISPATCHED', 'IN_TRANSIT', 'ON_SCENE'];
                    const activeIdx = order.indexOf(sosState.workflowStage || 'BROADCASTED');
                    const done = idx <= activeIdx;
                    return (
                      <div
                        key={st}
                        className={`py-1 px-1 rounded border font-bold ${
                          done
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coordinates & Accuracy */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-900 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    Broadcasted Location:
                  </span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {location.coords.lat.toFixed(5)}°N, {location.coords.lng.toFixed(5)}°E
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 border-t border-slate-200 pt-2">
                  <span>Address / Zone:</span>
                  <span className="text-slate-900 font-medium">{location.regionName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 border-t border-slate-200 pt-2">
                  <span>Emergency Contacts Notified:</span>
                  <span className="text-slate-900 font-semibold">3 Contacts Alerted with Live Map Link</span>
                </div>
              </div>

              {/* Hardware / Distress Audio Tools */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onToggleSiren}
                  className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                    sosState.isSirenPlaying
                      ? 'bg-red-50 border-red-500 text-red-700 animate-pulse font-bold'
                      : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {sosState.isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
                  <span>{sosState.isSirenPlaying ? 'Mute Distress Siren' : 'Sound Audible Siren'}</span>
                </button>

                <button
                  onClick={onToggleStrobe}
                  className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                    sosState.isStrobeActive
                      ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                      : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Radio className="w-4 h-4 text-slate-600" />
                  <span>{sosState.isStrobeActive ? 'Exit Screen Strobe' : 'Screen Rescue Strobe'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleShareSos}
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied to Clipboard' : 'Share SOS Link / SMS'}</span>
                </button>

                <button
                  onClick={onDeactivateSos}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel / Safe Now
                </button>
              </div>
            </div>
          ) : (
            /* PRE-ACTIVATION CONFIGURATION VIEW */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                  1. Select Nature of Emergency:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EMERGENCY_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = selectedType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedType(t.id)}
                        className={`p-3 rounded-lg border text-left text-xs transition-colors flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trapped count & Blood type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    People with You:
                  </label>
                  <select
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                  >
                    <option value={1}>1 Person (Just me)</option>
                    <option value={2}>2 People</option>
                    <option value={3}>3 People</option>
                    <option value={4}>4 People</option>
                    <option value={5}>5+ Group / Family</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Medical Blood Group:
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                  >
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                    <option value="Unknown">Not Specified</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Critical Medical / Rescue Notes:
                </label>
                <textarea
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Trapped on 2nd floor, elderly person with oxygen, water 1ft high..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* GPS broadcast disclaimer */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>GPS fix: {location.coords.lat.toFixed(5)}°, {location.coords.lng.toFixed(5)}°</span>
                <span className="font-mono text-slate-900 font-semibold">Accuracy &plusmn;{location.accuracyMeters}m</span>
              </div>

              <button
                type="button"
                onClick={startCountdown}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 fill-white text-red-600" />
                <span>Trigger Emergency SOS (3s safety hold)</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
