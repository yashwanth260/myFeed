import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import {
  SetDutyStatusDto,
  AcceptOfferDto,
  AdvanceDeliveryStepDto,
  RecordLocationDto,
} from './dto/delivery.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('duty')
  @HttpCode(HttpStatus.OK)
  async setDuty(@Body() dto: SetDutyStatusDto) {
    return this.deliveryService.setDutyStatus(dto);
  }

  @Get('offers')
  async getOffers(@Query('driverId') driverId?: string) {
    return this.deliveryService.fetchAvailableOffers(driverId);
  }

  @Post('offers/:orderId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptOffer(
    @Param('orderId') orderId: string,
    @Body() dto: AcceptOfferDto,
  ) {
    return this.deliveryService.acceptOffer(orderId, dto?.driverId);
  }

  @Post('orders/:orderId/step')
  @HttpCode(HttpStatus.OK)
  async advanceStep(
    @Param('orderId') orderId: string,
    @Body() dto: AdvanceDeliveryStepDto,
  ) {
    return this.deliveryService.advanceDeliveryStep(orderId, dto.step, dto.driverId);
  }

  @Post('location')
  @HttpCode(HttpStatus.OK)
  async recordLocation(@Body() dto: RecordLocationDto) {
    return this.deliveryService.recordLocation(dto);
  }
}
