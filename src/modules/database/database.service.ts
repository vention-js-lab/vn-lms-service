import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { buildDatabaseUrl, type EnvConfig } from '#/shared/configs';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    const connectionString = buildDatabaseUrl({
      DATABASE_HOST: configService.get('DATABASE_HOST', { infer: true }),
      DATABASE_PORT: configService.get('DATABASE_PORT', { infer: true }),
      DATABASE_NAME: configService.get('DATABASE_NAME', { infer: true }),
      DATABASE_USER: configService.get('DATABASE_USER', { infer: true }),
      DATABASE_PASSWORD: configService.get('DATABASE_PASSWORD', { infer: true }),
    });

    const adapter = new PrismaPg({
      connectionString,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
