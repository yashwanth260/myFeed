import { RedisOptions } from 'ioredis';
import { envConfig } from './env.config';

const redisUrl = process.env.REDIS_URL;
const isTls = envConfig.redis.tls || (redisUrl && redisUrl.startsWith('rediss://')) || process.env.REDIS_TLS === 'true';

export const redisConnectionOptions: RedisOptions = {
  host: envConfig.redis.host,
  port: envConfig.redis.port,
  password: envConfig.redis.password,
  db: envConfig.redis.db,
  ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  reconnectOnError(err: Error) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect when cluster master changes
    }
    return false;
  },
};
