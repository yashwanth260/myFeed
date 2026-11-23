# CraveCart API Documentation (v1)

Base URL: `http://localhost:4000/api/v1`  
Interactive Swagger / OpenAPI 3.0 Specs: `http://localhost:4000/api/v1/docs`

---

## Authentication & Headers

All authenticated endpoints expect a standard HTTP Bearer token header:
```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
```

Role-based access control enforces one of the following roles:
- `CUSTOMER`
- `RESTAURANT_OWNER` / `RESTAURANT_STAFF`
- `DELIVERY_PARTNER`
- `ADMIN`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new customer or merchant account.
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "name": "Alex Johnson",
  "phone": "+919876543210",
  "role": "CUSTOMER"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "user": {
    "id": "usr-uuid-v4",
    "email": "user@example.com",
    "name": "Alex Johnson",
    "role": "CUSTOMER"
  },
  "tokens": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### `POST /auth/login`
Authenticates user using email and password, returning signed JWT tokens.
- **Request Body:**
```json
{
  "email": "customer@cravecart.in",
  "password": "Pass@123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": "usr-customer-01",
    "email": "customer@cravecart.in",
    "name": "Alex Johnson",
    "role": "CUSTOMER"
  },
  "tokens": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### `POST /auth/refresh`
Rotates refresh tokens and returns a fresh short-lived access token.
- **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

---

## 2. Customer & Discovery Endpoints

### `GET /restaurants`
List all active, verified restaurants.
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 4,
  "restaurants": [
    {
      "id": "rest-01",
      "name": "Spice Junction",
      "cuisine": "North Indian, Biryani",
      "rating": 4.8,
      "deliveryTimeMinutes": 30,
      "baseDeliveryFeePaise": 3500,
      "freeDeliveryThresholdPaise": 50000,
      "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8"
    }
  ]
}
```

### `GET /menu/items?section={food|meat|mart}`
Fetches curated items across specialized verticals:
- `food`: Chef dishes (Biryani, Noodles, Pizza, Burgers)
- `Feedo Meat`: Clean cuts, goat chops, organic chicken breast
- `Feedo Mart`: Daily essentials, milk, butter, organic produce

---

## 3. Authoritative Pricing Engine

### `POST /pricing/calculate`
Authoritative backend computation preventing client-side price tampering. All monetary values are strictly in integer paise.
- **Request Body:**
```json
{
  "restaurantId": "rest-01",
  "items": [
    {
      "itemId": "food-1",
      "quantity": 2,
      "unitPricePaise": 22500,
      "customizationTotalPaise": 0
    }
  ],
  "couponCode": "SAVINGS30",
  "tipPaise": 2000
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "pricing": {
    "subtotalPaise": 45000,
    "discountPaise": 10000,
    "deliveryFeePaise": 3500,
    "taxesPaise": 2250,
    "platformFeePaise": 500,
    "tipPaise": 2000,
    "totalPaise": 43250,
    "currency": "INR",
    "formattedTotal": "₹432.50"
  }
}
```

---

## 4. Orders Management

### `POST /orders`
Creates a new order in `PENDING` status.
- **Request Body:**
```json
{
  "restaurantId": "rest-01",
  "items": [...],
  "pricing": { ... },
  "deliveryAddress": {
    "formattedAddress": "42 MG Road, Indiranagar, Bengaluru 560038",
    "lat": 12.9716,
    "lng": 77.5946
  },
  "paymentMethod": "RAZORPAY"
}
```

### `GET /orders/:id`
Retrieves live order details with status snapshot and tracking information.

### `PATCH /orders/:id/status`
State-machine governed status progression.
Valid transitions:
- `PENDING` -> `CONFIRMED`, `REJECTED`, `CANCELLED`
- `CONFIRMED` -> `PREPARING`
- `PREPARING` -> `READY_FOR_PICKUP`
- `READY_FOR_PICKUP` -> `PICKED_UP`
- `PICKED_UP` -> `OUT_FOR_DELIVERY`
- `OUT_FOR_DELIVERY` -> `DELIVERED`

---

## 5. Payments & Razorpay Integration

### `POST /payments/create-razorpay-order`
Creates an official Razorpay Order ID for client checkout SDK.
- **Request Body:**
```json
{
  "orderId": "order-uuid-v4",
  "amountPaise": 43250
}
```
- **Response `200 OK`:**
```json
{
  "razorpayOrderId": "order_RzpTest9912048",
  "amountPaise": 43250,
  "currency": "INR",
  "keyId": "rzp_test_51NgQ7Cravecart"
}
```

### `POST /payments/verify`
Validates HMAC SHA256 signature returned by Razorpay Checkout.
- **Headers:** `x-razorpay-signature`
- **Request Body:**
```json
{
  "orderId": "order-uuid-v4",
  "razorpayOrderId": "order_RzpTest9912048",
  "razorpayPaymentId": "pay_99201481",
  "signature": "hmac_sha256_hex"
}
```

### `POST /payments/webhook`
Asynchronous payment event processor from Razorpay webhook servers with signature validation and deduplication replay protection.

---

## 6. Delivery Dispatch & GPS Tracking

### `GET /delivery/offers`
Lists ready orders within radius available for pickup by delivery partners.

### `POST /delivery/accept`
Claims a delivery offer with atomic lock to prevent race conditions.
- **Request Body:**
```json
{
  "orderId": "order-uuid-v4"
}
```

### `POST /delivery/location`
Rider broadcasts real-time GPS coordinates.
- **Request Body:**
```json
{
  "lat": 12.9785,
  "lng": 77.5921,
  "heading": 180,
  "speed": 22.4
}
```

---

## 7. Admin & Platform Operations

### `GET /admin/restaurants/pending`
Lists merchants awaiting verification and KYC review.

### `POST /admin/restaurants/:id/approve`
Approves and activates merchant in the consumer catalog.

### `GET /admin/analytics`
Summarizes platform GMV, commissions collected, net merchant payouts, and active riders.

### `GET /admin/audit-logs`
Security trail of all administrative and financial actions.

