/**
 * CraveCart Order Lifecycle & State Machine Service
 * Enforces strict transactional state transitions, concurrency safety,
 * cancellation policy, and audit trail records.
 */

const crypto = require('crypto');
const db = require('../data/store');
const { calculateOrderPricing } = require('./pricingService');

const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED', 'PAYMENT_FAILED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['PICKED_UP'],
  PICKED_UP: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  REJECTED: [],
  CANCELLED: [],
  PAYMENT_FAILED: ['PENDING'],
};

function isValidStatusTransition(currentStatus, nextStatus) {
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

class OrderService {
  /**
   * Create a new food delivery order
   */
  createOrder({
    userId,
    restaurantId,
    items,
    addressSnapshot,
    paymentMethod = 'RAZORPAY',
    couponCode = null,
  }) {
    const user = db.users.get(userId);
    if (!user) {
      throw new Error(`User '${userId}' not found`);
    }

    const restaurant = db.restaurants.get(restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant '${restaurantId}' not found`);
    }

    if (!restaurant.isApproved || !restaurant.isActive || !restaurant.isOpen) {
      throw new Error(`Restaurant '${restaurant.name}' is currently not accepting orders`);
    }

    if (!addressSnapshot || !addressSnapshot.fullAddress) {
      throw new Error('Valid delivery address is required');
    }

    // 1. Run authoritative server pricing
    const pricing = calculateOrderPricing({
      restaurantId,
      items,
      couponCode,
    });

    // 2. Generate unique human-readable order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CC-${Date.now().toString().slice(-4)}-${randomSuffix}`;
    const orderId = `ord-${crypto.randomUUID()}`;

    const newOrder = {
      id: orderId,
      orderNumber,
      userId,
      restaurantId,
      restaurantName: restaurant.name,
      orderStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      paymentMethod,
      addressSnapshot,
      items: pricing.items,
      subtotalPaise: pricing.financials.subtotalPaise,
      discountPaise: pricing.financials.discountPaise,
      deliveryFeePaise: pricing.financials.deliveryFeePaise,
      serviceFeePaise: pricing.financials.serviceFeePaise,
      taxPaise: pricing.financials.taxPaise,
      finalTotalPaise: pricing.financials.finalTotalPaise,
      couponCode: pricing.coupon.applied ? pricing.coupon.applied.code : null,
      statusHistory: [
        {
          status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
          timestamp: new Date().toISOString(),
          actor: userId,
          note: `Order placed via ${paymentMethod}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.set(orderId, newOrder);

    // 3. Initialize Payment Record
    const paymentId = `pay-${crypto.randomUUID()}`;
    const newPayment = {
      id: paymentId,
      orderId,
      provider: paymentMethod,
      amountPaise: pricing.financials.finalTotalPaise,
      currency: 'INR',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.payments.set(orderId, newPayment);

    return {
      order: newOrder,
      pricing: pricing.financials,
      payment: newPayment,
    };
  }

  /**
   * Transition order to next state with validation
   */
  updateOrderStatus(orderId, nextStatus, actorId, note = '') {
    const order = db.orders.get(orderId);
    if (!order) {
      throw new Error(`Order '${orderId}' not found`);
    }

    const currentStatus = order.orderStatus;

    if (!isValidStatusTransition(currentStatus, nextStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${nextStatus}'. Allowed next steps: ${ALLOWED_STATUS_TRANSITIONS[currentStatus].join(', ') || 'None (Terminal state)'}`
      );
    }

    order.orderStatus = nextStatus;
    order.updatedAt = new Date().toISOString();

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date().toISOString(),
      actor: actorId,
      note,
    });

    // Handle side effects on state change
    if (nextStatus === 'READY_FOR_PICKUP') {
      // Trigger automatic delivery assignment offer
      this.triggerDeliveryOffer(order);
    } else if (nextStatus === 'DELIVERED') {
      // Record driver earnings & restaurant settlement
      this.settleCompletedOrder(order);
    }

    return order;
  }

  /**
   * Cancel an order if allowed by current progress
   */
  cancelOrder(orderId, actorId, reason = 'Customer requested cancellation') {
    const order = db.orders.get(orderId);
    if (!order) {
      throw new Error(`Order '${orderId}' not found`);
    }

    // Cancellation is only permitted before food preparation has completed
    if (['READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus)) {
      throw new Error('Order cannot be cancelled as kitchen preparation or delivery is already in progress');
    }

    return this.updateOrderStatus(orderId, 'CANCELLED', actorId, reason);
  }

  /**
   * Auto-dispatch offer to available delivery partners
   */
  triggerDeliveryOffer(order) {
    const existingAssignment = db.deliveryAssignments.get(order.id);
    if (existingAssignment && existingAssignment.status === 'ACCEPTED') {
      return existingAssignment; // Already accepted
    }

    // Find available driver
    let assignedDriver = null;
    for (const [id, user] of db.users.entries()) {
      if (user.role === 'DELIVERY_PARTNER' && user.isOnline) {
        assignedDriver = user;
        break;
      }
    }

    if (!assignedDriver) {
      assignedDriver = db.users.get('usr-delivery-01'); // Fallback to primary test driver
    }

    const assignment = {
      id: `asg-${crypto.randomUUID()}`,
      orderId: order.id,
      driverId: assignedDriver.id,
      driverName: assignedDriver.fullName,
      status: 'OFFERED',
      offeredAt: new Date().toISOString(),
      estimatedDistanceKm: 3.5,
      payoutAmountPaise: 6500, // ₹65.00
    };

    db.deliveryAssignments.set(order.id, assignment);
    return assignment;
  }

  /**
   * Finalize financials on successful delivery
   */
  settleCompletedOrder(order) {
    const assignment = db.deliveryAssignments.get(order.id);
    if (assignment) {
      db.driverEarnings.push({
        id: `ern-${crypto.randomUUID()}`,
        driverId: assignment.driverId,
        orderId: order.id,
        amountPaise: assignment.payoutAmountPaise,
        status: 'CREDITED',
        createdAt: new Date().toISOString(),
      });
    }

    // Credit Restaurant Gross - Commission
    const restaurant = db.restaurants.get(order.restaurantId);
    const commissionPercent = restaurant ? restaurant.commissionRatePercent : 15.0;
    const grossSalesPaise = order.subtotalPaise;
    const commissionPaise = Math.round((grossSalesPaise * commissionPercent) / 100);
    const netPayoutPaise = grossSalesPaise - commissionPaise;

    db.restaurantSettlements.push({
      id: `stl-${crypto.randomUUID()}`,
      restaurantId: order.restaurantId,
      orderId: order.id,
      grossSalesPaise,
      platformCommissionPaise: commissionPaise,
      netPayoutPaise,
      settlementStatus: 'PENDING_PAYOUT',
      createdAt: new Date().toISOString(),
    });
  }
}

const orderService = new OrderService();
module.exports = {
  orderService,
  isValidStatusTransition,
  ALLOWED_STATUS_TRANSITIONS,
};

