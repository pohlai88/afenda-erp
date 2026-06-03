import "server-only";

import { getNeonAuthEnv } from "@afenda/config/env";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { neonAuthJwksUrl } from "./jwks.shared.server";

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let cachedJwksBaseUrl: string | undefined;

function jwksFor(baseUrl: string) {
  if (cachedJwks && cachedJwksBaseUrl === baseUrl) return cachedJwks;
  cachedJwks = createRemoteJWKSet(neonAuthJwksUrl(baseUrl));
  cachedJwksBaseUrl = baseUrl;
  return cachedJwks;
}

export function resetNeonAuthJwtVerifyCacheForTests() {
  cachedJwks = undefined;
  cachedJwksBaseUrl = undefined;
}

/** @see https://neon.com/docs/auth/guides/plugins/jwt */
export async function verifyNeonAuthAccessToken(token: string): Promise<JWTPayload> {
  const baseUrl = getNeonAuthEnv().NEON_AUTH_BASE_URL;
  if (!baseUrl) throw new Error("Neon Auth is not configured.");
  const issuer = new URL(baseUrl).origin;
  const { payload } = await jwtVerify(token, jwksFor(baseUrl), { issuer, audience: issuer });
  return payload;
}
