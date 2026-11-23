import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateRestaurantStatusDto, CreateCouponDto, UpdateCouponDto, RefundOrderDto } from './admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('restaurants')
  async getRestaurants() {
    return this.adminService.getRestaurants();
  }

  @Patch('restaurants/:id/status')
  async updateRestaurantStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantStatusDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.updateRestaurantStatus(id, dto, admin.id);
  }

  @Get('coupons')
  async getCoupons() {
    return this.adminService.getCoupons();
  }

  @Post('coupons')
  async createCoupon(
    @Body() dto: CreateCouponDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.createCoupon(dto, admin.id);
  }

  @Patch('coupons/:id')
  async updateCoupon(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.updateCoupon(id, dto, admin.id);
  }

  @Get('orders')
  async getOrders() {
    return this.adminService.getOrders();
  }

  @Post('orders/:id/refund')
  async refundOrder(
    @Param('id') id: string,
    @Body() dto: RefundOrderDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.refundOrder(id, dto, admin.id);
  }
}
