/**
 * CraveCart Delivery Partner API Bridge
 * Connects the Feedo Delivery Partner Application with the CraveCart Core Backend (Port 4000).
 * Handles offers, atomic acceptance, fulfillment steps (pickup, out for delivery, drop),
 * GPS tracking, and duty status with safe offline fallbacks.
 */

const getBaseUrl = (): string => {
  if (typeof process !== 'undefined' && (process.env as any)?.REACT_APP_API_URL) {
    return (process.env as any).REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host === '10.0.2.2') {
      return 'http://10.0.2.2:4000/api/v1';
    }
    return `http://${host}:4000/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
};

const API_BASE_URL = getBaseUrl();

export const deliveryApiBridge = {
  /**
   * Set Driver Duty Status (Online / Offline)
   */
  async setDutyStatus(isOnline: boolean, driverId: string = 'usr-delivery-01'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/duty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, isOnline }),
      });
      return res.ok;
    } catch {
      return false; // Silent graceful fallback in offline or standalone demo mode
    }
  },

  /**
   * Fetch Active Backend Offers for Driver
   */
  async fetchAvailableOffers(driverId: string = 'usr-delivery-01'): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/offers?driverId=${encodeURIComponent(driverId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.offers || [];
    } catch {
      return [];
    }
  },

  /**
   * Concurrency-safe atomic offer acceptance
   */
  async acceptOffer(orderId: string, driverId: string = 'usr-delivery-01'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/offers/${encodeURIComponent(orderId)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Advance order step (PICKUP, START_DELIVERY, COMPLETE_DELIVERY)
   */
  async advanceDeliveryStep(
    orderId: string,
    step: 'PICKUP' | 'START_DELIVERY' | 'COMPLETE_DELIVERY',
    driverId: string = 'usr-delivery-01'
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/orders/${encodeURIComponent(orderId)}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, step }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Record Driver Real-time GPS Location
   */
  async recordLocation(
    orderId: string | null,
    coords: { lat: number; lng: number; heading?: number; speed?: number },
    driverId: string = 'usr-delivery-01'
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          orderId,
          coords,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

