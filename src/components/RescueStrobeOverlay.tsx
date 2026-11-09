import React, { useState, useEffect } from 'react';
import { X, SunMedium, Flame, ShieldAlert } from 'lucide-react';

interface RescueStrobeOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export const RescueStrobeOverlay: React.FC<RescueStrobeOverlayProps> = ({
  isActive,
  onClose,
}) => {
  const [strobeMode, setStrobeMode] = useState<'SOS' | 'RAPID' | 'RED_BLUE'>('SOS');
  const [flashState, setFlashState] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    let intervalMs = 250;
    if (strobeMode === 'RAPID') intervalMs = 120;
    if (strobeMode === 'SOS') intervalMs = 350;

    const timer = setInterval(() => {
      setFlashState((prev) => !prev);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isActive, strobeMode]);

  if (!isActive) return null;

  let bgClass = 'bg-black';
  if (strobeMode === 'RED_BLUE') {
    bgClass = flashState ? 'bg-rose-600' : 'bg-blue-600';
  } else {
    bgClass = flashState ? 'bg-white' : 'bg-slate-950';
  }

  return (
    <div className={`fixed inset-0 z-50 transition-colors duration-75 flex flex-col justify-between p-6 ${bgClass}`}>
      
      {/* Top controls: close button */}
      <div className="flex items-center justify-between">
        <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-mono text-white">
          RESCUE STROBE BEACON ACTIVE (NIGHT SIGNAL)
        </div>
        <button
          onClick={onClose}
          className="bg-black/80 hover:bg-black text-white p-2.5 rounded-xl border border-white/30 shadow-lg flex items-center gap-1.5 text-xs font-bold"
        >
          <X className="w-5 h-5 text-rose-400" />
          <span>Exit Strobe</span>
        </button>
      </div>

      {/* Middle status prompt */}
      <div className="text-center bg-black/60 backdrop-blur-md p-4 rounded-2xl max-w-md mx-auto border border-white/20">
        <p className="text-xs uppercase tracking-widest font-mono text-amber-300 font-bold mb-1">
          Optical Rescue Guidance
        </p>
        <p className="text-sm font-semibold text-white">
          Hold your screen facing outward or toward rescue aircraft / boats.
        </p>
      </div>

      {/* Bottom mode picker */}
      <div className="flex items-center justify-center gap-2 max-w-sm mx-auto bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
        <button
          onClick={() => setStrobeMode('SOS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
            strobeMode === 'SOS' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          SOS Morse Pulse
        </button>
        <button
          onClick={() => setStrobeMode('RAPID')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
            strobeMode === 'RAPID' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          High-Speed Strobe
        </button>
        <button
          onClick={() => setStrobeMode('RED_BLUE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
            strobeMode === 'RED_BLUE' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Red/Blue Emergency
        </button>
      </div>
    </div>
  );
};
