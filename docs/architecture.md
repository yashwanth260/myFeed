# System Architecture: CraveCart & Feedo Food Delivery Platform

## 1. Architecture Overview

CraveCart / Feedo is designed as a **high-throughput, modular monolith** backend powering three client applications:
1. **Customer Mobile Application** (React Native / Expo + Web Viewport)
2. **Restaurant Partner Application** (React + Capacitor Mobile Frame)
3. **Delivery Partner Application** (React + Capacitor Mobile Frame)
4. **Operations & Admin Dashboard** (Platform Governance Console)

```
                                  ┌───────────────────────────────┐
                                  │   Clients & Micro-Frontends   │
                                  ├───────────────┬───────────────┤
                                  │ Customer App  │ Restaurant App│
                                  │ Delivery App  │ Admin Console │
                                  └───────┬───────┴───────┬───────┘
                                          │               │
                                 HTTP / REST API    WebSocket (Socket.IO)
                                          │               │
                                          ▼               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NestJS Modular Monolith API Gateway                             │
│                                                                                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────────┐  │
│  │  AuthModule   │  │ CustomerModule│  │RestaurantMod  │  │ DeliveryPartnerModule   │  │
│  │ (JWT + RBAC)  │  │(Discovery/Cart│  │(Menu/Kitchen) │  │ (Dispatch/GPS/OTP)      │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └────────────┬────────────┘  │
│          │                  │                  │                       │               │
│  ┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐  ┌────────────▼────────────┐  │
│  │  OrderModule  │  │ PaymentModule │  │ PricingEngine │  │  NotificationsModule    │  │
│  │(State Machine)│  │ (Razorpay/HMAC│  │(Integer Paise)│  │ (In-App / Sound Alerts) │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  └─────────────────────────┘  │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌────────────────┐              ┌────────────────┐              ┌────────────────┐
│   PostgreSQL   │              │     Redis      │              │    BullMQ      │
│  (Prisma ORM)  │              │ (Cache / PubSub│              │ (Async Workers │
│  ACID Ledger   │              │   Driver GPS)  │              │  Rider Timeout)│
└────────────────┘              └────────────────┘              └────────────────┘
```

---

## 2. Core Architectural Pillars

### 2.1 Integer Paise Financial Engine
- All monetary calculations (food subtotal, promo discounts, surge delivery fees, 5% GST taxes, restaurant payouts, driver earnings) are strictly executed in 64-bit integer paise ($1\text{ Rupee} = 100\text{ Paise}$).
- Floating-point calculations (`0.1 + 0.2 = 0.30000000000000004`) are forbidden in financial paths to prevent fractional rounding errors or reconciliation discrepancies.

### 2.2 Server-Authoritative State Machine
- Order transitions must flow monotonically through allowed lifecycle stages:
  $$\text{PENDING} \longrightarrow \text{CONFIRMED} \longrightarrow \text{PREPARING} \longrightarrow \text{READY\_FOR\_PICKUP} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{OUT\_FOR\_DELIVERY} \longrightarrow \text{DELIVERED}$$
- Reverse transitions (e.g. `DELIVERED` $\rightarrow$ `PREPARING`) or illegal jumps (e.g. `PENDING` $\rightarrow$ `DELIVERED`) are blocked with HTTP 400 Bad Request.

### 2.3 Concurrency-Safe Delivery Dispatch
- Dispatch assignments utilize atomic locking in Redis / PostgreSQL transactions.
- When an order reaches `READY_FOR_PICKUP`, an atomic broadcast targets the closest eligible online delivery partner with a 60-second acceptance timeout before cascading to the next rider.

---

## 3. Directory Layout & Monorepo Structure

```
foodapp/
├── apps/
│   ├── customer/            # React Native Expo Customer Mobile App
│   ├── restaurant/          # React 18 + Capacitor Restaurant Partner App
│   ├── delivery/            # React 19 + Capacitor Delivery Partner App
│   ├── restaurant_flutter/  # Pure Flutter Restaurant Partner App
│   ├── delivery_flutter/    # Pure Flutter Delivery Partner App
│   └── backend/             # NestJS Modular Monolith API & Realtime Gateway
├── packages/
│   ├── shared-types/        # Canonical TypeScript types & interfaces
│   ├── shared-ui/           # UI Design tokens (Colors, Shadows, Typography)
│   ├── shared-validation/   # Zod runtime validation schemas
│   └── shared-business-logic# Pure pricing, tax & ledger formulas
├── prisma/
│   └── schema.prisma        # 617-line PostgreSQL relational schema
├── scripts/
│   ├── start-web-servers.js # Multi-server development supervisor
│   └── run-tests.js         # Automated cross-app integration test harness
└── docs/                    # Technical architecture & operational specs
```
