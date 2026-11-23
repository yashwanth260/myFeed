import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppLoggerService } from '../logger/app-logger.service';
import { envConfig } from '../../config/env.config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request.headers['x-correlation-id'] as string) || (request as any).id || 'N/A';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'An internal server error occurred';
    let errorCode = 'INTERNAL_ERROR';
    let details: any = undefined;

    // 1. Standard NestJS HttpExceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errorCode = (res as any).error || `HTTP_${status}`;
      } else {
        message = res;
        errorCode = `HTTP_${status}`;
      }
    }
    // 2. Prisma Database Specific Errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          const target = (exception.meta?.target as string[]) || [];
          message = `Unique constraint violation on field: ${target.join(', ')}`;
          errorCode = 'RESOURCE_ALREADY_EXISTS';
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          message = 'The requested database record does not exist';
          errorCode = 'RECORD_NOT_FOUND';
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint violated';
          errorCode = 'FOREIGN_KEY_VIOLATION';
          break;
        }
        case 'P2024': {
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Database connection pool timed out under heavy load. Please retry.';
          errorCode = 'DB_CONNECTION_TIMEOUT';
          break;
        }
        default: {
          status = HttpStatus.BAD_REQUEST;
          message = `Database query error (Code: ${exception.code})`;
          errorCode = 'DATABASE_QUERY_ERROR';
        }
      }
    }
    // 3. Prisma Validation Errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid database query parameters';
      errorCode = 'INVALID_DATABASE_INPUT';
    }
    // 4. General / Unhandled Exceptions
    else if (exception instanceof Error) {
      message = envConfig.nodeEnv === 'production' ? 'An unexpected internal error occurred' : exception.message;
      errorCode = 'UNHANDLED_EXCEPTION';
    }

    // Structured Error Logging
    this.logger.error(
      `[${request.method} ${request.url}] Status: ${status} | ErrorCode: ${errorCode} | Msg: ${
        typeof message === 'object' ? JSON.stringify(message) : message
      }`,
      exception instanceof Error ? exception.stack : undefined,
      'GlobalExceptionFilter',
      {
        correlationId,
        path: request.url,
        method: request.method,
        ip: request.ip,
      },
    );

    const errorResponse = {
      success: false,
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
      ...(details ? { details } : {}),
    };

    response.status(status).json(errorResponse);
  }
}
