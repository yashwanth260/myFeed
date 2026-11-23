import React from 'react';
import { X, History, Smartphone, MapPin } from 'lucide-react';
import { mockLoginHistory } from '../../data/mockProfile';

interface LoginHistoryModalProps {
  onClose: () => void;
}

export const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <History size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Login History</h2>
              <p className="text-xs text-slate-500">Recent account access and active device sessions</p>
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
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {mockLoginHistory.map((item) => {
            const isCurrent = item.status === 'CURRENT';
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  isCurrent
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone size={15} className={isCurrent ? 'text-amber-800' : 'text-slate-500'} />
                    <span className="font-extrabold text-slate-900 text-xs">{item.device}</span>
                  </div>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Current Device</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-200/70">
                      Past Session
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/70 pt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400" />
                    <span>{item.location}</span>
                  </span>
                  <span className="font-mono text-slate-500">IP: {item.ipAddress}</span>
                </div>

                <div className="text-[10px] text-slate-400">
                  {item.timestamp}
                </div>
              </div>
            );
          })}
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
