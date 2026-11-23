import React, { useState } from 'react';
import { Order, GPSState } from '../../types';
import { SimulatedMapView } from '../map/SimulatedMapView';
import { CategoryBadge } from '../common/CategoryBadge';
import { SwipeToConfirm } from '../common/SwipeToConfirm';
import { PickupVerificationModal } from './PickupVerificationModal';
import { DeliveryOTPModal } from './DeliveryOTPModal';
import { IssueReportModal } from './IssueReportModal';
import {
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Package,
  Clock,
  KeyRound,
  Lock,
  Layers,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDelivery } from '../../context/DeliveryContext';

interface ActiveDeliveryWorkflowProps {
  order: Order;
  gpsState: GPSState;
  onUpdateState: (state: any) => void;
  onVerifyPickup: (code: string) => boolean;
  onVerifyOtp: (otp: string) => boolean;
  onCancelOrder: (reason: string) => void;
  isStoreCodeError?: boolean;
  isOtpError?: boolean;
}

export const ActiveDeliveryWorkflow: React.FC<ActiveDeliveryWorkflowProps> = ({
  order,
  gpsState,
  onUpdateState,
  onVerifyPickup,
  onVerifyOtp,
  onCancelOrder,
  isStoreCodeError = false,
  isOtpError = false,
}) => {
  const { t } = useLanguage();
  const {
    activeOrders,
    activeOrderId,
    setActiveOrderId,
    remainingCancellations,
    capacityFullError,
    routeIncompatibleError,
    clearErrors,
  } = useDelivery();
  const [showItemsList, setShowItemsList] = useState<boolean>(false);
  const [showPickupModal, setShowPickupModal] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [issueType, setIssueType] = useState<'STORE' | 'CUSTOMER' | 'CANCEL' | null>(null);

  const isHeadingToPickup = order.status === 'ACCEPTED' || order.status === 'GOING_TO_PICKUP';
  const isAtStore = order.status === 'ARRIVED_AT_PICKUP' || order.status === 'PICKUP_VERIFICATION';
  const isHeadingToCustomer = order.status === 'PICKED_UP' || order.status === 'GOING_TO_CUSTOMER';
  const isAtCustomer = order.status === 'ARRIVED_AT_CUSTOMER' || order.status === 'DELIVERY_OTP';

  // 14 Operational Stages Mapping
  const getCurrentStageNumber = () => {
    if (order.status === 'ACCEPTED') return 3; // Navigate to restaurant
    if (order.status === 'GOING_TO_PICKUP') return 4; // GPS restaurant arrival verification
    if (order.status === 'ARRIVED_AT_PICKUP') return 6; // Store provides pickup code
    if (order.status === 'PICKUP_VERIFICATION') return 7; // Verify code
    if (order.status === 'PICKED_UP') return 8; // Reveal customer details
    if (order.status === 'GOING_TO_CUSTOMER') return 9; // Navigate to customer
    if (order.status === 'ARRIVED_AT_CUSTOMER') return 12; // Enter customer OTP
    if (order.status === 'DELIVERY_OTP') return 13; // Validate OTP
    if (order.status === 'DELIVERED') return 14; // Complete delivery
    return 2;
  };

  const currentStage = getCurrentStageNumber();

  // Timeline Step Status Indicator
  const timelineSteps = [
    { label: 'Accepted', active: true },
    { label: 'Store Pickup', active: isAtStore || isHeadingToCustomer || isAtCustomer },
    { label: 'Verified Code', active: isHeadingToCustomer || isAtCustomer },
    { label: 'Customer Drop', active: isAtCustomer },
    { label: 'Completed', active: order.status === 'DELIVERED' },
  ];

  const handleOpenStoreMaps = () => {
    const query = encodeURIComponent(`${order.store.name}, ${order.store.address}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const handleOpenCustomerMaps = () => {
    const query = encodeURIComponent(`${order.customer.name}, ${order.customer.address}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  // Multi-order stop sequence calculation
  const currentCapacityCount = activeOrders.length || 1;
  const isMultiOrder = activeOrders.length > 1;

  // Determine current stop and next stop
  const currentStopName = isHeadingToPickup || isAtStore ? order.store.name : order.customer.name;
  const currentStopType = isHeadingToPickup || isAtStore ? 'Pickup' : 'Drop';

  return (
    <div className="space-y-4 font-sans">
      {/* Section 13: Capacity Full Alert Banner */}
      {capacityFullError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-700 shrink-0" />
            <span>{capacityFullError}</span>
          </div>
          <button onClick={clearErrors} className="text-slate-400 hover:text-slate-900 text-xs px-2 py-0.5">✕</button>
        </div>
      )}

      {/* Section 13: Route Incompatible Alert Banner */}
      {routeIncompatibleError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-700 shrink-0" />
            <span>{routeIncompatibleError}</span>
          </div>
          <button onClick={clearErrors} className="text-slate-400 hover:text-slate-900 text-xs px-2 py-0.5">✕</button>
        </div>
      )}

      {/* Section 13: Multi-Order Capacity & Stop Sequence Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-amber-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FACC15]" />
            </span>
            <span className="text-xs font-black tracking-wider text-amber-400 uppercase">
              Connected Route Mode
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-xs">
            <Layers size={13} />
            <span>Active Orders: {currentCapacityCount}/5</span>
          </div>
        </div>

        {/* Multi-Order Tabs Switcher (When partner has multiple active orders) */}
        {isMultiOrder && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {activeOrders.map((ord, idx) => {
              const isSelected = ord.id === order.id;
              return (
                <button
                  key={ord.id}
                  onClick={() => setActiveOrderId(ord.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FACC15] text-slate-950 border-[#FACC15] shadow-md shadow-amber-400/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/80'
                  }`}
                >
                  <span className="font-mono text-[11px] font-black">#{ord.id}</span>
                  <span className="text-[11px] opacity-80 truncate max-w-[90px]">{ord.store.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded uppercase font-black bg-black/20">
                    {ord.status === 'ACCEPTED' ? 'To Store' : ord.status === 'PICKED_UP' ? 'With You' : ord.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Current & Next Stop Sequence Indicator */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <MapPin size={11} />
              <span>Current Stop ({currentStopType})</span>
            </div>
            <div className="text-slate-100 font-extrabold truncate mt-0.5">{currentStopName}</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Navigation size={11} />
              <span>Route Plan</span>
            </div>
            <div className="text-slate-300 font-medium truncate mt-0.5">
              {isHeadingToPickup || isAtStore ? `Next: Deliver to ${order.customer.name}` : 'Final Drop for Order'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner Alert Bar */}
      <div className="bg-white border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center justify-between text-slate-900">
        <div className="flex items-center gap-3">
          <CategoryBadge category={order.category} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 font-mono">{order.id}</span>
              {order.isBatched && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Layers size={11} />
                  <span>BATCHED</span>
                </span>
              )}
            </div>
            <div className="text-xs text-amber-800 font-bold flex items-center gap-1 mt-0.5">
              <Clock size={12} />
              <span>ETA: {order.estimatedTime} mins</span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] uppercase font-bold text-slate-500">Stage {currentStage} of 14</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Trip Earning</div>
          <div className="text-2xl font-black text-slate-900">₹{order.estimatedEarnings.toFixed(2)}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
            {order.earningsBreakdown.tip > 0 ? `+₹${order.earningsBreakdown.tip.toFixed(2)} Tip` : 'No tip'}
          </div>
        </div>
      </div>

      {/* Progress Timeline Pills */}
      <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between overflow-x-auto gap-2 shadow-xs">
        {timelineSteps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                  step.active
                    ? 'bg-[#FACC15] text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {step.active ? '✓' : idx + 1}
              </div>
              <span className={`text-xs font-semibold ${step.active ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < timelineSteps.length - 1 && <div className="w-4 h-0.5 bg-slate-200" />}
          </div>
        ))}
      </div>

      {/* Interactive Map Simulation View */}
      <SimulatedMapView
        store={order.store}
        customer={isHeadingToCustomer || isAtCustomer ? order.customer : undefined}
        currentStep={order.status}
        gpsState={gpsState}
      />

      {/* Main Delivery Action Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 text-slate-900">
        {/* Step 1 & 2: Store Pickup Details */}
        {(isHeadingToPickup || isAtStore) && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                <span>PICKUP RESTAURANT (STAGE 3 TO 7)</span>
              </div>
              <span className="text-slate-400 font-normal">{order.distanceToPickup} km away</span>
            </div>

            <div className="flex items-start justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{order.store.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{order.store.address}</p>
                {order.store.preparationStatus && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {order.store.preparationStatus}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenStoreMaps}
                  className="p-2.5 rounded-xl bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs"
                  title="Navigate in Google Maps"
                >
                  <ExternalLink size={17} />
                </button>
                <a
                  href={`tel:${order.store.phone}`}
                  className="p-2.5 rounded-xl bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 flex items-center justify-center flex-shrink-0 shadow-xs"
                  title="Call Store"
                >
                  <Phone size={17} />
                </a>
              </div>
            </div>

            {/* Stage 5: Swipe to Confirm Restaurant Arrival */}
            {isHeadingToPickup && (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Stage 4: GPS proximity verified</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Within Store Perimeter
                  </span>
                </div>

                {/* SWIPE TO CONFIRM RESTAURANT ARRIVAL */}
                <SwipeToConfirm
                  label="SWIPE TO CONFIRM STORE ARRIVAL"
                  onConfirm={() => onUpdateState('ARRIVED_AT_PICKUP')}
                  variant="gold"
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setIssueType('STORE')}
                    className="text-xs text-slate-500 hover:text-amber-800 flex items-center gap-1 py-1 cursor-pointer font-semibold"
                  >
                    <AlertTriangle size={14} />
                    <span>Report Store Issue</span>
                  </button>
                  <button
                    onClick={() => setIssueType('CANCEL')}
                    className="text-xs text-rose-600 hover:underline py-1 font-bold cursor-pointer"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}

            {/* Stage 6 & 7: Store Pickup Code Prompt */}
            {isAtStore && (
              <div className="space-y-3 bg-amber-50/60 border border-amber-200 p-4 sm:p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <KeyRound size={16} />
                    <span>STAGE 6 & 7: STORE PICKUP CODE</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Collect the packed order and ask cashier for their 4-digit verification code. Customer delivery address will be revealed upon code validation.
                </p>
                <button
                  onClick={() => setShowPickupModal(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-sm shadow-md shadow-amber-200/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <KeyRound size={18} />
                  <span>ENTER 4-DIGIT PICKUP CODE</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 & 4: Customer Navigation Details (Stage 8 to 14) */}
        {(isHeadingToCustomer || isAtCustomer) && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} />
                <span>CUSTOMER DELIVERY LOCATION (UNLOCKED)</span>
              </div>
              <span className="text-slate-400 font-normal">{order.deliveryDistance} km drop</span>
            </div>

            <div className="flex items-start justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{order.customer.name}</h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{order.customer.address}</p>
                {order.customer.instructions && (
                  <p className="text-xs text-amber-900 bg-amber-100/60 border border-amber-200 p-2.5 rounded-xl mt-2 font-medium">
                    Note: {order.customer.instructions}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCustomerMaps}
                  className="p-2.5 rounded-xl bg-white text-emerald-600 hover:text-emerald-700 border border-slate-200/90 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs"
                  title="Navigate in Google Maps"
                >
                  <ExternalLink size={17} />
                </button>
                <a
                  href={`tel:${order.customer.phone}`}
                  className="p-2.5 rounded-xl bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 flex items-center justify-center flex-shrink-0 shadow-xs"
                  title="Call Customer"
                >
                  <Phone size={17} />
                </a>
              </div>
            </div>

            {/* Stage 11: Swipe to Confirm Customer Arrival */}
            {isHeadingToCustomer && (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Stage 10: GPS customer drop arrival check</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> At Drop Location
                  </span>
                </div>

                {/* SWIPE TO CONFIRM CUSTOMER ARRIVAL */}
                <SwipeToConfirm
                  label="SWIPE TO CONFIRM CUSTOMER ARRIVAL"
                  onConfirm={() => onUpdateState('ARRIVED_AT_CUSTOMER')}
                  variant="gold"
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setIssueType('CUSTOMER')}
                    className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 py-1 cursor-pointer font-semibold"
                  >
                    <AlertTriangle size={14} />
                    <span>Report Customer Issue</span>
                  </button>
                  <button
                    onClick={() => setIssueType('CANCEL')}
                    className="text-xs text-rose-600 hover:underline py-1 font-bold cursor-pointer"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}

            {/* Stage 12 & 13: Customer OTP */}
            {isAtCustomer && (
              <div className="space-y-3 bg-emerald-50/60 border border-emerald-200 p-4 sm:p-5 rounded-2xl">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  <span>STAGE 12 & 13: ENTER CUSTOMER OTP</span>
                </div>
                <p className="text-xs text-slate-600">
                  Hand over the items to {order.customer.name} and ask for their 4-digit delivery OTP to validate completion and credit ₹{order.estimatedEarnings.toFixed(2)}.
                </p>
                <button
                  onClick={() => setShowOtpModal(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-sm shadow-md shadow-amber-200/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ShieldCheck size={18} />
                  <span>ENTER CUSTOMER DELIVERY OTP</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Itemized Order Package Details Drawer */}
        <div className="border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowItemsList(!showItemsList)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-900 font-semibold py-1 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Package size={16} className="text-amber-600" />
              <span>Package Items ({order.itemCount} items)</span>
            </div>
            {showItemsList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showItemsList && (
            <div className="mt-3 space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-900">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                  <span className="font-medium">{item.quantity}x {item.name}</span>
                  <span className="text-slate-950 font-extrabold">₹{item.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pickup Verification Code Modal */}
      {showPickupModal && (
        <PickupVerificationModal
          store={order.store}
          onVerify={(code) => {
            const ok = onVerifyPickup(code);
            if (ok) setShowPickupModal(false);
            return ok;
          }}
          onClose={() => setShowPickupModal(false)}
          isError={isStoreCodeError}
        />
      )}

      {/* Customer Delivery OTP Modal */}
      {showOtpModal && (
        <DeliveryOTPModal
          customer={order.customer}
          onVerify={(otp) => {
            const ok = onVerifyOtp(otp);
            if (ok) setShowOtpModal(false);
            return ok;
          }}
          onClose={() => setShowOtpModal(false)}
          isError={isOtpError}
        />
      )}

      {/* Issue / Cancellation Modal */}
      {issueType && (
        <IssueReportModal
          type={issueType}
          remainingCancellations={remainingCancellations}
          onClose={() => setIssueType(null)}
          onSubmitIssue={(reason) => {
            if (issueType === 'CANCEL') {
              onCancelOrder(reason);
            }
            setIssueType(null);
          }}
        />
      )}
    </div>
  );
};
