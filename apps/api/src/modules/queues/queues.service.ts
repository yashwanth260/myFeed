import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../../config/redis.config';
import { AppLoggerService } from '../../common/logger/app-logger.service';

export const ORDER_PROCESSING_QUEUE = 'order-processing';

export interface OrderJobData {
  orderId: string;
  orderNumber: string;
  customerId: string;
  restaurantId: string;
  action: 'PAYMENT_CONFIRMED' | 'DISPATCH_COURIER' | 'RESTAURANT_SLA_CHECK';
  payload?: Record<string, unknown>;
}

@Injectable()
export class QueuesService implements OnModuleInit, OnModuleDestroy {
  private orderQueue!: Queue<any>;

  constructor(private readonly logger: AppLoggerService) {}

  onModuleInit() {
    this.logger.log('Initializing BullMQ order processing task queue...', 'QueuesService');
    this.orderQueue = new Queue(ORDER_PROCESSING_QUEUE, {
      connection: redisConnectionOptions as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // keep completed jobs for 1 hour
          count: 1000,
        },
        removeOnFail: {
          age: 86400 * 3, // keep failed jobs for 3 days for analysis
        },
      },
    });

    this.orderQueue.on('error', (err) => {
      this.logger.warn(`BullMQ Queue notice: ${err.message}`, 'QueuesService');
    });

    this.logger.log('BullMQ task queue connected to Redis.', 'QueuesService');
  }

  async onModuleDestroy() {
    this.logger.log('Gracefully closing BullMQ task queues...', 'QueuesService');
    if (this.orderQueue) {
      await this.orderQueue.close();
    }
  }

  /**
   * Enqueue order workflow task with idempotency / deduplication key
   */
  async addOrderJob(name: string, data: OrderJobData, options?: { delay?: number; jobId?: string }) {
    const jobId = options?.jobId || `order_${data.orderId}_${data.action}_${Date.now()}`;
    this.logger.log(
      `Enqueueing order job [${name}] for Order: ${data.orderNumber} (ID: ${data.orderId})`,
      'QueuesService',
    );

    return this.orderQueue.add(name, data, {
      jobId,
      delay: options?.delay,
    });
  }

  getOrderQueue(): Queue<any> {
    return this.orderQueue;
  }
}
