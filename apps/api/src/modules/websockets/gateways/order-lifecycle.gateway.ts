import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { envConfig } from '../../../config/env.config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisPubSubService } from '../../redis-pubsub/redis-pubsub.service';
import { AppLoggerService } from '../../../common/logger/app-logger.service';
import {
  WsOrderEvent,
  WsSubscribeOrderDto,
  WsRestaurantOrderActionDto,
  WsKitchenStatusUpdateDto,
  WsCourierLocationPingDto,
  WsRestaurantAcceptedPayload,
  WsKitchenStagePayload,
  WsCourierLocationBroadcastPayload,
} from '../events/order-events.schema';
import { OrderStatus, Role } from '@prisma/client';

const REDIS_ORDER_EVENTS_CHANNEL = 'feedo:orders:events';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/orders',
  transports: ['websocket', 'polling'],
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OrderLifecycleGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisPubSub: RedisPubSubService,
    private readonly logger: AppLoggerService,
  ) {}

  async afterInit(server: Server) {
    this.logger.log('OrderLifecycleGateway initialized on namespace: /orders', 'WebSocketGateway');

    // Subscribe to distributed Redis Pub/Sub channel to synchronize events across cluster instances
    await this.redisPubSub.subscribe(
      REDIS_ORDER_EVENTS_CHANNEL,
      (_channel: string, message: { event: string; room: string; payload: any }) => {
        if (this.server && message.room) {
          this.server.to(message.room).emit(message.event, message.payload);
        }
      },
    );
  }

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.headers['authorization'] as string)?.replace(/^Bearer\s+/i, '');

    if (!token) {
      this.logger.warn(`Rejected unauthenticated socket connection: ${client.id}`, 'WebSocketGateway');
      client.disconnect(true);
      return;
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
          restaurantMemberships: { select: { restaurantId: true } },
        },
      });

      if (!user || user.accountStatus !== 'ACTIVE') {
        client.disconnect(true);
        return;
      }

      client.data.user = user;

      // Join standard private rooms
      client.join(`user:${user.id}`);

      if (user.role === Role.CUSTOMER) {
        client.join(`customer:${user.id}`);
      } else if (user.role === Role.DELIVERY_PARTNER) {
        client.join(`courier:${user.id}`);
      } else if (
        (user.role === Role.RESTAURANT_OWNER || user.role === Role.RESTAURANT_STAFF) &&
        user.restaurantMemberships.length > 0
      ) {
        user.restaurantMemberships.forEach((m) => client.join(`restaurant:${m.restaurantId}`));
      }

      this.logger.log(
        `Socket connected: ${client.id} (User: ${user.fullName}, Role: ${user.role})`,
        'WebSocketGateway',
      );
    } catch (err: any) {
      this.logger.warn(`Invalid JWT on socket handshake ${client.id}: ${err.message}`, 'WebSocketGateway');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`, 'WebSocketGateway');
  }

  // ==========================================
  // INBOUND CLIENT TRIGGERS & SUBSCRIPTIONS
  // ==========================================

  @SubscribeMessage(WsOrderEvent.CLIENT_SUBSCRIBE)
  async handleOrderSubscription(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: WsSubscribeOrderDto,
  ) {
    const user = client.data.user;
    if (!user) return { success: false, message: 'Unauthenticated' };

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      select: { userId: true, restaurantId: true, deliveryAssignment: { select: { driverId: true } } },
    });

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    // Tenant check: Only customer, associated restaurant, or assigned courier can join
    const isOwner = order.userId === user.id;
    const isRestaurantStaff = user.restaurantMemberships?.some((m: any) => m.restaurantId === order.restaurantId);
    const isAssignedCourier = order.deliveryAssignment?.driverId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isRestaurantStaff && !isAssignedCourier && !isAdmin) {
      this.logger.warn(`Unauthorized room join attempt for order ${dto.orderId} by user ${user.id}`, 'WebSocketGateway');
      return { success: false, message: 'Forbidden: Insufficient privileges for this order' };
    }

    const roomName = `order:${dto.orderId}`;
    client.join(roomName);
    this.logger.debug(`User ${user.id} joined room ${roomName}`, 'WebSocketGateway');

    return { success: true, room: roomName };
  }

  @SubscribeMessage(WsOrderEvent.RESTAURANT_ACTION)
  async handleRestaurantAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: WsRestaurantOrderActionDto,
  ) {
    const user = client.data.user;
    if (!user) return { success: false, message: 'Unauthenticated' };

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { restaurant: true },
    });

    if (!order) return { success: false, message: 'Order not found' };

    if (dto.action === 'ACCEPT') {
      const estimatedPrepTimeMin = dto.estimatedPrepTimeMin || order.restaurant.estimatedPrepTimeMinutes || 25;

      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: OrderStatus.PREPARING,
            estimatedDeliveryTime: new Date(Date.now() + (estimatedPrepTimeMin + 20) * 60000),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            previousStatus: order.orderStatus,
            nextStatus: OrderStatus.PREPARING,
            actorId: user.id,
            note: `Restaurant accepted order with estimated prep time of ${estimatedPrepTimeMin} mins`,
          },
        });
      });

      const payload: WsRestaurantAcceptedPayload = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        restaurantId: order.restaurantId,
        estimatedPrepTimeMin,
        acceptedAt: new Date().toISOString(),
      };

      // Broadcast across distributed Redis pub/sub
      await this.broadcastToRoom(`order:${order.id}`, WsOrderEvent.RESTAURANT_ACCEPTED, payload);

      return { success: true, orderStatus: OrderStatus.PREPARING };
    } else {
      // Rejection handling
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: OrderStatus.REJECTED,
            rejectionReason: dto.rejectionReason || 'Kitchen is currently overwhelmed',
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            previousStatus: order.orderStatus,
            nextStatus: OrderStatus.REJECTED,
            actorId: user.id,
            note: `Restaurant rejected order: ${dto.rejectionReason}`,
          },
        });
      });

      await this.broadcastToRoom(`order:${order.id}`, WsOrderEvent.RESTAURANT_REJECTED, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reason: dto.rejectionReason,
      });

      return { success: true, orderStatus: OrderStatus.REJECTED };
    }
  }

  @SubscribeMessage(WsOrderEvent.KITCHEN_UPDATE)
  async handleKitchenUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: WsKitchenStatusUpdateDto,
  ) {
    const user = client.data.user;
    if (!user) return { success: false, message: 'Unauthenticated' };

    const nextStatus =
      dto.stage === 'READY_FOR_PICKUP' ? OrderStatus.READY_FOR_PICKUP : OrderStatus.PREPARING;

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: dto.orderId },
        data: { orderStatus: nextStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: dto.orderId,
          nextStatus,
          actorId: user.id,
          note: `Kitchen updated status to ${dto.stage}`,
        },
      });
    });

    const payload: WsKitchenStagePayload = {
      orderId: dto.orderId,
      orderNumber: '',
      restaurantId: '',
      stage: dto.stage,
      timestamp: new Date().toISOString(),
    };

    const eventName =
      dto.stage === 'READY_FOR_PICKUP'
        ? WsOrderEvent.KITCHEN_READY_FOR_PICKUP
        : WsOrderEvent.KITCHEN_PREPARING;

    await this.broadcastToRoom(`order:${dto.orderId}`, eventName, payload);
    return { success: true, stage: dto.stage };
  }

  @SubscribeMessage(WsOrderEvent.COURIER_LOCATION_PING)
  async handleCourierLocationPing(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: WsCourierLocationPingDto,
  ) {
    const user = client.data.user;
    if (!user || user.role !== Role.DELIVERY_PARTNER) {
      return { success: false, message: 'Only active delivery partners can emit location pings' };
    }

    // 1. Cache latest presence in Redis (with 60-second TTL)
    await this.redisPubSub.setCourierPresence(user.id, {
      lat: dto.latitude,
      lng: dto.longitude,
      bearing: dto.bearing,
    });

    // 2. High-speed broadcast directly to the customer's order tracking room
    const broadcastPayload: WsCourierLocationBroadcastPayload = {
      orderId: dto.orderId,
      courierId: user.id,
      latitude: dto.latitude,
      longitude: dto.longitude,
      bearing: dto.bearing,
      speedKmh: dto.speedKmh,
      timestamp: dto.recordedAt || new Date().toISOString(),
    };

    await this.broadcastToRoom(`order:${dto.orderId}`, WsOrderEvent.COURIER_LOCATION_UPDATE, broadcastPayload);

    return { received: true };
  }

  // ==========================================
  // DISTRIBUTED ROOM BROADCAST HELPER
  // ==========================================

  async broadcastToRoom(room: string, event: string, payload: unknown) {
    // 1. Emit locally on this server instance
    if (this.server) {
      this.server.to(room).emit(event, payload);
    }

    // 2. Publish to Redis so all other scaled instances broadcast to their connected sockets
    await this.redisPubSub.publish(REDIS_ORDER_EVENTS_CHANNEL, {
      room,
      event,
      payload,
    });
  }

  /**
   * Graceful shutdown: notifies all connected clients before disconnecting
   */
  async gracefulShutdown() {
    this.logger.warn('Broadcasting server maintenance notice to all active WebSocket clients...', 'WebSocketGateway');
    if (this.server) {
      this.server.emit(WsOrderEvent.SYSTEM_MAINTENANCE, {
        message: 'Server undergoing scheduled rolling update. Reconnecting automatically...',
        retryInSeconds: 3,
      });

      // Disconnect all sockets
      const sockets = await this.server.fetchSockets();
      for (const socket of sockets) {
        socket.disconnect(true);
      }
    }
  }
}
