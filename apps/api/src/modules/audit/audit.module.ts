import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AppLoggerService } from '../../common/logger/app-logger.service';

@Global()
@Module({
  providers: [AuditService, AppLoggerService],
  exports: [AuditService],
})
export class AuditModule {}
