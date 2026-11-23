import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '../../../config/redis.config';
import { ORDER_PROCESSING_QUEUE, OrderJobData } from '../queues.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLoggerService } from '../../../common/logger/app-logger.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderProcessor implements OnModuleInit, OnModuleDestroy {
  private worker!: Worker<any>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting BullMQ order background worker...', 'OrderProcessor');

    this.worker = new Worker(
      ORDER_PROCESSING_QUEUE,
      async (job: Job<OrderJobData>) => {
        return this.processJob(job);
      },
      {
        connection: redisConnectionOptions as any,
        concurrency: 10, // process up to 10 orders concurrently
      },
    );

    this.worker.on('completed', (job: Job<OrderJobData>) => {
      this.logger.log(
        `Job ${job.id} (${job.name}) completed for Order ${job.data.orderNumber}`,
        'OrderProcessor',
      );
    });

    this.worker.on('failed', (job: Job<OrderJobData> | undefined, err: Error) => {
      this.logger.error(
        `Job ${job?.id} (${job?.name}) failed: ${err.message}`,
        err.stack,
        'OrderProcessor',
      );
    });

    this.worker.on('error', (err: Error) => {
      this.logger.warn(`BullMQ Worker connection notice: ${err.message}`, 'OrderProcessor');
    });
  }

  async onModuleDestroy() {
    this.logger.log('Gracefully stopping BullMQ order worker...', 'OrderProcessor');
    if (this.worker) {
      await this.worker.close();
    }
  }

  private async processJob(job: Job<OrderJobData>) {
    const { orderId, orderNumber, action, customerId } = job.data;
    this.logger.log(`Processing Order Job [${action}] for ${orderNumber}...`, 'OrderProcessor');

    switch (action) {
      case 'PAYMENT_CONFIRMED': {
        // Transition order to CONFIRMED and notify restaurant
        await this.prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: { orderStatus: OrderStatus.CONFIRMED },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId,
              previousStatus: OrderStatus.PENDING,
              nextStatus: OrderStatus.CONFIRMED,
              actorId: customerId,
              note: 'Payment verified and order automatically sent to restaurant',
            },
          });
        });
        break;
      }

      case 'DISPATCH_COURIER': {
        this.logger.log(`Executing dispatch algorithm for Order ${orderNumber}...`, 'OrderProcessor');
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (order && order.orderStatus === OrderStatus.READY_FOR_PICKUP) {
          await this.prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: OrderStatus.OUT_FOR_DELIVERY },
          });
        }
        break;
      }

      case 'RESTAURANT_SLA_CHECK': {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (order && order.orderStatus === OrderStatus.PENDING) {
          this.logger.warn(
            `Order ${orderNumber} is still pending restaurant confirmation after SLA limit. Triggering alert.`,
            'OrderProcessor',
          );
        }
        break;
      }

      default:
        this.logger.warn(`Unknown order job action: ${action}`, 'OrderProcessor');
    }

    return { processed: true, orderId, timestamp: new Date().toISOString() };
  }
}
