import React, { useState } from 'react';
import { mockNotifications } from '../../data/mockNotifications';
import { Bell, CheckCircle2, DollarSign, Award, ShieldAlert, X, CheckCheck } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[85vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">Order, payment & account updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              type="button"
              className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-950 border border-slate-200/80 transition-colors cursor-pointer text-xs shadow-xs"
              title="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer shadow-xs"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="py-4 space-y-2.5 overflow-y-auto flex-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border text-xs space-y-1 transition-all shadow-xs ${
                n.isRead
                  ? 'bg-slate-50 border-slate-200/80 text-slate-500'
                  : 'bg-amber-50/60 border-amber-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">{n.title}</span>
                <span className="text-[10px] text-slate-400">{n.timestamp}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed font-medium">{n.message}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
