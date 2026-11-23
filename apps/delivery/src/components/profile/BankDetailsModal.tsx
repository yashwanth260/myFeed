import React from 'react';
import { X, Building, CheckCircle2, Calendar, Lock } from 'lucide-react';
import { PartnerProfile } from '../../types';

interface BankDetailsModalProps {
  partner: PartnerProfile;
  onClose: () => void;
}

export const BankDetailsModal: React.FC<BankDetailsModalProps> = ({ partner, onClose }) => {
  const bank = partner.bankDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <Building size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Bank Account Details</h2>
              <p className="text-xs text-slate-500">Registered payout destination</p>
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
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Bank Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">{bank.bankName}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} />
                <span>VERIFIED</span>
              </span>
            </div>

            <div className="space-y-2 pt-1 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Account Holder</span>
                <span className="font-bold text-slate-900">{bank.accountHolder}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Account Number</span>
                <span className="font-mono font-bold text-slate-900">{bank.accountNumberMasked}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">IFSC Code</span>
                <span className="font-mono font-bold text-slate-900">{bank.ifscCode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Linked UPI ID</span>
                <span className="font-mono font-bold text-emerald-700">{bank.upiId}</span>
              </div>
            </div>
          </div>

          {/* Automatic Wednesday Payout Rule Reassurance */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
              <Calendar size={14} />
              <span>Automatic Wednesday Payouts</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Your weekly eligible earnings are automatically deposited directly to this account every Wednesday. No withdrawal request or manual cashout is required.
            </p>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
            <Lock size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              Bank account modifications require multi-factor verification with the Feedo partner onboarding desk.
            </span>
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
