import React from 'react';
import { X, ShieldCheck, HeartHandshake, PhoneCall, Building2, CheckCircle2 } from 'lucide-react';
import { InsuranceDetails } from '../../types';

interface InsuranceModalProps {
  insurance: InsuranceDetails;
  onClose: () => void;
}

export const InsuranceModal: React.FC<InsuranceModalProps> = ({ insurance, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#121826] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#00E676] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Partner Insurance Policy</h2>
              <p className="text-xs text-slate-400">Comprehensive protection while on duty</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Policy Overview Card */}
          <div className="p-4 rounded-2xl bg-[#172033] border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                Policy #{insurance.policyNumber}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-[#00E676] border border-emerald-500/30">
                <CheckCircle2 size={12} />
                <span>{insurance.status}</span>
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Sum Insured Cover
                </span>
                <div className="text-2xl font-black text-white">{insurance.sumInsured}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Underwriter
                </span>
                <div className="text-xs font-bold text-slate-200">{insurance.provider}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 flex justify-between">
              <span>Valid Until: <strong className="text-white">{insurance.validUntil}</strong></span>
              <span>{insurance.cashlessHospitalsCount}+ Cashless Hospitals</span>
            </div>
          </div>

          {/* Key Inclusions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Coverage Highlights
            </h3>
            <div className="space-y-2">
              {insurance.coverageDetails.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0f1523] border border-slate-800 text-xs text-slate-300"
                >
                  <CheckCircle2 size={15} className="text-[#00E676] flex-shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Claims Helpline */}
          <div className="p-3.5 rounded-2xl bg-[#0f1523] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <PhoneCall size={17} />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">Emergency Claims Desk</div>
                <div className="text-[11px] font-mono text-slate-400">{insurance.claimHelpline}</div>
              </div>
            </div>
            <a
              href="tel:18002666419"
              className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs transition-colors"
            >
              Call TPA
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0f1523] flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

