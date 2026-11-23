import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root or local directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface DatabasePoolConfig {
  connectionLimit: number;
  poolTimeout: number;
  idleTimeout: number;
}

export interface MongoPoolConfig {
  uri: string;
  dbName: string;
  minPoolSize: number;
  maxPoolSize: number;
  connectTimeoutMS: number;
}

export interface AppEnvConfig {
  nodeEnv: string;
  port: number;
  wsPort: number;
  apiPrefix: string;
  databaseUrl: string;
  databasePool: DatabasePoolConfig;
  mongodb: MongoPoolConfig;
  redis: {
    host: string;
    port: number;
    password?: string;
    tls: boolean;
    db: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  security: {
    bcryptSaltRounds: number;
    corsOrigins: string[];
    rateLimitTtl: number;
    rateLimitMax: number;
  };
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };
}

export const envConfig: AppEnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  wsPort: parseInt(process.env.WS_PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/cravecart?schema=public&connection_limit=25&pool_timeout=20',
  databasePool: {
    connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '25', 10),
    poolTimeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '20', 10), // seconds
    idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '10', 10),
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/feedo_catalogs?maxPoolSize=50&minPoolSize=10',
    dbName: process.env.MONGODB_DB_NAME || 'feedo_catalogs',
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '10', 10),
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50', 10),
    connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '10000', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secure-production-jwt-secret-2026-feedo',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secure-production-refresh-secret-2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8080,http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8085').split(','),
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret',
  },
};
