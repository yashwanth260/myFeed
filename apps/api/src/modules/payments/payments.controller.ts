import { Controller, Post, Body, Headers, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createPaymentOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentOrderDto,
  ) {
    return this.paymentsService.createRazorpayOrder(user.id, dto);
  }

  @Post('create-razorpay-order')
  @HttpCode(HttpStatus.OK)
  async createRazorpayOrderCompat(@Body() dto: CreatePaymentOrderDto) {
    return this.paymentsService.createRazorpayOrder('usr-customer-01', dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @Body() dto: VerifyPaymentDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.paymentsService.verifyPayment(user?.id || 'usr-customer-01', dto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
    @Req() req: Request,
  ) {
    const rawBody = (req as any).rawBody
      ? (Buffer.isBuffer((req as any).rawBody) ? (req as any).rawBody.toString('utf8') : (req as any).rawBody)
      : JSON.stringify(payload);
    return this.paymentsService.handleWebhook(rawBody, signature || '', payload);
  }
}
