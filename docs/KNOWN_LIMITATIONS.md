# CraveCart Known Limitations & Production Scaling Roadmap

This document catalogs current system boundaries, development environment constraints, and the roadmap for scaling to Tier-1 production workloads.

---

## 1. Development vs. Production Constraints

### 1.1 Payment Gateway Sandbox
- **Current State:** Configured with Razorpay Test Mode keys (`rzp_test_...`).
- **Limitation:** Transactions are simulated; bank accounts are not debited, and mock card/UPI flows are used.
- **Production Transition:** Switch to `rzp_live_...` keys, upload verified business documents, activate GSTIN billing, and configure secure HTTPS webhooks.

### 1.2 Geolocation & Distance Matrix
- **Current State:** Implements Haversine spherical distance calculation with fallback mock routes when Google Maps API key is unconfigured.
- **Limitation:** Haversine computes straight-line distance ("as the crow flies"), which under-estimates urban traffic road travel time by ~25-35%.
- **Production Transition:** Provision production Google Maps Platform API key with **Routes API** and **Distance Matrix API** enabled to factor live traffic congestion and turn-by-turn road networks.

### 1.3 Push Notifications (FCM / APNs)
- **Current State:** Real-time events are transmitted through WebSocket (Socket.IO) and browser toasts.
- **Limitation:** When mobile devices are in sleep mode or apps are closed, WebSocket connections terminate.
- **Production Transition:** Integrate Firebase Cloud Messaging (FCM) for Android and Apple Push Notification service (APNs) for iOS using production developer certificates.

### 1.4 Background Worker & Redis Cluster
- **Current State:** BullMQ queues run against a single local Redis instance.
- **Limitation:** High memory pressure under heavy queue backlog without automatic failover.
- **Production Transition:** Deploy Redis Sentinel or AWS ElastiCache for Redis with automated failover and multi-AZ replication.

---

## 2. High-Scale Architecture Roadmap (>100,000 Orders / Day)

To support Swiggy-scale order volume:

### 2.1 Database Partitioning & Read Replicas
1. **Time-Based Table Partitioning:** Partition the `Order`, `OrderItem`, and `Payment` tables by month (`RANGE (createdAt)`). This keeps the active working dataset in RAM while older completed orders reside in cold storage partitions.
2. **Read/Write Splitting:** Route write operations (`INSERT`, `UPDATE`) to the PostgreSQL Primary, and heavy read traffic (discovery catalog, search, order history) to multiple read replicas via PgBouncer connection pooling.

### 2.2 Micro-Frontends & Native Mobile App Stores
1. **Flutter Mobile Deployment:** Build native APKs/AABs for Google Play and IPAs for the iOS App Store from `apps/restaurant_flutter` and `apps/delivery_flutter`.
2. **Capacitor Mobile Build:** Package `apps/customer` into an Android Studio and Xcode project via Capacitor CLI (`npx cap open android`, `npx cap open ios`).

### 2.3 Geo-Spatial Indexing
1. Enable **PostGIS** extension on PostgreSQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
2. Convert `latitude`/`longitude` to `GEOGRAPHY(Point, 4326)` columns with spatial R-tree GiST indexes for millisecond nearest-neighbor restaurant and rider lookups:
   ```sql
   CREATE INDEX idx_restaurants_location ON "Restaurant" USING GIST(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
   ```

