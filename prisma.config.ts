import { defineConfig } from 'prisma/config';
import 'dotenv/config';
import { buildDatabaseUrl } from './src/shared/configs/database-url';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const databaseUrl = buildDatabaseUrl({
  DATABASE_HOST: requireEnv('DATABASE_HOST'),
  DATABASE_PORT: Number(requireEnv('DATABASE_PORT')),
  DATABASE_NAME: requireEnv('DATABASE_NAME'),
  DATABASE_USER: requireEnv('DATABASE_USER'),
  DATABASE_PASSWORD: requireEnv('DATABASE_PASSWORD'),
});

export default defineConfig({
  schema: 'src/modules/database/schema/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
