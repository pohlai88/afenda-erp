import { z } from "zod";

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AFENDA_APP_NAME: z.string().default("Afenda ERP"),
  AFENDA_DEV_AUTH_BYPASS: z.enum(["0", "1"]).default("0"),
  AFENDA_NEON_AUTH_ENABLED: z.enum(["0", "1"]).default("0"),
  AFENDA_E2E_DEV_AUTH: z.enum(["0", "1"]).default("0"),
});

const databaseEnvSchema = z.object({
  DATABASE_URL: z.url(),
});

const neonAuthConfigSchema = z.object({
  NEON_AUTH_BASE_URL: z.url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  NEON_AUTH_SESSION_CACHE_TTL: z.coerce.number().int().positive().default(300),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export type NeonAuthEnv = BaseEnv & {
  configured: boolean;
  NEON_AUTH_BASE_URL?: string;
  NEON_AUTH_COOKIE_SECRET?: string;
  NEON_AUTH_SESSION_CACHE_TTL: number;
};

export function getBaseEnv(input: NodeJS.ProcessEnv = process.env): BaseEnv {
  return baseEnvSchema.parse(input);
}

export function getDatabaseEnv(
  input: NodeJS.ProcessEnv = process.env,
): BaseEnv & DatabaseEnv {
  return {
    ...getBaseEnv(input),
    ...databaseEnvSchema.parse(input),
  };
}

export function getNeonAuthEnv(
  input: NodeJS.ProcessEnv = process.env,
): NeonAuthEnv {
  const baseEnv = getBaseEnv(input);

  const config = neonAuthConfigSchema.safeParse(input);

  if (!config.success) {
    return {
      ...baseEnv,
      configured: false,
      NEON_AUTH_SESSION_CACHE_TTL: 300,
    };
  }

  return {
    ...baseEnv,
    configured: true,
    ...config.data,
  };
}

export function isNeonAuthEnabled(input: NodeJS.ProcessEnv = process.env) {
  const env = getNeonAuthEnv(input);
  return env.AFENDA_NEON_AUTH_ENABLED === "1" && env.configured;
}

export function isDevAuthBypassEnabled(input: NodeJS.ProcessEnv = process.env) {
  const env = getBaseEnv(input);
  return env.NODE_ENV === "development" && env.AFENDA_DEV_AUTH_BYPASS === "1";
}

export function isDevCookieAuthEnabled(input: NodeJS.ProcessEnv = process.env) {
  if (isNeonAuthEnabled(input)) {
    return false;
  }

  const env = getBaseEnv(input);

  if (env.NODE_ENV === "production") {
    return env.AFENDA_E2E_DEV_AUTH === "1";
  }

  return true;
}
