import type { EnvConfig } from './env.config';

type DatabaseConfig = Pick<
  EnvConfig,
  'DATABASE_HOST' | 'DATABASE_PORT' | 'DATABASE_NAME' | 'DATABASE_USER' | 'DATABASE_PASSWORD'
>;

export function buildDatabaseUrl(config: DatabaseConfig): string {
  const user = encodeURIComponent(config.DATABASE_USER);
  const password = encodeURIComponent(config.DATABASE_PASSWORD);
  const dbName = encodeURIComponent(config.DATABASE_NAME);

  return `postgresql://${user}:${password}@${config.DATABASE_HOST}:${config.DATABASE_PORT}/${dbName}?schema=public`;
}
