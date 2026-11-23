import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AppLoggerService } from '../logger/app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const { method, originalUrl, ip } = req;
    const correlationId = (req.headers['x-correlation-id'] as string) || (req as any).id;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const statusCode = ctx.getResponse().statusCode;
          this.logger.log(
            `${method} ${originalUrl} ${statusCode} - ${duration}ms [CID: ${correlationId}]`,
            'HTTP',
            { method, path: originalUrl, statusCode, duration, ip, correlationId },
          );
        },
      }),
    );
  }
}
