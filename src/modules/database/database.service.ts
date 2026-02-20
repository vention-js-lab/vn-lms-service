import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { type EnvConfig } from '#/shared/configs';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    const host = configService.get('DATABASE_HOST', { infer: true });
    const port = configService.get('DATABASE_PORT', { infer: true });
    const name = configService.get('DATABASE_NAME', { infer: true });
    const user = configService.get('DATABASE_USER', { infer: true });
    const password = configService.get('DATABASE_PASSWORD', { infer: true });

    const connectionString = `postgresql://${user}:${password}@${host}:${port}/${name}?schema=public`;

    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
