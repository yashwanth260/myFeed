import React, { useState } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { useAuth } from '../../context/AuthContext';
import { CategoryType, GPSState, AccountStatus } from '../../types';
import { Wrench, X, KeyRound, ShieldCheck, Layers, UserCheck, RotateCcw } from 'lucide-react';

export const FloatingDemoControlPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { partner, setDemoAccountStatus, setIsAdminPortalOpen } = useAuth();
  const {
    isOnline,
    toggleOnline,
    activeOrder,
    triggerDemoOffer,
    setGpsState,
    gpsState,
    verifyPickupCode,
    verifyDeliveryOtp,
    resetDemoData,
  } = useDelivery();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-amber-300 flex items-center gap-2 text-xs cursor-pointer"
          title="Open Developer Demo Controls"
        >
          <Wrench size={18} />
          <span className="hidden sm:inline">DEMO CONTROL PANEL</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-fade-in relative text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold">
              <Wrench size={16} />
              <span>DEMO CONTROLS</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Direct Link to Central Admin Dashboard */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsAdminPortalOpen(true);
            }}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-xs"
          >
            <ShieldCheck size={16} />
            <span>OPEN CENTRAL ADMIN DASHBOARD</span>
          </button>

          {/* Account Verification Status Switcher */}
          <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
            <div className="text-slate-600 font-bold text-[11px] flex items-center gap-1">
              <UserCheck size={14} className="text-amber-700" />
              <span>Account Status Gatekeeping Test</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {(['APPROVED', 'UNDER_REVIEW', 'DOCUMENTS_PENDING', 'REJECTED', 'SUSPENDED'] as AccountStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setDemoAccountStatus(st)}
                    className={`p-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                      partner.accountStatus === st
                        ? 'bg-[#FACC15] text-slate-950 border-amber-400 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Duty Status */}
          <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/80">
            <span className="text-slate-700 font-semibold">Duty Status:</span>
            <button
              onClick={toggleOnline}
              className={`px-3 py-1 rounded-full font-extrabold text-[11px] cursor-pointer transition-colors ${
                isOnline ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>

          {/* Trigger Order Offers */}
          <div className="space-y-2">
            <div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              Trigger Order Offer by Category
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(['FOOD', 'GROCERY', 'ELECTRONICS', 'MEAT', 'FASHION', 'VEGETABLES'] as CategoryType[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => triggerDemoOffer(cat)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-[11px] border border-slate-200 text-left truncate cursor-pointer transition-colors"
                  >
                    + {cat}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => triggerDemoOffer('FOOD', true)}
              className="w-full p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-[11px] border border-purple-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Layers size={14} />
              <span>+ SMART BATCHED OFFER (2 ORDERS)</span>
            </button>
          </div>

          {/* GPS Geofence State Switcher */}
          {activeOrder && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                GPS Geofence Simulation
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['NORMAL', 'ARRIVING', 'ARRIVED', 'OUTSIDE_GEOFENCE'] as GPSState[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setGpsState(st)}
                    className={`p-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                      gpsState === st
                        ? 'bg-[#FACC15] text-slate-950 border-amber-400 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auto Fill Codes */}
          {activeOrder && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                Auto-Fill Verification Codes
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => verifyPickupCode('4821')}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <KeyRound size={14} />
                  <span>Auto-Pickup (4821)</span>
                </button>
                <button
                  onClick={() => verifyDeliveryOtp('9102')}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <ShieldCheck size={14} />
                  <span>Auto-OTP (9102)</span>
                </button>
              </div>
            </div>
          )}

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={resetDemoData}
              className="w-full p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw size={14} />
              <span>RESET DEMO DATA & METRICS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
