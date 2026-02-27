import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthConfig } from '#/shared/configs/auth.config';

@Injectable()
export class AuthTokenGuard extends AuthGuard(AuthConfig.AuthTokenStrategyKey) {}
