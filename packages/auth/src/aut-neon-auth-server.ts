import "server-only";

import {
  getNeonAuthEnv,
  isNeonAuthEnabled,
  isNeonAuthUiEnabled,
  type NeonAuthLogLevel,
} from "@afenda/config/env";
import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server";

let neonAuthServer: NeonAuth | null = null;

export function isNeonAuthReady() {
  return isNeonAuthEnabled();
}

export function isNeonAuthUiReady() {
  return isNeonAuthUiEnabled();
}

export function resetNeonAuthServerForTests() {
  neonAuthServer = null;
}

/** @see https://neon.com/docs/auth/reference/nextjs-server#createneonauth */
export function getNeonAuthServer() {
  const env = getNeonAuthEnv();

  if (env.AFENDA_NEON_AUTH_ENABLED !== "1" || !env.configured) {
    throw new Error(
      "Neon Auth is not configured. Set AFENDA_NEON_AUTH_ENABLED=1 and NEON_AUTH_* variables.",
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
      },
      logLevel: env.NEON_AUTH_LOG_LEVEL satisfies NeonAuthLogLevel,
    });
  }

  return neonAuthServer;
}

/** Lazy Neon quickstart alias — supports `auth.getSession()` without eager env reads. */
export const auth: NeonAuth = new Proxy({} as NeonAuth, {
  get(_target, prop, receiver) {
    const server = getNeonAuthServer();
    const value = Reflect.get(server, prop, receiver);
    return typeof value === "function" ? value.bind(server) : value;
  },
});

/** @see https://neon.com/docs/auth/reference/nextjs-server#authsignout */
export async function signOutNeonSession() {
  return getNeonAuthServer().signOut();
}
