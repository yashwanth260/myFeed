import React from 'react';
import { X, Wallet, Heart, CloudRain, Bike, Calendar } from 'lucide-react';

interface WaysToEarnModalProps {
  onClose: () => void;
}

export const WaysToEarnModal: React.FC<WaysToEarnModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <Wallet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Ways to Earn</h2>
              <p className="text-xs text-slate-500">Transparent earnings structure & compensation</p>
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
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* 1. Delivery Trip Pay */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Bike size={16} />
              </div>
              <span>Delivery Trip Compensation</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-10">
              Every completed order includes transparent pay calculated based on order complexity, merchant pickup distance, and travel distance to the customer's delivery location.
            </p>
          </div>

          {/* 2. Customer Tips */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Heart size={16} fill="currentColor" />
              </div>
              <span>Customer Tips (100% Passed)</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-10">
              Customers have the option to add tips during checkout or after delivery completion. 100% of customer tips are credited directly to your payout without any platform deductions.
            </p>
          </div>

          {/* 3. Rain & High-Demand Surge Bonuses */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <CloudRain size={16} />
              </div>
              <span>Rain & High-Demand Surge Bonuses</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-10">
              During inclement weather, monsoon showers, or peak lunch/dinner rush hours in high-demand clusters, additional surge bonuses are automatically added to each eligible delivery.
            </p>
          </div>

          {/* 4. Automatic Wednesday Bank Settlements */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-2.5 text-amber-950 font-extrabold text-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-200/70 text-amber-900 flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <span>Automatic Wednesday Payouts</span>
            </div>
            <p className="text-slate-700 leading-relaxed pl-10">
              All eligible weekly earnings are consolidated and automatically transferred directly to your registered bank account every Wednesday. You do not need to request withdrawals.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
