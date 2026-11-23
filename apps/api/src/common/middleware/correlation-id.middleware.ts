import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existingHeader = req.headers['x-correlation-id'] || req.headers['x-request-id'];
    const correlationId = (typeof existingHeader === 'string' ? existingHeader : null) || randomUUID();

    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    (req as any).id = correlationId;

    next();
  }
}
