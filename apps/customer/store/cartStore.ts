import { create } from 'zustand';
import { MenuItem, SelectedCustomization, Restaurant } from '@cravecart/shared-types';

export interface LocalCartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations: SelectedCustomization[];
  unit_price_paise: number;
  line_total_paise: number;
}

interface CartState {
  restaurant: Restaurant | null;
  items: LocalCartItem[];
  couponCode: string | null;
  addItem: (restaurant: Restaurant, menuItem: MenuItem, quantity: number, customizations: SelectedCustomization[]) => boolean;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getSubtotalPaise: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurant: null,
  items: [],
  couponCode: null,

  addItem: (restaurant, menuItem, quantity, customizations) => {
    const currentRes = get().restaurant;
    const currentItems = get().items;

    // Enforce 1-restaurant-per-cart rule
    if (currentRes && currentRes.id !== restaurant.id && currentItems.length > 0) {
      return false; // Prompt user to clear cart or reject
    }

    const custPrice = customizations.reduce((acc, c) => acc + c.price_paise, 0);
    const unitPrice = menuItem.price_paise;
    const lineTotal = (unitPrice + custPrice) * quantity;

    const existingIndex = currentItems.findIndex(
      (i) => i.menuItem.id === menuItem.id && JSON.stringify(i.customizations) === JSON.stringify(customizations)
    );

    let updatedItems = [...currentItems];
    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex];
      const newQty = existing.quantity + quantity;
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        line_total_paise: (unitPrice + custPrice) * newQty,
      };
    } else {
      updatedItems.push({
        menuItem,
        quantity,
        customizations,
        unit_price_paise: unitPrice,
        line_total_paise: lineTotal,
      });
    }

    set({
      restaurant,
      items: updatedItems,
    });
    return true;
  },

  removeItem: (menuItemId) => {
    const updated = get().items.filter((i) => i.menuItem.id !== menuItemId);
    set({
      items: updated,
      restaurant: updated.length === 0 ? null : get().restaurant,
    });
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }

    const updated = get().items.map((i) => {
      if (i.menuItem.id === menuItemId) {
        const custPrice = i.customizations.reduce((acc, c) => acc + c.price_paise, 0);
        return {
          ...i,
          quantity,
          line_total_paise: (i.unit_price_paise + custPrice) * quantity,
        };
      }
      return i;
    });

    set({ items: updated });
  },

  applyCoupon: (code) => set({ couponCode: code }),
  removeCoupon: () => set({ couponCode: null }),

  clearCart: () => set({ restaurant: null, items: [], couponCode: null }),

  getSubtotalPaise: () => {
    return get().items.reduce((sum, item) => sum + item.line_total_paise, 0);
  },
}));
