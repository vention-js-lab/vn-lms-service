import { z } from 'zod';

export const envConfigSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: z.coerce.number().int().min(1).max(65535).default(8050),

  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_NAME: z.string().min(1),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),

  MAIL_SMTP_HOST: z.string().min(1),
  MAIL_SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  MAIL_WEB_PORT: z.coerce.number().int().min(1).max(65535),
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
