import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfig } from '#/shared/configs';
import { AuthConfig } from '#/shared/configs/auth.config';
import type { AccessTokenPayload, CurrentUser } from '../types';

@Injectable()
export class AuthTokenStrategy extends PassportStrategy(Strategy, AuthConfig.AuthTokenStrategyKey) {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('AUTH_JWT_ACCESS_SECRET', { infer: true }),
      ignoreExpiration: false,
    });
  }
  validate(payload: AccessTokenPayload): CurrentUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
