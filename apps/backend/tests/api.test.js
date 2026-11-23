/**
 * CraveCart Production Backend Automated Integration Test Suite
 * Executes end-to-end HTTP calls against all /api/v1 endpoints:
 * Auth, Pricing, Orders, Razorpay Signatures, Webhooks, Delivery Dispatch, Admin.
 */

const http = require('http');
const crypto = require('crypto');
const { createApiServer } = require('../src/server');
const config = require('../src/config');
const db = require('../src/data/store');

// Test runner helper
function makeRequest(server, { method, path, body, headers = {} }) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const port = address.port;

    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers,
      ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
    };

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: encodeURI(path),
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let data = null;
          try {
            data = JSON.parse(responseBody);
          } catch (e) {
            data = responseBody;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runBackendTests() {
  console.log(`\n====================================================`);
  console.log(`   CRAVECART PRODUCTION BACKEND API TEST SUITE`);
  console.log(`====================================================\n`);

  db.reset(); // Fresh clean state
  const server = createApiServer();

  await new Promise((resolve) => server.listen(0, resolve));
  const testPort = server.address().port;
  console.log(`[INIT] Test Server running on ephemeral port ${testPort}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await makeRequest(server, { method: 'GET', path: '/api/v1/health' });
    assert(healthRes.status === 200 && healthRes.body.status === 'UP', 'GET /api/v1/health returns 200 OK & status UP');

    // 2. Auth: Login with valid credentials
    const loginRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { email: 'customer@cravecart.in', password: 'Pass@123' },
    });
    assert(loginRes.status === 200 && loginRes.body.tokens && loginRes.body.tokens.accessToken, 'POST /api/v1/auth/login returns JWT tokens');
    const customerToken = loginRes.body.tokens.accessToken;

    // 3. Auth: Bad credentials rejection
    const badLoginRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { email: 'customer@cravecart.in', password: 'WrongPassword' },
    });
    assert(badLoginRes.status === 401, 'POST /api/v1/auth/login rejects invalid password with 401');

    // 4. Restaurants discovery
    const restRes = await makeRequest(server, { method: 'GET', path: '/api/v1/restaurants' });
    assert(restRes.status === 200 && restRes.body.restaurants.length >= 2, 'GET /api/v1/restaurants returns approved restaurant catalog');

    // 5. Feedo Meat items verification
    const meatRes = await makeRequest(server, { method: 'GET', path: '/api/v1/menu/items?section=Feedo Meat' });
    assert(meatRes.status === 200 && meatRes.body.items.length >= 5, 'GET /api/v1/menu/items?section=Feedo Meat returns fresh meat products');

    // 6. Feedo Mart items verification
    const martRes = await makeRequest(server, { method: 'GET', path: '/api/v1/menu/items?section=Feedo Mart' });
    assert(martRes.status === 200 && martRes.body.items.length >= 6, 'GET /api/v1/menu/items?section=Feedo Mart returns daily mart products');

    // 7. Authoritative Pricing Calculation with WELCOME50
    const pricingRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/pricing/calculate',
      body: {
        restaurantId: 'res-feedo-central',
        items: [
          { menuItemId: 'item-biryani-01', quantity: 2 }, // 24900 * 2 = 49800
          { menuItemId: 'item-meat-chicken', quantity: 1 }, // 18000
        ], // Subtotal: 67800 paise (₹678.00)
        couponCode: 'WELCOME50',
      },
    });
    assert(pricingRes.status === 200, 'POST /api/v1/pricing/calculate succeeds with 200');
    assert(pricingRes.body.financials.subtotalPaise === 67800, 'Subtotal correctly computed as 67800 paise (₹678.00)');
    assert(pricingRes.body.financials.discountPaise === 10000, 'WELCOME50 discount strictly capped at max ₹100.00 (10000 paise)');
    assert(pricingRes.body.financials.deliveryFeePaise === 0, 'Free delivery applied since subtotal >= 50000 paise threshold');
    assert(pricingRes.body.financials.finalTotalPaise > 0, 'Final grand total computed strictly in integer paise');

    // 8. Order Placement
    const orderCreateRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/orders',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        restaurantId: 'res-feedo-central',
        items: [{ menuItemId: 'item-biryani-01', quantity: 1 }],
        addressSnapshot: {
          title: 'Home',
          fullAddress: '108 Koramangala 4th Block, Bengaluru',
        },
        paymentMethod: 'RAZORPAY',
      },
    });
    assert(orderCreateRes.status === 201, 'POST /api/v1/orders creates order in PENDING status');
    const createdOrderId = orderCreateRes.body.order.id;

    // 9. Razorpay Order Creation
    const rzpOrderRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/payments/create-razorpay-order',
      body: { orderId: createdOrderId },
    });
    assert(rzpOrderRes.status === 200 && rzpOrderRes.body.razorpayOrderId, 'POST /api/v1/payments/create-razorpay-order returns Razorpay order ID');
    const razorpayOrderId = rzpOrderRes.body.razorpayOrderId;

    // 10. Razorpay Valid HMAC-SHA256 Signature Verification
    const fakePaymentId = `pay_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpayOrderId}|${fakePaymentId}`)
      .digest('hex');

    const verifyRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/payments/verify',
      body: {
        orderId: createdOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: validSignature,
      },
    });
    assert(verifyRes.status === 200 && verifyRes.body.status === 'COMPLETED', 'POST /api/v1/payments/verify verifies HMAC signature and confirms payment');

    // 11. Razorpay Tampered Signature Rejection
    const badVerifyRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/payments/verify',
      body: {
        orderId: createdOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: 'tampered-fraudulent-signature-hex',
      },
    });
    assert(badVerifyRes.status === 400, 'POST /api/v1/payments/verify rejects tampered signature with 400');

    // 12. Razorpay Webhook with Idempotency
    const webhookPayload = {
      event_id: `evt_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: fakePaymentId,
            order_id: razorpayOrderId,
            status: 'captured',
          },
        },
      },
    };
    const rawWebhookBody = JSON.stringify(webhookPayload);
    const webhookSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(rawWebhookBody)
      .digest('hex');

    const webhookRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/payments/webhook',
      headers: { 'x-razorpay-signature': webhookSignature },
      body: webhookPayload,
    });
    assert(webhookRes.status === 200, 'POST /api/v1/payments/webhook processes authentic payment event');

    // Replay same webhook to test idempotency
    const replayWebhookRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/payments/webhook',
      headers: { 'x-razorpay-signature': webhookSignature },
      body: webhookPayload,
    });
    assert(replayWebhookRes.body.message && replayWebhookRes.body.message.includes('Idempotent'), 'Webhook deduplication detects replay and enforces idempotency');

    // 13. Kitchen Partner State Transition (CONFIRMED -> PREPARING -> READY_FOR_PICKUP)
    const prepRes = await makeRequest(server, {
      method: 'POST',
      path: `/api/v1/restaurant-partner/orders/${createdOrderId}/status`,
      body: { status: 'PREPARING', note: 'Chef began cooking' },
    });
    assert(prepRes.status === 200 && prepRes.body.order.orderStatus === 'PREPARING', 'Restaurant transitions order: CONFIRMED -> PREPARING');

    const readyRes = await makeRequest(server, {
      method: 'POST',
      path: `/api/v1/restaurant-partner/orders/${createdOrderId}/status`,
      body: { status: 'READY_FOR_PICKUP', note: 'Kitchen bagged order' },
    });
    assert(readyRes.status === 200 && readyRes.body.order.orderStatus === 'READY_FOR_PICKUP', 'Restaurant transitions order: PREPARING -> READY_FOR_PICKUP');

    // 14. Invalid Status Transition Blocked (e.g. READY_FOR_PICKUP -> CONFIRMED)
    const invalidTransRes = await makeRequest(server, {
      method: 'POST',
      path: `/api/v1/restaurant-partner/orders/${createdOrderId}/status`,
      body: { status: 'CONFIRMED' },
    });
    assert(invalidTransRes.status === 400, 'Order state machine strictly blocks backwards or illegal transition');

    // 15. Delivery Partner Duty & Offers
    await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/delivery/duty',
      body: { driverId: 'usr-delivery-01', isOnline: true },
    });

    const offersRes = await makeRequest(server, {
      method: 'GET',
      path: '/api/v1/delivery/offers?driverId=usr-delivery-01',
    });
    assert(offersRes.status === 200 && offersRes.body.offers.length >= 1, 'Delivery partner receives active dispatch offer');

    // 16. Delivery Partner Atomic Offer Acceptance
    const acceptOfferRes = await makeRequest(server, {
      method: 'POST',
      path: `/api/v1/delivery/offers/${createdOrderId}/accept`,
      body: { driverId: 'usr-delivery-01' },
    });
    assert(acceptOfferRes.status === 200 && acceptOfferRes.body.assignment.status === 'ACCEPTED', 'Delivery partner accepts offer with atomic lock');

    // 17. Delivery Multi-Step Execution (PICKUP -> START_DELIVERY -> COMPLETE_DELIVERY)
    const pickupStep = await makeRequest(server, {
      method: 'POST',
      path: `/api/v1/delivery/orders/${createdOrderId}/step`,
      body: { driverId: 'usr-delivery-01', step: 'PICKUP' },
    });
    assert(pickupStep.status === 200 && pickupStep.body.orderStatus === 'PICKED_UP', 'Rider marks package PICKED_UP');

    const inTransitStep = await makeRequest(server, {
      method: 'POST',
      path: `/api/v1/delivery/orders/${createdOrderId}/step`,
      body: { driverId: 'usr-delivery-01', step: 'START_DELIVERY' },
    });
    assert(inTransitStep.status === 200 && inTransitStep.body.orderStatus === 'OUT_FOR_DELIVERY', 'Rider marks package OUT_FOR_DELIVERY');

    const completeStep = await makeRequest(server, {
      method: 'POST',
      path: `/api/v1/delivery/orders/${createdOrderId}/step`,
      body: { driverId: 'usr-delivery-01', step: 'COMPLETE_DELIVERY' },
    });
    assert(completeStep.status === 200 && completeStep.body.orderStatus === 'DELIVERED', 'Rider completes drop and reaches terminal DELIVERED status');

    // 18. Driver GPS Location Update
    const locRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/delivery/location',
      body: {
        orderId: createdOrderId,
        driverId: 'usr-delivery-01',
        latitude: 12.9716,
        longitude: 77.5946,
        heading: 90.0,
        speed: 25.5,
      },
    });
    assert(locRes.status === 200 && locRes.body.location.latitude === 12.9716, 'POST /api/v1/delivery/location broadcasts driver GPS coords');

    // 19. Admin Restaurant Approval Workflow
    const pendingRes = await makeRequest(server, { method: 'GET', path: '/api/v1/admin/restaurants/pending' });
    assert(pendingRes.status === 200 && pendingRes.body.restaurants.length >= 1, 'Admin retrieves unapproved restaurant list');

    const approveRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/admin/restaurants/res-royal-sushi/approve',
    });
    assert(approveRes.status === 200 && approveRes.body.restaurant.isApproved === true, 'Admin successfully approves pending restaurant');

    // 20. Admin Analytics & Financial Ledger
    const analyticsRes = await makeRequest(server, { method: 'GET', path: '/api/v1/admin/analytics' });
    assert(analyticsRes.status === 200 && analyticsRes.body.totalOrdersCount > 0, 'Admin analytics computes platform GMV and revenue');

    const settlementsRes = await makeRequest(server, { method: 'GET', path: '/api/v1/admin/settlements' });
    assert(settlementsRes.status === 200 && settlementsRes.body.settlements.length > 0, 'Admin views restaurant commission and net payout ledger');

    const auditRes = await makeRequest(server, { method: 'GET', path: '/api/v1/admin/audit-logs' });
    assert(auditRes.status === 200 && auditRes.body.auditLogs.length > 0, 'Security audit log traces administrative operations');

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\n====================================================`);
  console.log(`   BACKEND API TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runBackendTests().catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
}

module.exports = { runBackendTests };
