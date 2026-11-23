import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { envConfig } from '../../config/env.config';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Verify user email & phone uniqueness
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }],
      },
    });

    if (existing) {
      if (existing.email === dto.email.toLowerCase()) {
        throw new ConflictException('An account with this email address already exists');
      }
      throw new ConflictException('An account with this phone number already exists');
    }

    // 2. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(dto.password, envConfig.security.bcryptSaltRounds);

    // 3. Create user in database
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        fullName: dto.fullName,
        passwordHash,
        role: dto.role || Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    // 4. Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended or pending approval');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
      ...tokens,
    };
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: envConfig.jwt.secret,
      expiresIn: envConfig.jwt.expiresIn as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: envConfig.jwt.refreshSecret,
      expiresIn: envConfig.jwt.refreshExpiresIn as any,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: envConfig.jwt.expiresIn,
    };
  }
}
