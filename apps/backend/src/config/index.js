/**
 * CraveCart Production Backend Configuration
 * Centralized, validated environment and business rules
 */

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  appName: process.env.APP_NAME || 'CraveCart Enterprise',
  appUrl: process.env.APP_URL || 'http://localhost:4000',

  // Authentication & Cryptography
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'cravecart-ultra-secure-jwt-access-secret-key-32chars',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'cravecart-ultra-secure-jwt-refresh-secret-key-32chars',
    accessExpirySeconds: 15 * 60, // 15 mins
    refreshExpirySeconds: 7 * 24 * 60 * 60, // 7 days
    saltRounds: 10,
  },

  // Payment Gateway (Razorpay India)
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_CravecartSandboxKey123',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'CravecartSandboxSecret456Key',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'CravecartWebhookSecretHmac789',
    currency: 'INR',
  },

  // Core Financial & Platform Business Rules (Strictly in Integer Paise)
  // 100 paise = ₹1.00
  financialRules: {
    baseDeliveryFeePaise: 4000,         // ₹40.00 base delivery fee
    freeDeliveryThresholdPaise: 50000,  // Free delivery above ₹500.00
    serviceFeePaise: 1500,             // ₹15.00 packaging & platform fee
    taxRatePercent: 0.05,              // 5% GST on food services in India
    restaurantCommissionPercent: 15.0, // 15% platform take-rate
    driverBasePayoutPaise: 6500,       // ₹65.00 base driver earnings per delivery
    driverPerKmPaise: 1000,            // ₹10.00 per km after 3 km
    cancellationRefundFeePaise: 2000,  // ₹20.00 nominal fee if cancelled after restaurant accepts
  },

  // Geo Dispatch Configuration
  dispatch: {
    maxSearchRadiusKm: 12.0,
    offerTimeoutSeconds: 45,
    defaultLat: 12.9716, // Bangalore Central
    defaultLng: 77.5946,
  },
};

