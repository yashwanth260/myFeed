import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

// ==========================================
// 1. WEBSOCKET EVENT NAME ENUMS
// ==========================================
export enum WsOrderEvent {
  // Client to Server (Inbound Triggers)
  CLIENT_SUBSCRIBE = 'subscribe:order',
  CLIENT_UNSUBSCRIBE = 'unsubscribe:order',
  RESTAURANT_ACTION = 'restaurant:order_action',
  KITCHEN_UPDATE = 'kitchen:status_update',
  COURIER_LOCATION_PING = 'courier:location_ping',

  // Server to Client (Outbound Lifecycle Broadcasts)
  ORDER_PLACED = 'order:placed',
  RESTAURANT_ACCEPTED = 'restaurant:accepted',
  RESTAURANT_REJECTED = 'restaurant:rejected',
  KITCHEN_PREPARING = 'kitchen:prep_started',
  KITCHEN_READY_FOR_PICKUP = 'kitchen:ready_for_pickup',
  COURIER_OFFERED = 'courier:dispatch_offered',
  COURIER_ASSIGNED = 'courier:assigned',
  COURIER_PICKED_UP = 'courier:picked_up',
  COURIER_LOCATION_UPDATE = 'courier:location_update',
  ORDER_DELIVERED = 'order:delivered',
  ORDER_CANCELLED = 'order:cancelled',
  SYSTEM_MAINTENANCE = 'server:maintenance_notice',
}

// ==========================================
// 2. EXPLICIT PAYLOAD CONTRACTS & DTOS
// ==========================================

export class WsSubscribeOrderDto {
  @IsUUID('4', { message: 'orderId must be a valid UUID' })
  @IsNotEmpty()
  orderId!: string;
}

export class WsRestaurantOrderActionDto {
  @IsUUID('4')
  @IsNotEmpty()
  orderId!: string;

  @IsEnum(['ACCEPT', 'REJECT'])
  @IsNotEmpty()
  action!: 'ACCEPT' | 'REJECT';

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  estimatedPrepTimeMin?: number;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class WsKitchenStatusUpdateDto {
  @IsUUID('4')
  @IsNotEmpty()
  orderId!: string;

  @IsEnum(['PREPARING', 'READY_FOR_PICKUP'])
  @IsNotEmpty()
  stage!: 'PREPARING' | 'READY_FOR_PICKUP';

  @IsOptional()
  @IsString()
  pickupOtp?: string;
}

export class WsCourierLocationPingDto {
  @IsUUID('4')
  @IsNotEmpty()
  orderId!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsNumber()
  speedKmh?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  bearing?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @IsOptional()
  @IsString()
  recordedAt?: string;
}

// Outbound Broadcast Payloads
export interface WsOrderPlacedPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  customerId: string;
  items: Array<{ name: string; quantity: number; unitPricePaise: number }>;
  totalAmountPaise: number;
  placedAt: string;
}

export interface WsRestaurantAcceptedPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  estimatedPrepTimeMin: number;
  acceptedAt: string;
}

export interface WsKitchenStagePayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  stage: 'PREPARING' | 'READY_FOR_PICKUP';
  timestamp: string;
}

export interface WsCourierAssignedPayload {
  orderId: string;
  orderNumber: string;
  courierId: string;
  courierName: string;
  courierPhone: string;
  vehicleType: string;
  vehicleRegistration: string;
  etaMinutes: number;
  assignedAt: string;
}

export interface WsCourierLocationBroadcastPayload {
  orderId: string;
  courierId: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  speedKmh?: number;
  timestamp: string;
}

export interface WsOrderDeliveredPayload {
  orderId: string;
  orderNumber: string;
  deliveredAt: string;
  feedbackPrompt: boolean;
}
