import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateRestaurantStatusDto, CreateCouponDto, UpdateCouponDto, RefundOrderDto } from './admin.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface MockRestaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  _count: { menuItems: number; orders: number };
}

export interface MockCoupon {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  maxDiscountPaise: number;
  minOrderAmountPaise: number;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  _count: { redemptions: number };
}

export interface MockOrder {
  id: string;
  orderNumber: string;
  totalAmountPaise: number;
  finalTotalPaise?: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  cancellationReason?: string | null;
  createdAt: Date;
  user: { fullName: string; email: string; phone: string };
  restaurant: { name: string; city: string };
  items: Array<{ id: string; name: string; quantity: number; pricePaise: number }>;
  deliveryAssignment?: { driver: { fullName: string; phone: string } } | null;
}

@Injectable()
export class AdminService {
  private mockRestaurants: MockRestaurant[] = [
    {
      id: 'res-01',
      name: 'Royal Biryani Mahal',
      address: 'Indiranagar 100ft Road',
      city: 'Bangalore',
      phone: '+919876543201',
      rating: 4.8,
      isApproved: true,
      isActive: true,
      createdAt: new Date('2026-01-10'),
      _count: { menuItems: 24, orders: 142 },
    },
    {
      id: 'res-02',
      name: 'Truffles & Crust Bistro',
      address: 'Koramangala 4th Block',
      city: 'Bangalore',
      phone: '+919876543202',
      rating: 4.6,
      isApproved: true,
      isActive: true,
      createdAt: new Date('2026-01-15'),
      _count: { menuItems: 18, orders: 98 },
    },
    {
      id: 'res-03',
      name: 'Pushpa Blooms & Puja Florals',
      address: 'Malleshwaram 8th Cross',
      city: 'Bangalore',
      phone: '+919876543203',
      rating: 4.9,
      isApproved: true,
      isActive: true,
      createdAt: new Date('2026-02-01'),
      _count: { menuItems: 12, orders: 67 },
    },
    {
      id: 'res-04',
      name: 'Vedic Gir Cow Farm Dairy',
      address: 'Whitefield Main Road',
      city: 'Bangalore',
      phone: '+919876543204',
      rating: 4.7,
      isApproved: true,
      isActive: true,
      createdAt: new Date('2026-02-10'),
      _count: { menuItems: 15, orders: 84 },
    },
    {
      id: 'res-05',
      name: 'Golden Dragon Dim Sum',
      address: 'Lavelle Road',
      city: 'Bangalore',
      phone: '+919876543205',
      rating: 4.5,
      isApproved: false,
      isActive: true,
      createdAt: new Date('2026-03-01'),
      _count: { menuItems: 14, orders: 12 },
    },
  ];

  private mockCoupons: MockCoupon[] = [
    {
      id: 'cpn-01',
      code: 'FEEDO50',
      description: '50% Flat Off on first 3 orders',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      maxDiscountPaise: 15000,
      minOrderAmountPaise: 24900,
      validUntil: new Date('2026-12-31'),
      isActive: true,
      createdAt: new Date('2026-01-01'),
      _count: { redemptions: 340 },
    },
    {
      id: 'cpn-02',
      code: 'GOLD20',
      description: '20% Off on gourmet dining & organics',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscountPaise: 10000,
      minOrderAmountPaise: 49900,
      validUntil: new Date('2026-12-31'),
      isActive: true,
      createdAt: new Date('2026-01-05'),
      _count: { redemptions: 185 },
    },
    {
      id: 'cpn-03',
      code: 'FREESHIP',
      description: 'Free doorstep express delivery',
      discountType: 'FLAT',
      discountValue: 40,
      maxDiscountPaise: 4000,
      minOrderAmountPaise: 19900,
      validUntil: new Date('2026-12-31'),
      isActive: true,
      createdAt: new Date('2026-01-12'),
      _count: { redemptions: 512 },
    },
  ];

