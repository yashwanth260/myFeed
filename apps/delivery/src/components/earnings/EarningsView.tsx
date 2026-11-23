import React, { useState } from 'react';
import {
  totalEarningsSummary,
  nextAutomaticPayout,
  earningsHistoryData,
  weeklyPayoutHistoryData,
} from '../../data/mockEarnings';
import {
  IndianRupee,
  Calendar,
  Clock,
  Building,
  Heart,
  CloudRain,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Info,
  CalendarDays,
  CreditCard,
  Sparkles,
  TrendingUp,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import { PayoutStatus } from '../../types';

export const EarningsView: React.FC = () => {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'TOTAL'>('WEEK');

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#35B879]/15 text-[#35B879] border border-[#35B879]/30">
            <CheckCircle2 size={12} />
            <span>PAID</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37]/15 text-[#F5D76E] border border-[#D4AF37]/30">
            <Clock size={12} className="animate-spin text-[#D4AF37]" />
            <span>PROCESSING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EF5350]/15 text-[#EF5350] border border-[#EF5350]/30">
            <AlertCircle size={12} />
            <span>FAILED</span>
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>SCHEDULED</span>
          </span>
        );
    }
  };

  // Dynamic filter values
  const getFilterEarnings = () => {
    switch (timeFilter) {
      case 'TODAY':
        return { amount: 640, label: "Today's Settled Earnings", trips: 12 };
      case 'WEEK':
        return { amount: 5980, label: "Current Week (Oct 26 - Nov 01)", trips: 86 };
      case 'MONTH':
        return { amount: 24850, label: 'October 2026', trips: 364 };
      case 'TOTAL':
      default:
        return { amount: totalEarningsSummary.totalAmount, label: 'Lifetime Deliveries', trips: 512 };
    }
  };

  const currentSummary = getFilterEarnings();

  return (
    <div className="space-y-4 sm:space-y-5 pb-28 md:pb-12 max-w-xl mx-auto w-full animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Earnings & Wallet</span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              WEDNESDAY ACH
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated direct bank deposits every Wednesday • Live breakdown
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-[11px] text-slate-700 font-bold self-start sm:self-auto shadow-xs">
          <CalendarDays size={13} className="text-amber-600" />
          <span>Next: Wednesday</span>
        </div>
      </div>

      {/* Time Filter Pills */}
      <div className="flex bg-white p-1 rounded-full border border-slate-200/80 shadow-xs">
        {(['TODAY', 'WEEK', 'MONTH', 'TOTAL'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              timeFilter === filter
                ? 'bg-[#FACC15] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {filter === 'TODAY' && 'Today'}
            {filter === 'WEEK' && 'This Week'}
            {filter === 'MONTH' && 'Month'}
            {filter === 'TOTAL' && 'All Time'}
          </button>
        ))}
      </div>

      {/* Total Earnings Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {currentSummary.label}
            </span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-600" />
              <span>Direct Bank Deposit</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-500">₹</span>
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {currentSummary.amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-amber-600" />
              <span>{currentSummary.trips} Fulfilled Orders</span>
            </div>
            <span className="text-emerald-600 font-bold">100% Verified</span>
          </div>
        </div>
      </div>

      {/* Next Automatic Wednesday Payout Card */}
      <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4">
        {/* Card Title & Payout Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Calendar size={22} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Automated Bank Settlement
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Next Automatic Payout
              </h2>
            </div>
          </div>

          {getStatusBadge(nextAutomaticPayout.status)}
        </div>

        {/* Payout Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Settlement Day
            </span>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
              Wednesday
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
              {nextAutomaticPayout.scheduledDate}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Expected Payout
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              ₹{nextAutomaticPayout.expectedPayout.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Building size={11} className="text-amber-600" />
              <span>{nextAutomaticPayout.bankName} {nextAutomaticPayout.bankAccountMasked}</span>
            </div>
          </div>
        </div>

        {/* Notice Reassurance */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Payouts are deposited automatically to your verified bank account every Wednesday. No manual cashout request or fee deduction required.
          </p>
        </div>
      </div>

      {/* Earnings Breakdown (Tips & Surge) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Component Breakdown
          </h2>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Clear Itemization
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 1. Customer Tips */}
          <div className="rounded-3xl bg-white border border-slate-100 p-4 sm:p-5 flex flex-col justify-between shadow-sm select-none group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">
                Customer Tips
              </span>
              <div className="w-8 h-8 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Heart size={16} fill="currentColor" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ₹{totalEarningsSummary.customerTipsTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-1 font-medium">
                100% direct to partner
              </div>
            </div>
          </div>

          {/* 2. Rain / Surge Bonuses */}
          <div className="rounded-3xl bg-white border border-slate-100 p-4 sm:p-5 flex flex-col justify-between shadow-sm select-none group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">
                Rain / Surge Bonus
              </span>
              <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <CloudRain size={16} strokeWidth={2.3} />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ₹{totalEarningsSummary.rainSurgeBonusesTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-amber-700 mt-1 font-medium">
                Weather & peak demand
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Earnings History */}
      <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Daily Delivery History
          </h2>
          <span className="text-xs font-semibold text-slate-400">Past 6 Days</span>
        </div>

        <div className="space-y-2">
          {earningsHistoryData.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                setSelectedHistoryItem(selectedHistoryItem === item.id ? null : item.id)
              }
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all flex flex-col gap-1.5 cursor-pointer group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {item.formattedDate}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.completedTrips} Fulfilled Deliveries
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-slate-900">
                    ₹{item.totalEarned.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Cycle Settled
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-1.5 flex items-center justify-between">
                <span>{item.details}</span>
                <span className="text-emerald-600 font-semibold">Eligible</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Payout History (Wednesday Bank Payouts) */}
      <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Weekly Payout History
            </h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              WEDNESDAYS
            </span>
          </div>
          <span className="text-xs text-slate-400">Bank Direct ACH</span>
        </div>

        <div className="space-y-2.5">
          {weeklyPayoutHistoryData.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <CreditCard size={17} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    ₹{record.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {record.payoutDate}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {record.bankAccountMasked}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                {getStatusBadge(record.status)}
                <span className="text-[10px] text-slate-400 font-mono">
                  {record.transactionRef}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
