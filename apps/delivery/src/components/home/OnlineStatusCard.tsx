import React, { useState } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Power, Loader2, Sparkles } from 'lucide-react';

export const OnlineStatusCard: React.FC = () => {
  const { isOnline, toggleOnline } = useDelivery();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      // Simulate confirmed availability sync
      await new Promise((resolve) => setTimeout(resolve, 350));
      toggleOnline();
    } catch (err) {
      console.error('Failed to update availability status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4 font-sans">
      {/* "Let's serve the food!" inside the box */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-left">
          Let's serve the food!
        </h1>
        <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-xs" />
      </div>

      {/* Online / Offline Toggle Button inside the same box */}
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        type="button"
        className={`w-full h-16 sm:h-18 rounded-2xl px-5 sm:px-6 transition-all duration-300 flex items-center justify-between shadow-xs cursor-pointer select-none active:scale-[0.99] border ${
          isOnline
            ? 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-300/80 text-emerald-950'
            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/90 text-slate-900'
        }`}
        aria-label="Toggle Online/Offline Availability"
      >
        {/* Left Side: Status Text & Indicator */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-xs ${
              isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            {isUpdating ? (
              <Loader2 size={19} className="animate-spin text-amber-600" />
            ) : (
              <Power size={19} strokeWidth={2.5} />
            )}
          </div>

          <div className="flex flex-col items-start text-left">
            <span
              className={`text-lg sm:text-xl font-extrabold tracking-wider uppercase leading-tight ${
                isOnline ? 'text-emerald-700' : 'text-slate-900'
              }`}
            >
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">
              {isOnline ? 'Ready to receive orders' : 'Tap to start receiving orders'}
            </span>
          </div>
        </div>

        {/* Right Side: Smooth Pill Slider Track */}
        <div
          className={`w-13 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${
            isOnline ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </div>
        </div>
      </button>
    </div>
  );
};
