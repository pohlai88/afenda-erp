import "server-only";

import { getNeonAuthEnv } from "@afenda/config/env";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
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

function parseDate(value: unknown, field: string) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  throw new Error(`Invalid date for ${field}`);
}

function parseNeonAuthSessionPayload(
  payload: Record<string, unknown>,
): NeonAuthSessionPayload | null {
  const session = payload.session;
  const user = payload.user;

  if (
    !session ||
    typeof session !== "object" ||
    !user ||
    typeof user !== "object"
  ) {
    return null;
  }

  const sessionRecord = session as Record<string, unknown>;
  const userRecord = user as Record<string, unknown>;

  if (
    typeof sessionRecord.id !== "string" ||
    typeof userRecord.id !== "string" ||
    typeof userRecord.name !== "string" ||
    typeof userRecord.email !== "string"
  ) {
    return null;
  }

  return {
    session: {
      id: sessionRecord.id,
      expiresAt: parseDate(sessionRecord.expiresAt, "session.expiresAt"),
      createdAt: parseDate(sessionRecord.createdAt, "session.createdAt"),
      updatedAt: parseDate(sessionRecord.updatedAt, "session.updatedAt"),
    },
    user: {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      createdAt: parseDate(userRecord.createdAt, "user.createdAt"),
      updatedAt: parseDate(userRecord.updatedAt, "user.updatedAt"),
    },
  };
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

