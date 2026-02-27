import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UsersRepository } from '#/modules/users/repositories/users.repository';
import { EnvConfig } from '#/shared/configs';
import { Hasher } from '#/shared/lib/hasher';
import { LoginDto } from '../dto/login.dto';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/auth-payload';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private configService: ConfigService<EnvConfig>,
    private jwtService: JwtService,
  ) {}
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new BadRequestException('Email or password is invalid');

    const isEqual = await Hasher.verify(user.password, password);

    if (!isEqual) throw new BadRequestException('Email or password is invalid');

    const accessTokenPayload = {
      sub: user.id,
      tokenType: 'access',
      email: user.email,
      role: user.role,
    } satisfies AccessTokenPayload;

    const refreshTokenPayload = {
      sub: user.id,
      tokenType: 'refresh',
      jti: randomUUID(),
    } satisfies RefreshTokenPayload;

    const accessToken = await this.generateAccessToken(accessTokenPayload);
    const refreshToken = await this.generateRefreshToken(refreshTokenPayload);
    return { accessToken, refreshToken };
  }

  async generateAccessToken(payload: AccessTokenPayload) {
    const jwtSecret = this.configService.get('AUTH_JWT_ACCESS_SECRET', { infer: true });
    const jwtAccessExpiresIn = this.configService.get('AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true });
    return await this.jwtService.signAsync(payload, {
      secret: jwtSecret,
      expiresIn: jwtAccessExpiresIn,
    } as JwtSignOptions);
  }

  async generateRefreshToken(payload: RefreshTokenPayload) {
    const jwtSecret = this.configService.get('AUTH_JWT_REFRESH_SECRET', { infer: true });
    const jwtRefreshExpiresIn = this.configService.get('AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN', { infer: true });
    return await this.jwtService.signAsync(payload, {
      secret: jwtSecret,
      expiresIn: jwtRefreshExpiresIn,
    } as JwtSignOptions);
  }
}
