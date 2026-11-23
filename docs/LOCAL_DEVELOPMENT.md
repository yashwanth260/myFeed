# CraveCart Local Development Guide

This guide walks through running the complete multi-app food delivery ecosystem on your local development machine.

---

## 1. Local Architecture & Port Mapping

The CraveCart platform runs four specialized frontends and one central backend API server concurrently:

| Application | Role | Port | Technology | URL |
| :--- | :--- | :--- | :--- | :--- |
| **CraveCart Customer** | Consumer ordering, discovery, cart, tracking | **8081** | React / Tailwind / Capacitor | `http://localhost:8081` |
| **Feedo Restaurant Partner** | Kitchen display, order acceptance, menu | **8082** | React / Vite / Flutter | `http://localhost:8082` |
| **Feedo Delivery Partner** | Dispatch acceptance, GPS streaming, drop OTP | **8083** | React / Vite / Flutter | `http://localhost:8083` |
| **CraveCart Admin Console** | KYC approvals, GMV analytics, audit logs | **8084** | HTML5 / Tailwind Dashboard | `http://localhost:8084` |
| **Unified Backend API** | REST API, Prisma ORM, Socket.IO, Razorpay | **4000** | Node.js / NestJS / TypeScript | `http://localhost:4000/api/v1` |

---

## 2. Starting the Development Stack

### Starting All Services Concurrently
To start all 4 applications and the backend API with a single supervisor command:

```bash
npm start
# or
node scripts/start-web-servers.js
```

### Starting Individual Applications (Independent Debugging)
If you want to run or debug a specific application in isolation:

```bash
# Customer Mobile App
npm run start:customer

# Restaurant Partner App
npm run start:restaurant

# Delivery Partner App
npm run start:delivery

# Flutter Android/iOS Emulators (Optional)
npm run flutter:restaurant
npm run flutter:delivery
```

---

## 3. Demo Test Accounts

The local development seed script pre-loads fully authenticated role-based test accounts:

| Role | Email | Password | Pre-configured Context |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@cravecart.in` | `Pass@123` | Alex Johnson, 42 MG Road, Indiranagar |
| **Restaurant Partner** | `owner@spicejunction.in` | `Pass@123` | Rajesh Sharma, Spice Junction (Biryani) |
| **Delivery Partner** | `driver@cravecart.in` | `Pass@123` | Rahul Kumar, Hero Electric, 4.9★ |
| **Platform Admin** | `admin@cravecart.in` | `Pass@123` | Platform Superadmin |

---

## 4. End-to-End Workflow Testing

To verify the full cross-application order lifecycle across your open browser tabs:

### Step 1: Place an Order in Customer App (`:8081`)
1. Open `http://localhost:8081`.
2. Browse products or switch tabs to **Food Item**, **Feedo Meat**, or **Feedo Mart**.
3. Tap **"Add to Cart"** on *Hyderabadi Dum Biryani*.
4. Open the Cart Drawer, enter promo code `SAVINGS30` (saves 30%), and proceed to checkout.
5. In the OTP modal, enter demo code `204815` (or tap the quick autofill pill).
6. Order transitions to `PENDING` with order number `#CC-8821-492`.

### Step 2: Accept Order in Restaurant Partner App (`:8082`)
1. Open `http://localhost:8082`.
2. The incoming order appears immediately under **Active Orders**.
3. Tap **"Accept & Start Prep"** (`PENDING` -> `PREPARING`).
4. When finished cooking, tap **"Ready for Pickup"** (`PREPARING` -> `READY_FOR_PICKUP`).

### Step 3: Dispatch & Delivery in Delivery Partner App (`:8083`)
1. Open `http://localhost:8083`.
2. The order notification alert triggers with an atomic acceptance timer.
3. Tap **"Accept Delivery Offer"**.
4. Tap **"Arrived at Restaurant"** -> **"Confirm Pickup"** (`READY_FOR_PICKUP` -> `PICKED_UP`).
5. Tap **"Start Navigation"** (`PICKED_UP` -> `OUT_FOR_DELIVERY`).
6. At customer doorstep, enter Customer PIN `204815` and tap **"Confirm Delivery"**.
7. Order reaches terminal state `DELIVERED`. Rider wallet is instantly credited with ₹93.00.

### Step 4: Audit & Verify in Admin Console (`:8084`)
1. Open `http://localhost:8084`.
2. Review GMV metrics, merchant net payouts, and inspect immutable audit logs in real-time.

---

## 5. Running Automated Test Suites

Run the end-to-end integration test suite verifying all 54 scenarios:

```bash
npm test
```

This executes:
- **Phase 1:** Server-authoritative integer paise pricing calculations.
- **Phase 2:** State machine transition integrity & RLS security guards.
- **Phase 3:** Zod payload validations.
- **Phase 4:** Cross-app order dispatch simulation.
- **Phase 5:** Backend HTTP API calls (Auth, Razorpay HMAC, Webhooks, Rider Locks, Admin KYCs).

