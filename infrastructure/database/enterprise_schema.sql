-- ==============================================================================
-- ENTERPRISE FOOD DELIVERY PLATFORM: POSTGRESQL PRODUCTION DDL SPECIFICATION
-- Architecture: High-Throughput Normalized Relational Schema
-- Engine: PostgreSQL 15+ with PostGIS, pg_trgm, and btree_gist
-- Currency Standard: Strict integer minor currency units (e.g., paise/cents)
-- Partitioning: Declarative Range Partitioning on Location Telemetry & Audit Logs
-- Security: Strict RBAC, Row-Level Security (RLS), and Dynamic Data Masking Views
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & ENVIRONMENT INITIALIZATION
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Set client timezone and search path
SET timezone TO 'UTC';

-- ------------------------------------------------------------------------------
-- 2. DOMAIN ENUM TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'CUSTOMER',
        'RESTAURANT_OWNER',
        'RESTAURANT_STAFF',
        'COURIER',
        'ADMIN',
        'SUPPORT_AGENT'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM (
        'PENDING_VERIFICATION',
        'ACTIVE',
        'SUSPENDED',
        'BANNED',
        'DEACTIVATED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE address_type AS ENUM (
        'HOME',
        'WORK',
        'FRIENDS_FAMILY',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE restaurant_status AS ENUM (
        'ONBOARDING',
        'ACTIVE_OPEN',
        'ACTIVE_BUSY',
        'ACTIVE_CLOSED',
        'SUSPENDED',
        'PERMANENTLY_CLOSED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE dietary_type AS ENUM (
        'VEG',
        'NON_VEG',
        'EGG',
        'VEGAN'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'PAYMENT_PENDING',
        'PLACED',
        'CONFIRMED_BY_RESTAURANT',
        'PREPARING',
        'READY_FOR_PICKUP',
        'COURIER_ASSIGNED',
        'COURIER_PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED_BY_CUSTOMER',
        'CANCELLED_BY_RESTAURANT',
        'CANCELLED_BY_ADMIN',
        'FAILED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'INITIATED',
        'AUTHENTICATING',
        'AUTHORIZED',
        'CAPTURED',
        'FAILED',
        'REFUND_REQUESTED',
        'REFUNDED',
        'PARTIALLY_REFUNDED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'UPI',
        'CREDIT_CARD',
        'DEBIT_CARD',
        'NET_BANKING',
        'WALLET',
        'CASH_ON_DELIVERY'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE courier_duty_status AS ENUM (
        'OFFLINE',
        'IDLE_AVAILABLE',
        'ORDER_OFFERED',
        'DISPATCHED_TO_RESTAURANT',
        'WAITING_AT_RESTAURANT',
        'TRANSIT_TO_CUSTOMER',
        'ON_BREAK'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM (
        'OFFERED',
        'ACCEPTED',
        'REJECTED',
        'AUTO_EXPIRED',
        'CANCELLED_BY_DISPATCH'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM (
        'BICYCLE',
        'MOTORCYCLE',
        'SCOOTER',
        'ELECTRIC_VEHICLE',
        'CAR'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM (
        'INSERT',
        'UPDATE',
        'DELETE'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------------------------
-- 3. CORE IDENTITY & ACCESS ENTITIES
-- ------------------------------------------------------------------------------

-- Master Users Table
CREATE TABLE IF NOT EXISTS users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   VARCHAR(255) NOT NULL,
    phone_country_code      VARCHAR(8) NOT NULL DEFAULT '+91',
    phone_number            VARCHAR(20) NOT NULL,
    full_name               VARCHAR(150) NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,
    role                    user_role NOT NULL DEFAULT 'CUSTOMER',
    status                  account_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
    is_phone_verified       BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_verified       BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url              TEXT,
    metadata                JSONB DEFAULT '{}'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_phone UNIQUE (phone_country_code, phone_number),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_users_phone_numeric CHECK (phone_number ~ '^[0-9]{7,15}$')
);

-- User Physical Addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL,
    address_label           address_type NOT NULL DEFAULT 'HOME',
    recipient_name          VARCHAR(150) NOT NULL,
    recipient_phone         VARCHAR(25) NOT NULL,
    street_address_line1    VARCHAR(255) NOT NULL,
    street_address_line2    VARCHAR(255),
    landmark                VARCHAR(150),
    city                    VARCHAR(100) NOT NULL,
    state_province          VARCHAR(100) NOT NULL,
    postal_code             VARCHAR(20) NOT NULL,
    country_code            CHAR(2) NOT NULL DEFAULT 'IN',
    latitude                NUMERIC(10, 8) NOT NULL,
    longitude               NUMERIC(11, 8) NOT NULL,
    location                GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
                                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
                            ) STORED,
    delivery_instructions   TEXT,
    is_default              BOOLEAN NOT NULL DEFAULT FALSE,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_address_lat CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
    CONSTRAINT chk_user_address_lng CHECK (longitude BETWEEN -180.00000000 AND 180.00000000)
);

-- ------------------------------------------------------------------------------
-- 4. RESTAURANT ARCHITECTURE & DYNAMIC MENUS
-- ------------------------------------------------------------------------------

-- Restaurant Enterprise Profiles
CREATE TABLE IF NOT EXISTS restaurant_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id           UUID NOT NULL,
    name                    VARCHAR(150) NOT NULL,
    slug                    VARCHAR(180) NOT NULL,
    legal_business_name     VARCHAR(200) NOT NULL,
    tax_identifier          VARCHAR(50) NOT NULL, -- GSTIN/EIN/VAT
    fssai_license_number    VARCHAR(50) NOT NULL,
    description             TEXT,
    phone_contact           VARCHAR(25) NOT NULL,
    email_contact           VARCHAR(255) NOT NULL,
    status                  restaurant_status NOT NULL DEFAULT 'ONBOARDING',
    is_pure_veg             BOOLEAN NOT NULL DEFAULT FALSE,
    commission_rate_pct     NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    average_prep_time_min   INT NOT NULL DEFAULT 25,
    min_order_value_paise   BIGINT NOT NULL DEFAULT 0,
    cost_for_two_paise      BIGINT NOT NULL DEFAULT 40000, -- 400.00 in minor units
    banner_image_url        TEXT,
    logo_image_url          TEXT,
    
    -- Spatial coordinates
    street_address          VARCHAR(255) NOT NULL,
    city                    VARCHAR(100) NOT NULL,
    state_province          VARCHAR(100) NOT NULL,
    postal_code             VARCHAR(20) NOT NULL,
    latitude                NUMERIC(10, 8) NOT NULL,
    longitude               NUMERIC(11, 8) NOT NULL,
    location                GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
                                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
                            ) STORED,
    delivery_radius_meters  INT NOT NULL DEFAULT 7000, -- 7km service perimeter

    -- Operational Schedule & Rating Cache
    operating_hours         JSONB NOT NULL DEFAULT '{"mon":{"open":"09:00","close":"23:00"},"tue":{"open":"09:00","close":"23:00"}}'::jsonb,
    cached_rating           NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    total_reviews_count     INT NOT NULL DEFAULT 0,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_restaurant_slug UNIQUE (slug),
    CONSTRAINT uq_restaurant_tax_id UNIQUE (tax_identifier),
    CONSTRAINT uq_restaurant_fssai UNIQUE (fssai_license_number),
    CONSTRAINT fk_restaurant_owner FOREIGN KEY (owner_user_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_restaurant_lat CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
    CONSTRAINT chk_restaurant_lng CHECK (longitude BETWEEN -180.00000000 AND 180.00000000),
    CONSTRAINT chk_restaurant_commission CHECK (commission_rate_pct >= 0 AND commission_rate_pct <= 100),
    CONSTRAINT chk_restaurant_prep_time CHECK (average_prep_time_min > 0)
);

-- Restaurant Staff Roles (RBAC per branch)
CREATE TABLE IF NOT EXISTS restaurant_staff_assignments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id           UUID NOT NULL,
    user_id                 UUID NOT NULL,
    staff_role              VARCHAR(50) NOT NULL DEFAULT 'STORE_MANAGER',
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_restaurant_staff UNIQUE (restaurant_id, user_id),
    CONSTRAINT fk_staff_restaurant FOREIGN KEY (restaurant_id) 
        REFERENCES restaurant_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id           UUID NOT NULL,
    name                    VARCHAR(100) NOT NULL,
    description             TEXT,
    display_order           INT NOT NULL DEFAULT 0,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_restaurant_category_order UNIQUE (restaurant_id, name),
    CONSTRAINT fk_category_restaurant FOREIGN KEY (restaurant_id) 
        REFERENCES restaurant_profiles(id) ON DELETE CASCADE
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id           UUID NOT NULL,
    category_id             UUID NOT NULL,
    name                    VARCHAR(150) NOT NULL,
    description             TEXT,
    dietary_type            dietary_type NOT NULL DEFAULT 'NON_VEG',
    base_price_paise        BIGINT NOT NULL,
    packaging_fee_paise     BIGINT NOT NULL DEFAULT 0,
    image_url               TEXT,
    is_available            BOOLEAN NOT NULL DEFAULT TRUE,
    is_bestseller           BOOLEAN NOT NULL DEFAULT FALSE,
    display_order           INT NOT NULL DEFAULT 0,
    prep_time_minutes       INT NOT NULL DEFAULT 15,
    calorie_count           INT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_restaurant FOREIGN KEY (restaurant_id) 
        REFERENCES restaurant_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) 
        REFERENCES menu_categories(id) ON DELETE RESTRICT,
    CONSTRAINT chk_menu_item_price CHECK (base_price_paise >= 0),
    CONSTRAINT chk_menu_packaging_fee CHECK (packaging_fee_paise >= 0)
);

