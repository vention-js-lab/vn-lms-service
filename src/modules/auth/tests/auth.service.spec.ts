import { BadRequestException } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { type JwtService } from '@nestjs/jwt';
import { userRoleEnum, userStatusEnum } from '#/modules/database/schema';
import { type UsersRepository } from '#/modules/users/repositories/users.repository';
import { Hasher } from '#/shared/lib/hasher';
import { AuthService } from '../services/auth.service';
import { type AuthPayload } from '../types/auth-payload';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
  } as unknown as UsersRepository;

  const mockConfigService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
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
      role: userRoleEnum.enumValues[3],
      status: userStatusEnum.enumValues[0],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('throws when user is not found and hashes incoming password', async () => {
      jest.spyOn(mockUsersRepository, 'findByEmail').mockResolvedValueOnce(null);
      const hashSpy = jest.spyOn(Hasher, 'hash').mockResolvedValueOnce('fake-hash');
      const verifySpy = jest.spyOn(Hasher, 'verify');
      const loginPromise = authService.login(dto);

      await expect(loginPromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(loginPromise).rejects.toThrow('Email or password is invalid');

      expect(hashSpy).toHaveBeenCalledWith(dto.password);
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
      const generateTokensSpy = jest.spyOn(authService, 'generateTokens').mockResolvedValueOnce({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      await expect(authService.login(dto)).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(generateTokensSpy).toHaveBeenCalledWith({
        sub: user.id,
        email: dto.email,
        role: 'STUDENT',
      });
    });
  });

  describe('generateTokens', () => {
    it('signs and returns access and refresh tokens', async () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce('jwt-secret').mockReturnValueOnce('15m').mockReturnValueOnce('7d');
      jest.spyOn(mockJwtService, 'sign').mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const payload: AuthPayload = {
        sub: 'user-id',
        email: 'test@test.com',
        role: 'STUDENT',
      };

      await expect(authService.generateTokens(payload)).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(mockConfigService.get).toHaveBeenNthCalledWith(1, 'JWT_SECRET', { infer: true });
      expect(mockConfigService.get).toHaveBeenNthCalledWith(2, 'JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true });
      expect(mockConfigService.get).toHaveBeenNthCalledWith(3, 'JWT_REFRESH_TOKEN_EXPIRES_IN', {
        infer: true,
      });

      expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, payload, {
        secret: 'jwt-secret',
        expiresIn: '15m',
      });
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(2, payload, {
        secret: 'jwt-secret',
        expiresIn: '7d',
      });
    });
  });
});
