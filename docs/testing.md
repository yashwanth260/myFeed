# CraveCart Automated Testing Strategy & Verification Guide

This document details the multi-layered testing strategy, test runner architecture, and execution procedures for the CraveCart food delivery platform.

---

## 1. Multi-Layered Testing Pyramid

```
                ▲
               / \
              /   \
             / E2E \       Cross-App Order Lifecycle Simulation (Phase 4)
            /-------\
           / Backend \     HTTP API Integration & Razorpay Tests (Phase 5)
          /----------- \
         / State Machine\  Order Transition & Security Guards (Phase 2)
        /----------------\
       / Business Logic   \ Server Pricing & Zod Validation (Phase 1 & 3)
      +--------------------+
```

---

## 2. Test Execution Command

Run the unified test runner:
```bash
npm test
```
Or directly:
```bash
node scripts/run-tests.js
```

---

## 3. Test Suites Breakdown (54/54 Passing Tests)

### Phase 1: Shared Business Logic & Pricing Tests
- **Subtotal Calculation:** Verifies accurate summation of base menu item prices and customization additions strictly in integer paise.
- **Free Delivery Threshold:** Verifies that when subtotal reaches or exceeds `freeDeliveryThresholdPaise` (₹500.00 / 50000 paise), the delivery fee drops to 0.
- **GST Tax Computation:** Verifies 5% GST computation on the taxable base.
- **Grand Total Integrity:** Confirms `finalTotalPaise === subtotal - discount + delivery + packaging + service + tax`.
- **Coupon Caps:** Verifies that percentage discounts (e.g., `WELCOME50` 50%) are strictly bounded by `maxDiscountPaise` (₹100.00 max).

### Phase 2: Order State Machine & RLS Security Tests
- **Valid Forward Transitions:**
  - `pending` -> `confirmed`
  - `confirmed` -> `preparing`
  - `preparing` -> `ready_for_pickup`
  - `ready_for_pickup` -> `picked_up`
  - `picked_up` -> `out_for_delivery`
  - `out_for_delivery` -> `delivered`
- **Illegal Backward Transitions:**
  - Blocks `delivered` -> `preparing`
  - Blocks `cancelled` -> `delivered`
  - Blocks skips (e.g. `pending` directly to `delivered`)

### Phase 3: Zod & DTO Payload Validation Tests
- **Auth Payloads:** Validates standard email patterns, minimum password complexity, and phone number formatting.
- **Address Payloads:** Validates GPS coordinate ranges (Latitude `[-90, 90]`, Longitude `[-180, 180]`).
- **Malformed Input Rejection:** Ensures missing required properties or illegal types result in clean `400 Bad Request` responses.

### Phase 4: Cross-App Interconnected Workflow Verification
Simulates the real-world interconnected journey across all 3 apps:
1. Customer places order `#CC-9900-123` via Customer App.
2. Restaurant receives real-time alert and accepts order (`CONFIRMED`).
3. Kitchen starts cooking (`PREPARING`) and finishes (`READY_FOR_PICKUP`).
4. Dispatch engine makes delivery partner eligible for pickup.
5. Delivery partner claims offer and confirms pickup (`PICKED_UP`).
6. Delivery partner completes doorstep delivery with PIN verification (`DELIVERED`).

### Phase 5: Production Backend HTTP API Tests
- `GET /api/v1/health`: Checks system health, uptime, and environment.
- `POST /api/v1/auth/login`: Authenticates valid credentials and rejects incorrect passwords.
- `GET /api/v1/restaurants`: Verifies catalog retrieval of approved restaurants.
- `GET /api/v1/menu/items`: Tests filters for *Food Item*, *Feedo Meat*, and *Feedo Mart*.
- `POST /api/v1/pricing/calculate`: Asserts server calculation of subtotal, tax, and discount.
- `POST /api/v1/payments/create-razorpay-order`: Asserts Razorpay order ID generation.
- `POST /api/v1/payments/verify`: Verifies valid HMAC SHA256 signatures and rejects forged signatures.
- `POST /api/v1/payments/webhook`: Tests webhook ingestion and replay deduplication.
- `POST /api/v1/delivery/accept`: Tests atomic locking to prevent multiple driver claims.
- `POST /api/v1/delivery/location`: Tests driver GPS coordinate broadcasting.
- `POST /api/v1/admin/restaurants/:id/approve`: Tests admin merchant approval flow.
- `GET /api/v1/admin/analytics`: Verifies financial ledger aggregation, GMV, and commissions.
