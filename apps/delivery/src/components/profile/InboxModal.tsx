import React, { useState } from 'react';
import { X, Inbox, CheckCheck } from 'lucide-react';
import { mockInboxMessages } from '../../data/mockProfile';
import { InboxMessageItem } from '../../types';

interface InboxModalProps {
  onClose: () => void;
}

export const InboxModal: React.FC<InboxModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<InboxMessageItem[]>(mockInboxMessages);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessageItem | null>(null);

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
  };

  const handleSelect = (msg: InboxMessageItem) => {
    setSelectedMessage(msg);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <Inbox size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">Partner Inbox</h2>
                {messages.filter((m) => !m.isRead).length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FACC15] text-slate-950">
                    {messages.filter((m) => !m.isRead).length} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Important messages & operational alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              type="button"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer text-xs"
              title="Mark all as read"
              aria-label="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {selectedMessage ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                ← Back to All Messages
              </button>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                      {selectedMessage.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2">
                      {selectedMessage.title}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      From: <strong className="text-slate-700">{selectedMessage.sender}</strong> • {selectedMessage.timestamp}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pt-2 border-t border-slate-200/70">
                  {selectedMessage.body}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  msg.isRead
                    ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                    : 'bg-amber-50/60 border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!msg.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                    <span className="text-xs font-extrabold text-slate-900">{msg.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {msg.summary}
                </p>
                <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                  <span>{msg.sender}</span>
                  <span className="text-amber-800 font-bold">Tap to read</span>
                </div>
              </div>
            ))
          )}
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
