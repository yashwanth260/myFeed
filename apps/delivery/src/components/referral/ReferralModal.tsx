import React, { useState } from 'react';
import { X, Users, Copy, Check, Share2, MessageCircle, Send, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ReferralModalProps {
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ onClose }) => {
  const { partner } = useAuth();
  const [copied, setCopied] = useState<boolean>(false);

  const referralCode = partner?.id
    ? `FEEDO-${partner.name.split(' ')[0].toUpperCase()}-${partner.id.replace(/\D/g, '').slice(-3) || '77X'}`
    : 'FEEDO-PARTNER-2026';

  const referralLink = `https://feedodelivery.com/partner/join?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Deliver food and earn great daily payouts with Feedo Partner app. Sign up using my referral link: ${referralLink} or use referral code: ${referralCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Deliver with Feedo Partner',
          text: `Join Feedo as a Delivery Partner with my referral code ${referralCode}!`,
          url: referralLink,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Refer a Friend</h2>
              <p className="text-xs text-slate-500">
                Invite friends and fellow riders to join Feedo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200/80 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Card with code */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Personal Referral Code
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-800 tracking-wider select-all">
              {referralCode}
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleCopy}
                type="button"
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>
            </div>
          </div>

          {/* Quick Sharing Options */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Share Via
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppShare}
                type="button"
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleNativeShare}
                type="button"
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Share2 size={18} />
                <span>More Options</span>
              </button>
            </div>
          </div>

          {/* Referral Activity Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Referral Activity</span>
              <span className="text-xs font-bold text-emerald-600">3 Friends Invited</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-400 font-semibold">Registered</div>
                <div className="text-base font-black text-slate-900 mt-0.5">2 Partners</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-400 font-semibold">Completed 1st Trip</div>
                <div className="text-base font-black text-emerald-600 mt-0.5">1 Partner</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

