import React from 'react';
import { X, Sparkles, Fuel, Wrench, HeartPulse, Coffee } from 'lucide-react';
import { mockSpecialBenefits } from '../../data/mockProfile';

interface SpecialBenefitsModalProps {
  onClose: () => void;
}

export const SpecialBenefitsModal: React.FC<SpecialBenefitsModalProps> = ({ onClose }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FUEL':
        return <Fuel size={18} className="text-amber-400" />;
      case 'VEHICLE':
        return <Wrench size={18} className="text-sky-400" />;
      case 'HEALTH':
        return <HeartPulse size={18} className="text-rose-400" />;
      case 'FOOD':
      default:
        return <Coffee size={18} className="text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#121826] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Partner Special Benefits</h2>
              <p className="text-xs text-slate-400">Exclusive rider perks & tie-up discounts</p>
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
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {mockSpecialBenefits.map((ben) => (
            <div
              key={ben.id}
              className="p-4 rounded-2xl bg-[#0f1523] border border-slate-800/80 space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#172033] border border-slate-800 flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(ben.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{ben.title}</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">Partner: <strong className="text-slate-200">{ben.partner}</strong></div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ben.description}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-[#00E676] border border-emerald-500/30">
                  {ben.discountBadge}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Show Feedo Partner ID</span>
              </div>
            </div>
          ))}
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

