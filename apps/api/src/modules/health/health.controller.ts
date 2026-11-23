import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueuesService } from '../queues/queues.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queuesService: QueuesService,
  ) {}

  @Get()
  async getHealth() {
    const isDbAlive = await this.prisma.ping().catch(() => false);
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: isDbAlive ? 'UP' : 'STANDBY',
    };
  }

  @Get('liveness')
  getLiveness() {
    return {
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  async getReadiness() {
    const isDbAlive = await this.prisma.ping();
    let isRedisAlive = false;

    try {
      const queue = this.queuesService.getOrderQueue();
      const client = await (queue as any).client;
      if (client && typeof client.ping === 'function') {
        const pong = await client.ping();
        isRedisAlive = pong === 'PONG';
      } else {
        isRedisAlive = true;
      }
    } catch {
      isRedisAlive = false;
    }

    if (!isDbAlive || !isRedisAlive) {
      throw new ServiceUnavailableException({
        status: 'DOWN',
        database: isDbAlive ? 'UP' : 'DOWN',
        redis: isRedisAlive ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'READY',
      database: 'UP',
      redis: 'UP',
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
