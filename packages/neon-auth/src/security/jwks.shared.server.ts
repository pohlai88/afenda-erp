import "server-only";

import { getNeonAuthEnv } from "@afenda/config/env";
import type { JsonWebKey } from "node:crypto";

export type NeonAuthJwkKey = JsonWebKey & { kid?: string };

const JWKS_CACHE_TTL_MS = 5 * 60 * 1000;

let jwksCache:
  | { fetchedAt: number; keys: NeonAuthJwkKey[]; baseUrl: string }
  | undefined;

export function resetNeonAuthJwksCacheForTests() {
  jwksCache = undefined;
}

export function neonAuthJwksUrl(baseUrl: string) {
  return new URL(".well-known/jwks.json", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
}

async function fetchJwksKeys(baseUrl: string, force = false): Promise<NeonAuthJwkKey[]> {
  const now = Date.now();
  if (
    !force &&
    jwksCache &&
    jwksCache.baseUrl === baseUrl &&
    now - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS
  ) {
    return jwksCache.keys;
  }

  const response = await fetch(neonAuthJwksUrl(baseUrl), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch Neon Auth JWKS (${response.status}).`);
  }

  const body = (await response.json()) as { keys?: NeonAuthJwkKey[] };
  const keys = body.keys ?? [];
  jwksCache = { fetchedAt: now, keys, baseUrl };
  return keys;
}

/** Resolves a JWKS key by kid, refetching once when the kid is missing (key rotation). */
export async function getNeonAuthJwkByKid(
  kid: string,
  options?: { forceRefetch?: boolean },
): Promise<NeonAuthJwkKey> {
  const baseUrl = getNeonAuthEnv().NEON_AUTH_BASE_URL;
  if (!baseUrl) throw new Error("Neon Auth is not configured.");

  let keys = await fetchJwksKeys(baseUrl, options?.forceRefetch);
  let jwk = keys.find((key) => key.kid === kid);

  if (!jwk && !options?.forceRefetch) {
    keys = await fetchJwksKeys(baseUrl, true);
    jwk = keys.find((key) => key.kid === kid);
  }

  if (!jwk) throw new Error(`JWKS key ${kid} not found.`);
  return jwk;
}
