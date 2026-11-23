import React, { useState } from 'react';
import {
  X,
  Phone,
  LifeBuoy,
  HeartHandshake,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CustomerCareModalProps {
  onClose: () => void;
  onOpenLiveChat?: () => void;
}

export const CustomerCareModal: React.FC<CustomerCareModalProps> = ({
  onClose,
  onOpenLiveChat,
}) => {
  const { partner } = useAuth();
  const [callbackRequested, setCallbackRequested] = useState<boolean>(false);
  const [selectedIssue, setSelectedIssue] = useState<string>('order_issue');

  const emergencyContacts = [
    {
      id: 'helpline',
      title: 'Feedo Partner 24x7 Helpline',
      subtitle: 'Toll-free emergency rider care line',
      number: '1800-419-FEEDO (3336)',
      icon: PhoneCall,
      color: 'text-[#00E676]',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
      action: 'tel:18004193336',
    },
    {
      id: 'roadside',
      title: 'Roadside Assistance & Towing',
      subtitle: 'Flat tyre, mechanical breakdown & battery jumpstart',
      number: '+91 80 4719 2200',
      icon: LifeBuoy,
      color: 'text-blue-400',
      bg: 'bg-blue-500/15 border-blue-500/30',
      action: 'tel:+918047192200',
    },
    {
      id: 'medical',
      title: 'Accident & Hospital Claims Desk',
      subtitle: 'Insurance cashless admission & hospital assistance',
      number: '+91 80 4719 3300',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/15 border-rose-500/30',
      action: 'tel:+918047193300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Partner Care & Assistance</h2>
              <p className="text-xs text-slate-500">
                Dedicated support for on-duty delivery partners
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

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Partner identification pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500">Rider ID: </span>
              <strong className="text-slate-900 font-mono">{partner?.applicationId || 'FP-88421'}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Priority Care Active</span>
            </div>
          </div>

          {/* Quick Helpline Numbers */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Instant Phone Helplines
            </div>

            {emergencyContacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <a
                  key={contact.id}
                  href={contact.action}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-slate-100/70 transition-all group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl ${contact.bg} ${contact.color} flex items-center justify-center flex-shrink-0 border shadow-xs`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                        {contact.title}
                      </div>
                      <div className="text-[11px] text-slate-500">{contact.subtitle}</div>
                      <div className="text-xs font-mono font-bold text-slate-700 mt-0.5">{contact.number}</div>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 group-hover:bg-[#FACC15] text-white group-hover:text-slate-950 font-black text-xs transition-colors flex items-center gap-1 flex-shrink-0 shadow-xs">
                    <Phone size={13} />
                    <span>Call</span>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Request Instant Callback Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-600" />
                <span>Request Priority Partner Callback</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Avg. response &lt; 2 mins
              </span>
            </div>

            <p className="text-xs text-slate-600">
              On-duty manager will call your registered phone <strong className="text-slate-900 font-mono">{partner?.phone || '+91 98765 43210'}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label
                className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                  selectedIssue === 'order_issue'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="issue"
                  className="hidden"
                  checked={selectedIssue === 'order_issue'}
                  onChange={() => setSelectedIssue('order_issue')}
                />
                Order / Store Issue
              </label>

              <label
                className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                  selectedIssue === 'app_issue'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="issue"
                  className="hidden"
                  checked={selectedIssue === 'app_issue'}
                  onChange={() => setSelectedIssue('app_issue')}
                />
                Payment / App Query
              </label>
            </div>

            {callbackRequested ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Callback registered! Manager will connect shortly.</span>
              </div>
            ) : (
              <button
                onClick={() => setCallbackRequested(true)}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-200/60 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PhoneCall size={14} />
                <span>Request Immediate Callback</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          {onOpenLiveChat && (
            <button
              onClick={() => {
                onClose();
                onOpenLiveChat();
              }}
              type="button"
              className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>Open Live Chat with Agent</span>
            </button>
          )}

          <button
            onClick={onClose}
            type="button"
            className="ml-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