-- Customization Groups (e.g., Size, Crust, Spice Level)
CREATE TABLE IF NOT EXISTS item_customization_groups (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id            UUID NOT NULL,
    group_title             VARCHAR(100) NOT NULL,
    min_selection           INT NOT NULL DEFAULT 0,
    max_selection           INT NOT NULL DEFAULT 1,
    is_mandatory            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customization_item FOREIGN KEY (menu_item_id) 
        REFERENCES menu_items(id) ON DELETE CASCADE,
    CONSTRAINT chk_custom_selection_bounds CHECK (min_selection <= max_selection)
);

-- Customization Individual Options (e.g., Large +150, Extra Cheese +50)
CREATE TABLE IF NOT EXISTS item_customization_options (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id                UUID NOT NULL,
    option_name             VARCHAR(100) NOT NULL,
    price_modifier_paise    BIGINT NOT NULL DEFAULT 0,
    is_available            BOOLEAN NOT NULL DEFAULT TRUE,
    is_default              BOOLEAN NOT NULL DEFAULT FALSE,
    display_order           INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_option_group FOREIGN KEY (group_id) 
        REFERENCES item_customization_groups(id) ON DELETE CASCADE,
    CONSTRAINT chk_option_modifier CHECK (price_modifier_paise >= 0)
);

