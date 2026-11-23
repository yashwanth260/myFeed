import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @IsUUID('4')
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  razorpayOrderId!: string;

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId!: string;

  @IsString()
  @IsNotEmpty()
  razorpaySignature!: string;
}

export class CreatePaymentOrderDto {
  @IsUUID('4')
  @IsNotEmpty()
  orderId!: string;
}
