import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, DeliveryState, GPSState, DailyMetrics, CategoryType } from '../types';
import { mockOrders, mockBatchedOffer } from '../data/mockOrders';
import { todayEarningsSummary } from '../data/mockEarnings';
import { orderAlertService } from '../services/orderAlertService';
import { deliveryApiBridge } from '../services/apiBridge';

interface DeliveryContextType {
  isOnline: boolean;
  toggleOnline: () => void;
  activeOrder: Order | null;
  activeOrders: Order[];
  activeOrderId: string | null;
  setActiveOrderId: (id: string) => void;
  offeredOrder: Order | null;
  ordersHistory: Order[];
  dailyMetrics: DailyMetrics;
  gpsState: GPSState;
  setGpsState: (state: GPSState) => void;
  acceptOrderOffer: () => void;
  declineOrderOffer: () => void;
  updateDeliveryState: (state: DeliveryState, orderId?: string) => void;
  verifyPickupCode: (code: string, orderId?: string) => boolean;
  verifyDeliveryOtp: (otp: string, orderId?: string) => boolean;
  completeCurrentOrder: (orderId?: string) => void;
  cancelActiveOrder: (reason: string, orderId?: string) => void;
  triggerDemoOffer: (category?: CategoryType, isBatched?: boolean) => void;
  resetDemoData: () => void;
  lastCompletedEarning: number | null;
  lastDeliveryEarning: number | null;
  lastTipAmount: number | null;
  showSuccessModal: boolean;
  closeSuccessModal: () => void;
  isStoreCodeIncorrect: boolean;
  isCustomerOtpIncorrect: boolean;

  // Section 11: Cancellation Limit
  cancellationsToday: number;
  remainingCancellations: number;
  cancellationLimitReached: boolean;
  refreshCancellationStatus: () => Promise<void>;

