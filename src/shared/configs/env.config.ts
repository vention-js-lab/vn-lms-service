import { z } from 'zod';

export const envConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: z.coerce.number().int().min(1).max(65535).default(8050),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),

  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number().int().min(1).max(65535),
  MAIL_FROM: z.string().min(3),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;

export function validateEnv(config: unknown): EnvConfig {
  const parsed = envConfigSchema.safeParse(config);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map((issue) => {
      return {
        field: issue.path.join('.'),
        message: issue.message,
      };
    });
    throw new Error(`Invalid environment configuration: ${JSON.stringify(errorMessage)}`);
  }
  return parsed.data;
}
