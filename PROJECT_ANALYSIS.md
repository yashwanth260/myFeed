# Project Architecture & Deep Inspection Analysis: CraveCart / Feedo Food Delivery Platform

**Document Version:** 1.0.0  
**Generated Date:** November 11, 2026  
**Author:** Principal Software & Backend Architect  

---

## 1. Executive Summary

This document presents a comprehensive technical audit of the **CraveCart / Feedo** food delivery startup platform codebase. The repository is structured as a multi-client monorepo serving four primary user archetypes:
1. **Feedo Customer Application** (`apps/customer`) — Mobile (React Native / Expo Router) & Mobile Web Preview.
2. **Feedo Restaurant Partner Application** (`apps/restaurant`) — Mobile-first PWA / Capacitor Android application.
3. **Feedo Delivery Partner Application** (`apps/delivery`) — Mobile-first PWA / Capacitor Android application.
4. **Operations & Admin Platform Console** (`http://localhost:8084`) — Platform governance, KYC approvals, and commission ledger.

The purpose of this analysis is to evaluate existing frontend and backend capabilities, specify architectural boundaries, map out missing enterprise capabilities, and chart the migration to a production-grade **NestJS, TypeScript, PostgreSQL, Prisma, Redis, Socket.IO, and Razorpay** backend.

---

## 2. Existing Frontend Applications Analysis

### A. Customer Application (`apps/customer`)
- **Framework & Runtime:** React Native 0.74 with Expo Router (`expo ~52.0.0`) and TypeScript.
- **Routing Paradigm:** File-system based navigation (`app/` directory):
  - `app/_layout.tsx`: Root Stack provider with React Query client and font hydration.
  - `app/(auth)/login.tsx`: Customer phone/email authentication with OTP dialog.
  - `app/(auth)/register.tsx`: Customer onboarding & profile creation.
  - `app/(tabs)/_layout.tsx`: Bottom tab bar with badge count indicators.
  - `app/(tabs)/index.tsx`: Main home discovery feed with 3-way segment switcher:
    - `Food Item`: Biryani, Burgers, Pizzas, Noodles, Bowls.
    - `Feedo Meat`: Antibiotic-free chicken, tender goat mutton, sea prawns, salmon, eggs, wings.
    - `Feedo Mart`: Fresh Hass avocados, berries, A2 farm milk, sourdough, paneer, dry fruits.
  - `app/(tabs)/search.tsx`: Real-time query search, dietary toggles (`Pure Veg`), and 4.7+ rating filter.
  - `app/(tabs)/orders.tsx`: Customer order history and live active order tracking entrypoint.
  - `app/(tabs)/profile.tsx`: Customer saved addresses, payment methods, and profile preferences.
  - `app/restaurant/[id].tsx`: Restaurant details, category scroll, and menu listing.
  - `app/cart.tsx`: Cart contents, item quantity steppers, promo coupon engine (`SAVINGS30`, `WELCOME50`, `FREEDEL`), and integer-paise bill breakdown.
  - `app/checkout.tsx`: Delivery address selection, payment gateway trigger, and order placement.
  - `app/tracking/[id].tsx`: Live order timeline (`PLACED` $\rightarrow$ `PREPARING` $\rightarrow$ `ON_THE_WAY` $\rightarrow$ `DELIVERED`).
  - `app/review/[orderId].tsx`: Post-delivery feedback and star rating.
- **Design System & Styling:** Amber Yellow (`#FFC727`), Charcoal (`#1E1E1E`), Coral Red (`#FF5E7E`), and White card surfaces (`#FFFFFF`) with subtle box shadows. Custom component library utilizing Lucide React Native icons.
- **State Management:** Zustand (`useCartStore`, `useAuthStore`) and TanStack React Query (`@tanstack/react-query`).
- **API Integration:** Centralized API client in `apps/customer/services/apiService.ts` communicating with `http://localhost:4000/api/v1` with resilient offline seed fallbacks.

---

