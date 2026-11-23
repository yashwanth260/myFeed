import React from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { useAuth } from '../../context/AuthContext';
import {
  IndianRupee,
  CheckCircle2,
  Bike,
  Navigation,
  Star,
  Activity,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface HeroEarningsStatsCardProps {
  onViewEarnings?: () => void;
  onViewOrders?: () => void;
}

export const HeroEarningsStatsCard: React.FC<HeroEarningsStatsCardProps> = ({
  onViewEarnings,
  onViewOrders,
}) => {
  const { dailyMetrics, activeOrder, activeOrders } = useDelivery();
  const { partner } = useAuth();

  const todayEarnings = dailyMetrics?.earnings ?? 640;
  const completedOrders = dailyMetrics?.ordersCompleted ?? 12;
  const activeOrdersCount = activeOrders && activeOrders.length > 0 ? activeOrders.length : (activeOrder ? 1 : 0);
  const distanceKm = 42.8;
  const rating = partner?.rating ?? 4.85;
  const acceptanceRate = 96.2;
  const completionRate = 98.5;

  return (
    <div className="space-y-3.5">
      {/* Premium Hero Earnings Card with Gold Highlights */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1C1C1C] via-[#161616] to-[#121212] border-2 border-[#D4AF37]/50 p-5 sm:p-6 shadow-[0_12px_40px_rgba(212,175,55,0.12)] relative overflow-hidden">
        {/* Top Gold Corner Accent */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-[#D4AF37]/20 via-[#F5D76E]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Card Top Pill */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F5D76E] text-[11px] font-black uppercase tracking-wider">
              <Sparkles size={12} className="text-[#D4AF37]" />
              <span>Today's Total Earnings</span>
            </div>

            <span className="text-[10px] font-semibold text-[#A1A1A1] uppercase tracking-wider">
              Auto Payout • Every Wednesday
            </span>
          </div>

          {/* Main Earnings Figure */}
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#D4AF37]">₹</span>
              <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-[#F5D76E] to-[#D4AF37] bg-clip-text text-transparent tracking-tight">
                {Math.round(todayEarnings).toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={onViewEarnings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#252525] hover:bg-[#2E2E2E] border border-[#D4AF37]/30 text-[#F5D76E] text-xs font-bold transition-all shadow-md cursor-pointer hover:border-[#D4AF37]"
            >
              <span>Earnings Details</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#252525]">
            <div className="bg-[#151515] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-[#A1A1A1] block font-medium">Delivery Pay</span>
              <span className="text-xs sm:text-sm font-bold text-white">₹560</span>
            </div>
            <div className="bg-[#151515] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-[#A1A1A1] block font-medium">Surge / Rain</span>
              <span className="text-xs sm:text-sm font-bold text-[#F5D76E]">₹140</span>
            </div>
            <div className="bg-[#151515] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-[#A1A1A1] block font-medium">Customer Tips</span>
              <span className="text-xs sm:text-sm font-bold text-[#35B879]">₹80</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Operational Statistics
        </h3>
        <span className="text-[11px] font-bold text-[#A1A1A1]">Live Metrics</span>
      </div>

      {/* Key Operational Statistics Grid (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* 1. Completed Deliveries */}
        <div
          onClick={onViewOrders}
          className="bg-[#1C1C1C] border border-[#252525] hover:border-[#D4AF37]/40 p-3.5 rounded-2xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#A1A1A1]">Completed</span>
            <div className="w-6 h-6 rounded-lg bg-[#35B879]/15 text-[#35B879] flex items-center justify-center">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white group-hover:text-[#F5D76E] transition-colors">
            {completedOrders}
          </div>
          <span className="text-[10px] text-[#666666]">Trips fulfilled today</span>
        </div>

        {/* 2. Active Deliveries */}
        <div
          onClick={onViewOrders}
          className="bg-[#1C1C1C] border border-[#252525] hover:border-[#D4AF37]/40 p-3.5 rounded-2xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#A1A1A1]">Active Duty</span>
            <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/15 text-[#F5D76E] flex items-center justify-center">
              <Bike size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white group-hover:text-[#F5D76E] transition-colors">
            {activeOrdersCount}
          </div>
          <span className="text-[10px] text-[#666666]">
            {activeOrdersCount > 0 ? 'Live in transit' : 'Standby mode'}
          </span>
        </div>

        {/* 3. Distance Covered */}
        <div className="bg-[#1C1C1C] border border-[#252525] p-3.5 rounded-2xl transition-all shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#A1A1A1]">Distance</span>
            <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Navigation size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {distanceKm} <span className="text-xs text-[#A1A1A1] font-semibold">km</span>
          </div>
          <span className="text-[10px] text-[#666666]">Total logged today</span>
        </div>

        {/* 4. Average Rating */}
        <div className="bg-[#1C1C1C] border border-[#252525] p-3.5 rounded-2xl transition-all shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#A1A1A1]">Rating</span>
            <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/15 text-[#F5D76E] flex items-center justify-center">
              <Star size={14} className="fill-[#F5D76E]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-1">
            <span>{rating}</span>
            <span className="text-xs text-[#F5D76E]">★</span>
          </div>
          <span className="text-[10px] text-[#666666]">Top 5% Partner</span>
        </div>

        {/* 5. Acceptance Rate */}
        <div className="bg-[#1C1C1C] border border-[#252525] p-3.5 rounded-2xl transition-all shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#A1A1A1]">Acceptance</span>
            <div className="w-6 h-6 rounded-lg bg-[#35B879]/15 text-[#35B879] flex items-center justify-center">
              <Activity size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {acceptanceRate}%
          </div>
          <span className="text-[10px] text-[#35B879] font-medium">Optimal tier</span>
        </div>

        {/* 6. Completion Rate */}
        <div className="bg-[#1C1C1C] border border-[#252525] p-3.5 rounded-2xl transition-all shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#A1A1A1]">Completion</span>
            <div className="w-6 h-6 rounded-lg bg-[#35B879]/15 text-[#35B879] flex items-center justify-center">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {completionRate}%
          </div>
          <span className="text-[10px] text-[#35B879] font-medium">Zero cancellations</span>
        </div>
      </div>
    </div>
  );
};