-- ------------------------------------------------------------------------------
-- 5. COURIER FLEET & DISPATCH MANAGEMENT
-- ------------------------------------------------------------------------------

-- Courier Master Fleet Profile
CREATE TABLE IF NOT EXISTS courier_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL,
    vehicle_type            vehicle_type NOT NULL DEFAULT 'MOTORCYCLE',
    vehicle_registration    VARCHAR(50) NOT NULL,
    driving_license_number  VARCHAR(50) NOT NULL,
    national_identity_num   VARCHAR(50) NOT NULL,
    is_document_verified    BOOLEAN NOT NULL DEFAULT FALSE,
    duty_status             courier_duty_status NOT NULL DEFAULT 'OFFLINE',
    max_concurrent_orders   INT NOT NULL DEFAULT 1,
    active_orders_count     INT NOT NULL DEFAULT 0,
    total_deliveries_done   INT NOT NULL DEFAULT 0,
    rating                  NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    last_ping_at            TIMESTAMPTZ,
    last_latitude           NUMERIC(10, 8),
    last_longitude          NUMERIC(11, 8),
    last_location           GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
                                CASE WHEN last_latitude IS NOT NULL AND last_longitude IS NOT NULL
                                THEN ST_SetSRID(ST_MakePoint(last_longitude, last_latitude), 4326)::geography
                                ELSE NULL END
                            ) STORED,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_courier_user UNIQUE (user_id),
    CONSTRAINT uq_courier_license UNIQUE (driving_license_number),
    CONSTRAINT uq_courier_vehicle UNIQUE (vehicle_registration),
    CONSTRAINT fk_courier_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_courier_active_orders CHECK (active_orders_count >= 0 AND active_orders_count <= max_concurrent_orders)
);

