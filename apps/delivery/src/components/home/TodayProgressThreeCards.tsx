import React from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Clock, Bike, IndianRupee } from 'lucide-react';

interface TodayProgressThreeCardsProps {
  onCardClick?: (type: 'earnings' | 'time' | 'trips') => void;
}

export const TodayProgressThreeCards: React.FC<TodayProgressThreeCardsProps> = ({
  onCardClick,
}) => {
  const { dailyMetrics } = useDelivery();

  // Format earnings with Indian Rupee symbol
  const formattedEarnings = dailyMetrics?.earnings
    ? `₹${Math.round(dailyMetrics.earnings).toLocaleString('en-IN')}`
    : '₹0';

  // Format online time (hours and minutes)
  const totalMinutes = dailyMetrics?.onlineTimeMinutes ?? 320;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedOnlineTime = `${hours}h ${minutes}m`;

  // Format completed trips
  const tripsCount = dailyMetrics?.ordersCompleted ?? 12;

  return (
    <div className="space-y-3 font-sans">
      {/* Section Title */}
      <div className="px-1">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          Today's Progress
        </h2>
      </div>

      {/* Exactly Three Statistics in One Horizontal Row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Column 1 — Earnings */}
        <div
          onClick={() => onCardClick && onCardClick('earnings')}
          className="rounded-3xl bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-amber-300 p-3 sm:p-4 flex flex-col items-center text-center justify-center transition-all shadow-sm select-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-amber-200/80 shadow-xs">
            <IndianRupee size={17} strokeWidth={2.5} />
          </div>

          <div className="text-base sm:text-xl font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors tracking-tight">
            {formattedEarnings}
          </div>

          <span className="text-[11px] font-semibold text-slate-500 mt-1">
            Earnings
          </span>
        </div>

        {/* Column 2 — Online Time */}
        <div
          onClick={() => onCardClick && onCardClick('time')}
          className="rounded-3xl bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-sky-300 p-3 sm:p-4 flex flex-col items-center text-center justify-center transition-all shadow-sm select-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-sky-200/80 shadow-xs">
            <Clock size={17} strokeWidth={2.5} />
          </div>

          <div className="text-base sm:text-xl font-extrabold text-slate-900 group-hover:text-sky-800 transition-colors tracking-tight">
            {formattedOnlineTime}
          </div>

          <span className="text-[11px] font-semibold text-slate-500 mt-1">
            Online Time
          </span>
        </div>

        {/* Column 3 — Trips */}
        <div
          onClick={() => onCardClick && onCardClick('trips')}
          className="rounded-3xl bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-emerald-300 p-3 sm:p-4 flex flex-col items-center text-center justify-center transition-all shadow-sm select-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-emerald-200/80 shadow-xs">
            <Bike size={18} strokeWidth={2.5} />
          </div>

          <div className="text-base sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors tracking-tight">
            {tripsCount}
          </div>

          <span className="text-[11px] font-semibold text-slate-500 mt-1">
            Trips
          </span>
        </div>
      </div>
    </div>
  );
};
