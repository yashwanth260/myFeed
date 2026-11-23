import { Global, Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { OrderProcessor } from './processors/order.processor';
import { AppLoggerService } from '../../common/logger/app-logger.service';

@Global()
@Module({
  providers: [QueuesService, OrderProcessor, AppLoggerService],
  exports: [QueuesService],
})
export class QueuesModule {}
