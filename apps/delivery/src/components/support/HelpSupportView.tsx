import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  PhoneCall,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Search,
} from 'lucide-react';
import { LiveSupportChat } from './LiveSupportChat';

export const HelpSupportView: React.FC = () => {
  const [showLiveChat, setShowLiveChat] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const faqCategories = [
    { title: 'Store & Pickup Issues', desc: 'Order not ready, merchant closed, wrong pickup code', icon: HelpCircle },
    { title: 'Customer Delivery Issues', desc: 'Unreachable customer, locked gate, wrong address', icon: ShieldCheck },
    { title: 'Earnings & Wednesday Payouts', desc: 'Weekly automatic bank deposit, tips & surge bonuses', icon: PhoneCall },
    { title: 'Vehicle & Safety Assistance', desc: 'Breakdown help, flat tyre, accident claims', icon: AlertTriangle },
  ];

  const filteredFaqs = faqCategories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-28 md:pb-12 max-w-3xl mx-auto animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Help & Support</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          24/7 dedicated partner assistance for on-trip and account questions.
        </p>
      </div>

      {/* Live Support Banner CTA */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Support Desk
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">
            Need Instant Help with an Active Order?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chat directly with our rider assistance team or get automated resolutions.
          </p>
        </div>

        <button
          onClick={() => setShowLiveChat(true)}
          type="button"
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <MessageSquare size={16} />
          <span>Start Live Chat</span>
        </button>
      </div>

      {/* Search FAQ Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search help topics (e.g. pickup code, Wednesday payout, vehicle)..."
          className="w-full bg-white border border-slate-200 rounded-full pl-11 pr-4 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 shadow-xs"
        />
      </div>

      {/* FAQ Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredFaqs.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.title}
              onClick={() => setShowLiveChat(true)}
              className="bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-slate-200 p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
            </div>
          );
        })}
      </div>

      {/* Live Support Chat Drawer */}
      {showLiveChat && <LiveSupportChat onClose={() => setShowLiveChat(false)} />}
    </div>
  );
};
