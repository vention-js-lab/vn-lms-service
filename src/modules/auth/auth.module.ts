import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
// import { UsersRepository } from '../users/repositories/users.repository';

@Module({
  imports: [UsersModule, JwtModule, ConfigModule], //question? should i bring it from usersModule, or usersRepo??
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
