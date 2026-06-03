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

const neonAuthLogLevelSchema = z.enum(["silent", "warn", "debug"]).default("warn");

const neonAuthConfigSchema = z.object({
  NEON_AUTH_BASE_URL: z.url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  NEON_AUTH_SESSION_CACHE_TTL: z.coerce.number().int().positive().default(300),
  NEON_AUTH_LOG_LEVEL: neonAuthLogLevelSchema,
  NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS: z.string().optional(),
});

const cronEnvSchema = z.object({
  CRON_SECRET: z.string().min(1),
});

const observabilityEnvSchema = z.object({
  VERCEL_DRAIN_SECRET: z.string().min(1),
});

const logLevelSchema = z
  .enum(["trace", "debug", "info", "warn", "error", "fatal"])
  .default("info");

const loggingEnvSchema = z.object({
  LOG_LEVEL: logLevelSchema,
});

const blobEnvSchema = z.object({
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  VERCEL_BLOB_CALLBACK_URL: z.url().optional(),
});

const objectStorageProviderSchema = z.enum(["vercel-blob", "r2", "s3"]);

const optionalObjectStorageEnvString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().min(1).optional(),
);

const optionalObjectStorageEnvUrl = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.url().optional(),
);

const optionalObjectStorageProvider = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  objectStorageProviderSchema.optional(),
);

const objectStorageEnvSchema = z.object({
  OBJECT_STORAGE_PROVIDER: optionalObjectStorageProvider,
  BLOB_READ_WRITE_TOKEN: optionalObjectStorageEnvString,
  VERCEL_BLOB_CALLBACK_URL: optionalObjectStorageEnvUrl,
  OBJECT_STORAGE_ENDPOINT: optionalObjectStorageEnvUrl,
  OBJECT_STORAGE_BUCKET: optionalObjectStorageEnvString,
  OBJECT_STORAGE_ACCESS_KEY_ID: optionalObjectStorageEnvString,
  OBJECT_STORAGE_SECRET_ACCESS_KEY: optionalObjectStorageEnvString,
  OBJECT_STORAGE_PUBLIC_URL_BASE: optionalObjectStorageEnvUrl,
  AWS_S3_REGION: optionalObjectStorageEnvString,
});

const vaultEnvSchema = z.object({
  VAULT_ADDR: optionalObjectStorageEnvUrl,
  VAULT_TOKEN: optionalObjectStorageEnvString,
  VAULT_TRANSIT_MOUNT: optionalObjectStorageEnvString,
  VAULT_TRANSIT_KEY_PREFIX: optionalObjectStorageEnvString,
});

const awsKmsEnvSchema = z.object({
  AWS_KMS_REGION: optionalObjectStorageEnvString,
});

const optionalNonEmptyEnvString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().min(1).optional(),
);

const aiEnvSchema = z.object({
  AFENDA_AI_MODEL: optionalNonEmptyEnvString,
  AFENDA_AI_FAST_MODEL: optionalNonEmptyEnvString,
  AFENDA_AI_HIGH_CONFIDENCE_MODEL: optionalNonEmptyEnvString,
  RERANK_MODEL: optionalNonEmptyEnvString,
  AI_GATEWAY_API_KEY: optionalNonEmptyEnvString,
  /** Vercel account API token for management APIs; not a Gateway runtime credential. */
  VERCEL_API_TOKEN: optionalNonEmptyEnvString,
  /** CLI / tooling token for Vercel management APIs; not a Gateway runtime credential. */
  VERCEL_TOKEN: optionalNonEmptyEnvString,
  VERCEL_OIDC_TOKEN: optionalNonEmptyEnvString,
  VERCEL_ENV: optionalNonEmptyEnvString,
});

