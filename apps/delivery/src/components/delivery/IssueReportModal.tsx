import React, { useState } from 'react';
import { AlertTriangle, HelpCircle, X, CheckCircle2 } from 'lucide-react';

interface IssueReportModalProps {
  type: 'STORE' | 'CUSTOMER' | 'CANCEL';
  onClose: () => void;
  onSubmitIssue: (reason: string) => void;
  remainingCancellations?: number;
}

export const IssueReportModal: React.FC<IssueReportModalProps> = ({
  type,
  onClose,
  onSubmitIssue,
  remainingCancellations = 5,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const isLimitReached = type === 'CANCEL' && remainingCancellations <= 0;

  const storeReasons = [
    'Order is delayed / Not ready yet',
    'Store is closed / Unreachable',
    'Pickup code unavailable from staff',
    'Package is damaged or leaking',
    'Wrong items packed by store',
    'Other store issue'
  ];

  const customerReasons = [
    'Customer not answering phone call',
    'Delivery location inaccessible / Locked gate',
    'Incorrect / Incomplete delivery address',
    'Customer refused package',
    'Safety issue at location',
    'Other customer issue'
  ];

  const cancelReasons = [
    'Vehicle breakdown / Flat tyre',
    'Store closed / Cannot pick up',
    'Customer non-responsive',
    'Accident or medical emergency',
    'Excessive store wait time (>20 mins)',
    'Other emergency'
  ];

  const reasons = type === 'STORE' ? storeReasons : type === 'CUSTOMER' ? customerReasons : cancelReasons;
  const title = type === 'STORE' ? 'Report Store Issue' : type === 'CUSTOMER' ? 'Report Customer Issue' : 'Cancel Delivery Order';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || isLimitReached) return;
    onSubmitIssue(selectedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 border border-slate-200/80 cursor-pointer shadow-xs"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center mb-4 shadow-xs">
          <AlertTriangle size={22} />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-4">
          Please select the reason so Feedo support can assist or reassign the order.
        </p>

        {/* Section 11: Daily Cancellation Limit Display */}
        {type === 'CANCEL' && (
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-xs font-bold text-amber-950 shadow-xs mb-2">
              <span>Daily cancellations remaining:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-xs">
                {Math.max(0, remainingCancellations)}/5
              </span>
            </div>

            {isLimitReached && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium leading-relaxed shadow-xs">
                You have reached your daily cancellation limit of 5 orders. You can cancel accepted orders again after 12:00 AM IST.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {reasons.map((reason) => (
              <label
                key={reason}
                onClick={() => !isLimitReached && setSelectedReason(reason)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all shadow-xs ${
                  isLimitReached
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                    : selectedReason === reason
                    ? 'bg-amber-50 border-amber-300 text-amber-900 cursor-pointer'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 cursor-pointer'
                }`}
              >
                <span>{reason}</span>
                <input
                  type="radio"
                  name="issueReason"
                  disabled={isLimitReached}
                  checked={selectedReason === reason}
                  onChange={() => !isLimitReached && setSelectedReason(reason)}
                  className="accent-amber-500"
                />
              </label>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
            Note: Frequent cancellations affect your acceptance & completion rating. Daily limit resets at 12:00 AM IST.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer shadow-xs"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!selectedReason || isLimitReached}
              className="py-3 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-200/60 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{type === 'CANCEL' ? 'Confirm Cancellation' : 'Submit Issue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
