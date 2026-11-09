import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  CheckSquare, 
  Square, 
  BookOpen, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sun
} from 'lucide-react';
import { LocationData } from '../types/disaster';
import { SURVIVAL_GUIDES, EMERGENCY_KIT_ITEMS } from '../data/mockDisasterData';
import { audioBeacon } from '../utils/audioBeacon';

interface EmergencyToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  onLaunchStrobe: () => void;
}

export const EmergencyToolsModal: React.FC<EmergencyToolsModalProps> = ({
  isOpen,
  onClose,
  location,
  onLaunchStrobe,
}) => {
  const [activeTab, setActiveTab] = useState<'KIT' | 'BROADCAST' | 'GUIDE' | 'SIREN'>('KIT');
  const [kitItems, setKitItems] = useState(EMERGENCY_KIT_ITEMS);
  const [safeStatusNote, setSafeStatusNote] = useState('With family at community high ground. Phone battery 70%.');
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);

  if (!isOpen) return null;

  const toggleKitItem = (id: string) => {
    setKitItems(prev =>
      prev.map(item => item.id === id ? { ...item, isPacked: !item.isPacked } : item)
    );
  };

  const packedCount = kitItems.filter(i => i.isPacked).length;
  const packedPercent = Math.round((packedCount / kitItems.length) * 100);

  const broadcastMessage = `✅ I AM SAFE - RESQ Safety Check: I am safe in ${location.regionName} (GPS: ${location.coords.lat.toFixed(5)}, ${location.coords.lng.toFixed(5)}). Note: ${safeStatusNote} Automated timestamp: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(broadcastMessage);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2500);
  };

  const handleToggleSiren = () => {
    if (isSirenActive) {
      audioBeacon.stop();
      setIsSirenActive(false);
    } else {
      audioBeacon.startSiren(0.3);
      setIsSirenActive(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Radio className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Emergency Readiness & Field Safety Toolkit
              </h3>
              <p className="text-xs text-slate-500">
                Offline protocols, family check-in broadcaster, and survival gear verification
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isSirenActive) {
                audioBeacon.stop();
                setIsSirenActive(false);
              }
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto text-xs">
          {[
            { id: 'KIT', label: `72h Go-Bag (${packedCount}/${kitItems.length})` },
            { id: 'BROADCAST', label: '"I\'m Safe" Broadcast' },
            { id: 'GUIDE', label: 'Survival Protocols' },
            { id: 'SIREN', label: 'Acoustic Distress Siren' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-900">
          
          {activeTab === 'KIT' && (
            /* 72-Hour Survival Go-Bag Checklist */
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Go-Bag Preparedness Score</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">{packedPercent}% Ready</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all duration-300"
                    style={{ width: `${packedPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Keep this emergency kit assembled in a lightweight waterproof backpack near your primary exit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {kitItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleKitItem(item.id)}
                    className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                      item.isPacked
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item.isPacked ? (
                      <CheckSquare className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className={`font-medium ${item.isPacked ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                        {item.name}
                      </div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 mt-0.5 block">
                        Category: {item.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'BROADCAST' && (
            /* "I'm Safe" Message Generator */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  Custom Note for Family & Friends:
                </label>
                <input
                  type="text"
                  value={safeStatusNote}
                  onChange={(e) => setSafeStatusNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Ready-to-Send Emergency Check-in SMS:</span>
                  <span className="text-slate-900 font-mono font-semibold">Verified GPS Attached</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-300 font-mono text-slate-900 text-xs leading-relaxed select-all">
                  {broadcastMessage}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyBroadcast}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {copiedBroadcast ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                  <span>{copiedBroadcast ? 'Copied to Clipboard' : 'Copy Check-in Message'}</span>
                </button>

                <a
                  href={`sms:?&body=${encodeURIComponent(broadcastMessage)}`}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <span>Open SMS App</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'GUIDE' && (
            /* Offline Survival Protocol Cards */
            <div className="space-y-3">
              {SURVIVAL_GUIDES.map(guide => (
                <div
                  key={guide.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2"
                >
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <span>{guide.title}</span>
                  </h4>
                  <p className="text-slate-600 text-xs">
                    {guide.summary}
                  </p>
                  <ul className="space-y-1.5 pt-1 text-slate-600 border-t border-slate-200">
                    {guide.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-900 font-bold shrink-0">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'SIREN' && (
            /* Distress Sound Synthesizer & Optical Beacon */
            <div className="space-y-4 text-center py-4">
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-base font-bold text-slate-900">
                  Acoustic Distress Siren & Rescue Strobe
                </h4>
                <p className="text-slate-600 text-xs">
                  Produces a high-decibel dual-frequency wail using the browser's audio synthesizer. Use when trapped under debris or attracting rescue boats.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={handleToggleSiren}
                  className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                    isSirenActive
                      ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSirenActive ? 'Silence Distress Siren' : 'Trigger Acoustic Siren'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onLaunchStrobe();
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span>Launch Night Screen Strobe</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
