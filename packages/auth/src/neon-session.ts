import "server-only";

import { getNeonAuthEnv } from "@afenda/config/env";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  NEON_AUTH_SESSION_DATA_COOKIE,
  NEON_AUTH_SESSION_TOKEN_COOKIE,
  hasNeonAuthSessionToken,
} from "./neon-cookies";

export { hasNeonAuthSessionToken };

type NeonAuthSessionPayload = {
  session: {
    id: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

const neonAuthSessionPayloadSchema = z.object({
  session: z.object({
    id: z.string().min(1),
    expiresAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
  user: z.object({
    id: z.string().min(1),
    name: z.string(),
    email: z.email(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

function parseNeonAuthSessionPayload(
  payload: Record<string, unknown>,
): NeonAuthSessionPayload | null {
  const parsed = neonAuthSessionPayloadSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

export async function readNeonAuthSessionPayload(): Promise<NeonAuthSessionPayload | null> {
  const env = getNeonAuthEnv();

  if (
    !env.configured ||
    !env.NEON_AUTH_COOKIE_SECRET ||
    !env.NEON_AUTH_BASE_URL
  ) {
    return null;
  }

  const cookieStore = await cookies();
  const sessionData = cookieStore.get(NEON_AUTH_SESSION_DATA_COOKIE)?.value;
  const sessionToken = cookieStore.get(NEON_AUTH_SESSION_TOKEN_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  if (sessionData) {
    try {
      const { payload } = await jwtVerify(
        sessionData,
        new TextEncoder().encode(env.NEON_AUTH_COOKIE_SECRET),
        { algorithms: ["HS256"] },
      );

      if (payload && typeof payload === "object") {
        const parsed = parseNeonAuthSessionPayload(
          payload as Record<string, unknown>,
        );

        if (parsed) {
          return parsed;
        }
      }
    } catch {
      // Fall through to upstream session fetch when the signed cookie is stale.
    }
  }

  return fetchNeonAuthSessionFromUpstream(
    `${NEON_AUTH_SESSION_TOKEN_COOKIE}=${sessionToken}`,
    env.NEON_AUTH_BASE_URL,
  );
}

async function fetchNeonAuthSessionFromUpstream(
  sessionTokenCookie: string,
  baseUrl: string,
): Promise<NeonAuthSessionPayload | null> {
  try {
    const response = await fetch(`${baseUrl}/get-session`, {
      headers: { Cookie: sessionTokenCookie },
      signal: AbortSignal.timeout(3_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as unknown;

    if (!body || typeof body !== "object") {
      return null;
    }

    return parseNeonAuthSessionPayload(body as Record<string, unknown>);
  } catch {
    return null;
  }
}
