import { getNeonAuthEnv, isNeonAuthEnabled } from "@afenda/config/env";
import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server";

let neonAuthServer: NeonAuth | null = null;

export function isNeonAuthReady() {
  return isNeonAuthEnabled();
}

export function getNeonAuthServer() {
  const env = getNeonAuthEnv();

  if (env.AFENDA_NEON_AUTH_ENABLED !== "1" || !env.configured) {
    throw new Error(
      "Neon Auth is not configured. Provide the required NEON_AUTH_* variables before using auth routes.",
    );
  }

  const baseUrl = env.NEON_AUTH_BASE_URL;
  const cookieSecret = env.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl || !cookieSecret) {
    throw new Error("Neon Auth variables are incomplete.");
  }

  if (!neonAuthServer) {
    neonAuthServer = createNeonAuth({
      baseUrl,
      cookies: {
        secret: cookieSecret,
        sessionDataTtl: env.NEON_AUTH_SESSION_CACHE_TTL,
        sameSite: "lax",
      },
      logLevel: "warn",
    });
  }

  return neonAuthServer;
}
