import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { Headset, HeartHandshake, User } from 'lucide-react';

interface HeaderProps {
  onOpenSupport: () => void;
  onOpenCare: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSupport,
  onOpenCare,
  onOpenProfile,
}) => {
  const { partner } = useAuth();
  const { isOnline } = useDelivery();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-4 py-2.5 font-sans">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left Side: Feedo Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="/brand/feedo-logo.png"
            alt="Feedo Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)] select-none pointer-events-none"
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900">
                FEEDO
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 uppercase tracking-wider shadow-xs">
                DELIVERY PARTNER
              </span>
            </div>
          </div>
        </div>

        {/* Right Side, in exact sketch order: 1. Care, 2. Help, 3. Circular Profile */}
        <div className="flex items-center gap-2">
          {/* 1. Care / Customer Assistance Icon */}
          <button
            onClick={onOpenCare}
            type="button"
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200/90 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            title="Care / Customer Assistance"
            aria-label="Care / Customer Assistance"
          >
            <HeartHandshake size={17} strokeWidth={2.2} />
          </button>

          {/* 2. Help & Support Headset Icon */}
          <button
            onClick={onOpenSupport}
            type="button"
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200/90 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            title="Help & Support"
            aria-label="Help & Support"
          >
            <Headset size={17} strokeWidth={2.2} />
          </button>

          {/* 3. Circular Profile Icon */}
          <button
            onClick={onOpenProfile}
            type="button"
            className="relative w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 overflow-hidden group"
            title="Profile"
            aria-label="Profile"
          >
            {partner?.photoUrl ? (
              <img
                src={partner.photoUrl}
                alt={partner.name || 'Partner Profile'}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User size={17} className="text-slate-600 group-hover:text-slate-900" strokeWidth={2.2} />
            )}

            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
