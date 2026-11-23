import React, { useState } from 'react';
import { AlertTriangle, Phone, Radio, MapPin, X, CheckCircle2 } from 'lucide-react';

interface EmergencySOSModalProps {
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ onClose }) => {
  const [triggered, setTriggered] = useState<boolean>(false);

  const handleConfirmSOS = () => {
    setTriggered(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 border border-slate-200/80 cursor-pointer shadow-xs"
        >
          <X size={18} />
        </button>

        {!triggered ? (
          <>
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center mb-4 mx-auto animate-pulse shadow-xs">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 text-center mb-1">EMERGENCY SOS ASSISTANCE</h3>
            <p className="text-xs text-slate-500 text-center mb-5">
              Use this during immediate safety threats, vehicle accidents, or dangerous situations on duty.
            </p>

            <div className="space-y-2.5 mb-6">
              <a
                href="tel:112"
                className="w-full p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-between transition-colors shadow-md shadow-rose-200/60 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Phone size={18} />
                  <span>Call Emergency Police (112)</span>
                </div>
                <span className="text-[10px] bg-rose-800 px-2 py-0.5 rounded">DIRECT CALL</span>
              </a>

              <button
                onClick={handleConfirmSOS}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Radio size={18} className="animate-pulse text-amber-600" />
                  <span>Broadcast Live GPS Location to Feedo Safety</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded border border-amber-300">ALERT TEAM</span>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Cancel & Return
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Emergency Alert Dispatched</h3>
            <p className="text-xs text-slate-600">
              Your live GPS coordinates (Indiranagar 100 Feet Rd) have been broadcasted to Feedo Safety Officers and your emergency contact.
            </p>
            <button
              onClick={onClose}
              className="py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
