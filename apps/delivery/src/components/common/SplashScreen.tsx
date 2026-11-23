import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeState, setFadeState] = useState<'enter' | 'active' | 'exit'>('enter');

  useEffect(() => {
    // Fade in
    const t1 = setTimeout(() => setFadeState('active'), 100);
    // Begin exit
    const t2 = setTimeout(() => setFadeState('exit'), 2000);
    // Finish callback
    const t3 = setTimeout(() => onFinish(), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-[#F8F9FA] transition-opacity duration-500 font-sans ${
        fadeState === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full" />

      {/* Center Animated Logo & Branding */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
        {/* Feedo Emblem Logo */}
        <div className="relative">
          {/* Subtle Outer Warm Glow Ring */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/40 to-yellow-300/40 rounded-full blur-2xl opacity-60 animate-pulse pointer-events-none" />

          <img
            src="/brand/feedo-logo.png"
            alt="Feedo Logo"
            className="relative w-32 h-32 object-contain drop-shadow-[0_12px_30px_rgba(250,204,21,0.45)] animate-fade-in select-none"
          />
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              FEEDO
            </h1>
            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 uppercase">
              DELIVERY PARTNER
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
            Delivery Partner Fleet
          </p>
        </div>

        {/* Brand Philosophy */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-[10px] font-black text-amber-900 shadow-xs tracking-wider uppercase">
            <Sparkles size={11} className="text-amber-600" />
            <span>Drive Less • Deliver Smarter • Earn Clearly</span>
          </div>
        </div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-xs space-y-2 text-center pb-6">
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#FACC15] animate-[pulse_1.5s_infinite] w-full" />
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
          Initializing Secure Session...
        </p>
      </div>
    </div>
  );
};

