# CraveCart Environment Setup & Configuration Guide

This guide details the complete configuration required to run the CraveCart ecosystem across local development, staging, and production environments.

---

## 1. Quick Start with Environment Variables

Create your local `.env` file by copying `.env.example`:
```bash
cp .env.example .env
```

Ensure the key variables are configured:
```ini
NODE_ENV=development
PORT=4000
API_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8084

# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cravecart?schema=public"

# Redis & BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379

# Cryptographic Keys (Min 32 characters)
JWT_ACCESS_SECRET="cravecart-ultra-secure-jwt-access-secret-key-32chars"
JWT_REFRESH_SECRET="cravecart-ultra-secure-jwt-refresh-secret-key-32chars"

# Razorpay India (Test Sandbox)
RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="your_razorpay_test_secret_here"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret_here"
```

---

## 2. Infrastructure Setup (PostgreSQL & Redis)

### Option A: Using Docker Compose (Recommended)
Launch the database, Redis cache, and BullMQ worker queue with a single command:
```bash
docker compose up -d postgres redis
```

This brings up:
- **PostgreSQL 16:** Running on `localhost:5432` with pre-created `cravecart` database.
- **Redis 7:** Running on `localhost:6379` with in-memory persistence.

### Option B: Local Native Installations
If running natively on Windows or macOS:
1. **PostgreSQL:** Ensure PostgreSQL service is active:
   ```bash
   psql -U postgres -c "CREATE DATABASE cravecart;"
   ```
2. **Redis:** Ensure Redis server is active:
   ```bash
   redis-cli ping
   # Expected output: PONG
   ```

---

## 3. Database Schema Migration & Seeding

Run Prisma to generate types and apply the database schema:

```bash
# Generate Prisma Client TypeScript types
npx prisma generate

# Push schema directly to database (development)
npx prisma db push

# Seed development database with users, restaurants, menu items, coupons
npm run prisma:seed
```

---

## 4. Payment Gateway Setup (Razorpay Test Mode)

1. Register or sign in at [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch to **Test Mode** in the top navigation bar.
3. Navigate to **Settings -> API Keys** and generate key credentials:
   - `RAZORPAY_KEY_ID`: Prefixed with `rzp_test_...`
   - `RAZORPAY_KEY_SECRET`: Private secret key
4. Navigate to **Settings -> Webhooks**:
   - Webhook URL: `https://your-domain.ngrok.app/api/v1/payments/webhook`
   - Secret: Enter your `RAZORPAY_WEBHOOK_SECRET`
   - Subscribed Events:
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`

> [!CAUTION]
> Never commit real `rzp_live_...` credentials to source control. Live credentials must only be injected via encrypted CI/CD secrets or cloud secret managers (AWS Secrets Manager, GCP Secret Manager).

---

## 5. Google Maps Platform Setup

For distance, route estimation, geofencing, and map visuals:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com).
2. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API (New)**
   - **Geocoding API**
   - **Routes API / Distance Matrix API**
3. Create an API Key and restrict its HTTP referrers or IP addresses to authorized domains.
4. Set `GOOGLE_MAPS_API_KEY` in `.env`.

---

## 6. Verifying System Health

To confirm all backend services and configurations are operating correctly:
```bash
curl http://localhost:4000/api/v1/health
```

Expected JSON response:
```json
{
  "status": "UP",
  "service": "cravecart-backend-api",
  "version": "1.0.0",
  "uptimeSeconds": 128,
  "environment": "development"
}
```
Interactive Swagger / OpenAPI docs can be verified in your browser at:
`http://localhost:4000/api/v1/docs`

