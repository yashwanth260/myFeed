/**
 * CraveCart Restaurant Partner API Bridge
 * Connects the Feedo Restaurant Partner Application with the CraveCart Core Backend (Port 4000).
 * Handles live kitchen orders, status transitions (ACCEPT, PREPARING, READY_FOR_PICKUP),
 * menu stock toggles, and catalog sync.
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

export const restaurantApiBridge = {
  /**
   * Fetch active orders from CraveCart Backend
   */
  async fetchOrders(restaurantId: string = 'res-feedo-central'): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders?restaurantId=${encodeURIComponent(restaurantId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.orders || [];
    } catch {
      return [];
    }
  },

  /**
   * Update Order Status (CONFIRMED, PREPARING, READY_FOR_PICKUP, REJECTED)
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch Restaurant Menu Items
   */
  async fetchMenu(restaurantId: string = 'res-feedo-central'): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/restaurants/${encodeURIComponent(restaurantId)}/menu`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.items || [];
    } catch {
      return [];
    }
  },

  /**
   * Toggle Item Stock Availability
   */
  async toggleItemStock(restaurantId: string, itemId: string, isAvailable: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/restaurants/${encodeURIComponent(restaurantId)}/menu/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

