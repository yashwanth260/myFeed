/**
 * CraveCart Delivery Partner Dispatch & Real-Time Tracking Service
 * Manages duty status, concurrency-safe atomic offer acceptance,
 * multi-step fulfillment (pickup -> in-transit -> drop), and GPS tracking.
 */

const crypto = require('crypto');
const db = require('../data/store');
const { orderService } = require('./orderService');

class DeliveryService {
  /**
   * Toggle Driver Online / Offline Duty Status
   */
  setDutyStatus(driverId, isOnline) {
    const driver = db.users.get(driverId);
    if (!driver || driver.role !== 'DELIVERY_PARTNER') {
      throw new Error(`Delivery partner '${driverId}' not found`);
    }

    driver.isOnline = Boolean(isOnline);
    return {
      driverId,
      name: driver.fullName,
      isOnline: driver.isOnline,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Fetch Active Delivery Offers for a Driver
   */
  getAvailableOffers(driverId) {
    const driver = db.users.get(driverId);
    if (!driver || !driver.isOnline) {
      return [];
    }

    const offers = [];
    for (const [orderId, assignment] of db.deliveryAssignments.entries()) {
      if (assignment.status === 'OFFERED' && assignment.driverId === driverId) {
        const order = db.orders.get(orderId);
        const restaurant = order ? db.restaurants.get(order.restaurantId) : null;
        if (order) {
          offers.push({
            assignmentId: assignment.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            restaurant: {
              name: restaurant ? restaurant.name : 'Restaurant',
              address: restaurant ? restaurant.address : '',
            },
            dropAddress: order.addressSnapshot.fullAddress,
            payoutAmountPaise: assignment.payoutAmountPaise,
            estimatedDistanceKm: assignment.estimatedDistanceKm,
            offeredAt: assignment.offeredAt,
          });
        }
      }
    }

    return offers;
  }

  /**
   * Concurrency-Safe Atomic Offer Acceptance
   */
  acceptDeliveryOffer(orderId, driverId) {
    const assignment = db.deliveryAssignments.get(orderId);
    if (!assignment) {
      throw new Error(`No delivery assignment found for order '${orderId}'`);
    }

    // Atomic concurrency lock check
    if (assignment.status !== 'OFFERED') {
      throw new Error(`Assignment is no longer available (Current status: ${assignment.status})`);
    }

    if (assignment.driverId !== driverId) {
      throw new Error('This delivery offer is not assigned to your account');
    }

    // Lock assignment
    assignment.status = 'ACCEPTED';
    assignment.acceptedAt = new Date().toISOString();
    assignment.driverId = driverId;

    const order = db.orders.get(orderId);

    return {
      success: true,
      message: 'Delivery offer accepted successfully',
      assignment,
      order,
    };
  }

  /**
   * Advance Delivery Step: PICKUP, OUT_FOR_DELIVERY, or DELIVERED
   */
  advanceDeliveryStep(orderId, driverId, step) {
    const assignment = db.deliveryAssignments.get(orderId);
    if (!assignment || assignment.driverId !== driverId) {
      throw new Error('Unauthorized: You are not the assigned delivery partner for this order');
    }

    const order = db.orders.get(orderId);
    if (!order) {
      throw new Error(`Order '${orderId}' not found`);
    }

    switch (step) {
      case 'PICKUP':
        if (order.orderStatus !== 'READY_FOR_PICKUP') {
          throw new Error(`Cannot confirm pickup: Order status is '${order.orderStatus}' (Expected 'READY_FOR_PICKUP')`);
        }
        assignment.status = 'PICKED_UP';
        assignment.pickedUpAt = new Date().toISOString();
        orderService.updateOrderStatus(orderId, 'PICKED_UP', driverId, 'Driver collected order from restaurant');
        break;

      case 'START_DELIVERY':
        if (order.orderStatus !== 'PICKED_UP') {
          throw new Error(`Cannot start delivery: Order status is '${order.orderStatus}'`);
        }
        orderService.updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', driverId, 'Driver en-route to customer address');
        break;

      case 'COMPLETE_DELIVERY':
        if (order.orderStatus !== 'OUT_FOR_DELIVERY' && order.orderStatus !== 'PICKED_UP') {
          throw new Error(`Cannot complete delivery: Order is currently '${order.orderStatus}'`);
        }
        assignment.status = 'COMPLETED';
        assignment.completedAt = new Date().toISOString();
        orderService.updateOrderStatus(orderId, 'DELIVERED', driverId, 'Driver delivered package at doorstep');
        break;

      default:
        throw new Error(`Unknown delivery step '${step}'`);
    }

    return {
      orderId,
      orderStatus: order.orderStatus,
      assignmentStatus: assignment.status,
    };
  }

  /**
   * Broadcast Driver Real-Time GPS Location
   */
  recordLocation(driverId, orderId, { latitude, longitude, heading = 0, speed = 0 }) {
    const loc = {
      id: `loc-${crypto.randomUUID()}`,
      driverId,
      orderId,
      latitude,
      longitude,
      heading,
      speed,
      timestamp: new Date().toISOString(),
    };

    db.driverLocations.set(orderId, loc);

    // Update driver's last known coordinates
    const driver = db.users.get(driverId);
    if (driver) {
      driver.currentLat = latitude;
      driver.currentLng = longitude;
    }

    return loc;
  }
}

const deliveryService = new DeliveryService();
module.exports = { deliveryService };

