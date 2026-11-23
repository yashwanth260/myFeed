import { Global, Module } from '@nestjs/common';
import { RedisPubSubService } from './redis-pubsub.service';
import { AppLoggerService } from '../../common/logger/app-logger.service';

@Global()
@Module({
  providers: [RedisPubSubService, AppLoggerService],
  exports: [RedisPubSubService],
})
export class RedisPubSubModule {}
