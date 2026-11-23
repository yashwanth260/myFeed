/**
 * CraveCart Administrative Operations & Financial Settlements Service
 * Handles restaurant merchant verification, delivery partner vetting,
 * dispute resolutions, financial ledger settlements, and audit logging.
 */

const crypto = require('crypto');
const db = require('../data/store');
const { formatCurrencyPaise } = require('./pricingService');

class AdminService {
  /**
   * Log an administrative security action
   */
  logAudit(actorId, action, targetType, targetId, details = {}, ip = '127.0.0.1') {
    const entry = {
      id: `aud-${crypto.randomUUID()}`,
      actorId,
      action,
      targetType,
      targetId,
      details,
      ipAddress: ip,
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(entry);
    return entry;
  }

  /**
   * Approve a Restaurant Partner
   */
  approveRestaurant(restaurantId, adminId) {
    const res = db.restaurants.get(restaurantId);
    if (!res) {
      throw new Error(`Restaurant '${restaurantId}' not found`);
    }

    res.isApproved = true;
    res.isOpen = true;
    res.updatedAt = new Date().toISOString();

    this.logAudit(adminId, 'APPROVE_RESTAURANT', 'RESTAURANT', restaurantId, { name: res.name });

    return {
      success: true,
      message: `Restaurant '${res.name}' has been approved and is now live on CraveCart.`,
      restaurant: res,
    };
  }

  /**
   * Reject a Restaurant Partner
   */
  rejectRestaurant(restaurantId, adminId, reason = 'Documentation incomplete') {
    const res = db.restaurants.get(restaurantId);
    if (!res) {
      throw new Error(`Restaurant '${restaurantId}' not found`);
    }

    res.isApproved = false;
    res.isOpen = false;
    res.rejectionReason = reason;
    res.updatedAt = new Date().toISOString();

    this.logAudit(adminId, 'REJECT_RESTAURANT', 'RESTAURANT', restaurantId, { name: res.name, reason });

    return {
      success: true,
      message: `Restaurant '${res.name}' was rejected: ${reason}`,
      restaurant: res,
    };
  }

  /**
   * Admin Status Override on Stuck Orders
   */
  overrideOrderStatus(orderId, adminId, newStatus, reason = 'Administrative manual intervention') {
    const order = db.orders.get(orderId);
    if (!order) {
      throw new Error(`Order '${orderId}' not found`);
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor: adminId,
      note: `ADMIN OVERRIDE: ${reason} (Was: ${previousStatus})`,
    });

    this.logAudit(adminId, 'OVERRIDE_ORDER_STATUS', 'ORDER', orderId, {
      from: previousStatus,
      to: newStatus,
      reason,
    });

    return {
      success: true,
      order,
    };
  }

  /**
   * Payout Settlement Execution
   */
  processSettlement(settlementId, adminId) {
    const settlement = db.restaurantSettlements.find((s) => s.id === settlementId);
    if (!settlement) {
      throw new Error(`Settlement '${settlementId}' not found`);
    }

    settlement.settlementStatus = 'SETTLED';
    settlement.payoutReference = `UTR-${Date.now().toString().slice(-8)}`;
    settlement.settledAt = new Date().toISOString();

    this.logAudit(adminId, 'EXECUTE_SETTLEMENT', 'SETTLEMENT', settlementId, {
      payoutPaise: settlement.netPayoutPaise,
      reference: settlement.payoutReference,
    });

    return {
      success: true,
      message: `Settlement of ${formatCurrencyPaise(settlement.netPayoutPaise)} processed successfully.`,
      settlement,
    };
  }

  /**
   * Platform Analytics KPI Aggregate
   */
  getAnalytics() {
    let totalGMVPaise = 0;
    let totalCommissionPaise = 0;
    let totalOrdersCount = db.orders.size;
    let deliveredOrdersCount = 0;

    for (const [id, order] of db.orders.entries()) {
      totalGMVPaise += order.finalTotalPaise;
      if (order.orderStatus === 'DELIVERED') {
        deliveredOrdersCount++;
        const comm = Math.round((order.subtotalPaise * 0.15));
        totalCommissionPaise += comm;
      }
    }

    return {
      totalGMVPaise,
      totalGMVFormatted: formatCurrencyPaise(totalGMVPaise),
      totalCommissionPaise,
      totalCommissionFormatted: formatCurrencyPaise(totalCommissionPaise),
      totalOrdersCount,
      deliveredOrdersCount,
      totalRestaurants: db.restaurants.size,
      totalUsers: db.users.size,
      activeDrivers: Array.from(db.users.values()).filter((u) => u.role === 'DELIVERY_PARTNER' && u.isOnline).length,
    };
  }
}

const adminService = new AdminService();
module.exports = { adminService };

