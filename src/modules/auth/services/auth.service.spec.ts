import { BadRequestException } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { type JwtService } from '@nestjs/jwt';
import { userRoleEnum, userStatusEnum } from '#/modules/database/schema';
import { type UsersRepository } from '#/modules/users/repositories/users.repository';
import { Hasher } from '#/shared/lib/hasher';
import { AuthService } from '../services/auth.service';
import { type AccessTokenPayload, type RefreshTokenPayload } from '../types/auth-payload';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
  } as unknown as UsersRepository;

  const mockConfigService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  const mockJwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockUsersRepository, mockConfigService, mockJwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    const dto = {
      email: 'test@test.com',
      password: 'password',
    };

    const user = {
      id: 'user-id',
      email: 'test@test.com',
      firstName: 'test',
      lastName: 'test',
      password: 'hashed_password',
      role: userRoleEnum[0],
      status: userStatusEnum[0],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('throws when user is not found and hashes fake password', async () => {
      jest.spyOn(mockUsersRepository, 'findByEmail').mockResolvedValueOnce(null);
      const verifySpy = jest.spyOn(Hasher, 'verify');
      const loginPromise = authService.login(dto);

      await expect(loginPromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(loginPromise).rejects.toThrow('Email or password is invalid');

      expect(verifySpy).not.toHaveBeenCalled();
    });

    it('throws when password is invalid', async () => {
      jest.spyOn(mockUsersRepository, 'findByEmail').mockResolvedValueOnce(user);
      const verifySpy = jest.spyOn(Hasher, 'verify').mockResolvedValueOnce(false);
      const loginPromise = authService.login(dto);

      await expect(loginPromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(loginPromise).rejects.toThrow('Email or password is invalid');

      expect(verifySpy).toHaveBeenCalledWith(user.password, dto.password);
    });

    it('returns tokens for valid credentials', async () => {
      jest.spyOn(mockUsersRepository, 'findByEmail').mockResolvedValueOnce(user);
      jest.spyOn(Hasher, 'verify').mockResolvedValueOnce(true);
      const accessTokenSpy = jest.spyOn(authService, 'generateAccessToken').mockResolvedValueOnce('access-token');
      const refreshTokenSpy = jest.spyOn(authService, 'generateRefreshToken').mockResolvedValueOnce('refresh-token');

      await expect(authService.login(dto)).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(accessTokenSpy).toHaveBeenCalledWith({
        sub: user.id,
        tokenType: 'access',
        email: dto.email,
        role: userRoleEnum[0],
      });

      expect(refreshTokenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          tokenType: 'refresh',
        }),
      );
      expect(refreshTokenSpy.mock.calls[0][0].jti).toEqual(expect.any(String));
    });
  });

  describe('generateAccessToken', () => {
    it('signs access token using access secret and expiry', async () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce('access-secret').mockReturnValueOnce('15m');
      const signAsyncSpy = jest.spyOn(mockJwtService, 'signAsync').mockResolvedValueOnce('access-token');

      const payload: AccessTokenPayload = {
        sub: 'user-id',
        tokenType: 'access',
        email: 'test@test.com',
        role: userRoleEnum[0],
      };

      await expect(authService.generateAccessToken(payload)).resolves.toBe('access-token');

      expect(mockConfigService.get).toHaveBeenNthCalledWith(1, 'AUTH_JWT_ACCESS_SECRET', { infer: true });
      expect(mockConfigService.get).toHaveBeenNthCalledWith(2, 'AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true });
      expect(signAsyncSpy).toHaveBeenCalledWith(payload, {
        secret: 'access-secret',
        expiresIn: '15m',
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('signs refresh token using refresh secret and expiry', async () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce('refresh-secret').mockReturnValueOnce('7d');
      const signAsyncSpy = jest.spyOn(mockJwtService, 'signAsync').mockResolvedValueOnce('refresh-token');

      const payload: RefreshTokenPayload = {
        sub: 'user-id',
        tokenType: 'refresh',
        jti: 'jti-1',
      };

      await expect(authService.generateRefreshToken(payload)).resolves.toBe('refresh-token');

      expect(mockConfigService.get).toHaveBeenNthCalledWith(1, 'AUTH_JWT_REFRESH_SECRET', { infer: true });
      expect(mockConfigService.get).toHaveBeenNthCalledWith(2, 'AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN', { infer: true });
      expect(signAsyncSpy).toHaveBeenCalledWith(payload, {
        secret: 'refresh-secret',
        expiresIn: '7d',
      });
    });
  });
});
