import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { MongoDBModule } from './modules/mongodb/mongodb.module';
import { RedisPubSubModule } from './modules/redis-pubsub/redis-pubsub.module';
import { QueuesModule } from './modules/queues/queues.module';
import { WebSocketsModule } from './modules/websockets/websockets.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

@Module({
  imports: [
    PrismaModule,
    MongoDBModule,
    RedisPubSubModule,
    QueuesModule,
    WebSocketsModule,
    AuditModule,
    AuthModule,
    OrdersModule,
    RestaurantsModule,
    CatalogModule,
    PaymentsModule,
    DeliveryModule,
    HealthModule,
    AdminModule,
    NotificationsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
