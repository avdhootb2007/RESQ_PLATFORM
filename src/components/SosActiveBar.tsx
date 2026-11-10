import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, XCircle, Share2, Check } from 'lucide-react';
import { ActiveSosState } from '../types/disaster';

interface SosActiveBarProps {
  sosState: ActiveSosState;
  onOpenSosModal: () => void;
  onDeactivateSos: () => void;
  onToggleSiren: () => void;
  onToggleStrobe: () => void;
}

export const SosActiveBar: React.FC<SosActiveBarProps> = ({
  sosState,
  onOpenSosModal,
  onDeactivateSos,
  onToggleSiren,
  onToggleStrobe,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sosState.isActive) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sosState.isActive]);

  if (!sosState.isActive) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyBeacon = () => {
    navigator.clipboard.writeText(`SOS BEACON: ${sosState.beaconId} | Coords: ${sosState.coords.lat}, ${sosState.coords.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-red-600 border-b-2 border-red-700 text-white px-4 py-2.5 shadow-md sticky top-16 z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Active beacon info */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-white animate-ping shrink-0" />
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold tracking-wider uppercase text-red-100 font-mono">
              SOS ACTIVE BEACON:
            </span>
            <button 
              onClick={handleCopyBeacon}
              className="font-mono font-bold bg-red-700/80 px-2 py-0.5 rounded border border-red-500 hover:bg-red-800 transition-colors flex items-center gap-1 text-white"
              title="Click to copy beacon ID"
            >
              <span>{sosState.beaconId}</span>
              {copied ? <Check className="w-3 h-3 text-white" /> : <Share2 className="w-3 h-3 text-red-200" />}
            </button>
            <span className="text-red-200">·</span>
            <span className="font-mono text-white font-semibold tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
            <span className="text-red-200">·</span>
            <span className="font-mono text-[11px] bg-white/15 border border-white/25 px-2 py-0.5 rounded font-bold">
              {sosState.workflowStage === 'ON_SCENE'
                ? `UNIT ON SCENE (${sosState.assignedUnit || 'Rescue Unit'})`
                : sosState.workflowStage === 'IN_TRANSIT'
                ? `IN TRANSIT · ${sosState.assignedUnit || 'Unit'} (~${sosState.etaMinutes ?? 3}m)`
                : sosState.workflowStage === 'DISPATCHED'
                ? `DISPATCHED · ${sosState.assignedUnit || 'Unit'} (~${sosState.etaMinutes ?? 6}m)`
                : `BROADCASTED · Awaiting EOC Dispatch`}
            </span>
            <span className="text-red-100 hidden lg:inline">
              · {sosState.contactsNotifiedCount} Family Contacts Pinged
            </span>
          </div>
        </div>

        {/* Right: Quick distress controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleSiren}
            className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors flex items-center gap-1.5 ${
              sosState.isSirenPlaying 
                ? 'bg-amber-400 text-slate-900 border-amber-300 font-bold' 
                : 'bg-red-700 hover:bg-red-800 border-red-500 text-white'
            }`}
          >
            {sosState.isSirenPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{sosState.isSirenPlaying ? 'Mute Siren' : 'Sound Siren'}</span>
          </button>

          <button
            onClick={onToggleStrobe}
            className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors flex items-center gap-1.5 ${
              sosState.isStrobeActive 
                ? 'bg-white text-slate-900 border-white' 
                : 'bg-red-700 hover:bg-red-800 border-red-500 text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{sosState.isStrobeActive ? 'Stop Strobe' : 'Strobe'}</span>
          </button>

          <button
            onClick={onOpenSosModal}
            className="px-2.5 py-1 text-xs font-medium bg-red-700/70 hover:bg-red-800 border border-red-500 text-white rounded transition-colors"
          >
            Details
          </button>

          <button
            onClick={onDeactivateSos}
            className="px-3 py-1 text-xs font-bold bg-white hover:bg-slate-100 text-red-700 rounded transition-colors flex items-center gap-1 shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>I Am Safe</span>
          </button>
        </div>

      </div>
    </div>
  );
};
