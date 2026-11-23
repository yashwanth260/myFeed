import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateRestaurantStatusDto, CreateCouponDto, UpdateCouponDto, RefundOrderDto } from './admin.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getRestaurants() {
    return this.prisma.restaurant.findMany({
      include: {
        _count: {
          select: { menuItems: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRestaurantStatus(id: string, dto: UpdateRestaurantStatusDto, adminId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const updated = await this.prisma.restaurant.update({
      where: { id },
      data: {
        ...(dto.isApproved !== undefined && { isApproved: dto.isApproved }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'ADMIN_UPDATE_RESTAURANT_STATUS',
      targetType: 'RESTAURANT',
      targetId: id,
      details: { ...dto } as Record<string, unknown>,
    });

    return updated;
  }

  async getCoupons() {
    return this.prisma.coupon.findMany({
      include: {
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCoupon(dto: CreateCouponDto, adminId: string) {
    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        description: dto.description,
        discountType: dto.discountType || 'PERCENTAGE',
        discountValue: dto.discountValue,
        maxDiscountPaise: dto.maxDiscountPaise || 15000,
        minOrderAmountPaise: dto.minOrderAmountPaise || 0,
        validUntil: new Date(dto.validUntil),
        isActive: true,
      },
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'ADMIN_CREATE_COUPON',
      targetType: 'RESTAURANT',
      targetId: coupon.id,
      details: { code: coupon.code },
    });

    return coupon;
  }

  async updateCoupon(id: string, dto: UpdateCouponDto, adminId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const updated = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
        ...(dto.maxDiscountPaise !== undefined && { maxDiscountPaise: dto.maxDiscountPaise }),
      },
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'ADMIN_UPDATE_COUPON',
      targetType: 'RESTAURANT',
      targetId: id,
      details: { ...dto } as Record<string, unknown>,
    });

    return updated;
  }

  async getOrders() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        restaurant: { select: { name: true, city: true } },
        items: true,
        deliveryAssignment: {
          include: { driver: { select: { fullName: true, phone: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async refundOrder(id: string, dto: RefundOrderDto, adminId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const refunded = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          orderStatus: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.REFUNDED,
          cancellationReason: dto.reason || 'Admin initiated refund',
        },
      });

      await tx.payment.updateMany({
        where: { orderId: id },
        data: { status: PaymentStatus.REFUNDED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          previousStatus: order.orderStatus,
          nextStatus: OrderStatus.CANCELLED,
          actorId: adminId,
          note: `Refund issued by admin: ${dto.reason || 'No reason provided'}`,
        },
      });

      return updatedOrder;
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'ADMIN_REFUND_ORDER',
      targetType: 'ORDER',
      targetId: id,
      details: { previousStatus: order.orderStatus, reason: dto.reason },
    });

    return refunded;
  }
}
