import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { envConfig } from '../../config/env.config';

export interface LogPayload {
  message: string;
  context?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
}

@Injectable({ scope: Scope.DEFAULT })
export class AppLoggerService implements LoggerService {
  private formatLog(level: string, message: any, context?: string, metadata?: Record<string, unknown>, stack?: string) {
    const timestamp = new Date().toISOString();
    const logObj = {
      timestamp,
      level: level.toUpperCase(),
      context: context || 'Application',
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      ...(metadata ? { metadata } : {}),
      ...(stack ? { stack } : {}),
    };

    if (envConfig.nodeEnv === 'production') {
      return JSON.stringify(logObj);
    }

    // Colorized developer friendly string for development
    const color =
      level === 'error'
        ? '\x1b[31m'
        : level === 'warn'
        ? '\x1b[33m'
        : level === 'debug'
        ? '\x1b[34m'
        : '\x1b[32m';
    const reset = '\x1b[0m';
    return `${color}[${timestamp}] [${level.toUpperCase()}] [${context || 'App'}]${reset} ${logObj.message}${
      stack ? `\n${stack}` : ''
    }`;
  }

  log(message: any, context?: string, metadata?: Record<string, unknown>) {
    console.log(this.formatLog('info', message, context, metadata));
  }

  error(message: any, trace?: string, context?: string, metadata?: Record<string, unknown>) {
    console.error(this.formatLog('error', message, context, metadata, trace));
  }

  warn(message: any, context?: string, metadata?: Record<string, unknown>) {
    console.warn(this.formatLog('warn', message, context, metadata));
  }

  debug(message: any, context?: string, metadata?: Record<string, unknown>) {
    if (envConfig.nodeEnv !== 'production') {
      console.debug(this.formatLog('debug', message, context, metadata));
    }
  }

  verbose(message: any, context?: string) {
    if (envConfig.nodeEnv !== 'production') {
      console.log(this.formatLog('verbose', message, context));
    }
  }
}
