/** Env vars read by `@afenda/auth` via `@afenda/config/env`. @see Neon quickstart. */
export const neonAuthEnvKeys = [
  "AFENDA_NEON_AUTH_ENABLED",
  "NEON_AUTH_BASE_URL",
  "NEON_AUTH_COOKIE_SECRET",
  "NEON_AUTH_SESSION_CACHE_TTL",
  "NEON_AUTH_LOG_LEVEL",
  "NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS",
  "NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED",
  "NEXT_PUBLIC_AUTH_URL",
] as const;

export type NeonAuthEnvKey = (typeof neonAuthEnvKeys)[number];
