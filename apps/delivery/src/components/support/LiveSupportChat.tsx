import React, { useState } from 'react';
import { Send, X, Bot } from 'lucide-react';
import { ChatMessage } from '../../types';

interface LiveSupportChatProps {
  onClose: () => void;
}

export const LiveSupportChat: React.FC<LiveSupportChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello Arjun! I am Feedo Partner Support AI. How can I assist you today?',
      timestamp: 'Just now',
    },
    {
      id: 'm2',
      sender: 'support',
      text: 'Common quick topics: Restaurant delay, Customer unreachable, Wrong pickup code, Wednesday payout.',
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState<string>('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'partner',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    // Auto reply simulation
    setTimeout(() => {
      let replyText = "We're checking your active order. Please remain at the store location while we contact merchant support.";

      if (currentInput.toLowerCase().includes('payment') || currentInput.toLowerCase().includes('earning') || currentInput.toLowerCase().includes('payout')) {
        replyText = 'Your eligible earnings are automatically deposited to your registered bank account every Wednesday. No manual withdrawal request is required.';
      } else if (currentInput.toLowerCase().includes('code') || currentInput.toLowerCase().includes('otp')) {
        replyText = 'Merchant pickup codes are provided by store managers. Customer OTPs are displayed in the customer Feedo app home screen.';
      }

      const botMsg: ChatMessage = {
        id: `m-bot-${Date.now()}`,
        sender: 'support',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-lg h-[600px] max-h-[90vh] bg-white border border-slate-100 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <Bot size={20} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">Feedo Partner Live Support</div>
              <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online • 24/7 Priority Support</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'partner' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs ${
                  msg.sender === 'partner'
                    ? 'bg-[#FACC15] text-slate-950 font-bold rounded-tr-none shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs leading-relaxed'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <button
            onClick={() => setInput('Restaurant is taking too long to prepare order')}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap border border-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Store Delayed
          </button>
          <button
            onClick={() => setInput('Customer is not answering my phone call')}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap border border-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Customer Unreachable
          </button>
          <button
            onClick={() => setInput('My Wednesday payout question')}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap border border-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Wednesday Payout
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or report issue..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-slate-950 font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
