import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UsersRepository } from '#/modules/users/repositories/users.repository';
import { EnvConfig } from '#/shared/configs';
import { Hasher } from '#/shared/lib/hasher';
import { LoginDto } from '../dto/login.dto';
import { AuthPayload } from '../types/auth-payload';

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

    if (!user) {
      await Hasher.hash(password);
      throw new BadRequestException('Email or password is invalid');
    }
    const isEqual = await Hasher.verify(user.password, password);

    if (!isEqual) throw new BadRequestException('Email or password is invalid');

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  generateTokens(payload: AuthPayload) {
    const jwtSecret = this.configService.get('JWT_SECRET', { infer: true });
    const jwtAccessExpiresIn = this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true });
    const jwtRefreshExpiresIn = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN', { infer: true });

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtAccessExpiresIn,
    } as JwtSignOptions);

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtRefreshExpiresIn,
    } as JwtSignOptions);

    return { accessToken, refreshToken };
  }
}
