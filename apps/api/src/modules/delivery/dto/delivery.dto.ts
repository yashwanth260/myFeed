import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsObject,
  IsNumber,
} from 'class-validator';

export class SetDutyStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isOnline!: boolean;

  @IsOptional()
  @IsString()
  driverId?: string;
}

export class AcceptOfferDto {
  @IsOptional()
  @IsString()
  driverId?: string;
}

export class AdvanceDeliveryStepDto {
  @IsEnum(['PICKUP', 'START_DELIVERY', 'COMPLETE_DELIVERY'], {
    message: 'step must be PICKUP, START_DELIVERY, or COMPLETE_DELIVERY',
  })
  @IsNotEmpty()
  step!: 'PICKUP' | 'START_DELIVERY' | 'COMPLETE_DELIVERY';

  @IsOptional()
  @IsString()
  driverId?: string;
}

export class LocationCoordsDto {
  @IsNumber()
  @IsNotEmpty()
  lat!: number;

  @IsNumber()
  @IsNotEmpty()
  lng!: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;
}

export class RecordLocationDto {
  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  orderId?: string | null;

  @IsObject()
  @IsNotEmpty()
  coords!: LocationCoordsDto;
}
