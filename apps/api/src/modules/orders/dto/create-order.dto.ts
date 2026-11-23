import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class OrderItemDto {
  @IsUUID('4', { message: 'menuItemId must be a valid UUID' })
  @IsNotEmpty()
  menuItemId!: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  customizationOptionIds?: string[];
}

export class CreateOrderDto {
  @IsUUID('4', { message: 'restaurantId must be a valid UUID' })
  @IsNotEmpty()
  restaurantId!: string;

  @IsUUID('4', { message: 'deliveryAddressId must be a valid UUID' })
  @IsNotEmpty()
  deliveryAddressId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  @IsNotEmpty()
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
