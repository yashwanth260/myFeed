import { Global, Module } from '@nestjs/common';
import { MongoDBService } from './mongodb.service';
import { AppLoggerService } from '../../common/logger/app-logger.service';

@Global()
@Module({
  providers: [MongoDBService, AppLoggerService],
  exports: [MongoDBService],
})
export class MongoDBModule {}
