# ==============================================================================
# Multi-Stage Production Dockerfile for CraveCart / Feedo Delivery Platform
# Builds Frontend SPAs (Customer, Restaurant, Delivery) & Core Backend API
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Dependencies & Compile Assets
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy root & workspace package manifests to leverage Docker layer caching
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/customer/package*.json ./apps/customer/
COPY apps/delivery/package*.json ./apps/delivery/
COPY apps/restaurant/package*.json ./apps/restaurant/
COPY packages/shared-business-logic/package*.json ./packages/shared-business-logic/
COPY packages/shared-config/package*.json ./packages/shared-config/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/shared-ui/package*.json ./packages/shared-ui/
COPY packages/shared-validation/package*.json ./packages/shared-validation/

# Copy Prisma schema
COPY prisma ./prisma/

# Install monorepo dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma ORM Client
RUN npx prisma generate

# Copy the full application source tree
COPY . .

# Run automated tests to verify business logic and API integrity
RUN npm test

# Build Frontend SPAs for Delivery and Restaurant applications
RUN cd apps/delivery && npm run build
RUN cd apps/restaurant && npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Minimal Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Install curl for health checks
RUN apk add --no-cache curl

# Copy installed dependencies and built code from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps

# Expose all ecosystem ports:
# 4000: Backend REST API & OpenAPI Swagger Docs
# 8081: Customer Web/Mobile Application
# 8082: Feedo Restaurant Partner Application
# 8083: Feedo Delivery Partner Application
# 8084: Platform Operations & Admin Dashboard
EXPOSE 4000 8081 8082 8083 8084

# Health check against core API health telemetry
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1

# Start the unified application suite
CMD ["node", "scripts/start-web-servers.js"]
