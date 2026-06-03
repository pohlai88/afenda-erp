import "server-only";

import {
  capabilitiesForRole,
  type AppCapability,
} from "../contracts/auth.capability-policy.shared";
import {
  userSessionSchema,
  type UserSession,
} from "../contracts/auth.session-contracts.shared";

const compactDevSessionCapabilities: AppCapability[] = ["dashboard.view"];

function encodeSession(session: UserSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function compactDevSession(session: UserSession): UserSession {
  if (session.source !== "dev") {
    return session;
  }

  return {
    ...session,
    organizations: session.organizations.map((organization) => ({
      ...organization,
      capabilities: [...compactDevSessionCapabilities],
    })),
  };
}

function expandDevSession(session: UserSession): UserSession {
  if (session.source !== "dev") {
    return session;
  }

  return userSessionSchema.parse({
    ...session,
    organizations: session.organizations.map((organization) => ({
      ...organization,
      capabilities: capabilitiesForRole(organization.role),
    })),
  });
}

export function serializeDevSessionCookie(session: UserSession) {
  return encodeSession(compactDevSession(userSessionSchema.parse(session)));
}

export function parseDevSessionCookie(value: string): UserSession | null {
  try {
    const session = userSessionSchema.parse(
      JSON.parse(Buffer.from(value, "base64url").toString("utf8")),
    );

    return expandDevSession(session);
  } catch {
    return null;
  }
}
