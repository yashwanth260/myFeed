# Database Architecture & Data Dictionary: CraveCart & Feedo

## 1. Storage Overview

The platform uses **PostgreSQL 16** managed via **Prisma ORM**, configured with strict foreign key constraints, composite unique indexes, and financial integrity checks.

---

## 2. Core Relational Entities

### 2.1 Identity & Access Control
- **`User`**: Central user account across all roles (`CUSTOMER`, `RESTAURANT_OWNER`, `RESTAURANT_STAFF`, `DELIVERY_PARTNER`, `ADMIN`).
- **`Address`**: Customer geocoded delivery coordinates (`latitude`, `longitude`, `streetAddress`, `landmark`, `postalCode`).
- **`Session`**: Active refresh token sessions with device fingerprinting and IP tracking.

### 2.2 Restaurants & Food Catalog
- **`Restaurant`**: Merchant profile, FSSAI registration, operating hours, base delivery fee, commission rate, and serviceability radius.
- **`MenuCategory`**: Hierarchical categories (`Food Items`, `Feedo Meat`, `Feedo Mart`).
- **`MenuItem`**: Product records with `pricePaise`, `originalPricePaise`, `dietaryType` (`VEG`, `NON_VEG`, `EGG`), `isAvailable`, `prepTimeMins`.
- **`MenuCustomizationGroup`** & **`MenuCustomizationOption`**: Portion sizing (`Regular`, `Family Pack`), cut preferences, spice levels.

### 2.3 Orders & Ledger
- **`Order`**: Master order record containing server-calculated totals:
  - `subtotalPaise`, `customizationTotalPaise`, `deliveryFeePaise`, `taxPaise`, `discountPaise`, `finalAmountPaise`.
- **`OrderItem`**: Historical snapshot of item name, category, and exact unit price at purchase time.
- **`OrderStatusHistory`**: Immutable audit log of every lifecycle timestamp and triggering actor.
- **`Payment`**: Payment status, provider transaction ID (`razorpayOrderId`, `razorpayPaymentId`), signature verification flag, and refund records.

### 2.4 Delivery Dispatch & Tracking
- **`DeliveryPartnerProfile`**: Driver verification status (`APPROVED`, `PENDING_REVIEW`), vehicle type, DL number, active shift status.
- **`DeliveryAssignment`**: Atomic relationship linking order, rider, accepted timestamp, pickup timestamp, and drop verification OTP.
- **`DeliveryLocation`**: Historical breadcrumb trail of driver GPS coordinates for route playback.

---

## 3. High-Volume Partitioning Strategy

For enterprise deployments handling millions of orders:
```sql
-- Partition orders table by month
CREATE TABLE orders (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    final_amount_paise BIGINT NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Monthly partition instance
CREATE TABLE orders_2026_11 PARTITION OF orders
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
```
Active orders queries index directly into the current month's partition, maintaining sub-10ms response times irrespective of table size.
