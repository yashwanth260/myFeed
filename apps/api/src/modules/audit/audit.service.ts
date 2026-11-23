import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLoggerService } from '../../common/logger/app-logger.service';

export interface AuditLogOptions {
  actorId: string;
  action: string;
  targetType: 'ORDER' | 'PAYMENT' | 'RESTAURANT' | 'DELIVERY' | 'USER';
  targetId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async log(options: AuditLogOptions): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: options.actorId,
          action: options.action,
          targetType: options.targetType,
          targetId: options.targetId,
          details: (options.details as any) || {},
          ipAddress: options.ipAddress || null,
        },
      });

      this.logger.log(
        `[AUDIT] Action: ${options.action} | Target: ${options.targetType}:${options.targetId} | Actor: ${options.actorId}`,
        'AuditService',
      );
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err.message}`, err.stack, 'AuditService');
    }
  }
}
