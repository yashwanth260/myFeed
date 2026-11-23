import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { envConfig } from './config/env.config';
import { AppLoggerService } from './common/logger/app-logger.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import { OrderLifecycleGateway } from './modules/websockets/gateways/order-lifecycle.gateway';

async function bootstrap() {
  const logger = new AppLoggerService();

  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
    rawBody: true,
  });

  // Enable graceful shutdown lifecycle hooks (SIGTERM, SIGINT)
  app.enableShutdownHooks();

  // 1. Global API Prefix
  app.setGlobalPrefix(envConfig.apiPrefix);

  // 2. Strict Input Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // 3. Global Exception Filter & Response Interceptors
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
  );

  // 4. CORS Configuration
  const corsOriginsEnv = process.env.CORS_ORIGINS || '*';
  app.enableCors({
    origin: corsOriginsEnv === '*' ? true : corsOriginsEnv.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Requested-With', 'x-razorpay-signature'],
  });

  // 5. Swagger OpenAPI 3.0 Documentation
  if (envConfig.nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Feedo Food Delivery Platform API')
      .setDescription('Enterprise High-Throughput REST API with PostgreSQL, Prisma ORM, BullMQ & Redis')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    logger.log(`Swagger OpenAPI documentation live at http://localhost:${envConfig.port}/api/docs`, 'Bootstrap');
  }

  // 6. Graceful Process Signal Handling
  const shutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Initiating graceful zero-downtime shutdown...`, 'Bootstrap');
    try {
      try {
        const wsGateway = app.get(OrderLifecycleGateway, { strict: false });
        if (wsGateway) {
          await wsGateway.gracefulShutdown();
        }
      } catch (_) {}

      await app.close();
      logger.log('NestJS application, WebSockets and connections terminated gracefully.', 'Bootstrap');
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error during graceful shutdown: ${err.message}`, err.stack, 'Bootstrap');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // 7. Start Listening
  await app.listen(envConfig.port, '0.0.0.0');
  logger.log(
    `🚀 Feedo Enterprise API Server running at http://localhost:${envConfig.port}/${envConfig.apiPrefix} (Environment: ${envConfig.nodeEnv})`,
    'Bootstrap',
  );
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap failure:', err);
  process.exit(1);
});
