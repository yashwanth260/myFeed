import React from 'react';
import { Check, Sparkles, ArrowRight, IndianRupee } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DeliverySuccessModalProps {
  earningAmount: number;
  deliveryEarning?: number;
  tipAmount?: number;
  onClose: () => void;
  onViewOrders: () => void;
}

export const DeliverySuccessModal: React.FC<DeliverySuccessModalProps> = ({
  earningAmount,
  deliveryEarning,
  tipAmount,
  onClose,
  onViewOrders,
}) => {
  const { t } = useLanguage();

  const finalDeliveryEarning = deliveryEarning ?? Math.max(0, earningAmount - (tipAmount ?? 0));
  const finalTip = tipAmount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative overflow-hidden text-slate-900">
        {/* Celebration Ambient Glow */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-56 h-56 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Checkmark */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FACC15] text-slate-950 flex items-center justify-center shadow-lg shadow-amber-200/80 mb-4 animate-bounce">
          <Check size={44} strokeWidth={3.5} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider mb-2">
          <Sparkles size={14} className="text-amber-600" />
          <span>Stage 14: Order Completed</span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Delivery Fulfilled!</h2>
        <p className="text-xs text-slate-500 mb-5">
          Order completed and OTP validated. Earnings have been automatically credited to your Feedo balance.
        </p>

        {/* Big Earnings Breakdown Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Partner Earning</span>
            <div className="flex items-baseline gap-1 text-slate-950 font-black">
              <span className="text-lg text-amber-600">₹</span>
              <span className="text-3xl">{earningAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="font-medium text-slate-600">Delivery Earning</span>
              <span className="text-slate-900 font-bold">₹{finalDeliveryEarning.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span className="font-medium">Customer Tip</span>
              <span className="font-bold">
                {finalTip > 0 ? `+₹${finalTip.toFixed(2)}` : '₹0 (No tip)'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Settlement Cycle</span>
            <span className="text-amber-800 font-bold">Auto Payout This Wednesday</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onViewOrders}
            className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-xs"
          >
            Trip Receipt
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-200/60 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span>Back to Home</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
