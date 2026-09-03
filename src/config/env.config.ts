import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_PATH: z.string().default('data/a11yfix.sqlite'),
  MAX_AUDIT_TIMEOUT_MS: z.coerce.number().default(60000),
  CORS_ORIGIN: z.string().default('*'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function loadEnvConfig(env: NodeJS.ProcessEnv = process.env): EnvConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${JSON.stringify(result.error.format())}`);
  }
  return result.data;
}

export const envConfig = loadEnvConfig();
