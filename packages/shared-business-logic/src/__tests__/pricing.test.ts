import { calculateOrderPricing, isValidStatusTransition, formatCurrencyPaise } from '../index';

describe('CraveCart Shared Business Logic Tests', () => {
  test('formatCurrencyPaise converts integer paise to INR string correctly', () => {
    expect(formatCurrencyPaise(25000)).toBe('₹250.00');
    expect(formatCurrencyPaise(4000)).toBe('₹40.00');
    expect(formatCurrencyPaise(0)).toBe('₹0.00');
  });

  test('calculateOrderPricing computes subtotal, GST, delivery fee and total correctly', () => {
    const result = calculateOrderPricing({
      items: [
        { unit_price_paise: 32000, quantity: 1 }, // ₹320
        { unit_price_paise: 42000, quantity: 1 }, // ₹420
      ],
      baseDeliveryFeePaise: 4000, // ₹40
      freeDeliveryThresholdPaise: 100000, // ₹1000 (threshold not met)
    });

    expect(result.subtotal_paise).toBe(74000); // ₹740
    expect(result.delivery_fee_paise).toBe(4000); // ₹40
    expect(result.service_fee_paise).toBe(1500); // ₹15
    expect(result.tax_paise).toBe(3700); // 5% of ₹740 = ₹37
    expect(result.final_total_paise).toBe(74000 + 4000 + 1500 + 3700); // 83200 paise (₹832)
  });

  test('calculateOrderPricing applies free delivery threshold when subtotal exceeds limit', () => {
    const result = calculateOrderPricing({
      items: [{ unit_price_paise: 60000, quantity: 1 }], // ₹600
      baseDeliveryFeePaise: 4000,
      freeDeliveryThresholdPaise: 50000, // ₹500
    });

    expect(result.delivery_fee_paise).toBe(0); // Free delivery applied!
  });

  test('calculateOrderPricing applies WELCOME50 coupon percentage discount with cap', () => {
    const coupon = {
      id: 'cp-1',
      code: 'WELCOME50',
      description: '50% off',
      discount_type: 'percentage' as const,
      discount_value: 50,
      max_discount_paise: 10000, // Max ₹100 off
      min_order_amount_paise: 15000,
      valid_from: '2026-01-01',
      valid_until: '2027-12-31',
      usage_limit_per_user: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const result = calculateOrderPricing({
      items: [{ unit_price_paise: 30000, quantity: 1 }], // ₹300
      baseDeliveryFeePaise: 4000,
      coupon,
    });

    expect(result.discount_paise).toBe(10000); // Capped at ₹100
    expect(result.coupon_applied?.code).toBe('WELCOME50');
  });

  test('Order status state machine enforces valid transitions and rejects invalid ones', () => {
    expect(isValidStatusTransition('pending', 'confirmed')).toBe(true);
    expect(isValidStatusTransition('confirmed', 'preparing')).toBe(true);
    expect(isValidStatusTransition('preparing', 'ready_for_pickup')).toBe(true);
    expect(isValidStatusTransition('ready_for_pickup', 'picked_up')).toBe(true);
    expect(isValidStatusTransition('picked_up', 'out_for_delivery')).toBe(true);
    expect(isValidStatusTransition('out_for_delivery', 'delivered')).toBe(true);

    // Invalid transitions must be rejected!
    expect(isValidStatusTransition('delivered', 'preparing')).toBe(false);
    expect(isValidStatusTransition('delivered', 'confirmed')).toBe(false);
    expect(isValidStatusTransition('cancelled', 'delivered')).toBe(false);
  });
});
