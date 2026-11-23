import { Global, Module } from '@nestjs/common';
import { OrderLifecycleGateway } from './gateways/order-lifecycle.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AppLoggerService } from '../../common/logger/app-logger.service';

@Global()
@Module({
  providers: [OrderLifecycleGateway, WsJwtGuard, AppLoggerService],
  exports: [OrderLifecycleGateway],
})
export class WebSocketsModule {}