-- High-Frequency Courier Geographic Telemetry (PARTITIONED BY RANGE)
CREATE TABLE IF NOT EXISTS courier_location_pings (
    id                      BIGSERIAL,
    courier_id              UUID NOT NULL,
    recorded_at             TIMESTAMPTZ NOT NULL,
    latitude                NUMERIC(10, 8) NOT NULL,
    longitude               NUMERIC(11, 8) NOT NULL,
    location                GEOGRAPHY(POINT, 4326) NOT NULL,
    speed_kmh               NUMERIC(5, 2),
    bearing_degrees         NUMERIC(5, 2),
    battery_percentage      SMALLINT,
    
    PRIMARY KEY (recorded_at, id),
    CONSTRAINT chk_ping_battery CHECK (battery_percentage BETWEEN 0 AND 100),
    CONSTRAINT chk_ping_bearing CHECK (bearing_degrees BETWEEN 0.00 AND 360.00)
) PARTITION BY RANGE (recorded_at);

-- Partition Sets for High-Velocity Telemetry Pings
CREATE TABLE IF NOT EXISTS courier_location_pings_y2026m11 
    PARTITION OF courier_location_pings
    FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS courier_location_pings_y2026m12 
    PARTITION OF courier_location_pings
    FOR VALUES FROM ('2026-12-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS courier_location_pings_y2027m01 
    PARTITION OF courier_location_pings
    FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2027-02-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS courier_location_pings_default
    PARTITION OF courier_location_pings DEFAULT;

-- ------------------------------------------------------------------------------
-- 6. ORDER PLACEMENT & STATUS TRACKING
-- ------------------------------------------------------------------------------

-- Master Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number            VARCHAR(32) NOT NULL, -- Human friendly identifier e.g. 'FD-20261122-8921'
    customer_id             UUID NOT NULL,
    restaurant_id           UUID NOT NULL,
    delivery_address_id     UUID NOT NULL,
    assigned_courier_id     UUID,
    order_status            order_status NOT NULL DEFAULT 'PAYMENT_PENDING',
    
    -- Financial Breakdown (Explicit integer minor currency units to prevent floating inaccuracies)
    subtotal_paise          BIGINT NOT NULL,
    delivery_fee_paise      BIGINT NOT NULL DEFAULT 0,
    packaging_fee_paise     BIGINT NOT NULL DEFAULT 0,
    platform_fee_paise      BIGINT NOT NULL DEFAULT 0,
    tax_paise               BIGINT NOT NULL DEFAULT 0,
    discount_paise          BIGINT NOT NULL DEFAULT 0,
    total_amount_paise      BIGINT NOT NULL,
    
    -- Security & Logistics Handshake
    pickup_otp_hash         VARCHAR(255),
    delivery_otp_hash       VARCHAR(255),
    special_instructions    TEXT,
    cancellation_reason     TEXT,

    -- Temporal Lifecycle Timestamps
    placed_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at            TIMESTAMPTZ,
    prep_completed_at       TIMESTAMPTZ,
    dispatched_at           TIMESTAMPTZ,
    delivered_at            TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_orders_order_number UNIQUE (order_number),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) 
        REFERENCES restaurant_profiles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_address FOREIGN KEY (delivery_address_id) 
        REFERENCES user_addresses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_courier FOREIGN KEY (assigned_courier_id) 
        REFERENCES courier_profiles(id) ON DELETE SET NULL,
    CONSTRAINT chk_orders_totals CHECK (
        total_amount_paise = (subtotal_paise + delivery_fee_paise + packaging_fee_paise + platform_fee_paise + tax_paise - discount_paise)
    ),
    CONSTRAINT chk_order_non_negative CHECK (
        subtotal_paise >= 0 AND delivery_fee_paise >= 0 AND tax_paise >= 0 AND total_amount_paise >= 0
    )
);

