/**
 * CraveCart Real-Time Event & WebSocket Gateway
 * Manages order rooms, kitchen dispatch queues, driver GPS coordinate streams,
 * and admin telemetry feeds.
 */

const { EventEmitter } = require('events');

class RealtimeGateway extends EventEmitter {
  constructor() {
    super();
    this.rooms = new Map(); // Room name -> Set of client identifiers
    this.clients = new Map(); // Client ID -> metadata
  }

  joinRoom(roomId, clientId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(clientId);
  }

  leaveRoom(roomId, clientId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(clientId);
    }
  }

  broadcast(roomId, eventName, payload) {
    const message = {
      room: roomId,
      event: eventName,
      data: payload,
      timestamp: new Date().toISOString(),
    };
    this.emit('broadcast', message);
    this.emit(eventName, payload);
    return message;
  }

  // Domain-specific helpers
  emitOrderStatusChange(orderId, orderStatus, details = {}) {
    return this.broadcast(`order_${orderId}`, 'order:status_updated', {
      orderId,
      orderStatus,
      ...details,
    });
  }

  emitDriverLocation(orderId, location) {
    return this.broadcast(`order_${orderId}`, 'driver:location_updated', {
      orderId,
      location,
    });
  }

  emitNewOrderToKitchen(restaurantId, order) {
    return this.broadcast(`restaurant_${restaurantId}`, 'order:new_incoming', {
      order,
    });
  }

  emitOfferToDriver(driverId, offer) {
    return this.broadcast(`driver_${driverId}`, 'delivery:new_offer', {
      offer,
    });
  }
}

const realtime = new RealtimeGateway();
module.exports = { realtime };

