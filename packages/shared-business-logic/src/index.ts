import {
  OrderStatus,
  UserRoleType,
  Coupon,
  PricingCalculationResult,
} from '@cravecart/shared-types';

/**
 * Format integer paise to Indian Rupee string representation
 * e.g., 25000 -> "₹250.00"
 */
export function formatCurrencyPaise(paise: number): string {
  const rupees = (paise / 100).toFixed(2);
  return `₹${rupees}`;
}

/**
 * Validates allowed status transitions in the CraveCart order state machine
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled', 'payment_failed'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup'],
  ready_for_pickup: ['picked_up'],
  picked_up: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
  payment_failed: ['pending'],
};

export function isValidStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

export function getAllowedNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
}

export interface PricingInputItem {
  unit_price_paise: number;
  quantity: number;
  customization_total_paise?: number;
}

export interface PricingInputParams {
  items: PricingInputItem[];
  baseDeliveryFeePaise: number;
  freeDeliveryThresholdPaise?: number | null;
  minOrderAmountPaise?: number;
  coupon?: Coupon | null;
  taxRate?: number; // default 0.05 (5% GST)
  serviceFeePaise?: number; // default 1500 paise (₹15)
}

/**
 * Server-authoritative order pricing calculation
 */
export function calculateOrderPricing({
  items,
  baseDeliveryFeePaise,
  freeDeliveryThresholdPaise,
  minOrderAmountPaise = 0,
  coupon,
  taxRate = 0.05,
  serviceFeePaise = 1500,
}: PricingInputParams): PricingCalculationResult {
  // 1. Calculate items subtotal including customizations
  const subtotal_paise = items.reduce((sum, item) => {
    const custFee = item.customization_total_paise || 0;
    return sum + (item.unit_price_paise + custFee) * item.quantity;
  }, 0);

  if (minOrderAmountPaise > 0 && subtotal_paise < minOrderAmountPaise) {
    throw new Error(
      `Order subtotal (${formatCurrencyPaise(
        subtotal_paise
      )}) is below restaurant minimum (${formatCurrencyPaise(minOrderAmountPaise)})`
    );
  }

  // 2. Calculate coupon discount
  let discount_paise = 0;
  let couponApplied: { code: string; discount_paise: number } | null = null;

  if (coupon && coupon.is_active) {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now >= validFrom && now <= validUntil && subtotal_paise >= coupon.min_order_amount_paise) {
      if (coupon.discount_type === 'flat') {
        discount_paise = coupon.discount_value;
      } else if (coupon.discount_type === 'percentage') {
        discount_paise = Math.round((subtotal_paise * coupon.discount_value) / 100);
        if (coupon.max_discount_paise && discount_paise > coupon.max_discount_paise) {
          discount_paise = coupon.max_discount_paise;
        }
      }

      // Ensure discount doesn't exceed subtotal
      if (discount_paise > subtotal_paise) {
        discount_paise = subtotal_paise;
      }

      couponApplied = {
        code: coupon.code,
        discount_paise,
      };
    }
  }

  // 3. Calculate delivery fee
  let delivery_fee_paise = baseDeliveryFeePaise;
  if (
    freeDeliveryThresholdPaise &&
    freeDeliveryThresholdPaise > 0 &&
    subtotal_paise >= freeDeliveryThresholdPaise
  ) {
    delivery_fee_paise = 0;
  }

  // 4. Calculate Tax (GST)
  const taxable_amount = Math.max(0, subtotal_paise - discount_paise);
  const tax_paise = Math.round(taxable_amount * taxRate);

  // 5. Final total
  const final_total_paise = taxable_amount + delivery_fee_paise + serviceFeePaise + tax_paise;

  return {
    subtotal_paise,
    discount_paise,
    delivery_fee_paise,
    service_fee_paise: serviceFeePaise,
    tax_paise,
    final_total_paise,
    coupon_applied: couponApplied,
  };
}

/**
 * Role-based permission checks
 */
export function canUserPerformStatusUpdate(
  userRole: UserRoleType,
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  if (!isValidStatusTransition(currentStatus, nextStatus)) {
    return false;
  }

  if (userRole === 'admin') return true;

  if (userRole === 'restaurant_owner' || userRole === 'restaurant_staff') {
    return ['confirmed', 'rejected', 'preparing', 'ready_for_pickup'].includes(nextStatus);
  }

  if (userRole === 'delivery_partner') {
    return ['picked_up', 'out_for_delivery', 'delivered'].includes(nextStatus);
  }

  if (userRole === 'customer') {
    return currentStatus === 'pending' && nextStatus === 'cancelled';
  }

  return false;
}