const documentAvEnvSchema = z.object({
  DOCUMENT_AV_API_URL: optionalNonEmptyEnvString,
  DOCUMENT_AV_API_KEY: optionalNonEmptyEnvString,
  DOCUMENT_AV_WEBHOOK_SECRET: optionalNonEmptyEnvString,
  DOCUMENT_AV_STALE_SCANNING_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(30),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AiEnv = z.infer<typeof aiEnvSchema>;
export type LogLevel = z.infer<typeof logLevelSchema>;

export type NeonAuthLogLevel = z.infer<typeof neonAuthLogLevelSchema>;

export type NeonAuthEnv = BaseEnv & {
  configured: boolean;
  NEON_AUTH_BASE_URL?: string;
  NEON_AUTH_COOKIE_SECRET?: string;
  NEON_AUTH_SESSION_CACHE_TTL: number;
  NEON_AUTH_LOG_LEVEL: NeonAuthLogLevel;
  NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS?: string;
};

export type BlobEnv = {
  configured: boolean;
  BLOB_READ_WRITE_TOKEN?: string;
  VERCEL_BLOB_CALLBACK_URL?: string;
};

export type ObjectStorageProviderId = "vercel-blob" | "r2" | "s3";

export type ObjectStorageR2Env = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrlBase?: string;
};

export type ObjectStorageS3Env = {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrlBase?: string;
};

export type VaultEnv = {
  configured: boolean;
  addr: string;
  token: string;
  transitMount: string;
  transitKeyPrefix: string;
};

export type AwsKmsEnv = {
  configured: boolean;
  region: string;
};

export type ObjectStorageEnv = {
  provider: ObjectStorageProviderId;
  configured: boolean;
  vercelBlob?: BlobEnv & { BLOB_READ_WRITE_TOKEN: string };
  r2?: ObjectStorageR2Env;
  s3?: ObjectStorageS3Env;
};

export type DocumentAvEnv = {
  apiUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
  staleScanningMinutes: number;
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
      NEON_AUTH_LOG_LEVEL: "warn",
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

export function getLogLevel(input: NodeJS.ProcessEnv = process.env): LogLevel {
  return loggingEnvSchema.parse(input).LOG_LEVEL;
}

export function getDocumentAvEnv(
  input: NodeJS.ProcessEnv = process.env,
): DocumentAvEnv {
  const parsed = documentAvEnvSchema.safeParse(input);

  if (!parsed.success) {
    return { staleScanningMinutes: 30 };
  }

  return {
    apiUrl: parsed.data.DOCUMENT_AV_API_URL,
    apiKey: parsed.data.DOCUMENT_AV_API_KEY,
    webhookSecret: parsed.data.DOCUMENT_AV_WEBHOOK_SECRET,
    staleScanningMinutes: parsed.data.DOCUMENT_AV_STALE_SCANNING_MINUTES,
  };
}

export function getDocumentAvWebhookSecret(
  input: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return getDocumentAvEnv(input).webhookSecret;
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

function parseS3Env(
  data: z.infer<typeof objectStorageEnvSchema>,
): ObjectStorageS3Env | undefined {
  if (
    !data.OBJECT_STORAGE_BUCKET ||
    !data.OBJECT_STORAGE_ACCESS_KEY_ID ||
    !data.OBJECT_STORAGE_SECRET_ACCESS_KEY
  ) {
    return undefined;
  }

  return {
    region: data.AWS_S3_REGION ?? "ap-southeast-1",
    bucket: data.OBJECT_STORAGE_BUCKET,
    accessKeyId: data.OBJECT_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: data.OBJECT_STORAGE_SECRET_ACCESS_KEY,
    publicUrlBase: data.OBJECT_STORAGE_PUBLIC_URL_BASE,
  };
}

function parseR2Env(
  data: z.infer<typeof objectStorageEnvSchema>,
): ObjectStorageR2Env | undefined {
  if (
    !data.OBJECT_STORAGE_ENDPOINT ||
    !data.OBJECT_STORAGE_BUCKET ||
    !data.OBJECT_STORAGE_ACCESS_KEY_ID ||
    !data.OBJECT_STORAGE_SECRET_ACCESS_KEY
  ) {
    return undefined;
  }

  return {
    endpoint: data.OBJECT_STORAGE_ENDPOINT,
    bucket: data.OBJECT_STORAGE_BUCKET,
    accessKeyId: data.OBJECT_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: data.OBJECT_STORAGE_SECRET_ACCESS_KEY,
    publicUrlBase: data.OBJECT_STORAGE_PUBLIC_URL_BASE,
  };
}

function normalizeObjectStorageProcessEnv(
  input: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...input };

  const read = (key: string) => env[key]?.trim();

  if (!read("OBJECT_STORAGE_ENDPOINT")) {
    const legacyEndpoint = read("R2_ENDPOINT");
    if (legacyEndpoint) {
      env.OBJECT_STORAGE_ENDPOINT = legacyEndpoint;
    } else {
      const accountId = read("R2_ACCOUNT_ID");
      if (accountId) {
        env.OBJECT_STORAGE_ENDPOINT = `https://${accountId}.r2.cloudflarestorage.com`;
      }
    }
  }

  if (!read("OBJECT_STORAGE_BUCKET") && read("R2_BUCKET_NAME")) {
    env.OBJECT_STORAGE_BUCKET = read("R2_BUCKET_NAME");
  }

  if (!read("OBJECT_STORAGE_ACCESS_KEY_ID") && read("R2_ACCESS_KEY_ID")) {
    env.OBJECT_STORAGE_ACCESS_KEY_ID = read("R2_ACCESS_KEY_ID");
  }

  if (!read("OBJECT_STORAGE_SECRET_ACCESS_KEY") && read("R2_SECRET_ACCESS_KEY")) {
    env.OBJECT_STORAGE_SECRET_ACCESS_KEY = read("R2_SECRET_ACCESS_KEY");
  }

  return env;
}

export function getObjectStorageEnv(
  input: NodeJS.ProcessEnv = process.env,
): ObjectStorageEnv {
  const normalized = normalizeObjectStorageProcessEnv(input);
  const parsed = objectStorageEnvSchema.safeParse(normalized);

  if (!parsed.success) {
    return { provider: "vercel-blob", configured: false };
  }

  const data = parsed.data;
  const vercelBlob = getBlobEnv(normalized);
  const r2 = parseR2Env(data);
  const s3 = parseS3Env(data);

  const explicitProvider = data.OBJECT_STORAGE_PROVIDER;
  let provider: ObjectStorageProviderId;

  if (explicitProvider) {
    provider = explicitProvider;
  } else if (vercelBlob.configured) {
    provider = "vercel-blob";
  } else if (r2) {
    provider = "r2";
  } else if (s3) {
    provider = "s3";
  } else {
    return { provider: "vercel-blob", configured: false };
  }

  if (provider === "vercel-blob") {
    if (!vercelBlob.configured || !vercelBlob.BLOB_READ_WRITE_TOKEN) {
      return { provider, configured: false };
    }

    return {
      provider,
      configured: true,
      vercelBlob: {
        ...vercelBlob,
        BLOB_READ_WRITE_TOKEN: vercelBlob.BLOB_READ_WRITE_TOKEN,
      },
    };
  }

  if (provider === "s3") {
    if (!s3) {
      return { provider: "s3", configured: false };
    }

    return {
      provider: "s3",
      configured: true,
      s3,
    };
  }

  if (!r2) {
    return { provider: "r2", configured: false };
  }

  return {
    provider: "r2",
    configured: true,
    r2,
  };
}

export function getVaultEnv(
  input: NodeJS.ProcessEnv = process.env,
): VaultEnv {
  const parsed = vaultEnvSchema.safeParse(input);

  if (!parsed.success || !parsed.data.VAULT_ADDR || !parsed.data.VAULT_TOKEN) {
    return {
      configured: false,
      addr: "",
      token: "",
      transitMount: "transit",
      transitKeyPrefix: "afenda/org-",
    };
  }

  return {
    configured: true,
    addr: parsed.data.VAULT_ADDR,
    token: parsed.data.VAULT_TOKEN,
    transitMount: parsed.data.VAULT_TRANSIT_MOUNT ?? "transit",
    transitKeyPrefix: parsed.data.VAULT_TRANSIT_KEY_PREFIX ?? "afenda/org-",
  };
}

export function getAwsKmsEnv(
  input: NodeJS.ProcessEnv = process.env,
): AwsKmsEnv {
  const parsed = awsKmsEnvSchema.safeParse(input);

  return {
    configured: true,
    region: parsed.success
      ? (parsed.data.AWS_KMS_REGION ?? "ap-southeast-1")
      : "ap-southeast-1",
  };
}

export function getAiEnv(input: NodeJS.ProcessEnv = process.env): AiEnv {
  return aiEnvSchema.parse(input);
}

export type AiGatewayRuntimeCredentialSource =
  | "AI_GATEWAY_API_KEY"
  | "VERCEL_OIDC_TOKEN"
  | "none";

export type VercelManagementCredentialSource =
  | "VERCEL_API_TOKEN"
  | "VERCEL_TOKEN"
  | "none";

function getAiGatewayRuntimeCredentialSource(
  env: AiEnv,
): AiGatewayRuntimeCredentialSource {
  if (env.AI_GATEWAY_API_KEY) {
    return "AI_GATEWAY_API_KEY";
  }

  if (env.VERCEL_OIDC_TOKEN) {
    return "VERCEL_OIDC_TOKEN";
  }

  return "none";
}

function getVercelManagementCredentialSource(
  env: AiEnv,
): VercelManagementCredentialSource {
  if (env.VERCEL_API_TOKEN) {
    return "VERCEL_API_TOKEN";
  }

  if (env.VERCEL_TOKEN) {
    return "VERCEL_TOKEN";
  }

  return "none";
}

export function hasAiGatewayRuntimeCredentials(
  input: NodeJS.ProcessEnv = process.env,
) {
  const env = getAiEnv(input);
  return getAiGatewayRuntimeCredentialSource(env) !== "none";
}

/**
 * @deprecated Use hasAiGatewayRuntimeCredentials. VERCEL_API_TOKEN and
 * VERCEL_TOKEN are management credentials and do not authorize model calls.
 */
export function hasAiGatewayCredentials(
  input: NodeJS.ProcessEnv = process.env,
) {
  return hasAiGatewayRuntimeCredentials(input);
}

export function resolveAiGatewayReportApiKey(
  input: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const env = getAiEnv(input);
  return env.AI_GATEWAY_API_KEY ?? env.VERCEL_OIDC_TOKEN;
}

export function describeAiGatewayCredentialSources(
  input: NodeJS.ProcessEnv = process.env,
): {
  hasAiGatewayCredentials: boolean;
  hasAiGatewayRuntimeCredentials: boolean;
  runtimeCredentialSource: AiGatewayRuntimeCredentialSource;
  reportApiKeyConfigured: boolean;
  reportApiKeySource: AiGatewayRuntimeCredentialSource;
  vercelManagementTokenConfigured: boolean;
  vercelManagementTokenSource: VercelManagementCredentialSource;
} {
  const env = getAiEnv(input);
  const runtimeCredentialSource = getAiGatewayRuntimeCredentialSource(env);
  const vercelManagementTokenSource = getVercelManagementCredentialSource(env);

  return {
    hasAiGatewayCredentials: hasAiGatewayCredentials(input),
    hasAiGatewayRuntimeCredentials: hasAiGatewayRuntimeCredentials(input),
    runtimeCredentialSource,
    reportApiKeyConfigured: runtimeCredentialSource !== "none",
    reportApiKeySource: runtimeCredentialSource,
    vercelManagementTokenConfigured: vercelManagementTokenSource !== "none",
    vercelManagementTokenSource,
  };
}

export function isNeonAuthEnabled(input: NodeJS.ProcessEnv = process.env) {
  const env = getNeonAuthEnv(input);
  return env.AFENDA_NEON_AUTH_ENABLED === "1" && env.configured;
}

/** Browser flag — when unset, Neon UI follows server `isNeonAuthEnabled`. */
export function isNeonAuthPublicUiEnabled(
  input: NodeJS.ProcessEnv = process.env,
) {
  const value = input.NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED?.trim();
  if (!value) {
    return true;
  }
  return value === "1";
}

/** Server Neon configured and client flag allows Neon SDK forms. */
export function isNeonAuthUiEnabled(input: NodeJS.ProcessEnv = process.env) {
  return isNeonAuthEnabled(input) && isNeonAuthPublicUiEnabled(input);
}

/** Browser auth client target (Neon quickstart: `NEXT_PUBLIC_AUTH_URL` → `/api/auth` proxy). */
export function getNeonAuthPublicUrl(
  input: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const value = input.NEXT_PUBLIC_AUTH_URL?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function isDevAuthBypassEnabled(input: NodeJS.ProcessEnv = process.env) {
  const env = getBaseEnv(input);
  return env.NODE_ENV === "development" && env.AFENDA_DEV_AUTH_BYPASS === "1";
}

export function isDevCookieAuthEnabled(input: NodeJS.ProcessEnv = process.env) {
  const env = getBaseEnv(input);

  if (env.NODE_ENV === "production") {
    return env.AFENDA_E2E_DEV_AUTH === "1" && !isNeonAuthEnabled(input);
  }

  return true;
}
