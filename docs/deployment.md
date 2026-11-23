# CraveCart Production Build & Deployment Guide

This document provides instructions for containerized production deployment, Docker Compose orchestration, mobile app artifact generation, and cloud deployment.

---

## 1. Docker & Docker Compose Deployment

The repository includes a production multi-container setup orchestrated by `docker-compose.yml`.

### Services:
1. `api`: NestJS/Node.js Production REST API + WebSocket Gateway (Port 4000)
2. `postgres`: PostgreSQL 16 database with health check and volume persistence (Port 5432)
3. `redis`: Redis 7 in-memory cache and BullMQ job queue (Port 6379)
4. `customer-web`: Nginx-backed web build of Customer App (Port 8081)
5. `restaurant-web`: Nginx-backed web build of Restaurant Partner App (Port 8082)
6. `delivery-web`: Nginx-backed web build of Delivery Partner App (Port 8083)
7. `admin-console`: Admin Control Tower (Port 8084)

### Production Deployment Commands:
```bash
# 1. Build all container images
npm run docker:build

# 2. Launch all services in detached mode
npm run docker:up

# 3. View container health and runtime logs
npm run docker:ps
npm run docker:logs
```

To stop all services:
```bash
npm run docker:down
```

---

## 2. Dockerfile Configurations

### Backend API Container (`apps/backend/Dockerfile`):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

---

## 3. Mobile Application Builds (Android & iOS)

### 3.1 CraveCart Customer App (Capacitor)
```bash
cd apps/customer

# Sync web assets to native container
npx cap sync

# Open Android Studio to build APK/Bundle
npx cap open android

# Open Xcode to build IPA for App Store (macOS)
npx cap open ios
```

### 3.2 Feedo Restaurant Partner (Flutter)
```bash
cd apps/restaurant_flutter

# Build release Android APK
flutter build apk --release

# Build Google Play App Bundle (AAB)
flutter build appbundle --release

# Build iOS Release
flutter build ipa --release
```

### 3.3 Feedo Delivery Partner (Flutter)
```bash
cd apps/delivery_flutter

# Build release Android APK
flutter build apk --release

# Build Google Play App Bundle (AAB)
flutter build appbundle --release

# Build iOS Release
flutter build ipa --release
```

---

## 4. Production CI/CD Pipeline Stages

A standard GitHub Actions or GitLab CI pipeline consists of:

1. **Lint & Static Analysis:**
   ```bash
   npm run lint
   npm run typecheck
   ```
2. **Automated Test Suite:**
   ```bash
   npm test
   ```
3. **Container Build & Registry Push:**
   ```bash
   docker build -t cravecart/api:v1.0.0 -f apps/backend/Dockerfile .
   docker push cravecart/api:v1.0.0
   ```
4. **Database Migration Execution:**
   ```bash
   npx prisma migrate deploy
   ```
5. **Rolling Deployment:**
   Deploy updated image to Kubernetes cluster / AWS ECS / Render with zero-downtime health checking on `/api/v1/health`.
