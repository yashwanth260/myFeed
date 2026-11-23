import React, { useState } from 'react';
import { CustomerInfo } from '../../types';
import { ShieldCheck, AlertCircle, CheckCircle2, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DeliveryOTPModalProps {
  customer: CustomerInfo;
  onVerify: (otp: string) => boolean;
  onClose: () => void;
  isError?: boolean;
}

export const DeliveryOTPModal: React.FC<DeliveryOTPModalProps> = ({
  customer,
  onVerify,
  onClose,
  isError = false,
}) => {
  const { t } = useLanguage();
  const [otp, setOtp] = useState<string>('');
  const [localError, setLocalError] = useState<boolean>(isError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    const success = onVerify(otp);
    if (!success) {
      setLocalError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 border border-slate-200/80 cursor-pointer shadow-xs"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4 shadow-xs">
          <ShieldCheck size={26} />
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider mb-2">
          <Sparkles size={11} className="text-amber-600" />
          <span>Stage 12 & 13: Customer OTP</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">Enter Customer Delivery OTP</h3>
        <p className="text-xs text-slate-500 mb-5">
          Ask customer <span className="text-slate-900 font-bold">{customer.name}</span> for the 4-digit verification code to complete delivery and credit earnings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
              ENTER 4-DIGIT DELIVERY OTP
            </label>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                setLocalError(false);
              }}
              placeholder="9102"
              className="w-full text-center text-3xl font-mono tracking-widest font-black py-3 px-4 rounded-2xl bg-slate-50 border-2 border-emerald-400 text-slate-950 focus:outline-none focus:bg-white"
              autoFocus
            />
          </div>

          {localError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Incorrect OTP. Ask customer to view the OTP on their Feedo app. (Demo code: 9102)</span>
            </div>
          )}

          <button
            type="submit"
            disabled={otp.length < 4}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-slate-950 font-black text-sm transition-all shadow-md shadow-amber-200/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <CheckCircle2 size={18} />
            <span>Validate OTP & Complete Delivery</span>
          </button>
        </form>
      </div>
    </div>
  );
};
