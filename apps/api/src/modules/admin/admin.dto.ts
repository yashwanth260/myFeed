import { IsBoolean, IsOptional, IsString, IsNotEmpty, IsInt, Min, IsEnum } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class UpdateRestaurantStatusDto {
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsInt()
  @Min(1)
  discountValue!: number;

  @IsOptional()
  @IsInt()
  maxDiscountPaise?: number;

  @IsOptional()
  @IsInt()
  minOrderAmountPaise?: number;

  @IsString()
  @IsNotEmpty()
  validUntil!: string;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  discountValue?: number;

  @IsOptional()
  @IsInt()
  maxDiscountPaise?: number;
}

export class RefundOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
