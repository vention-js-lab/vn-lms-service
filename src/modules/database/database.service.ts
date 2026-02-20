import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { type EnvConfig } from '#/shared/configs';
import * as schema from './schema';

@Injectable()
export class DatabaseService {
  public db: NodePgDatabase<typeof schema>;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    const host = configService.get('DATABASE_HOST', { infer: true });
    const port = configService.get('DATABASE_PORT', { infer: true });
    const name = configService.get('DATABASE_NAME', { infer: true });
    const user = configService.get('DATABASE_USER', { infer: true });
    const password = configService.get('DATABASE_PASSWORD', { infer: true });

    const connectionString = `postgresql://${user}:${password}@${host}:${port}/${name}?schema=public`;

    const dbClient = drizzle(connectionString, {
      schema,
    });

    this.db = dbClient;
  }
}