### B. Restaurant Partner Application (`apps/restaurant`)
- **Framework & Runtime:** React 18, Vite 5, TypeScript, Capacitor 8 Android (`com.feedo.restaurantpartner`).
- **Viewport System:** Configured as a centered native phone shell on desktop (`max-w-[430px]` with phone bezels, dynamic island, and 5G status bar) and full viewport on Android devices.
- **Screen Architecture (via `AppContext.tsx`):**
  - **Pre-Auth:** `splash`, `welcome`, `terms`, `privacy`, `permissions`, `onboarding`, `login`, `otp`, `register`, `documents` (FSSAI / GST upload), `verification_status`, `approval`, `setup`.
  - **Live Operations:**
    - `dashboard`: Real-time orders queue, today's sales metrics, store online/offline switch.
    - `orders`: Tabbed order progression (`Incoming` $\rightarrow$ `Kitchen Preparing` $\rightarrow$ `Ready for Pickup`).
    - `menu`: Menu catalog, price updates, instant in-stock/86 stock availability toggle.
    - `earnings` / `finance`: Gross order value, platform commission, net payout records.
    - `reviews`: Customer rating and feedback feed.
    - `staff`: Kitchen chef, cashier, and manager role accounts.
    - `support`: Helpdesk and emergency merchant care.
- **Audio Alerts:** Loud siren and ring alert integration utilizing the Web Audio API for incoming order dispatches.
- **State Management:** React Context (`AppContext.tsx`) with localStorage persistence.

---

### C. Delivery Partner Application (`apps/delivery`)
- **Framework & Runtime:** React 19, Vite 8, TypeScript, Capacitor 8 Android (`com.feedo.deliverypartner`).
- **Viewport System:** Native mobile phone wrapper (`max-w-[430px]`, dynamic status bar, touch-friendly action targets).
- **Core Views:**
  - `home` (Duty Screen): Duty switch (*Go Online / Offline*), live GPS beacon simulator, floating incoming trip offer card with countdown timer.
  - `orders` / `trips`: Trip queue, store arrival confirmation, pickup validation, customer drop navigation, and OTP completion.
  - `earnings`: Weekly wallet balance, trip counts, customer tips breakdown, and instant UPI cashout.
  - `profile`: Rider ratings (e.g. 4.92 stars), vehicle insurance/DL verification, and Emergency SOS patrol triggers.
- **State Management:** React Context (`AuthContext`, `DeliveryContext`, `LanguageContext`).
- **API Integration:** `apps/delivery/src/services/apiBridge.ts`.

---

## 3. Existing Backend & Infrastructure State

### Current Implementation:
- **Lightweight Monolithic Server (`apps/backend`):** A custom Node.js server (`src/server.js`) backed by an in-memory reactive data store (`src/data/store.js`) running on port 4000.
- **Features Implemented in Current Server:**
  - Standardized JSON responses for `/api/v1` routes.
  - Server-authoritative integer paise pricing engine (`pricingService.js`).
  - Order state machine (`orderService.js`) enforcing valid lifecycle transitions.
  - Razorpay order creation and HMAC-SHA256 signature verification (`paymentService.js`).
  - Delivery dispatch assignment with atomic concurrency locks (`deliveryService.js`).
  - Platform GMV, merchant settlements, and security audit log tracing (`adminService.js`).
  - Real-time Socket.IO gateway (`socketServer.js`).
  - Automated integration test suite (`tests/api.test.js`) with **31/31 passing tests**.
- **Prisma Schema (`prisma/schema.prisma`):** Contains 617 lines of enterprise relational database definitions, covering Users, Roles, CustomerProfiles, Restaurants, MenuCategories, MenuItems, Orders, Payments, DeliveryTasks, DriverEarnings, and Financial Ledgers.

