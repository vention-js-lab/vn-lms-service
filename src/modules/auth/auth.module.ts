import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '#/modules/users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthTokenStrategy } from './strategies/auth.strategy';

@Module({
  imports: [UsersModule, JwtModule, ConfigModule],
  providers: [AuthService, AuthTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