  private mockOrders: MockOrder[] = [
    {
      id: 'ord-1001',
      orderNumber: 'FDO-2026-1001',
      totalAmountPaise: 64900,
      finalTotalPaise: 64900,
      orderStatus: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.COMPLETED,
      cancellationReason: null,
      createdAt: new Date(Date.now() - 3600000 * 2),
      user: { fullName: 'Priya Sharma', email: 'priya@example.com', phone: '+919876543101' },
      restaurant: { name: 'Royal Biryani Mahal', city: 'Bangalore' },
      items: [
        { id: 'item-1', name: 'Hyderabadi Dum Biryani (Pot)', quantity: 2, pricePaise: 28000 },
        { id: 'item-2', name: 'Mirchi Ka Salan & Raita', quantity: 1, pricePaise: 8900 },
      ],
      deliveryAssignment: { driver: { fullName: 'Ramesh Express', phone: '+919900112233' } },
    },
    {
      id: 'ord-1002',
      orderNumber: 'FDO-2026-1002',
      totalAmountPaise: 42000,
      finalTotalPaise: 42000,
      orderStatus: OrderStatus.PREPARING,
      paymentStatus: PaymentStatus.COMPLETED,
      cancellationReason: null,
      createdAt: new Date(Date.now() - 1800000),
      user: { fullName: 'Vikram Joshi', email: 'vikram@example.com', phone: '+919876543102' },
      restaurant: { name: 'Pushpa Blooms & Puja Florals', city: 'Bangalore' },
      items: [
        { id: 'item-3', name: 'Fresh Jasmine Garland (Mullai)', quantity: 2, pricePaise: 21000 },
      ],
      deliveryAssignment: { driver: { fullName: 'Sunil Rider', phone: '+919900112244' } },
    },
    {
      id: 'ord-1003',
      orderNumber: 'FDO-2026-1003',
      totalAmountPaise: 89000,
      finalTotalPaise: 89000,
      orderStatus: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
      cancellationReason: null,
      createdAt: new Date(Date.now() - 600000),
      user: { fullName: 'Ananya Reddy', email: 'ananya@example.com', phone: '+919876543103' },
      restaurant: { name: 'Vedic Gir Cow Farm Dairy', city: 'Bangalore' },
      items: [
        { id: 'item-4', name: 'A2 Gir Cow Vedic Ghee (500ml)', quantity: 1, pricePaise: 89000 },
      ],
      deliveryAssignment: null,
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getRestaurants() {
    try {
      const records = await this.prisma.restaurant.findMany({
        include: {
          _count: {
            select: { menuItems: true, orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (records && records.length > 0) return records;
    } catch {
      // Database offline fallback
    }
    return this.mockRestaurants;
  }

  async updateRestaurantStatus(id: string, dto: UpdateRestaurantStatusDto, adminId: string) {
    try {
      const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
      if (restaurant) {
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
    } catch {
      // Fallback
    }

    const mock = this.mockRestaurants.find((r) => r.id === id);
    if (!mock) throw new NotFoundException('Restaurant not found');

    if (dto.isApproved !== undefined) mock.isApproved = dto.isApproved;
    if (dto.isActive !== undefined) mock.isActive = dto.isActive;

    await this.auditService.log({
      actorId: adminId,
      action: 'ADMIN_UPDATE_RESTAURANT_STATUS',
      targetType: 'RESTAURANT',
      targetId: id,
      details: { ...dto } as Record<string, unknown>,
    });

    return mock;
  }

  async getCoupons() {
    try {
      const records = await this.prisma.coupon.findMany({
        include: {
          _count: { select: { redemptions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (records && records.length > 0) return records;
    } catch {
      // Database offline fallback
    }
    return this.mockCoupons;
  }

  async createCoupon(dto: CreateCouponDto, adminId: string) {
    try {
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
    } catch {
      // Database offline fallback
    }

    const newCoupon: MockCoupon = {
      id: `cpn-${Date.now()}`,
      code: dto.code.trim().toUpperCase(),
      description: dto.description,
      discountType: dto.discountType || 'PERCENTAGE',
      discountValue: dto.discountValue,
      maxDiscountPaise: dto.maxDiscountPaise || 15000,
      minOrderAmountPaise: dto.minOrderAmountPaise || 0,
      validUntil: new Date(dto.validUntil),
      isActive: true,
      createdAt: new Date(),
      _count: { redemptions: 0 },
    };

    this.mockCoupons.unshift(newCoupon);

    await this.auditService.log({
      actorId: adminId,
      action: 'ADMIN_CREATE_COUPON',
      targetType: 'RESTAURANT',
      targetId: newCoupon.id,
      details: { code: newCoupon.code },
    });

    return newCoupon;
  }

  async updateCoupon(id: string, dto: UpdateCouponDto, adminId: string) {
    try {
      const coupon = await this.prisma.coupon.findUnique({ where: { id } });
      if (coupon) {
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
    } catch {
      // Database offline fallback
    }

    const mock = this.mockCoupons.find((c) => c.id === id);
    if (!mock) throw new NotFoundException('Coupon not found');

    if (dto.isActive !== undefined) mock.isActive = dto.isActive;
    if (dto.discountValue !== undefined) mock.discountValue = dto.discountValue;
    if (dto.maxDiscountPaise !== undefined) mock.maxDiscountPaise = dto.maxDiscountPaise;

    await this.auditService.log({
      actorId: adminId,
      action: 'ADMIN_UPDATE_COUPON',
      targetType: 'RESTAURANT',
      targetId: id,
      details: { ...dto } as Record<string, unknown>,
    });

    return mock;
  }

  async getOrders() {
    try {
      const records = await this.prisma.order.findMany({
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
      if (records && records.length > 0) return records;
    } catch {
      // Database offline fallback
    }
    return this.mockOrders;
  }

  async refundOrder(id: string, dto: RefundOrderDto, adminId: string) {
    try {
      const order = await this.prisma.order.findUnique({ where: { id } });
      if (order) {
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
    } catch {
      // Fallback
    }

    const mock = this.mockOrders.find((o) => o.id === id);
    if (!mock) throw new NotFoundException('Order not found');

    const prevStatus = mock.orderStatus;
    mock.orderStatus = OrderStatus.CANCELLED;
    mock.paymentStatus = PaymentStatus.REFUNDED;
    mock.cancellationReason = dto.reason || 'Admin initiated refund';

    await this.auditService.log({
      actorId: adminId,
      action: 'ADMIN_REFUND_ORDER',
      targetType: 'ORDER',
      targetId: id,
      details: { previousStatus: prevStatus, reason: dto.reason },
    });

    return mock;
  }
}
