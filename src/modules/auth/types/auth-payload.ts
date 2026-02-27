import { type UserRole } from '#/modules/database/schema';

export type AccessTokenPayload = {
  sub: string;
  tokenType: 'access';
  email: string;
  role: UserRole;
};

export type RefreshTokenPayload = {
  sub: string;
  tokenType: 'refresh';
  jti: string;
};
