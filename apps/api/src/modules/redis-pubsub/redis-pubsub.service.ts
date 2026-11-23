import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConnectionOptions } from '../../config/redis.config';
import { AppLoggerService } from '../../common/logger/app-logger.service';

export type PubSubHandler = (channel: string, message: any) => void;

@Injectable()
export class RedisPubSubService implements OnModuleInit, OnModuleDestroy {
  private publisherClient: Redis;
  private subscriberClient: Redis;
  private cacheClient: Redis;
  private channelHandlers = new Map<string, Set<PubSubHandler>>();

  constructor(private readonly logger: AppLoggerService) {
    // Initialize clients in constructor with TLS/URL support so they exist before any Gateway afterInit runs
    const createClient = () => {
      if (process.env.REDIS_URL) {
        return new Redis(process.env.REDIS_URL, {
          ...redisConnectionOptions,
          lazyConnect: false,
        });
      }
      return new Redis({
        ...redisConnectionOptions,
        lazyConnect: false,
      });
    };

    this.cacheClient = createClient();
    this.publisherClient = createClient();
    this.subscriberClient = createClient();

    const handleRedisErr = (name: string, err: Error) => {
      this.logger.warn(`Redis ${name} connection notice: ${err.message}`, 'RedisPubSubService');
    };

    this.cacheClient.on('error', (err) => handleRedisErr('Cache', err));
    this.publisherClient.on('error', (err) => handleRedisErr('Publisher', err));
    this.subscriberClient.on('error', (err) => handleRedisErr('Subscriber', err));

    this.subscriberClient.on('message', (channel: string, messageText: string) => {
      try {
        const parsed = JSON.parse(messageText);
        const handlers = this.channelHandlers.get(channel);
        if (handlers) {
          handlers.forEach((handler) => handler(channel, parsed));
        }
      } catch (err: any) {
        this.logger.error(`Failed to parse Pub/Sub payload on channel ${channel}: ${err.message}`, undefined, 'RedisPubSubService');
      }
    });
  }

  onModuleInit() {
    this.logger.log('Redis Session Caching and High-Throughput Pub/Sub engines initialized.', 'RedisPubSubService');
  }

  async onModuleDestroy() {
    this.logger.log('Gracefully disconnecting Redis Pub/Sub clients...', 'RedisPubSubService');
    await Promise.allSettled([
      this.cacheClient?.quit(),
      this.publisherClient?.quit(),
      this.subscriberClient?.quit(),
    ]);
    this.logger.log('Redis connections closed.', 'RedisPubSubService');
  }

  // ==========================================
  // DISTRIBUTED SESSION & PRESENCE CACHING
  // ==========================================

  async setSession(userId: string, data: Record<string, unknown>, ttlSeconds = 86400): Promise<void> {
    try {
      const key = `session:${userId}`;
      await this.cacheClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch {
      // Graceful fallback if Redis is temporarily unreachable
    }
  }

  async getSession<T = any>(userId: string): Promise<T | null> {
    try {
      const key = `session:${userId}`;
      const raw = await this.cacheClient.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async deleteSession(userId: string): Promise<void> {
    try {
      await this.cacheClient.del(`session:${userId}`);
    } catch {
      // Ignored
    }
  }

  async setCourierPresence(courierId: string, locationData: { lat: number; lng: number; bearing?: number }, ttlSeconds = 60): Promise<void> {
    try {
      const key = `courier:location:${courierId}`;
      await this.cacheClient.set(key, JSON.stringify(locationData), 'EX', ttlSeconds);
    } catch {
      // Ignored
    }
  }

  async getCourierPresence(courierId: string): Promise<{ lat: number; lng: number; bearing?: number } | null> {
    try {
      const raw = await this.cacheClient.get(`courier:location:${courierId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ==========================================
  // HIGH-THROUGHPUT PUB/SUB ENGINE
  // ==========================================

  async publish(channel: string, payload: unknown): Promise<number> {
    try {
      const serialized = JSON.stringify(payload);
      return await this.publisherClient.publish(channel, serialized);
    } catch {
      return 0;
    }
  }

  async subscribe(channel: string, handler: PubSubHandler): Promise<void> {
    try {
      if (!this.channelHandlers.has(channel)) {
        this.channelHandlers.set(channel, new Set());
        await this.subscriberClient.subscribe(channel);
        this.logger.debug(`Subscribed to Redis channel: ${channel}`, 'RedisPubSubService');
      }
      this.channelHandlers.get(channel)!.add(handler);
    } catch (err: any) {
      this.logger.warn(`Redis subscribe warning for channel ${channel}: ${err.message}`, 'RedisPubSubService');
    }
  }

  async unsubscribe(channel: string, handler: PubSubHandler): Promise<void> {
    try {
      const handlers = this.channelHandlers.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.channelHandlers.delete(channel);
          await this.subscriberClient.unsubscribe(channel);
        }
      }
    } catch {
      // Ignored
    }
  }
}
