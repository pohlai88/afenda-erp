import "server-only";

import {
  bootstrapOrganizationForUser,
  getUserProfile,
  listPermissionKeysByRole,
  listRoleOverridesForOrganization,
  listOrganizationsForUser,
  upsertUserProfile,
} from "@afenda/db";
import { isDevAuthBypassEnabled } from "@afenda/config/env";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  AFENDA_SESSION_COOKIE,
  DEMO_ORG_ID,
  DEMO_ORG_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  DEMO_USER_NAME,
  DEV_SESSION_MAX_AGE_SECONDS,
  appCapabilities,
  capabilitiesForRole,
  normalizeCapabilities,
  userSessionSchema,
  type AppCapability,
  type OrganizationSummary,
  type OrganizationRole,
  type UserSession,
} from "./index";
import { getNeonAuthServer, isNeonAuthReady } from "./neon-auth-server";
import { readNeonAuthSessionPayload } from "./neon-session";

const defaultOrganization: OrganizationSummary = {
  id: DEMO_ORG_ID,
  name: DEMO_ORG_NAME,
  slug: "afenda-operations",
  role: "owner",
  capabilities: [...appCapabilities],
};

const defaultSession: UserSession = {
  source: "dev",
  id: DEMO_USER_ID,
  name: DEMO_USER_NAME,
  email: DEMO_USER_EMAIL,
  activeOrganizationId: defaultOrganization.id,
  organizations: [defaultOrganization],
};

function encodeSession(session: UserSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string): UserSession | null {
  try {
    return userSessionSchema.parse(
      JSON.parse(Buffer.from(value, "base64url").toString("utf8")),
    );
  } catch {
    return null;
  }
}

export { isNeonAuthReady, getNeonAuthServer } from "./neon-auth-server";
export {
  hasDocumentReadAccess,
  hasDocumentWriteAccess,
  documentReadCapability,
  documentWriteCapability,
} from "./index";

export function createDevSessionCookie(session: UserSession) {
  return encodeSession(userSessionSchema.parse(session));
}

export function getDevSessionCookieMaxAge() {
  return DEV_SESSION_MAX_AGE_SECONDS;
}

async function getSessionFromNeonAuth() {
  const cachedSession = await readNeonAuthSessionPayload();

  if (!cachedSession?.user) {
    return null;
  }

  const user = cachedSession.user;

  try {
    await upsertUserProfile({
      authUserId: user.id,
      email: user.email,
      name: user.name,
    });

    const [profile, organizations] = await Promise.all([
      getUserProfile(user.id),
      listOrganizationsForUser(user.id),
    ]);

    const permissionsByRole = await listPermissionKeysByRole(
      organizations.map((organization) => organization.role),
    );

    const sessionOrganizations: OrganizationSummary[] = await Promise.all(
      organizations.map(async (organization) => {
        const baseKeys =
          permissionsByRole.get(organization.role) ??
          capabilitiesForRole(organization.role);
        const overrides = await listRoleOverridesForOrganization({
          organizationId: organization.id,
        });
        const permissionKeys = applyRoleOverrides(
          baseKeys,
          overrides,
          organization.role,
        );

        return {
          ...organization,
          capabilities: normalizeCapabilities(permissionKeys, organization.role),
        };
      }),
    );

    const activeOrganizationId =
      profile?.defaultOrganizationId &&
      sessionOrganizations.some(
        (organization) => organization.id === profile.defaultOrganizationId,
      )
        ? profile.defaultOrganizationId
        : (sessionOrganizations[0]?.id ?? "");

    return userSessionSchema.parse({
      source: "neon",
      id: user.id,
      name: user.name,
      email: user.email,
      activeOrganizationId,
      organizations: sessionOrganizations,
    });
  } catch (error) {
    console.error(
      "[auth] Failed to hydrate Neon session from tenant database.",
      error,
    );

    return userSessionSchema.parse({
      source: "neon",
      id: user.id,
      name: user.name,
      email: user.email,
      activeOrganizationId: "",
      organizations: [],
    });
  }
}

export type ApiAuthContext = {
  session: UserSession;
  organization: OrganizationSummary;
};

export async function getApiAuthContext(): Promise<
  ApiAuthContext | NextResponse<{ error: string }>
> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    );
  }

  const organization = getActiveOrganization(session);

  if (!organization) {
    return NextResponse.json(
      { error: "An active organization is required." },
      { status: 409 },
    );
  }

  return { session, organization };
}

function applyRoleOverrides(
  baseKeys: readonly string[],
  overrides: ReadonlyArray<{
    role: OrganizationRole;
    permissionKey: string;
    enabled: boolean;
  }>,
  role: OrganizationRole,
) {
  const keys = new Set(baseKeys);

  for (const override of overrides) {
    if (override.role !== role) {
      continue;
    }

    if (override.enabled) {
      keys.add(override.permissionKey);
    } else {
      keys.delete(override.permissionKey);
    }
  }

  return [...keys];
}

export async function getSession() {
  if (isDevAuthBypassEnabled()) {
    return defaultSession;
  }

  if (isNeonAuthReady()) {
    return getSessionFromNeonAuth();
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(AFENDA_SESSION_COOKIE)?.value;

  return value ? decodeSession(value) : null;
}

export function getPostSignInDestination(session: UserSession) {
  return session.organizations.length > 0 ? "/dashboard" : "/onboarding";
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function signOut() {
  if (isNeonAuthReady()) {
    await getNeonAuthServer().signOut();
    return;
  }

  const cookieStore = await cookies();
  cookieStore.delete({
    name: AFENDA_SESSION_COOKIE,
    path: "/",
  });
}

export function getActiveOrganization(session: UserSession) {
  return (
    session.organizations.find(
      (organization) => organization.id === session.activeOrganizationId,
    ) ??
    session.organizations[0] ??
    null
  );
}

export async function getOrganizationContext() {
  const session = await requireSession();
  const organization = getActiveOrganization(session);

  if (!organization) {
    redirect("/onboarding");
  }

  return {
    session,
    organization,
    hasCapability(capability: AppCapability) {
      return organization.capabilities.includes(capability);
    },
  };
}

export async function requireCapability(capability: AppCapability) {
  const context = await getOrganizationContext();

  if (!context.hasCapability(capability)) {
    notFound();
  }

  return context;
}

export async function bootstrapCurrentUserOrganization(
  organizationName: string,
) {
  const session = await requireSession();

  if (session.source !== "neon") {
    return defaultOrganization.id;
  }

  return bootstrapOrganizationForUser({
    authUserId: session.id,
    email: session.email,
    name: session.name,
    organizationName,
  });
}