### Gaps Requiring Production NestJS Migration:
1. **Database Persistence:** The current runtime uses `store.js` as an in-memory store; it must be backed by live PostgreSQL tables using Prisma Client with migrations.
2. **Framework Structure:** Replace raw HTTP server scripts with **NestJS modular monolith** architecture (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/swagger`).
3. **Background Job Processing:** Integrate **BullMQ** with **Redis** for worker tasks (e.g. 60-second rider offer timeouts, payment reconciliation, webhook retries).
4. **WebSocket Gateway:** Convert raw Socket.IO server to NestJS `@WebSocketGateway()` with JWT connection handshake authentication.
5. **Swagger / OpenAPI Documentation:** Expose auto-generated OpenAPI documentation at `/api/docs`.

---

## 4. Database Architecture & Schema Requirements

The PostgreSQL database must adhere to strict financial and transactional integrity rules:
1. **Integer Paise Financial Rule:** All amounts (`price_paise`, `subtotal_paise`, `discount_paise`, `delivery_fee_paise`, `tax_paise`, `final_amount_paise`) must be stored as 64-bit integers (`BigInt` or `Int`). Floating point types (`FLOAT`, `DOUBLE`) are strictly prohibited for financial calculations.
2. **Order Price Snapshots:** The `OrderItem` and `OrderPriceSnapshot` entities must capture the item name, variant, and exact unit price at order creation time. Subsequent menu price updates must never alter historical orders.
3. **Relational Constraints & Indexes:**
   - Unique constraints on `User.email`, `User.phone`, `Coupon.code`, `Payment.razorpayOrderId`.
   - B-Tree indexes on `Order.status`, `Order.customerId`, `Order.restaurantId`, `MenuItem.categoryId`, `DeliveryTask.status`.
4. **Declarative Partitioning Strategy:** For high-volume scaling (100k+ orders/day), the `orders` table is designed for range partitioning by `created_at`.

---

## 5. Security & Authentication Architecture

1. **Password Hashing:** Passwords hashed using **bcrypt** (salt rounds = 10) or **Argon2id**.
2. **Dual-Token JWT Authentication:**
   - Short-lived Access Token (15–30 minutes) containing `userId`, `role`, and `email`.
   - Long-lived Refresh Token (7–30 days) stored with cryptographic hash in database for rotation and revocation.
3. **Role-Based Access Control (RBAC):**
   - `@Roles('CUSTOMER')`: Restricted to personal addresses, carts, and orders.
   - `@Roles('RESTAURANT_OWNER', 'RESTAURANT_STAFF')`: Scoped strictly to the authenticated user's `restaurantId`.
   - `@Roles('DELIVERY_PARTNER')`: Scoped only to assigned tasks and personal earnings.
   - `@Roles('ADMIN')`: Platform-wide governance and approvals.
4. **Payment Gateway Security:**
   - Raw request body capture for Razorpay webhook HMAC-SHA256 signature verification.
   - Webhook idempotency ledger to prevent duplicate execution upon event replay.

---

## 6. Migration & Step-by-Step Implementation Roadmap

```
┌────────────────────────────────────────────────────────┐
│                      PHASE 1                           │
│  Project Inspection, Dependency Setup & NestJS Core    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      PHASE 2                           │
│   Prisma Database Client, PostgreSQL Config & Seed     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      PHASE 3                           │
│     Authentication, JWT Strategies & RBAC Guards       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      PHASE 4                           │
│  Domain Modules: Customer, Restaurant, Delivery & Order│
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      PHASE 5                           │
│  Razorpay Payments, Webhook HMAC & Pricing Engine      │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      PHASE 6                           │
│   Socket.IO Gateway, Redis Queues & BullMQ Workers     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      PHASE 7                           │
│  Admin Console, Financial Ledger, Swagger & Tests      │
└────────────────────────────────────────────────────────┘
```

---

## 7. Potential Compatibility & Migration Hazards

| Component | Potential Issue | Mitigation Strategy |
| :--- | :--- | :--- |
| **Port Conflicts** | Current dev server uses port 4000 for backend API | Ensure the NestJS server mounts cleanly on port 4000 or supports dynamic `PORT` env var with backwards compatibility for all 3 frontends. |
| **Prisma Versioning** | Root package has Prisma 8.0.0-rc.30 vs standard Prisma 5.x/6.x | Use compatible `@prisma/client` bindings that compile cleanly on Windows and Alpine Linux Docker images. |
| **Monorepo Workspaces** | Duplicate package names or conflicting lockfiles | Keep NestJS API in `apps/api` (or upgrade `apps/backend`), preserving shared libraries in `packages/`. |
| **Frontend API Contracts** | Frontends expect responses in `{ success: true, ... }` format | Implement a global NestJS `TransformInterceptor` that formats all controller outputs uniformly. |
| **Razorpay Webhooks** | JSON body parsers alter raw bytes required for HMAC verification | Implement a raw-body capture middleware specifically for `/api/v1/payments/webhook`. |

