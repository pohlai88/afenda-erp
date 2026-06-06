import { createNeonAuth } from "@neondatabase/auth/next/server";

import { getNeonAuthEnv } from "@afenda/config/env";

export type NeonAuthMiddleware = ReturnType<
  ReturnType<typeof createNeonAuth>["middleware"]
>;

export function getNeonAuthMiddleware(loginUrl = "/sign-in") {
  const env = getNeonAuthEnv();

  if (env.AFENDA_NEON_AUTH_ENABLED !== "1" || !env.configured) {
    return undefined;
  }

  if (!env.NEON_AUTH_BASE_URL || !env.NEON_AUTH_COOKIE_SECRET) {
    return undefined;
  }

  return createNeonAuth({
    baseUrl: env.NEON_AUTH_BASE_URL,
    cookies: {
      secret: env.NEON_AUTH_COOKIE_SECRET,
      sessionDataTtl: env.NEON_AUTH_SESSION_CACHE_TTL,
    },
    logLevel: env.NEON_AUTH_LOG_LEVEL,
  }).middleware({ loginUrl });
}
