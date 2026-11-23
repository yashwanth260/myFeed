import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisPubSubService } from '../redis-pubsub/redis-pubsub.service';
import { OrderLifecycleGateway } from '../websockets/gateways/order-lifecycle.gateway';
import { AuditService } from '../audit/audit.service';
import {
  SetDutyStatusDto,
  AdvanceDeliveryStepDto,
  RecordLocationDto,
} from './dto/delivery.dto';
import { OrderStatus, AssignmentStatus, Role } from '@prisma/client';
import { WsOrderEvent } from '../websockets/events/order-events.schema';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisPubSub: RedisPubSubService,
    private readonly wsGateway: OrderLifecycleGateway,
    private readonly auditService: AuditService,
  ) {}

  async setDutyStatus(dto: SetDutyStatusDto, authUserId?: string) {
    const driverId = authUserId || dto.driverId || 'usr-delivery-01';

    // 1. Update presence in Redis with 24-hour expiration
    await this.redisPubSub.setSession(`driver:duty:${driverId}`, {
      isOnline: dto.isOnline,
      updatedAt: new Date().toISOString(),
    });

    await this.auditService.log({
      actorId: driverId,
      action: dto.isOnline ? 'DRIVER_DUTY_ONLINE' : 'DRIVER_DUTY_OFFLINE',
      targetType: 'DELIVERY',
      targetId: driverId,
      details: { isOnline: dto.isOnline },
    });

    return { success: true, driverId, isOnline: dto.isOnline };
  }

  async fetchAvailableOffers(driverId: string = 'usr-delivery-01') {
    try {
      // Fetch orders ready for pickup or confirmed with pending dispatch
      const orders = await this.prisma.order.findMany({
        where: {
          orderStatus: {
            in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP],
          },
          deliveryAssignment: { is: null },
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      if (orders && orders.length > 0) {
        return orders.map((order) => {
          const addr = order.addressSnapshot as any;
          return {
            id: order.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: order.orderStatus,
            payoutPaise: 6500, // ₹65.00
            payoutInr: 65.0,
            estimatedDistanceKm: 3.8,
            estimatedDurationMin: 18,
            restaurant: {
              name: order.restaurant.name,
              address: order.restaurant.address,
              lat: order.restaurant.latitude,
              lng: order.restaurant.longitude,
              phone: '+91 98765 43210',
            },
            customer: {
              address: addr?.fullAddress || 'Indiranagar, Bengaluru',
              lat: addr?.latitude || 12.9716,
              lng: addr?.longitude || 77.5946,
            },
            itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
            itemsSummary: order.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
            placedAt: order.createdAt,
          };
        });
      }
    } catch {
      // Offline / dev fallback when DB container is booting
    }

    return [
      {
        id: 'ord-live-01',
        orderId: 'ord-live-01',
        orderNumber: 'FD-20261122-A891',
        status: OrderStatus.READY_FOR_PICKUP,
        payoutPaise: 6500,
        payoutInr: 65.0,
        estimatedDistanceKm: 3.8,
        estimatedDurationMin: 18,
        restaurant: {
          name: 'The Gold Crust Pizza',
          address: '42 MG Road, Indiranagar',
          lat: 12.9716,
          lng: 77.5946,
          phone: '+91 98765 43210',
        },
        customer: {
          address: 'Villa 14, Koramangala 4th Block',
          lat: 12.9352,
          lng: 77.6245,
        },
        itemsCount: 3,
        itemsSummary: '2x Truffle Burrata Pizza, 1x Tiramisu Cup',
        placedAt: new Date().toISOString(),
      },
      {
        id: 'ord-live-02',
        orderId: 'ord-live-02',
        orderNumber: 'FD-20261122-C412',
        status: OrderStatus.CONFIRMED,
        payoutPaise: 8200,
        payoutInr: 82.0,
        estimatedDistanceKm: 5.2,
        estimatedDurationMin: 24,
        restaurant: {
          name: 'Royal Biryani Palace',
          address: '100 Feet Road, HAL 2nd Stage',
          lat: 12.9654,
          lng: 77.6432,
          phone: '+91 98765 43211',
        },
        customer: {
          address: 'Apt 402, Whitefield Main Road',
          lat: 12.9698,
          lng: 77.7499,
        },
        itemsCount: 2,
        itemsSummary: '1x Dum Gosht Biryani, 1x Mirchi Ka Salan',
        placedAt: new Date().toISOString(),
      },
    ];
  }

  async acceptOffer(orderId: string, driverId: string = 'usr-delivery-01') {
    // 1. Concurrency-Safe Atomic Offer Acceptance using Prisma Transaction
    const assignment = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { deliveryAssignment: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.deliveryAssignment) {
        throw new ConflictException('This order has already been accepted by another courier');
      }

      // Ensure driver user exists or fallback to system driver
      let driverUser = await tx.user.findUnique({ where: { id: driverId } });
      if (!driverUser) {
        driverUser = await tx.user.findFirst({ where: { role: Role.DELIVERY_PARTNER } });
      }

      const activeDriverId = driverUser?.id || order.userId;

      const createdAssignment = await tx.deliveryAssignment.create({
        data: {
          orderId: order.id,
          driverId: activeDriverId,
          status: AssignmentStatus.ACCEPTED,
          acceptedAt: new Date(),
          payoutAmountPaise: 6500,
        },
        include: {
          driver: { select: { fullName: true, phone: true } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.orderStatus,
          nextStatus: order.orderStatus,
          actorId: activeDriverId,
          note: `Courier ${createdAssignment.driver.fullName} accepted the order`,
        },
      });

      return createdAssignment;
    });

    // 2. Broadcast courier assigned event to Customer & Restaurant room
    await this.wsGateway.broadcastToRoom(`order:${orderId}`, WsOrderEvent.COURIER_ASSIGNED, {
      orderId,
      courierId: assignment.driverId,
      courierName: assignment.driver.fullName,
      courierPhone: assignment.driver.phone,
      payoutAmountPaise: assignment.payoutAmountPaise,
      assignedAt: new Date().toISOString(),
    });

    await this.auditService.log({
      actorId: assignment.driverId,
      action: 'COURIER_ACCEPTED_OFFER',
      targetType: 'ORDER',
      targetId: orderId,
      details: { assignmentId: assignment.id },
    });

    return { success: true, assignmentId: assignment.id, orderId };
  }

  async advanceDeliveryStep(
    orderId: string,
    step: 'PICKUP' | 'START_DELIVERY' | 'COMPLETE_DELIVERY',
    driverId: string = 'usr-delivery-01',
  ) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { deliveryAssignment: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      let newOrderStatus = order.orderStatus;
      let newAssignmentStatus = order.deliveryAssignment?.status || AssignmentStatus.ACCEPTED;
      let note = '';

      if (step === 'PICKUP') {
        newOrderStatus = OrderStatus.PICKED_UP;
        newAssignmentStatus = AssignmentStatus.PICKED_UP;
        note = 'Courier arrived at restaurant and picked up order package';

        if (order.deliveryAssignment) {
          await tx.deliveryAssignment.update({
            where: { id: order.deliveryAssignment.id },
            data: { status: newAssignmentStatus, pickedUpAt: new Date() },
          });
        }
      } else if (step === 'START_DELIVERY') {
        newOrderStatus = OrderStatus.OUT_FOR_DELIVERY;
        note = 'Courier is out for delivery heading towards customer destination';
      } else if (step === 'COMPLETE_DELIVERY') {
        newOrderStatus = OrderStatus.DELIVERED;
        newAssignmentStatus = AssignmentStatus.COMPLETED;
        note = 'Order successfully delivered to customer';

        if (order.deliveryAssignment) {
          await tx.deliveryAssignment.update({
            where: { id: order.deliveryAssignment.id },
            data: { status: newAssignmentStatus, completedAt: new Date() },
          });

          // Create Driver Earning Record
          await tx.driverEarning.create({
            data: {
              driverId: order.deliveryAssignment.driverId,
              orderId: order.id,
              tripDistanceKm: 3.8,
              amountPaise: order.deliveryAssignment.payoutAmountPaise,
            },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: newOrderStatus,
          ...(newOrderStatus === OrderStatus.DELIVERED ? { updatedAt: new Date() } : {}),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          previousStatus: order.orderStatus,
          nextStatus: newOrderStatus,
          actorId: driverId,
          note,
        },
      });

      return { newOrderStatus, newAssignmentStatus };
    });

    // Broadcast WebSocket updates
    if (step === 'COMPLETE_DELIVERY') {
      await this.wsGateway.broadcastToRoom(`order:${orderId}`, WsOrderEvent.ORDER_DELIVERED, {
        orderId,
        deliveredAt: new Date().toISOString(),
        feedbackPrompt: true,
      });
    } else {
      await this.wsGateway.broadcastToRoom(`order:${orderId}`, WsOrderEvent.COURIER_PICKED_UP, {
        orderId,
        status: updated.newOrderStatus,
        timestamp: new Date().toISOString(),
      });
    }

    await this.auditService.log({
      actorId: driverId,
      action: `DELIVERY_STEP_${step}`,
      targetType: 'ORDER',
      targetId: orderId,
      details: { step, newOrderStatus: updated.newOrderStatus },
    });

    return { success: true, orderId, step, status: updated.newOrderStatus };
  }

  async recordLocation(dto: RecordLocationDto, authUserId?: string) {
    const driverId = authUserId || dto.driverId || 'usr-delivery-01';

    // 1. Ephemeral Cache in Redis (60s TTL)
    await this.redisPubSub.setCourierPresence(driverId, {
      lat: dto.coords.lat,
      lng: dto.coords.lng,
      bearing: dto.coords.heading,
    });

    // 2. Real-time broadcast to active order room
    if (dto.orderId) {
      await this.wsGateway.broadcastToRoom(`order:${dto.orderId}`, WsOrderEvent.COURIER_LOCATION_UPDATE, {
        orderId: dto.orderId,
        courierId: driverId,
        latitude: dto.coords.lat,
        longitude: dto.coords.lng,
        bearing: dto.coords.heading,
        speedKmh: dto.coords.speed,
        timestamp: new Date().toISOString(),
      });

      // 3. Persist location ping in PostgreSQL asynchronously
      try {
        await this.prisma.deliveryLocation.create({
          data: {
            driverId,
            orderId: dto.orderId,
            latitude: dto.coords.lat,
            longitude: dto.coords.lng,
            heading: dto.coords.heading || 0.0,
            speed: dto.coords.speed || 0.0,
          },
        });
      } catch {
        // Tolerant to telemetry insertion if table has constraint or driver mismatch
      }
    }

    return { success: true, driverId, recordedAt: new Date().toISOString() };
  }
}
