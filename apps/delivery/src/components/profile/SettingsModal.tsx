import React, { useState } from 'react';
import { X, Settings, Bell, Volume2, Smartphone, Trash2, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [orderAlerts, setOrderAlerts] = useState<boolean>(true);
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(true);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(true);
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">App Settings</h2>
              <p className="text-xs text-slate-500">Preferences & app configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Audio & Alert Settings */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Alerts & Audio
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Loud Order Alert Ring</div>
                  <div className="text-[10px] text-slate-500">High volume chime for incoming delivery offers</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderAlerts(!orderAlerts)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  orderAlerts ? 'bg-[#FACC15] justify-end' : 'bg-slate-300 justify-start'
                }`}
                aria-label="Toggle loud order alert ring"
              >
                <div className="w-5 h-5 rounded-full bg-slate-950 shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Volume2 size={16} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Voice Navigation</div>
                  <div className="text-[10px] text-slate-500">Audio directions during active trips</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVoiceGuidance(!voiceGuidance)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  voiceGuidance ? 'bg-[#FACC15] justify-end' : 'bg-slate-300 justify-start'
                }`}
                aria-label="Toggle voice navigation"
              >
                <div className="w-5 h-5 rounded-full bg-slate-950 shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Smartphone size={16} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Vibration on Offer</div>
                  <div className="text-[10px] text-slate-500">Haptic pulse when new request arrives</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHapticFeedback(!hapticFeedback)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  hapticFeedback ? 'bg-[#FACC15] justify-end' : 'bg-slate-300 justify-start'
                }`}
                aria-label="Toggle vibration on offer"
              >
                <div className="w-5 h-5 rounded-full bg-slate-950 shadow-md" />
              </button>
            </div>
          </div>

          {/* System & Cache */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Diagnostics & Storage
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Clear Offline Map & Cache</div>
                <div className="text-[10px] text-slate-500">Frees 42 MB storage without logging out</div>
              </div>
              <button
                onClick={handleClearCache}
                type="button"
                className="px-3.5 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {cacheCleared ? <CheckCircle2 size={13} className="text-emerald-700" /> : <Trash2 size={13} />}
                <span>{cacheCleared ? 'Cleared' : 'Clear'}</span>
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-slate-500 text-[11px]">
              <span>Feedo Delivery Partner</span>
              <span className="font-mono font-semibold">v2.4.1 (Build 419) • Production</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
