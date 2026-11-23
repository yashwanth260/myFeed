import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { envConfig } from '../../config/env.config';
import { AppLoggerService } from '../../common/logger/app-logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: AppLoggerService) {
    // Construct database URL with explicit connection pool parameters
    const url = new URL(envConfig.databaseUrl);
    url.searchParams.set('connection_limit', envConfig.databasePool.connectionLimit.toString());
    url.searchParams.set('pool_timeout', envConfig.databasePool.poolTimeout.toString());

    // Automatically enforce TLS on remote cloud PostgreSQL hosts
    if (
      envConfig.databaseUrl.includes('sslmode=require') ||
      (envConfig.nodeEnv === 'production' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1'))
    ) {
      if (!url.searchParams.has('sslmode')) {
        url.searchParams.set('sslmode', 'require');
      }
    }

    super({
      datasources: {
        db: {
          url: url.toString(),
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: envConfig.nodeEnv === 'production' ? 'minimal' : 'pretty',
    });
  }

  async onModuleInit() {
    this.logger.log(
      `Initializing PostgreSQL connection pool (Max: ${envConfig.databasePool.connectionLimit}, Timeout: ${envConfig.databasePool.poolTimeout}s)...`,
      'PrismaService',
    );

    // Instrument Query Timing & Slow Query Warning (>200ms threshold)
    (this as any).$on('query', (event: Prisma.QueryEvent) => {
      if (event.duration >= 200) {
        this.logger.warn(
          `[SLOW QUERY] Duration: ${event.duration}ms | Target: ${event.target} | Query: ${event.query}`,
          'PrismaService',
        );
      } else if (envConfig.nodeEnv !== 'production') {
        this.logger.debug(`Query (${event.duration}ms): ${event.query}`, 'PrismaService');
      }
    });

    (this as any).$on('error', (event: Prisma.LogEvent) => {
      this.logger.error(`Database Error: ${event.message}`, undefined, 'PrismaService');
    });

    try {
      await this.$connect();
      this.logger.log('PostgreSQL connection pool established successfully.', 'PrismaService');
    } catch (err: any) {
      this.logger.warn(
        `PostgreSQL connection notice: ${err.message}. Connection pool will connect on-demand.`,
        'PrismaService',
      );
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing PostgreSQL connection pool...', 'PrismaService');
    await this.$disconnect();
    this.logger.log('PostgreSQL connection pool disconnected.', 'PrismaService');
  }

  /**
   * Healthcheck helper used by the readiness probe
   */
  async ping(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
