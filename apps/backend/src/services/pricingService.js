/**
 * CraveCart Server-Authoritative Pricing Engine
 * Strictly computes all item subtotals, promotional discounts, dynamic delivery fees,
 * packaging fees, 5% GST taxes, and final totals in Integer Paise (100 paise = ₹1.00).
 */

const db = require('../data/store');
const config = require('../config');

function formatCurrencyPaise(paise) {
  const rupees = (paise / 100).toFixed(2);
  return `₹${rupees}`;
}

function calculateOrderPricing({
  restaurantId,
  items, // Array of { menuItemId, quantity, customizations }
  couponCode,
}) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('At least one menu item is required to calculate pricing');
  }

  const restaurant = db.restaurants.get(restaurantId);
  if (!restaurant) {
    throw new Error(`Restaurant with ID '${restaurantId}' not found`);
  }

  // 1. Calculate items subtotal
  let subtotalPaise = 0;
  const processedItems = [];

  for (const item of items) {
    const menuItem = db.menuItems.get(item.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item '${item.menuItemId}' does not exist`);
    }
    if (menuItem.restaurantId !== restaurantId) {
      throw new Error(`Item '${menuItem.name}' does not belong to selected restaurant`);
    }
    if (!menuItem.isAvailable) {
      throw new Error(`Item '${menuItem.name}' is currently sold out`);
    }

    const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
    const unitPricePaise = menuItem.pricePaise;

    // Optional customizations calculation
    let customOptionPaise = 0;
    const itemCustomizations = item.customizations || [];
    if (Array.isArray(itemCustomizations)) {
      for (const cust of itemCustomizations) {
        customOptionPaise += cust.pricePaise || 0;
      }
    }

    const lineTotalPaise = (unitPricePaise + customOptionPaise) * quantity;
    subtotalPaise += lineTotalPaise;

    processedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      unitPricePaise,
      quantity,
      customizations: itemCustomizations,
      lineTotalPaise,
    });
  }

  // 2. Validate minimum order value
  const minOrderPaise = restaurant.minOrderAmountPaise || config.financialRules.baseDeliveryFeePaise;
  const meetsMinOrder = subtotalPaise >= minOrderPaise;

  // 3. Process Coupon Promotions
  let discountPaise = 0;
  let couponApplied = null;
  let couponMessage = null;

  if (couponCode && typeof couponCode === 'string') {
    const cleanCode = couponCode.trim().toUpperCase();
    const coupon = db.coupons.get(cleanCode);

    if (!coupon) {
      couponMessage = `Invalid coupon code '${cleanCode}'`;
    } else if (!coupon.isActive) {
      couponMessage = `Coupon '${cleanCode}' is no longer active`;
    } else if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      couponMessage = `Coupon '${cleanCode}' has expired`;
    } else if (subtotalPaise < coupon.minOrderAmountPaise) {
      const minRequired = formatCurrencyPaise(coupon.minOrderAmountPaise);
      couponMessage = `Coupon '${cleanCode}' requires a minimum order of ${minRequired}`;
    } else {
      // Valid coupon application
      if (coupon.discountType === 'FLAT') {
        discountPaise = coupon.discountValue;
      } else if (coupon.discountType === 'PERCENTAGE') {
        discountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100);
        if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
          discountPaise = coupon.maxDiscountPaise;
        }
      }

      // Guarantee discount does not exceed subtotal
      discountPaise = Math.min(discountPaise, subtotalPaise);

      couponApplied = {
        code: coupon.code,
        description: coupon.description,
        discountPaise,
        discountFormatted: formatCurrencyPaise(discountPaise),
      };
      couponMessage = `Applied ${coupon.code} (-${formatCurrencyPaise(discountPaise)})`;
    }
  }

  // 4. Calculate Delivery Fee
  const freeThreshold = restaurant.freeDeliveryThresholdPaise || config.financialRules.freeDeliveryThresholdPaise;
  const baseDeliveryFee = restaurant.baseDeliveryFeePaise || config.financialRules.baseDeliveryFeePaise;
  let deliveryFeePaise = baseDeliveryFee;

  if (freeThreshold && subtotalPaise >= freeThreshold) {
    deliveryFeePaise = 0;
  }

  // Special case: FREEDEL coupon waives delivery fee
  if (couponApplied && couponApplied.code === 'FREEDEL') {
    deliveryFeePaise = 0;
  }

  // 5. Packaging & Service Fee
  const serviceFeePaise = restaurant.packagingFeePaise || config.financialRules.serviceFeePaise;

  // 6. GST Tax Calculation (5% on taxable amount)
  const taxableAmount = Math.max(0, subtotalPaise - discountPaise);
  const taxPaise = Math.round(taxableAmount * config.financialRules.taxRatePercent);

  // 7. Final Grand Total in Paise
  const finalTotalPaise = taxableAmount + deliveryFeePaise + serviceFeePaise + taxPaise;

  return {
    restaurantId,
    restaurantName: restaurant.name,
    items: processedItems,
    financials: {
      subtotalPaise,
      subtotalFormatted: formatCurrencyPaise(subtotalPaise),
      discountPaise,
      discountFormatted: formatCurrencyPaise(discountPaise),
      deliveryFeePaise,
      deliveryFeeFormatted: deliveryFeePaise === 0 ? 'FREE' : formatCurrencyPaise(deliveryFeePaise),
      serviceFeePaise,
      serviceFeeFormatted: formatCurrencyPaise(serviceFeePaise),
      taxPaise,
      taxFormatted: formatCurrencyPaise(taxPaise),
      finalTotalPaise,
      finalTotalFormatted: formatCurrencyPaise(finalTotalPaise),
      meetsMinOrder,
      minOrderRequiredPaise: minOrderPaise,
      minOrderRequiredFormatted: formatCurrencyPaise(minOrderPaise),
    },
    coupon: {
      applied: couponApplied,
      message: couponMessage,
    },
  };
}

module.exports = {
  calculateOrderPricing,
  formatCurrencyPaise,
};

