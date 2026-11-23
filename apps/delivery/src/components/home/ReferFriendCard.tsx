import React from 'react';
import { Users, ChevronRight, Gift } from 'lucide-react';

interface ReferFriendCardProps {
  onOpenReferralModal?: () => void;
}

export const ReferFriendCard: React.FC<ReferFriendCardProps> = ({ onOpenReferralModal }) => {
  return (
    <div
      onClick={onOpenReferralModal}
      className="w-full rounded-3xl bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-amber-300 px-4 py-3.5 shadow-sm flex items-center justify-between gap-3 cursor-pointer transition-all select-none group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <Gift size={20} />
        </div>

        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
            Refer the friend
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Invite friends to join the Feedo delivery fleet
          </span>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-white group-hover:border-amber-300 group-hover:translate-x-0.5 transition-all shadow-xs">
        <ChevronRight size={16} />
      </div>
    </div>
  );
};
