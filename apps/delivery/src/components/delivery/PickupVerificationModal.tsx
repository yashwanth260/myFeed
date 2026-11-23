import React, { useState } from 'react';
import { StoreInfo } from '../../types';
import { Lock, AlertCircle, KeyRound, CheckCircle2, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface PickupVerificationModalProps {
  store: StoreInfo;
  onVerify: (code: string) => boolean;
  onClose: () => void;
  isError?: boolean;
}

export const PickupVerificationModal: React.FC<PickupVerificationModalProps> = ({
  store,
  onVerify,
  onClose,
  isError = false,
}) => {
  const { t } = useLanguage();
  const [code, setCode] = useState<string>('');
  const [localError, setLocalError] = useState<boolean>(isError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return;
    const success = onVerify(code);
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

        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4 shadow-xs">
          <KeyRound size={26} />
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider mb-2">
          <Sparkles size={11} className="text-amber-600" />
          <span>Stage 6 & 7: Store Verification</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">Verify Merchant Pickup</h3>
        <p className="text-xs text-slate-500 mb-5">
          Ask merchant at <span className="text-slate-900 font-bold">{store.name}</span> for their 4-digit pickup code to securely confirm dispatch.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
              ENTER 4-DIGIT SECURE PICKUP CODE
            </label>
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setLocalError(false);
              }}
              placeholder="4821"
              className="w-full text-center text-3xl font-mono tracking-widest font-black py-3 px-4 rounded-2xl bg-slate-50 border-2 border-amber-400 text-slate-950 focus:outline-none focus:bg-white"
              autoFocus
            />
          </div>

          {localError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Incorrect pickup code. Verify with merchant cashier. (Demo code: 4821)</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Lock size={14} className="text-amber-600 shrink-0" />
            <span>Customer drop address and directions unlock only after successful code verification.</span>
          </div>

          <button
            type="submit"
            disabled={code.length < 4}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-slate-950 font-black text-sm transition-all shadow-md shadow-amber-200/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <CheckCircle2 size={18} />
            <span>Verify & Unlock Customer Details</span>
          </button>
        </form>
      </div>
    </div>
  );
};
