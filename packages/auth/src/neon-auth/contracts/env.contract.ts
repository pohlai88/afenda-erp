/**
 * Environment variables read by neon-auth runtime.
 * @see https://neon.com/docs/auth/reference/nextjs-server#environment-variables
 */
export const neonAuthRequiredServerEnv = [
  "NEON_AUTH_BASE_URL",
  "NEON_AUTH_COOKIE_SECRET",
] as const;

export const neonAuthOptionalServerEnv = [
  "NEON_AUTH_SESSION_CACHE_TTL",
  "NEON_AUTH_LOG_LEVEL",
  "AFENDA_NEON_AUTH_ENABLED",
  "NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS",
] as const;

export const neonAuthPublicEnv = [
  "NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED",
  "NEXT_PUBLIC_AUTH_URL",
] as const;
