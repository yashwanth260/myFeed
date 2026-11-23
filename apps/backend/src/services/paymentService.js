/**
 * CraveCart Payment Integration Service
 * Implements Razorpay order creation, HMAC-SHA256 signature verification,
 * and idempotent webhook processing for payments.
 */

const crypto = require('crypto');
const db = require('../data/store');
const config = require('../config');
const { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } = require('../security/auth');
const { orderService } = require('./orderService');

class PaymentService {
  /**
   * Create Razorpay Order
   */
  createRazorpayOrder(orderId) {
    const order = db.orders.get(orderId);
    if (!order) {
      throw new Error(`Order '${orderId}' not found`);
    }

    if (order.orderStatus !== 'PENDING') {
      throw new Error(`Order is in state '${order.orderStatus}', cannot create new payment`);
    }

    // Generate Razorpay order ID
    const randomHex = crypto.randomBytes(8).toString('hex');
    const razorpayOrderId = `order_${randomHex}`;

    // Update payment record
    let payment = db.payments.get(orderId);
    if (!payment) {
      payment = {
        id: `pay-${crypto.randomUUID()}`,
        orderId,
        provider: 'RAZORPAY',
        amountPaise: order.finalTotalPaise,
        currency: 'INR',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
    }

    payment.razorpayOrderId = razorpayOrderId;
    payment.status = 'PENDING';
    payment.updatedAt = new Date().toISOString();
    db.payments.set(orderId, payment);

    return {
      razorpayOrderId,
      amountPaise: order.finalTotalPaise,
      currency: 'INR',
      keyId: config.razorpay.keyId,
      orderNumber: order.orderNumber,
      customer: {
        name: order.addressSnapshot.title || 'CraveCart Customer',
        email: 'customer@cravecart.in',
        phone: '+919876543210',
      },
    };
  }

  /**
   * Verify Payment Signature after client checkout
   */
  verifyPayment({ orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const order = db.orders.get(orderId);
    if (!order) {
      throw new Error(`Order '${orderId}' not found`);
    }

    const isValid = verifyRazorpayPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      // Mark payment failed
      const payment = db.payments.get(orderId);
      if (payment) payment.status = 'FAILED';
      throw new Error('Payment verification failed: Invalid Razorpay signature');
    }

    // Update Payment record
    const payment = db.payments.get(orderId) || {};
    payment.status = 'COMPLETED';
    payment.razorpayOrderId = razorpay_order_id;
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.updatedAt = new Date().toISOString();
    db.payments.set(orderId, payment);

    // Update Order state
    order.paymentStatus = 'COMPLETED';
    if (order.orderStatus === 'PENDING') {
      orderService.updateOrderStatus(orderId, 'CONFIRMED', order.userId, 'Online payment verified successfully');
    }

    return {
      success: true,
      orderId,
      paymentId: razorpay_payment_id,
      status: 'COMPLETED',
    };
  }

  /**
   * Process incoming Webhook from Razorpay
   */
  processWebhook({ rawBody, signatureHeader, eventPayload }) {
    // 1. Verify webhook authenticity
    const isSignatureValid = verifyRazorpayWebhookSignature(rawBody, signatureHeader);
    if (!isSignatureValid) {
      throw new Error('Unauthorized Webhook: Signature verification failed');
    }

    // 2. Idempotency Check (Prevent duplicate credit/status update)
    const eventId = eventPayload.event_id || eventPayload.id;
    if (eventId && db.webhookEvents.has(eventId)) {
      return { success: true, message: 'Event already processed (Idempotent replay ignored)' };
    }

    if (eventId) {
      db.webhookEvents.add(eventId);
    }

    const event = eventPayload.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = eventPayload.payload && eventPayload.payload.payment && eventPayload.payload.payment.entity;
      const razorpayOrderId = paymentEntity ? paymentEntity.order_id : null;

      if (razorpayOrderId) {
        // Find order with this razorpay order ID
        for (const [orderId, payment] of db.payments.entries()) {
          if (payment.razorpayOrderId === razorpayOrderId) {
            payment.status = 'COMPLETED';
            payment.razorpayPaymentId = paymentEntity.id;
            payment.updatedAt = new Date().toISOString();

            const order = db.orders.get(orderId);
            if (order && order.orderStatus === 'PENDING') {
              orderService.updateOrderStatus(orderId, 'CONFIRMED', 'SYSTEM_WEBHOOK', 'Payment captured via Webhook');
            }
            break;
          }
        }
      }
    }

    return { success: true, processedEvent: event };
  }
}

const paymentService = new PaymentService();
module.exports = { paymentService };

