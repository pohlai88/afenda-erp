import { z } from "zod";

const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  AFENDA_APP_NAME: z.string().default("Afenda ERP"),
  AFENDA_DEV_AUTH_BYPASS: z.enum(["0", "1"]).default("0"),
  AFENDA_NEON_AUTH_ENABLED: z.enum(["0", "1"]).default("0"),
  AFENDA_E2E_DEV_AUTH: z.enum(["0", "1"]).default("0"),
});

const databaseEnvSchema = z.object({
  DATABASE_URL: z.url(),
});

const migrationDatabaseEnvSchema = z.object({
  DATABASE_MIGRATION_URL: z.url().optional(),
  NEON_PREVIEW_DATABASE_URL: z.url().optional(),
  DATABASE_URL: z.url().optional(),
});

const neonAuthConfigSchema = z.object({
  NEON_AUTH_BASE_URL: z.url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  NEON_AUTH_SESSION_CACHE_TTL: z.coerce.number().int().positive().default(300),
});

const cronEnvSchema = z.object({
  CRON_SECRET: z.string().min(1),
});

const observabilityEnvSchema = z.object({
  VERCEL_DRAIN_SECRET: z.string().min(1),
});

const blobEnvSchema = z.object({
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  VERCEL_BLOB_CALLBACK_URL: z.url().optional(),
});

const aiEnvSchema = z.object({
  AFENDA_AI_MODEL: z.string().min(1).optional(),
  AFENDA_AI_FAST_MODEL: z.string().min(1).optional(),
  AFENDA_AI_HIGH_CONFIDENCE_MODEL: z.string().min(1).optional(),
  AI_GATEWAY_API_KEY: z.string().min(1).optional(),
  /** Vercel account API token (Gateway billing report, REST). */
  VERCEL_API_TOKEN: z.string().min(1).optional(),
  /** CLI / tooling token; used for Gateway reporting when VERCEL_API_TOKEN is unset. */
  VERCEL_TOKEN: z.string().min(1).optional(),
  VERCEL_OIDC_TOKEN: z.string().min(1).optional(),
  VERCEL_ENV: z.string().optional(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AiEnv = z.infer<typeof aiEnvSchema>;

export type NeonAuthEnv = BaseEnv & {
  configured: boolean;
  NEON_AUTH_BASE_URL?: string;
  NEON_AUTH_COOKIE_SECRET?: string;
  NEON_AUTH_SESSION_CACHE_TTL: number;
};

export type BlobEnv = {
  configured: boolean;
  BLOB_READ_WRITE_TOKEN?: string;
  VERCEL_BLOB_CALLBACK_URL?: string;
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

export function resolveMigrationDatabaseUrl(
  input: NodeJS.ProcessEnv = process.env,
): string {
  const parsed = migrationDatabaseEnvSchema.parse(input);
  const url =
    parsed.DATABASE_MIGRATION_URL ??
    parsed.NEON_PREVIEW_DATABASE_URL ??
    parsed.DATABASE_URL;

  if (!url) {
    throw new Error(
      "A database URL is missing. Provide DATABASE_MIGRATION_URL, NEON_PREVIEW_DATABASE_URL, or DATABASE_URL before using drizzle-kit.",
    );
  }

  return url;
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

export function getCronSecret(
  input: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const parsed = cronEnvSchema.safeParse(input);
  return parsed.success ? parsed.data.CRON_SECRET : undefined;
}

export function getVercelDrainSecret(
  input: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const parsed = observabilityEnvSchema.safeParse(input);
  return parsed.success ? parsed.data.VERCEL_DRAIN_SECRET : undefined;
}

export function getBlobEnv(input: NodeJS.ProcessEnv = process.env): BlobEnv {
  const parsed = blobEnvSchema.safeParse(input);

  if (!parsed.success) {
    return { configured: false };
  }

  const { BLOB_READ_WRITE_TOKEN, VERCEL_BLOB_CALLBACK_URL } = parsed.data;

  return {
    configured: Boolean(BLOB_READ_WRITE_TOKEN),
    BLOB_READ_WRITE_TOKEN,
    VERCEL_BLOB_CALLBACK_URL,
  };
}

export function getAiEnv(input: NodeJS.ProcessEnv = process.env): AiEnv {
  return aiEnvSchema.parse(input);
}

export function hasAiGatewayCredentials(
  input: NodeJS.ProcessEnv = process.env,
) {
  const env = getAiEnv(input);
  return Boolean(
    env.AI_GATEWAY_API_KEY ||
      env.VERCEL_API_TOKEN ||
      env.VERCEL_TOKEN ||
      env.VERCEL_OIDC_TOKEN,
  );
}

export function resolveAiGatewayReportApiKey(
  input: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const env = getAiEnv(input);
  return (
    env.AI_GATEWAY_API_KEY ??
    env.VERCEL_API_TOKEN ??
    env.VERCEL_TOKEN ??
    env.VERCEL_OIDC_TOKEN
  );
}

export function describeAiGatewayCredentialSources(
  input: NodeJS.ProcessEnv = process.env,
): {
  hasAiGatewayCredentials: boolean;
  reportApiKeyConfigured: boolean;
  reportApiKeySource:
    | "AI_GATEWAY_API_KEY"
    | "VERCEL_API_TOKEN"
    | "VERCEL_TOKEN"
    | "VERCEL_OIDC_TOKEN"
    | "none";
} {
  const env = getAiEnv(input);
  const reportApiKeySource = env.AI_GATEWAY_API_KEY
    ? "AI_GATEWAY_API_KEY"
    : env.VERCEL_API_TOKEN
      ? "VERCEL_API_TOKEN"
      : env.VERCEL_TOKEN
        ? "VERCEL_TOKEN"
        : env.VERCEL_OIDC_TOKEN
          ? "VERCEL_OIDC_TOKEN"
          : "none";

  return {
    hasAiGatewayCredentials: hasAiGatewayCredentials(input),
    reportApiKeyConfigured: reportApiKeySource !== "none",
    reportApiKeySource,
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
