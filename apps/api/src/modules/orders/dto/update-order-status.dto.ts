import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Invalid order status transition' })
  @IsNotEmpty()
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
