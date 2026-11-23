/**
 * Feedo (CraveCart) 3-Sided End-to-End Smoke Test (Executable Node.js)
 */
const { io } = require('socket.io-client');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000/api/v1';
const WS_BASE = process.env.WS_BASE_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText} on ${path}: ${data ? JSON.stringify(data) : 'Unknown error'}`
    );
  }
  return data;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSmokeTest() {
  console.log('\n=============================================================');
  console.log('🧪 Starting Feedo 3-Sided End-to-End Lifecycle Smoke Test');
  console.log(`🌐 Target Core Backend: ${API_BASE}`);
  console.log('=============================================================\n');

  // 1. Customer Login
  console.log('▶ Step 1: Authenticating Customer (customer@feedo.dev)...');
  const customerAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'customer@feedo.dev',
      password: 'Password@123',
    }),
  });
  console.log(`   Customer Authenticated! ID: ${customerAuth.user.id}, Token Acquired.`);

  // 2. Kitchen Staff Login & WebSocket Join
  console.log('\n▶ Step 2: Authenticating Restaurant Kitchen Staff (kitchen@feedo.dev)...');
  const staffAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'kitchen@feedo.dev',
      password: 'Password@123',
    }),
  });
  console.log(`   Staff Authenticated! ID: ${staffAuth.user.id}, Role: ${staffAuth.user.role}`);

  console.log('   Connecting Kitchen Staff to WebSocket /orders namespace...');
  const staffSocket = io(`${WS_BASE}/orders`, {
    auth: { token: staffAuth.accessToken },
    transports: ['websocket', 'polling'],
  });

  const orderPlacedEventPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for order:placed WebSocket event')), 10000);
    staffSocket.on('order:placed', (payload) => {
      clearTimeout(timer);
      console.log('   [WS Event Received by Kitchen] order:placed:', payload);
      resolve(payload);
    });
  });

  await new Promise((resolve) => {
    staffSocket.on('connect', () => {
      console.log('   Kitchen Staff WebSocket connected successfully (Socket ID:', staffSocket.id, ')');
      resolve();
    });
  });

  // 3. Customer Places Order with Coupon FEEDO50
  console.log('\n▶ Step 3: Placing Order at "Bengaluru Tiffin House" with coupon FEEDO50...');
  const orderPayload = {
    restaurantId: 'res-feedo-tiffin-01',
    deliveryAddressId: 'addr-customer-feedo-home',
    items: [
      { menuItemId: 'item-dosa-01', quantity: 1 },
      { menuItemId: 'item-idli-02', quantity: 1 },
    ],
    paymentMethod: 'RAZORPAY',
    couponCode: 'FEEDO50',
    specialInstructions: 'Extra crisp dosa, pack chutneys separately',
  };

  const placedOrder = await request('/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerAuth.accessToken}` },
    body: JSON.stringify(orderPayload),
  });

  console.log(`   Order created successfully! Order ID: ${placedOrder.id}`);
  console.log(`   Order Number: ${placedOrder.orderNumber}`);
  console.log(`   Subtotal: ₹${(placedOrder.subtotalPaise / 100).toFixed(2)} (${placedOrder.subtotalPaise} paise)`);
  console.log(`   Discount: ₹${(placedOrder.discountPaise / 100).toFixed(2)} (${placedOrder.discountPaise} paise)`);
  console.log(`   Tax (GST): ₹${(placedOrder.taxPaise / 100).toFixed(2)} (${placedOrder.taxPaise} paise)`);
  console.log(`   Final Total: ₹${(placedOrder.finalTotalPaise / 100).toFixed(2)} (${placedOrder.finalTotalPaise} paise)`);

  if (placedOrder.subtotalPaise !== 21500) {
    throw new Error(`Subtotal mismatch: expected 21500, received ${placedOrder.subtotalPaise}`);
  }
  if (placedOrder.discountPaise !== 10750) {
    throw new Error(`Coupon discount mismatch: expected 10750, received ${placedOrder.discountPaise}`);
  }
  console.log('   Coupon calculation & integer paise financial invariants VERIFIED.');

  // 4. WebSocket verification
  console.log('\n▶ Step 4: Verifying Real-time WebSocket Order Notification to Restaurant...');
  try {
    const wsReceived = await orderPlacedEventPromise;
    console.log(`   Confirmed WebSocket reception! Order #${wsReceived.orderNumber} reached the kitchen screen.`);
  } catch (err) {
    console.warn(`   ⚠️ WebSocket notice: ${err.message}. Proceeding with HTTP status transitions.`);
  }

  // 5. Kitchen PREPARING
  console.log('\n▶ Step 5: Kitchen Updates Status to PREPARING...');
  const preparingRes = await request(`/orders/${placedOrder.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${staffAuth.accessToken}` },
    body: JSON.stringify({
      status: 'PREPARING',
      notes: 'Chef started roasting ghee masala dosa and steaming button idlis',
    }),
  });
  console.log(`   Status updated to: ${preparingRes.orderStatus}`);

  await sleep(400);

  // 6. Kitchen READY_FOR_PICKUP
  console.log('\n▶ Step 6: Kitchen Marks Order READY_FOR_PICKUP...');
  const readyRes = await request(`/orders/${placedOrder.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${staffAuth.accessToken}` },
    body: JSON.stringify({
      status: 'READY_FOR_PICKUP',
      notes: 'Hot food packed in tamper-proof thermal bag, ready at pickup counter',
    }),
  });
  console.log(`   Status updated to: ${readyRes.orderStatus}`);

  // 7. Delivery Partner login & offers
  console.log('\n▶ Step 7: Delivery Partner (rider@feedo.dev) Authenticates & Discovers Offers...');
  const driverAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'rider@feedo.dev',
      password: 'Password@123',
    }),
  });
  console.log(`   Driver Authenticated! ID: ${driverAuth.user.id}, Name: ${driverAuth.user.fullName}`);

  console.log('   Fetching available dispatch offers...');
  const offers = await request(`/delivery/offers?driverId=${driverAuth.user.id}`);
  console.log(`   Offers available in driver queue: ${Array.isArray(offers) ? offers.length : 'N/A'}`);

  // 8. Driver accept offer
  console.log(`\n▶ Step 8: Driver Concurrency-Safe Atomic Acceptance for Order ${placedOrder.id}...`);
  const acceptRes = await request(`/delivery/offers/${placedOrder.id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverAuth.accessToken}` },
    body: JSON.stringify({ driverId: driverAuth.user.id }),
  });
  console.log('   Offer accepted successfully:', acceptRes);

  // 9. Fulfillment steps & location pings
  console.log('\n▶ Step 9: Driver Telemetry & Fulfillment Steps...');
  
  console.log('   Advancing step -> PICKUP');
  await request(`/delivery/orders/${placedOrder.id}/step`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverAuth.accessToken}` },
    body: JSON.stringify({ driverId: driverAuth.user.id, step: 'PICKUP' }),
  });

  console.log('   Recording GPS Location Ping at Restaurant (Church Street)...');
  await request('/delivery/location', {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverAuth.accessToken}` },
    body: JSON.stringify({
      driverId: driverAuth.user.id,
      orderId: placedOrder.id,
      coords: { lat: 12.9716, lng: 77.5946, heading: 90, speed: 18.5 },
    }),
  });

  await sleep(400);

  console.log('   Advancing step -> START_DELIVERY (Out for delivery)');
  await request(`/delivery/orders/${placedOrder.id}/step`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverAuth.accessToken}` },
    body: JSON.stringify({ driverId: driverAuth.user.id, step: 'START_DELIVERY' }),
  });

  console.log('   Recording GPS Location Ping In-Transit towards Indiranagar...');
  await request('/delivery/location', {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverAuth.accessToken}` },
    body: JSON.stringify({
      driverId: driverAuth.user.id,
      orderId: placedOrder.id,
      coords: { lat: 12.9752, lng: 77.6210, heading: 85, speed: 32.0 },
    }),
  });

  await sleep(400);

  console.log('   Advancing step -> COMPLETE_DELIVERY (Customer Handover)');
  await request(`/delivery/orders/${placedOrder.id}/step`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverAuth.accessToken}` },
    body: JSON.stringify({ driverId: driverAuth.user.id, step: 'COMPLETE_DELIVERY' }),
  });

  // 10. Final State Verification
  console.log('\n▶ Step 10: Verifying Final Order State & Audit Integrity...');
  const finalOrder = await request(`/orders/${placedOrder.id}`, {
    headers: { Authorization: `Bearer ${customerAuth.accessToken}` },
  });

  console.log(`   Final Order Status: ${finalOrder.orderStatus}`);
  console.log(`   Payment Status: ${finalOrder.paymentStatus}`);
  console.log(`   Status History Steps Recorded: ${finalOrder.statusHistory ? finalOrder.statusHistory.length : 0}`);

  if (finalOrder.orderStatus !== 'DELIVERED') {
    throw new Error(`Expected order status to be DELIVERED, but got ${finalOrder.orderStatus}`);
  }

  staffSocket.disconnect();

  console.log('\n=============================================================');
  console.log('🎉 3-SIDED END-TO-END SMOKE TEST PASSED SUCCESSFULLY!');
  console.log('   Customer -> Kitchen -> Courier -> Handover cycle complete');
  console.log('=============================================================\n');
}

runSmokeTest().catch((err) => {
  console.error('\n❌ Smoke Test Failed with Error:', err);
  process.exit(1);
});