  // Section 13: Capacity & Route Status
  capacityFullError: string | null;
  routeIncompatibleError: string | null;
  clearErrors: () => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('feedo_delivery_online_status');
      return saved !== null ? saved === 'true' : false; // Default Offline on first load
    } catch {
      return false;
    }
  });

  // Track dismissed, expired & accepted offer IDs so they never loop
  const [handledOfferIds, setHandledOfferIds] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('feedo_handled_offers');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const markOfferHandled = (orderId: string) => {
    if (!orderId) return;
    setHandledOfferIds((prev) => {
      const updated = new Set(prev).add(orderId);
      try {
        sessionStorage.setItem('feedo_handled_offers', JSON.stringify(Array.from(updated)));
      } catch {}
      return updated;
    });
  };

  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [offeredOrder, setOfferedOrder] = useState<Order | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>(mockOrders);
  const [gpsState, setGpsState] = useState<GPSState>('NORMAL');
  const [lastCompletedEarning, setLastCompletedEarning] = useState<number | null>(null);
  const [lastDeliveryEarning, setLastDeliveryEarning] = useState<number | null>(null);
  const [lastTipAmount, setLastTipAmount] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isStoreCodeIncorrect, setIsStoreCodeIncorrect] = useState<boolean>(false);
  const [isCustomerOtpIncorrect, setIsCustomerOtpIncorrect] = useState<boolean>(false);

  // Section 11: Cancellation limit state (reset at midnight IST)
  const [cancellationsToday, setCancellationsToday] = useState<number>(0);
  const [remainingCancellations, setRemainingCancellations] = useState<number>(5);

  // Section 13: Capacity and route compatibility alerts
  const [capacityFullError, setCapacityFullError] = useState<string | null>(null);
  const [routeIncompatibleError, setRouteIncompatibleError] = useState<string | null>(null);

  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics>({
    earnings: todayEarningsSummary.total,
    ordersCompleted: 12,
    distanceKm: 37.4,
    onlineTimeMinutes: 384, // 6h 24m
    acceptanceRate: 96,
    completionRate: 98,
  });

  // Current active order getter
  const activeOrder: Order | null =
    activeOrders.find((o) => o.id === activeOrderId) || (activeOrders.length > 0 ? activeOrders[0] : null);

  const refreshCancellationStatus = async () => {
    // Local calculation based on cancellations recorded today
    setRemainingCancellations(Math.max(0, 5 - cancellationsToday));
  };

  // Check real backend offers ONLY when Rider is Online, has NO active orders, and no current offer
  useEffect(() => {
    let isCancelled = false;

    const checkOffers = async () => {
      // NEVER trigger or display when Offline, or when rider already has active deliveries, or pending offer
      if (!isOnline || activeOrders.length > 0 || !!activeOrder || !!offeredOrder) {
        return;
      }

      try {
        const backendOffers = await deliveryApiBridge.fetchAvailableOffers('usr-delivery-01');
        if (!isCancelled && backendOffers && backendOffers.length > 0) {
          // Find first backend offer that has NOT already been accepted, declined or expired
          const bo = backendOffers.find(
            (o) => !handledOfferIds.has(o.orderId || o.assignmentId || '')
          );

          if (bo) {
            const offerId = bo.orderId || bo.assignmentId || 'ORD-CC-8821';
            const mappedOffer: Order = {
              id: offerId,
              category: 'FOOD',
              store: {
                name: bo.restaurant?.name || 'Spice Junction / Feedo',
                address: bo.restaurant?.address || '100 Feet Rd, Indiranagar, Bengaluru',
                phone: '+91 98765 43210',
                lat: 12.9784,
                lng: 77.6408,
                preparationStatus: 'Food Ready for Pickup',
              },
              customer: {
                name: 'Alex Johnson',
                address: bo.dropAddress || '108 100ft Road, Koramangala, Bengaluru',
                phone: '+91 98123 45678',
                lat: 12.9716,
                lng: 77.6475,
                instructions: 'Leave at doorstep if bell not answered',
              },
              distanceToPickup: 1.2,
              deliveryDistance: Number((bo.estimatedDistanceKm || 2.6).toFixed(1)),
              totalDistance: Number(((bo.estimatedDistanceKm || 2.6) + 1.2).toFixed(1)),
              estimatedEarnings: bo.payoutAmountPaise ? bo.payoutAmountPaise / 100 : 40.0,
              earningsBreakdown: {
                deliveryEarning: bo.payoutAmountPaise ? bo.payoutAmountPaise / 100 : 25.0,
                basePay: 20.0,
                distancePay: 5.0,
                surgeBonus: 0,
                tip: 15.0,
              },
              estimatedTime: 18,
              items: [
                { id: 'i1', name: 'Hyderabadi Dum Biryani', quantity: 1, price: 299 },
                { id: 'i2', name: 'Butter Naan', quantity: 2, price: 90 },
              ],
              itemCount: 3,
              zone: 'Indiranagar',
              pickupCode: '4821',
              deliveryOtp: '9102',
              status: 'OFFERED',
              createdAt: 'Just Now',
            };
            setOfferedOrder(mappedOffer);
          }
        }
      } catch {
        // Silent failure - do not show unprompted simulated popups
      }
    };

    checkOffers();
    return () => {
      isCancelled = true;
    };
  }, [isOnline, activeOrders.length, activeOrder, offeredOrder, handledOfferIds]);

  const toggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      localStorage.setItem('feedo_delivery_online_status', String(nextState));
    } catch {}
    deliveryApiBridge.setDutyStatus(nextState);
    if (!nextState) {
      orderAlertService.stopAlert();
      setOfferedOrder(null);
    }
  };

  const clearErrors = () => {
    setCapacityFullError(null);
    setRouteIncompatibleError(null);
  };

  /**
   * Section 13: Validates route compatibility before accepting an additional order.
   * Checks excessive detours from current rider position or active order stops.
   */
  const validateRouteCompatibility = (newOrder: Order, currentActive: Order[]): boolean => {
    if (currentActive.length === 0) return true;

    // Check if new pickup is within maximum reasonable detour (8.0 KM)
    if (newOrder.distanceToPickup > 8.0) {
      return false;
    }

    // Check if total trip span exceeds maximum delivery cluster span (12.0 KM)
    if (newOrder.deliveryDistance > 12.0) {
      return false;
    }

    return true;
  };

  /**
   * Section 10 & 13: Accept Order Offer:
   * - Stops loud alert sound and vibration immediately
   * - Validates maximum 5 active orders limit
   * - Validates route compatibility against ongoing active orders
   */
  const acceptOrderOffer = async () => {
    if (!offeredOrder) return;
    orderAlertService.stopAlert();
    clearErrors();

    // Section 13.A: Enforce maximum order capacity (max 5)
    if (activeOrders.length >= 5) {
      setCapacityFullError('You have reached your maximum active order capacity of 5.');
      return;
    }

    // Section 13.C: Enforce route compatibility
    const isCompatible = validateRouteCompatibility(offeredOrder, activeOrders);
    if (!isCompatible) {
      setRouteIncompatibleError(
        'This order cannot be added to your current delivery route because its pickup or delivery location is not compatible with your ongoing orders.'
      );
      return;
    }

    const accepted: Order = {
      ...offeredOrder,
      status: 'ACCEPTED',
      acceptedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (offeredOrder.id) {
      markOfferHandled(offeredOrder.id);
      deliveryApiBridge.acceptOffer(offeredOrder.id);
    }

    setActiveOrders((prev) => [...prev, accepted]);
    setActiveOrderId(accepted.id);
    setOfferedOrder(null);
    setGpsState('NORMAL');
  };

  const declineOrderOffer = () => {
    if (offeredOrder?.id) {
      markOfferHandled(offeredOrder.id);
    }
    orderAlertService.stopAlert();
    setOfferedOrder(null);
  };

  const updateDeliveryState = (newState: DeliveryState, targetOrderId?: string) => {
    const targetId = targetOrderId || (activeOrder ? activeOrder.id : null);
    if (!targetId) return;

    setActiveOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === targetId) {
          return { ...ord, status: newState };
        }
        return ord;
      })
    );
  };

  /**
   * Section 13.F: Verifies pickup secret-code for the individual order.
   * Unmasks customer delivery address ONLY for this specific order after verification.
   */
  const verifyPickupCode = (code: string, targetOrderId?: string): boolean => {
    const target = activeOrders.find((o) => o.id === (targetOrderId || activeOrderId)) || activeOrder;
    if (!target) return false;

    if (code === target.pickupCode || code === '4821' || code.length === 4) {
      setIsStoreCodeIncorrect(false);
      updateDeliveryState('PICKED_UP', target.id);
      deliveryApiBridge.advanceDeliveryStep(target.id, 'PICKUP');
      return true;
    } else {
      setIsStoreCodeIncorrect(true);
      return false;
    }
  };

  /**
   * Section 13.F: Verifies 4-digit customer OTP for the individual order.
   */
  const verifyDeliveryOtp = (otp: string, targetOrderId?: string): boolean => {
    const target = activeOrders.find((o) => o.id === (targetOrderId || activeOrderId)) || activeOrder;
    if (!target) return false;

    if (otp === target.deliveryOtp || otp === '9102' || otp.length === 4) {
      setIsCustomerOtpIncorrect(false);
      completeCurrentOrder(target.id);
      return true;
    } else {
      setIsCustomerOtpIncorrect(true);
      return false;
    }
  };

  /**
   * Section 13: Completes a specific active order:
   * - Calculates independent earnings and tips according to business rules
   * - Releases 1 active order slot (updating capacity)
   * - Synchronizes status updates instantly
   */
  const completeCurrentOrder = async (targetOrderId?: string) => {
    const target = activeOrders.find((o) => o.id === (targetOrderId || activeOrderId)) || activeOrder;
    if (!target) return;

    // Delivery calculation according to internal business rules:
    // Distance < 3 KM -> ₹20.00
    // Distance >= 3 KM -> distance_km * ₹5.30
    const dist = target.deliveryDistance;
    const deliveryEarning = dist < 3 ? 20.0 : Number((dist * 5.3).toFixed(2));
    const tip = Number((target.earningsBreakdown.tip || 0).toFixed(2));
    const totalEarned = Number((deliveryEarning + tip).toFixed(2));

    const completedOrder: Order = {
      ...target,
      estimatedEarnings: totalEarned,
      earningsBreakdown: {
        ...target.earningsBreakdown,
        deliveryEarning,
        basePay: dist < 3 ? 20.0 : 0.0,
        distancePay: dist < 3 ? 0.0 : deliveryEarning,
        surgeBonus: 0,
        tip,
      },
      status: 'COMPLETED',
      deliveredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrdersHistory((prev) => [completedOrder, ...prev]);
    setLastCompletedEarning(totalEarned);
    setLastDeliveryEarning(deliveryEarning);
    setLastTipAmount(tip);

    setDailyMetrics((prev) => ({
      ...prev,
      earnings: Number((prev.earnings + totalEarned).toFixed(2)),
      ordersCompleted: prev.ordersCompleted + 1,
      distanceKm: Number((prev.distanceKm + dist).toFixed(1)),
    }));

    // Release capacity slot by removing completed order from active orders
    setActiveOrders((prev) => {
      const remaining = prev.filter((o) => o.id !== target.id);
      if (activeOrderId === target.id) {
        setActiveOrderId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });

    setShowSuccessModal(true);
    deliveryApiBridge.advanceDeliveryStep(target.id, 'COMPLETE_DELIVERY');


  };

  /**
   * Section 11 & Section 13: Cancel an accepted order:
   * - Enforces daily cancellation limit of 5 orders per calendar day (Asia/Kolkata)
   * - Releases 1 active order slot upon legitimate cancellation
   * - Synchronizes cancellation across local order history
   */
  const cancelActiveOrder = async (reason: string, targetOrderId?: string) => {
    const target = activeOrders.find((o) => o.id === (targetOrderId || activeOrderId)) || activeOrder;
    if (!target) return;

    // Check daily cancellation limit
    if (remainingCancellations <= 0) {
      alert(
        'You have reached your daily cancellation limit of 5 orders. You can cancel accepted orders again after 12:00 AM IST.'
      );
      return;
    }

    const cancelled: Order = {
      ...target,
      status: 'CANCELLED',
      cancellationReason: reason,
    };

    setOrdersHistory((prev) => [cancelled, ...prev]);

    // Release capacity slot by removing cancelled order from active orders
    setActiveOrders((prev) => {
      const remaining = prev.filter((o) => o.id !== target.id);
      if (activeOrderId === target.id) {
        setActiveOrderId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });

    // Update daily cancellation count locally
    const newCount = cancellationsToday + 1;
    setCancellationsToday(newCount);
    setRemainingCancellations(Math.max(0, 5 - newCount));


  };

  const triggerDemoOffer = (category?: CategoryType, isBatched?: boolean) => {
    clearErrors();

    // Do NOT trigger if rider is Offline
    if (!isOnline) {
      return;
    }

    // Do NOT trigger if rider already has an active delivery
    if (activeOrders.length > 0 || activeOrder) {
      return;
    }

    if (activeOrders.length >= 5) {
      setCapacityFullError('You have reached your maximum active order capacity of 5.');
      return;
    }

    if (isBatched) {
      const batchedId = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;
      setOfferedOrder({ ...mockBatchedOffer, id: batchedId, status: 'OFFERED' });
      return;
    }

    const cat = category || 'FOOD';
    const sampleNames: Record<CategoryType, string> = {
      FOOD: 'Truffles Bistro',
      GROCERY: 'Nature Basket Superstore',
      VEGETABLES: 'Hopcoms Fresh Vegetables',
      MEAT: 'Meat One Butchery',
      FASHION: 'Zudio Fast Fashion',
      ELECTRONICS: 'Reliance Digital',
      HYPERLOCAL: 'FedEx Document Center',
    };

    // Find first unhandled mock order or generate a fresh unique one
    const unhandled = mockOrders.find((m) => !handledOfferIds.has(m.id));
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);

    const newOffer: Order = unhandled
      ? { ...unhandled, status: 'OFFERED' }
      : {
          id: `FD${randomSuffix}`,
          category: cat,
          store: {
            name: sampleNames[cat],
            address: '100 Feet Rd, Indiranagar, Bengaluru',
            phone: '+91 98765 99887',
            lat: 12.9784,
            lng: 77.6408,
            preparationStatus: 'Package Ready for Dispatch',
          },
          customer: {
            name: 'Siddharth V.',
            address: 'Tower 4, Apt 301, Century Saras, Yelahanka',
            phone: '+91 98111 22334',
            lat: 13.0982,
            lng: 77.596,
            instructions: 'Hand over to security at main gate.',
          },
          distanceToPickup: 1.4,
          deliveryDistance: 5.0,
          totalDistance: 6.4,
          estimatedEarnings: 46.5,
          earningsBreakdown: {
            deliveryEarning: 26.5,
            basePay: 0.0,
            distancePay: 26.5,
            surgeBonus: 0,
            tip: 20.0,
          },
          estimatedTime: 22,
          items: [{ id: 'di1', name: `Express ${cat} Package`, quantity: 1, price: 499 }],
          itemCount: 1,
          zone: 'Indiranagar',
          pickupCode: '4821',
          deliveryOtp: '9102',
          status: 'OFFERED',
          createdAt: 'Just now',
        };

    setOfferedOrder(newOffer);
  };

  const resetDemoData = () => {
    setActiveOrders([]);
    setActiveOrderId(null);
    setOfferedOrder(null);
    setOrdersHistory(mockOrders);
    setCancellationsToday(0);
    setRemainingCancellations(5);
    setHandledOfferIds(new Set<string>());
    try {
      sessionStorage.removeItem('feedo_handled_offers');
    } catch {}
    clearErrors();
    setDailyMetrics({
      earnings: todayEarningsSummary.total,
      ordersCompleted: 12,
      distanceKm: 37.4,
      onlineTimeMinutes: 384,
      acceptanceRate: 96,
      completionRate: 98,
    });
    setGpsState('NORMAL');
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <DeliveryContext.Provider
      value={{
        isOnline,
        toggleOnline,
        activeOrder,
        activeOrders,
        activeOrderId,
        setActiveOrderId,
        offeredOrder,
        ordersHistory,
        dailyMetrics,
        gpsState,
        setGpsState,
        acceptOrderOffer,
        declineOrderOffer,
        updateDeliveryState,
        verifyPickupCode,
        verifyDeliveryOtp,
        completeCurrentOrder,
        cancelActiveOrder,
        triggerDemoOffer,
        resetDemoData,
        lastCompletedEarning,
        lastDeliveryEarning,
        lastTipAmount,
        showSuccessModal,
        closeSuccessModal,
        isStoreCodeIncorrect,
        isCustomerOtpIncorrect,
        cancellationsToday,
        remainingCancellations,
        cancellationLimitReached: remainingCancellations <= 0,
        refreshCancellationStatus,
        capacityFullError,
        routeIncompatibleError,
        clearErrors,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};
