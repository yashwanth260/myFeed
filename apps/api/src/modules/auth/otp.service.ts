import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { envConfig } from '../../config/env.config';

@Injectable()
export class OtpService {
  private readonly logger = new Logger('OtpService');
  private readonly cache = new Map<string, { otp: string; expiresAt: number }>();

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; debugOtp?: string }> {
    const isProd = envConfig.nodeEnv === 'production';
    const otp = isProd ? Math.floor(100000 + Math.random() * 900000).toString() : '1234';

    this.cache.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    if (isProd) {
      // Production SMS Gateway Adapter Stub (Twilio / AWS SNS / Gupshup)
      this.logger.log(`[SMS ADAPTER] Dispatched OTP ${otp} to ${phone}`);
      return { success: true, message: 'OTP sent via SMS' };
    }

    this.logger.log(`[DEV OTP] Generated dev OTP for ${phone}: ${otp}`);
    return { success: true, message: 'OTP generated (Dev Mode)', debugOtp: otp };
  }

  verifyOtp(phone: string, otp: string): boolean {
    const isProd = envConfig.nodeEnv === 'production';

    // Allow dev bypass codes in non-production environments
    if (!isProd && (otp === '1234' || otp === '4289')) {
      return true;
    }

    const cached = this.cache.get(phone);
    if (!cached || Date.now() > cached.expiresAt) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (cached.otp !== otp) {
      throw new BadRequestException('Invalid OTP code');
    }

    this.cache.delete(phone);
    return true;
  }
}
