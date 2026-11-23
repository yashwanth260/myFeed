import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import { MapPin, Clock, ArrowRight, ShieldCheck, Layers, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { orderAlertService } from '../../services/orderAlertService';

interface OrderOfferModalProps {
  order: Order;
  onAccept: () => void;
  onDecline: () => void;
}

export const OrderOfferModal: React.FC<OrderOfferModalProps> = ({
  order,
  onAccept,
  onDecline,
}) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Trigger loud sound and vibration for incoming order (max 30s)
  useEffect(() => {
    orderAlertService.startAlert(30000);

    const unsubscribe = orderAlertService.subscribe((_alerting, muted) => {
      setIsMuted(muted);
    });

    return () => {
      unsubscribe();
      orderAlertService.stopAlert();
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      orderAlertService.stopAlert();
      onDecline();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onDecline]);

  const handleAccept = () => {
    orderAlertService.stopAlert();
    onAccept();
  };

  const handleDecline = () => {
    orderAlertService.stopAlert();
    onDecline();
  };

  const handleUnmute = () => {
    orderAlertService.attemptUnmute();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden relative text-slate-900">
        {/* Top Radar Pulse Alert Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FACC15]" />
            </span>
            <span className="text-xs font-black tracking-widest text-amber-800 uppercase">
              {order.isBatched ? 'SMART BATCHED OFFER' : 'NEW ORDER OFFER'}
            </span>
          </div>

          {/* Sound & Vibration Indicator + Countdown Ring Timer */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-300 text-amber-900 text-[11px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <Volume2 size={13} className="text-amber-800 animate-pulse" />
              <Smartphone size={12} className="text-amber-800 animate-bounce" />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs shadow-xs">
              <Clock size={13} className="text-amber-700" />
              <span>Accept in {timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Fallback Unmute Banner if audio was blocked by browser gesture policy */}
        {isMuted && (
          <button
            type="button"
            onClick={handleUnmute}
            className="w-full mb-3 py-2 px-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <VolumeX size={15} className="text-amber-700" />
            <span>Audio paused by browser — Tap here to play loud siren</span>
          </button>
        )}

        {/* Order Category & Order ID */}
        <div className="flex items-center justify-between gap-2 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <CategoryBadge category={order.category} size="md" />
            {order.isBatched && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Layers size={12} />
                <span>2 DROPS</span>
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Order ID</div>
            <div className="text-xs font-mono font-bold text-slate-900">{order.id}</div>
          </div>
        </div>

        {/* Big Expected Earnings Highlight Card (Trip Earning Guaranteed) */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-amber-500/10 p-4 sm:p-5 rounded-2xl border border-amber-300/80 mb-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              Guaranteed Delivery Pay
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl text-amber-600">₹</span>
              <span>
                {(order.earningsBreakdown.deliveryEarning ?? 
                  (order.estimatedEarnings - (order.earningsBreakdown.tip || 0))).toFixed(2)}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              Settled directly to Wednesday bank deposit
            </div>
          </div>

          <div className="text-right border-l border-amber-200/80 pl-4">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              Total Route
            </div>
            <div className="text-xl font-black text-slate-900">{order.totalDistance} km</div>
            <div className="text-[11px] text-slate-500">~{order.estimatedTime} mins</div>
          </div>
        </div>

        {/* Route Details (Store & Delivery Area Preview - Protected Address) */}
        <div className="space-y-3 mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          {/* Pickup Store */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <MapPin size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold text-[10px] uppercase">RESTAURANT PICKUP</span>
                <span className="text-amber-800 font-black">{order.distanceToPickup} km away</span>
              </div>
              <div className="text-sm font-bold text-slate-900 truncate mt-0.5">{order.store.name}</div>
              <div className="text-xs text-slate-500 truncate">{order.store.address}</div>
            </div>
          </div>

          <div className="ml-4 border-l-2 border-dashed border-slate-300 h-3 my-0.5" />

          {/* Delivery Area (Strictly Masked Before Pickup) */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <MapPin size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold text-[10px] uppercase">DELIVERY DESTINATION</span>
                <span className="text-blue-600 font-black">{order.deliveryDistance} km drop</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{order.zone} Delivery Cluster</div>
              <div className="text-[11px] text-amber-900 flex items-center gap-1 mt-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <ShieldCheck size={12} className="text-amber-700 shrink-0" />
                <span>Protected: Exact customer address unlocks after 4-digit pickup code</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDecline}
            className="py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 transition-colors cursor-pointer shadow-xs"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-sm transition-all shadow-md shadow-amber-200/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Accept Order</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