-- Order Items Snapshots
CREATE TABLE IF NOT EXISTS order_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID NOT NULL,
    menu_item_id            UUID NOT NULL,
    item_name_snapshot      VARCHAR(150) NOT NULL,
    unit_price_paise        BIGINT NOT NULL,
    quantity                INT NOT NULL,
    total_price_paise       BIGINT NOT NULL,
    special_notes           TEXT,

    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) 
        REFERENCES menu_items(id) ON DELETE RESTRICT,
    CONSTRAINT chk_order_item_qty CHECK (quantity > 0),
    CONSTRAINT chk_order_item_math CHECK (total_price_paise = unit_price_paise * quantity)
);

-- Order Item Customization Selection Snapshots
CREATE TABLE IF NOT EXISTS order_item_customizations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id           UUID NOT NULL,
    customization_opt_id    UUID NOT NULL,
    option_name_snapshot    VARCHAR(100) NOT NULL,
    price_modifier_paise    BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_custom_order_item FOREIGN KEY (order_item_id) 
        REFERENCES order_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_custom_opt FOREIGN KEY (customization_opt_id) 
        REFERENCES item_customization_options(id) ON DELETE RESTRICT
);

-- Chronological Order Status Audit Log
CREATE TABLE IF NOT EXISTS order_status_history (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID NOT NULL,
    from_status             order_status,
    to_status               order_status NOT NULL,
    changed_by_user_id      UUID,
    status_notes            TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_history_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_status_history_user FOREIGN KEY (changed_by_user_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- Courier Dispatch Offer Lifecycle
CREATE TABLE IF NOT EXISTS courier_dispatch_assignments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID NOT NULL,
    courier_id              UUID NOT NULL,
    status                  assignment_status NOT NULL DEFAULT 'OFFERED',
    distance_to_rest_km     NUMERIC(6, 2) NOT NULL,
    estimated_earnings_paise BIGINT NOT NULL,
    offered_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at            TIMESTAMPTZ,

    CONSTRAINT fk_dispatch_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispatch_courier FOREIGN KEY (courier_id) 
        REFERENCES courier_profiles(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 7. PAYMENTS & TRANSACTION LEDGER
-- ------------------------------------------------------------------------------

-- Master Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID NOT NULL,
    idempotency_key         VARCHAR(128) NOT NULL,
    gateway_provider        VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',
    gateway_order_id        VARCHAR(100),
    gateway_payment_id      VARCHAR(100),
    gateway_signature       VARCHAR(255),
    method                  payment_method NOT NULL,
    status                  payment_status NOT NULL DEFAULT 'INITIATED',
    currency                CHAR(3) NOT NULL DEFAULT 'INR',
    amount_paise            BIGINT NOT NULL,
    gateway_fee_paise       BIGINT NOT NULL DEFAULT 0,
    gateway_tax_paise       BIGINT NOT NULL DEFAULT 0,
    failure_code            VARCHAR(50),
    failure_reason          TEXT,
    raw_response            JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_payment_idempotency UNIQUE (idempotency_key),
    CONSTRAINT uq_gateway_payment UNIQUE (gateway_payment_id),
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE RESTRICT,
    CONSTRAINT chk_payment_amount CHECK (amount_paise > 0)
);

-- Refunds Ledger
CREATE TABLE IF NOT EXISTS payment_refunds (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_transaction_id  UUID NOT NULL,
    gateway_refund_id       VARCHAR(100),
    refund_amount_paise     BIGINT NOT NULL,
    reason                  TEXT NOT NULL,
    status                  VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    processed_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_gateway_refund UNIQUE (gateway_refund_id),
    CONSTRAINT fk_refund_transaction FOREIGN KEY (payment_transaction_id) 
        REFERENCES payment_transactions(id) ON DELETE RESTRICT,
    CONSTRAINT chk_refund_positive CHECK (refund_amount_paise > 0)
);

-- ------------------------------------------------------------------------------
-- 8. RATINGS & REVIEWS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_reviews (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID NOT NULL,
    customer_id             UUID NOT NULL,
    restaurant_id           UUID NOT NULL,
    courier_id              UUID,
    restaurant_rating       SMALLINT NOT NULL,
    courier_rating          SMALLINT,
    food_review_text        TEXT,
    delivery_review_text    TEXT,
    restaurant_reply_text   TEXT,
    restaurant_replied_at   TIMESTAMPTZ,
    is_moderated            BOOLEAN NOT NULL DEFAULT FALSE,
    is_visible              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_review_order UNIQUE (order_id),
    CONSTRAINT fk_review_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_customer FOREIGN KEY (customer_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_review_restaurant FOREIGN KEY (restaurant_id) 
        REFERENCES restaurant_profiles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_review_courier FOREIGN KEY (courier_id) 
        REFERENCES courier_profiles(id) ON DELETE SET NULL,
    CONSTRAINT chk_restaurant_rating CHECK (restaurant_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_courier_rating CHECK (courier_rating IS NULL OR courier_rating BETWEEN 1 AND 5)
);

-- ------------------------------------------------------------------------------
-- 9. ENTERPRISE AUDIT SYSTEM (PARTITIONED BY RANGE)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS system_audit_logs (
    id                      BIGSERIAL,
    table_name              VARCHAR(100) NOT NULL,
    record_id               UUID NOT NULL,
    action                  audit_action NOT NULL,
    old_row_data            JSONB,
    new_row_data            JSONB,
    performed_by_user_id    UUID,
    client_ip_address       INET,
    user_agent              TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

-- Partition Sets for High-Capacity Audit Log
CREATE TABLE IF NOT EXISTS system_audit_logs_y2026m11 
    PARTITION OF system_audit_logs
    FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS system_audit_logs_y2026m12 
    PARTITION OF system_audit_logs
    FOR VALUES FROM ('2026-12-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS system_audit_logs_y2027m01 
    PARTITION OF system_audit_logs
    FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2027-02-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS system_audit_logs_default
    PARTITION OF system_audit_logs DEFAULT;

-- ------------------------------------------------------------------------------
-- 10. ULTRA-PERFORMANCE INDEXING STRATEGY
-- ------------------------------------------------------------------------------

-- User Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_phone_lookup ON users (phone_country_code, phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);

-- PostGIS Spatial Indexes for Geofencing & Proximity Queries
CREATE INDEX IF NOT EXISTS idx_user_addresses_spatial ON user_addresses USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_restaurant_location_spatial ON restaurant_profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_courier_last_location ON courier_profiles USING GIST (last_location);
CREATE INDEX IF NOT EXISTS idx_courier_telemetry_spatial ON courier_location_pings USING GIST (location);

-- Sub-Millisecond Partial Index on Active Delivery Operations
CREATE INDEX IF NOT EXISTS idx_orders_active_dispatch ON orders (order_status, placed_at DESC)
WHERE order_status NOT IN (
    'DELIVERED', 
    'CANCELLED_BY_CUSTOMER', 
    'CANCELLED_BY_RESTAURANT', 
    'CANCELLED_BY_ADMIN', 
    'FAILED'
);

-- Partial Index on Available Courier Fleet (Instant Dispatch Matching)
CREATE INDEX IF NOT EXISTS idx_couriers_active_available ON courier_profiles (duty_status, active_orders_count)
WHERE duty_status = 'IDLE_AVAILABLE' AND is_document_verified = TRUE;

-- Restaurant & Menu Searching Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_status ON restaurant_profiles (status);
CREATE INDEX IF NOT EXISTS idx_restaurant_name_trgm ON restaurant_profiles USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_menu_items_name_trgm ON menu_items USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_menu_items_catalog ON menu_items (restaurant_id, category_id, is_available);

-- Financial & Operational Foreign Key Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_date ON orders (customer_id, placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_date ON orders (restaurant_id, placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_courier_date ON orders (assigned_courier_id, placed_at DESC) WHERE assigned_courier_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_order ON payment_transactions (order_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_ref ON payment_transactions (gateway_order_id, gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON order_reviews (restaurant_id, restaurant_rating);

-- ------------------------------------------------------------------------------
-- 11. AUTOMATED TRIGGERS & BUSINESS LOGIC ENFORCEMENT
-- ------------------------------------------------------------------------------

-- Generic Updated-At Timestamp Synchronizer
CREATE OR REPLACE FUNCTION fn_enforce_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Automated Audit Log Producer
CREATE OR REPLACE FUNCTION fn_audit_row_mutation()
RETURNS TRIGGER AS $$
DECLARE
    v_record_id UUID;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_action audit_action;
    v_user_id UUID := NULL;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_record_id := NEW.id;
        v_new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_record_id := NEW.id;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
        v_record_id := OLD.id;
        v_old_data := to_jsonb(OLD);
    END IF;

    -- Extract current context user if defined in app session
    BEGIN
        v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    INSERT INTO system_audit_logs (
        table_name,
        record_id,
        action,
        old_row_data,
        new_row_data,
        performed_by_user_id,
        created_at
    ) VALUES (
        TG_TABLE_NAME::VARCHAR,
        v_record_id,
        v_action,
        v_old_data,
        v_new_data,
        v_user_id,
        CURRENT_TIMESTAMP
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply Updated-At Triggers
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_enforce_updated_at();
CREATE TRIGGER trg_user_addresses_updated_at BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION fn_enforce_updated_at();
CREATE TRIGGER trg_restaurant_profiles_updated_at BEFORE UPDATE ON restaurant_profiles FOR EACH ROW EXECUTE FUNCTION fn_enforce_updated_at();
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION fn_enforce_updated_at();
CREATE TRIGGER trg_courier_profiles_updated_at BEFORE UPDATE ON courier_profiles FOR EACH ROW EXECUTE FUNCTION fn_enforce_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION fn_enforce_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION fn_enforce_updated_at();

-- Apply Audit Log Triggers to Sensitive Tables
CREATE TRIGGER trg_audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION fn_audit_row_mutation();
CREATE TRIGGER trg_audit_restaurant_profiles AFTER INSERT OR UPDATE OR DELETE ON restaurant_profiles FOR EACH ROW EXECUTE FUNCTION fn_audit_row_mutation();
CREATE TRIGGER trg_audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION fn_audit_row_mutation();
CREATE TRIGGER trg_audit_payments AFTER INSERT OR UPDATE OR DELETE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION fn_audit_row_mutation();

-- Location Ping Telemetry Coordinates Auto-Populator
CREATE OR REPLACE FUNCTION fn_populate_ping_geog()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ping_geog_insert BEFORE INSERT ON courier_location_pings FOR EACH ROW EXECUTE FUNCTION fn_populate_ping_geog();

-- ------------------------------------------------------------------------------
-- 12. DATA SECURITY, DYNAMIC MASKING & RBAC
-- ------------------------------------------------------------------------------

-- Masked Customer Profile View (For Customer Support / General Workers)
CREATE OR REPLACE VIEW v_customer_masked_profiles AS
SELECT 
    id,
    full_name,
    -- Email masking: j***e@domain.com
    REGEXP_REPLACE(email, '^(.)(.*)(.@.*)$', '\1***\3') AS masked_email,
    -- Phone masking: +91-XXXXX-1234
    phone_country_code || '-XXXXX-' || RIGHT(phone_number, 4) AS masked_phone,
    role,
    status,
    created_at
FROM users
WHERE role = 'CUSTOMER';

-- Masked Order Summary View
CREATE OR REPLACE VIEW v_order_dispatch_masked AS
SELECT 
    o.id AS order_id,
    o.order_number,
    o.order_status,
    r.name AS restaurant_name,
    r.phone_contact AS restaurant_phone,
    a.street_address_line1,
    a.city,
    a.latitude AS dest_latitude,
    a.longitude AS dest_longitude,
    o.total_amount_paise / 100.0 AS total_amount_inr,
    -- Mask customer direct contact to delivery agents
    a.recipient_name,
    'XXXXX-' || RIGHT(a.recipient_phone, 4) AS masked_recipient_phone,
    o.placed_at
FROM orders o
JOIN restaurant_profiles r ON o.restaurant_id = r.id
JOIN user_addresses a ON o.delivery_address_id = a.id;

-- Row Level Security (RLS) Activation
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policies (Driven by session variable app.current_user_id)
DROP POLICY IF EXISTS p_customer_orders_isolation ON orders;
CREATE POLICY p_customer_orders_isolation ON orders
    FOR ALL
    USING (
        customer_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
        OR NULLIF(current_setting('app.current_user_role', true), '') IN ('ADMIN', 'SUPPORT_AGENT')
    );

DROP POLICY IF EXISTS p_customer_address_isolation ON user_addresses;
CREATE POLICY p_customer_address_isolation ON user_addresses
    FOR ALL
    USING (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
        OR NULLIF(current_setting('app.current_user_role', true), '') IN ('ADMIN')
    );

-- ------------------------------------------------------------------------------
-- 13. ENTERPRISE ROLE-BASED ACCESS CONTROL (LEAST PRIVILEGE)
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_api_service') THEN
        CREATE ROLE app_api_service WITH LOGIN PASSWORD 'SecureServicePassword2026!';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_read_only') THEN
        CREATE ROLE app_read_only WITH LOGIN PASSWORD 'SecureReadOnlyPassword2026!';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_analytics') THEN
        CREATE ROLE app_analytics WITH LOGIN PASSWORD 'SecureAnalyticsPassword2026!';
    END IF;
END $$;

-- Revoke default public schema permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO app_api_service, app_read_only, app_analytics;

-- Grant API Service Application Privileges (CRUD on operational tables)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_api_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_api_service;

-- Grant Read-Only Analyst Access (Select only, no data modification)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_read_only;

-- Grant Analytics Access on Masked Views and Aggregates
GRANT SELECT ON v_customer_masked_profiles TO app_analytics;
GRANT SELECT ON v_order_dispatch_masked TO app_analytics;
GRANT SELECT ON system_audit_logs TO app_analytics;
GRANT SELECT ON courier_location_pings TO app_analytics;
