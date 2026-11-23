/**
 * CraveCart Unified Production REST API Server (/api/v1)
 * Built with standard high-performance Node.js HTTP engine with CORS,
 * JWT authentication middleware, OpenAPI docs, and strict error handling.
 */

const http = require('http');
const url = require('url');
const config = require('./config');
const db = require('./data/store');
const {
  generateTokens,
  verifyPassword,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
} = require('./security/auth');
const { calculateOrderPricing } = require('./services/pricingService');
const { orderService } = require('./services/orderService');
const { paymentService } = require('./services/paymentService');
const { deliveryService } = require('./services/deliveryService');
const { adminService } = require('./services/adminService');
const { realtime } = require('./realtime/socketServer');

// Helper to parse incoming JSON request body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      req.rawBody = body; // Retain raw string for HMAC webhook signature verification
      if (!body || body.trim() === '') {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON in request payload'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

// Helper to send JSON responses with CORS headers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-razorpay-signature, x-role',
  });
  res.end(JSON.stringify(data));
}

// Authentication & Role Extraction Middleware
function extractAuthUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  return verifyAccessToken(token);
}

// Create the HTTP server
function createApiServer() {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // Handle CORS Pre-flight Options
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-razorpay-signature, x-role',
      });
      return res.end();
    }

    try {
      // ==========================================
      // 1. HEALTH & SYSTEM STATUS
      // ==========================================
      if (pathname === '/api/v1/health' && method === 'GET') {
        return sendJson(res, 200, {
          status: 'UP',
          service: 'cravecart-backend-api',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          uptimeSeconds: Math.floor(process.uptime()),
          environment: config.env,
        });
      }

      // ==========================================
      // 2. OPENAPI 3.0 / SWAGGER DOCUMENTATION
      // ==========================================
      if (pathname === '/api/v1/docs/openapi.json' && method === 'GET') {
        return sendJson(res, 200, {
          openapi: '3.0.0',
          info: {
            title: 'CraveCart Enterprise API',
            version: '1.0.0',
            description: 'Production food delivery ecosystem API supporting Customer, Restaurant, Delivery, and Admin workflows.',
          },
          servers: [{ url: 'http://localhost:4000/api/v1' }],
          paths: {
            '/auth/login': { post: { summary: 'User login & JWT token generation' } },
            '/pricing/calculate': { post: { summary: 'Authoritative integer paise price calculation' } },
            '/orders': { post: { summary: 'Create new order' } },
            '/payments/verify': { post: { summary: 'Verify Razorpay signature' } },
            '/delivery/offers': { get: { summary: 'Rider available delivery offers' } },
            '/admin/restaurants/pending': { get: { summary: 'Admin restaurant approvals' } },
          },
        });
      }

      if (pathname === '/api/v1/docs' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`<!DOCTYPE html>
<html>
<head>
  <title>CraveCart API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body style="margin:0; background:#FAFAFA;">
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/v1/docs/openapi.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout"
    });
  </script>
</body>
</html>`);
      }

      // ==========================================
      // 3. AUTHENTICATION MODULE
      // ==========================================
      if (pathname === '/api/v1/auth/register' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (!payload.email || !payload.password || !payload.fullName) {
          return sendJson(res, 400, { error: 'email, password, and fullName are required' });
        }

        // Check duplicate
        for (const u of db.users.values()) {
          if (u.email.toLowerCase() === payload.email.toLowerCase()) {
            return sendJson(res, 409, { error: 'User with this email already exists' });
          }
        }

        const newUser = {
          id: `usr-${Date.now()}`,
          email: payload.email.toLowerCase(),
          phone: payload.phone || '+919999999999',
          fullName: payload.fullName,
          passwordHash: hashPassword(payload.password),
          role: payload.role || 'CUSTOMER',
          accountStatus: 'ACTIVE',
          addresses: [],
        };
        db.users.set(newUser.id, newUser);

        const tokens = generateTokens(newUser);
        return sendJson(res, 201, {
          user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role },
          tokens,
        });
      }

      if (pathname === '/api/v1/auth/login' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (!payload.email || !payload.password) {
          return sendJson(res, 400, { error: 'email and password are required' });
        }

        let user = null;
        for (const u of db.users.values()) {
          if (u.email.toLowerCase() === payload.email.toLowerCase()) {
            user = u;
            break;
          }
        }

        if (!user || !verifyPassword(payload.password, user.passwordHash)) {
          return sendJson(res, 401, { error: 'Invalid email or password' });
        }

        const tokens = generateTokens(user);
        return sendJson(res, 200, {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            addresses: user.addresses || [],
          },
          tokens,
        });
      }

      if (pathname === '/api/v1/auth/refresh' && method === 'POST') {
        const payload = await parseJsonBody(req);
        const refreshToken = payload.refreshToken;
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || !decoded.sub) {
          return sendJson(res, 401, { error: 'Invalid or expired refresh token' });
        }

        const user = db.users.get(decoded.sub);
        if (!user) {
          return sendJson(res, 401, { error: 'User session no longer valid' });
        }

        const tokens = generateTokens(user);
        return sendJson(res, 200, { tokens });
      }

      if (pathname === '/api/v1/auth/me' && method === 'GET') {
        const authUser = extractAuthUser(req);
        if (!authUser) {
          return sendJson(res, 401, { error: 'Unauthorized: Valid Bearer token required' });
        }
        const user = db.users.get(authUser.sub);
        return sendJson(res, 200, { user });
      }

      // ==========================================
      // 4. RESTAURANTS & FOOD CATALOG
      // ==========================================
      if (pathname === '/api/v1/restaurants' && method === 'GET') {
        const restaurants = Array.from(db.restaurants.values()).filter((r) => r.isApproved);
        return sendJson(res, 200, { count: restaurants.length, restaurants });
      }

      if (pathname.startsWith('/api/v1/restaurants/') && method === 'GET') {
        const parts = pathname.split('/');
        const restaurantId = parts[4];
        const isMenuSubRoute = parts[5] === 'menu';

        const restaurant = db.restaurants.get(restaurantId);
        if (!restaurant) {
          return sendJson(res, 404, { error: `Restaurant '${restaurantId}' not found` });
        }

        if (isMenuSubRoute) {
          const items = Array.from(db.menuItems.values()).filter((i) => i.restaurantId === restaurantId);
          const categories = Array.from(db.categories.values()).filter((c) => c.restaurantId === restaurantId);
          return sendJson(res, 200, { restaurantId, categories, items });
        }

        return sendJson(res, 200, { restaurant });
      }

      if (pathname === '/api/v1/menu/items' && method === 'GET') {
        const section = parsedUrl.searchParams.get('section'); // "Food Item", "Feedo Meat", "Feedo Mart"
        let items = Array.from(db.menuItems.values());
        if (section) {
          items = items.filter((i) => i.section && i.section.toLowerCase() === section.toLowerCase());
        }
        return sendJson(res, 200, { count: items.length, items });
      }

      if (pathname === '/api/v1/coupons' && method === 'GET') {
        const coupons = Array.from(db.coupons.values()).filter((c) => c.isActive);
        return sendJson(res, 200, { coupons });
      }

      // ==========================================
      // 5. SERVER-AUTHORITATIVE PRICING CALCULATION
      // ==========================================
      if (pathname === '/api/v1/pricing/calculate' && method === 'POST') {
        const payload = await parseJsonBody(req);
        try {
          const pricing = calculateOrderPricing({
            restaurantId: payload.restaurantId,
            items: payload.items,
            couponCode: payload.couponCode,
          });
          return sendJson(res, 200, pricing);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      // ==========================================
      // 6. ORDER LIFECYCLE
      // ==========================================
      if (pathname === '/api/v1/orders' && method === 'POST') {
        const payload = await parseJsonBody(req);
        const authUser = extractAuthUser(req);
        const userId = authUser ? authUser.sub : payload.userId || 'usr-customer-01';

        try {
          const result = orderService.createOrder({
            userId,
            restaurantId: payload.restaurantId,
            items: payload.items,
            addressSnapshot: payload.addressSnapshot,
            paymentMethod: payload.paymentMethod || 'RAZORPAY',
            couponCode: payload.couponCode,
          });

          realtime.emitNewOrderToKitchen(payload.restaurantId, result.order);
          return sendJson(res, 201, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      if (pathname === '/api/v1/orders' && method === 'GET') {
        const authUser = extractAuthUser(req);
        const userId = authUser ? authUser.sub : parsedUrl.searchParams.get('userId') || 'usr-customer-01';
        const orders = Array.from(db.orders.values()).filter((o) => o.userId === userId);
        return sendJson(res, 200, { count: orders.length, orders });
      }

      if (pathname.startsWith('/api/v1/orders/') && method === 'GET') {
        const orderId = pathname.split('/')[4];
        const order = db.orders.get(orderId);
        if (!order) {
          return sendJson(res, 404, { error: `Order '${orderId}' not found` });
        }
        const assignment = db.deliveryAssignments.get(orderId);
        const location = db.driverLocations.get(orderId);
        return sendJson(res, 200, { order, assignment, driverLocation: location });
      }

      const cancelMatch = pathname.match(/^\/api\/v1\/orders\/([^/]+)\/cancel$/);
      if (cancelMatch && method === 'POST') {
        const orderId = cancelMatch[1];
        const payload = await parseJsonBody(req);
        const authUser = extractAuthUser(req);
        const actorId = authUser ? authUser.sub : 'usr-customer-01';

        try {
          const cancelledOrder = orderService.cancelOrder(orderId, actorId, payload.reason);
          realtime.emitOrderStatusChange(orderId, 'CANCELLED', { reason: payload.reason });
          return sendJson(res, 200, { success: true, order: cancelledOrder });
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      // ==========================================
      // 7. PAYMENTS MODULE (RAZORPAY)
      // ==========================================
      if (pathname === '/api/v1/payments/create-razorpay-order' && method === 'POST') {
        const payload = await parseJsonBody(req);
        if (!payload.orderId) {
          return sendJson(res, 400, { error: 'orderId is required' });
        }

        try {
          const razorpayData = paymentService.createRazorpayOrder(payload.orderId);
          return sendJson(res, 200, razorpayData);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      if (pathname === '/api/v1/payments/verify' && method === 'POST') {
        const payload = await parseJsonBody(req);
        try {
          const result = paymentService.verifyPayment(payload);
          realtime.emitOrderStatusChange(payload.orderId, 'CONFIRMED', { paymentId: payload.razorpay_payment_id });
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      if (pathname === '/api/v1/payments/webhook' && method === 'POST') {
        const payload = await parseJsonBody(req);
        const signature = req.headers['x-razorpay-signature'];
        try {
          const result = paymentService.processWebhook({
            rawBody: req.rawBody,
            signatureHeader: signature,
            eventPayload: payload,
          });
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      // ==========================================
      // 8. RESTAURANT PARTNER OPERATIONS
      // ==========================================
      if (pathname === '/api/v1/restaurant-partner/orders' && method === 'GET') {
        const restaurantId = parsedUrl.searchParams.get('restaurantId') || 'res-feedo-central';
        const orders = Array.from(db.orders.values()).filter((o) => o.restaurantId === restaurantId);
        return sendJson(res, 200, { restaurantId, count: orders.length, orders });
      }

      const restStatusMatch = pathname.match(/^\/api\/v1\/restaurant-partner\/orders\/([^/]+)\/status$/);
      if (restStatusMatch && method === 'POST') {
        const orderId = restStatusMatch[1];
        const payload = await parseJsonBody(req);
        const nextStatus = payload.status; // CONFIRMED, PREPARING, READY_FOR_PICKUP, REJECTED
        const authUser = extractAuthUser(req);
        const actorId = authUser ? authUser.sub : 'usr-restaurant-01';

        try {
          const updated = orderService.updateOrderStatus(orderId, nextStatus, actorId, payload.note);
          realtime.emitOrderStatusChange(orderId, nextStatus, { note: payload.note });
          return sendJson(res, 200, { success: true, order: updated });
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      const restAvailMatch = pathname.match(/^\/api\/v1\/restaurant-partner\/menu\/([^/]+)\/availability$/);
      if (restAvailMatch && method === 'PATCH') {
        const itemId = restAvailMatch[1];
        const payload = await parseJsonBody(req);
        const item = db.menuItems.get(itemId);
        if (!item) {
          return sendJson(res, 404, { error: `Menu item '${itemId}' not found` });
        }
        item.isAvailable = Boolean(payload.isAvailable);
        item.updatedAt = new Date().toISOString();
        return sendJson(res, 200, { success: true, item });
      }

      // ==========================================
      // 9. DELIVERY PARTNER OPERATIONS
      // ==========================================
      if (pathname === '/api/v1/delivery/duty' && method === 'POST') {
        const payload = await parseJsonBody(req);
        const authUser = extractAuthUser(req);
        const driverId = authUser ? authUser.sub : payload.driverId || 'usr-delivery-01';

        try {
          const result = deliveryService.setDutyStatus(driverId, payload.isOnline);
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      if (pathname === '/api/v1/delivery/offers' && method === 'GET') {
        const authUser = extractAuthUser(req);
        const driverId = authUser ? authUser.sub : parsedUrl.searchParams.get('driverId') || 'usr-delivery-01';
        const offers = deliveryService.getAvailableOffers(driverId);
        return sendJson(res, 200, { count: offers.length, offers });
      }

      const offerAcceptMatch = pathname.match(/^\/api\/v1\/delivery\/offers\/([^/]+)\/accept$/);
      if (offerAcceptMatch && method === 'POST') {
        const orderId = offerAcceptMatch[1];
        const authUser = extractAuthUser(req);
        const payload = await parseJsonBody(req);
        const driverId = authUser ? authUser.sub : payload.driverId || 'usr-delivery-01';

        try {
          const result = deliveryService.acceptDeliveryOffer(orderId, driverId);
          realtime.emitOrderStatusChange(orderId, 'ASSIGNED_TO_DRIVER', { driverId });
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 409, { error: err.message });
        }
      }

      const deliveryStepMatch = pathname.match(/^\/api\/v1\/delivery\/orders\/([^/]+)\/step$/);
      if (deliveryStepMatch && method === 'POST') {
        const orderId = deliveryStepMatch[1];
        const payload = await parseJsonBody(req); // step: "PICKUP", "START_DELIVERY", "COMPLETE_DELIVERY"
        const authUser = extractAuthUser(req);
        const driverId = authUser ? authUser.sub : payload.driverId || 'usr-delivery-01';

        try {
          const result = deliveryService.advanceDeliveryStep(orderId, driverId, payload.step);
          realtime.emitOrderStatusChange(orderId, result.orderStatus);
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      if (pathname === '/api/v1/delivery/location' && method === 'POST') {
        const payload = await parseJsonBody(req);
        const authUser = extractAuthUser(req);
        const driverId = authUser ? authUser.sub : payload.driverId || 'usr-delivery-01';

        const loc = deliveryService.recordLocation(driverId, payload.orderId, {
          latitude: payload.latitude,
          longitude: payload.longitude,
          heading: payload.heading,
          speed: payload.speed,
        });

        realtime.emitDriverLocation(payload.orderId, loc);
        return sendJson(res, 200, { success: true, location: loc });
      }

      if (pathname === '/api/v1/delivery/earnings' && method === 'GET') {
        const authUser = extractAuthUser(req);
        const driverId = authUser ? authUser.sub : parsedUrl.searchParams.get('driverId') || 'usr-delivery-01';
        const earnings = db.driverEarnings.filter((e) => e.driverId === driverId);
        const totalEarningsPaise = earnings.reduce((sum, e) => sum + e.amountPaise, 0);

        return sendJson(res, 200, {
          driverId,
          totalTrips: earnings.length,
          totalEarningsPaise,
          totalEarningsFormatted: `₹${(totalEarningsPaise / 100).toFixed(2)}`,
          trips: earnings,
        });
      }

      // ==========================================
      // 10. ADMINISTRATIVE OPERATIONS
      // ==========================================
      if (pathname === '/api/v1/admin/restaurants/pending' && method === 'GET') {
        const pending = Array.from(db.restaurants.values()).filter((r) => !r.isApproved);
        return sendJson(res, 200, { count: pending.length, restaurants: pending });
      }

      const adminApproveMatch = pathname.match(/^\/api\/v1\/admin\/restaurants\/([^/]+)\/approve$/);
      if (adminApproveMatch && method === 'POST') {
        const restaurantId = adminApproveMatch[1];
        const authUser = extractAuthUser(req);
        const adminId = authUser ? authUser.sub : 'usr-admin-01';

        try {
          const result = adminService.approveRestaurant(restaurantId, adminId);
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      const adminRejectMatch = pathname.match(/^\/api\/v1\/admin\/restaurants\/([^/]+)\/reject$/);
      if (adminRejectMatch && method === 'POST') {
        const restaurantId = adminRejectMatch[1];
        const payload = await parseJsonBody(req);
        const authUser = extractAuthUser(req);
        const adminId = authUser ? authUser.sub : 'usr-admin-01';

        try {
          const result = adminService.rejectRestaurant(restaurantId, adminId, payload.reason);
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      if (pathname === '/api/v1/admin/orders' && method === 'GET') {
        const allOrders = Array.from(db.orders.values());
        return sendJson(res, 200, { count: allOrders.length, orders: allOrders });
      }

      const adminOverrideMatch = pathname.match(/^\/api\/v1\/admin\/orders\/([^/]+)\/override-status$/);
      if (adminOverrideMatch && method === 'POST') {
        const orderId = adminOverrideMatch[1];
        const payload = await parseJsonBody(req);
        const authUser = extractAuthUser(req);
        const adminId = authUser ? authUser.sub : 'usr-admin-01';

        try {
          const result = adminService.overrideOrderStatus(orderId, adminId, payload.status, payload.reason);
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      if (pathname === '/api/v1/admin/settlements' && method === 'GET') {
        return sendJson(res, 200, { settlements: db.restaurantSettlements });
      }

      const adminSettleMatch = pathname.match(/^\/api\/v1\/admin\/settlements\/([^/]+)\/process$/);
      if (adminSettleMatch && method === 'POST') {
        const settlementId = adminSettleMatch[1];
        const authUser = extractAuthUser(req);
        const adminId = authUser ? authUser.sub : 'usr-admin-01';

        try {
          const result = adminService.processSettlement(settlementId, adminId);
          return sendJson(res, 200, result);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      if (pathname === '/api/v1/admin/audit-logs' && method === 'GET') {
        return sendJson(res, 200, { count: db.auditLogs.length, auditLogs: db.auditLogs });
      }

      if (pathname === '/api/v1/admin/analytics' && method === 'GET') {
        const analytics = adminService.getAnalytics();
        return sendJson(res, 200, analytics);
      }

      // Fallthrough 404
      return sendJson(res, 404, {
        error: 'Route not found',
        method,
        path: pathname,
        documentation: '/api/v1/docs',
      });
    } catch (unexpectedError) {
      console.error('API Error:', unexpectedError);
      return sendJson(res, 500, { error: 'Internal server error', details: unexpectedError.message });
    }
  });

  return server;
}

module.exports = { createApiServer };
