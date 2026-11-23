import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { envConfig } from '../../../config/env.config';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLoggerService } from '../../../common/logger/app-logger.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token =
      client.handshake.auth?.token ||
      (client.handshake.headers['authorization'] as string)?.replace(/^Bearer\s+/i, '');

    if (!token) {
      this.logger.warn(`WS connection rejected: Missing token from client ${client.id}`, 'WsJwtGuard');
      client.disconnect(true);
      return false;
    }

    try {
      const decoded = jwt.verify(token, envConfig.jwt.secret) as {
        sub: string;
        email: string;
        role: string;
      };

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          accountStatus: true,
        },
      });

      if (!user || user.accountStatus !== 'ACTIVE') {
        this.logger.warn(`WS connection rejected: Inactive user ${decoded.sub}`, 'WsJwtGuard');
        client.disconnect(true);
        return false;
      }

      // Store authenticated user in client session context
      client.data.user = user;
      return true;
    } catch (err: any) {
      this.logger.warn(`WS token verification failed for client ${client.id}: ${err.message}`, 'WsJwtGuard');
      client.disconnect(true);
      return false;
    }
  }
}
