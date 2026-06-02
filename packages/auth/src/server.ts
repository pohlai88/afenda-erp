import "server-only";

import { cache } from "react";
import {
  bootstrapOrganizationForUser,
  ensureDevDemoTenant,
  getTenantSettings,
  getUserProfile,
  listPermissionKeysByRole,
  listRoleOverridesForOrganization,
  listOrganizationsForUser,
  setDefaultOrganizationForUser,
  upsertUserProfile,
  userHasOrganizationMembership,
} from "@afenda/db";
import {
  isDevAuthBypassEnabled,
  isDevCookieAuthEnabled,
} from "@afenda/config/env";
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
  readOrganizationOperatingContextLabels,
  userSessionSchema,
  type AppCapability,
  type OrganizationSummary,
  type OrganizationRole,
  type UserSession,
} from "./index";
import { getNeonAuthServer, isNeonAuthReady } from "./neon-auth-server";
import { readNeonAuthSessionPayload } from "./neon-session";

const defaultOrganization: OrganizationSummary = {
  membershipId: "member_demo_owner",
  id: DEMO_ORG_ID,
  name: DEMO_ORG_NAME,
  slug: "afenda-operations",
  locale: "en-MY",
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

function decodeSession(value: string): UserSession | null {
  try {
    const session = userSessionSchema.parse(
      JSON.parse(Buffer.from(value, "base64url").toString("utf8")),
    );

    return expandDevSession(session);
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
  return encodeSession(compactDevSession(userSessionSchema.parse(session)));
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

    const activeOrganizationId = resolveActiveOrganizationId({
      defaultOrganizationId: profile?.defaultOrganizationId,
      organizations,
    });

    const sessionOrganizations: OrganizationSummary[] = await Promise.all(
      organizations.map((organization) =>
        hydrateOrganizationSummary(organization, permissionsByRole, {
          includeTenantOverrides:
            organization.id === activeOrganizationId ||
            (!activeOrganizationId && organization.id === organizations[0]?.id),
        }),
      ),
    );

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

function resolveActiveOrganizationId(input: {
  defaultOrganizationId?: string | null;
  organizations: readonly { id: string }[];
}) {
  if (!input.defaultOrganizationId) {
    return input.organizations[0]?.id ?? "";
  }

  return input.organizations.some(
    (organization) => organization.id === input.defaultOrganizationId,
  )
    ? input.defaultOrganizationId
    : (input.organizations[0]?.id ?? "");
}

type RolePermissionMap = Map<OrganizationRole, readonly string[]>;

async function hydrateOrganizationSummary(
  organization: {
    membershipId: string;
    id: string;
    name: string;
    slug: string;
    role: OrganizationRole;
  },
  permissionsByRole: RolePermissionMap,
  options?: { includeTenantOverrides?: boolean },
): Promise<OrganizationSummary> {
  const baseKeys =
    permissionsByRole.get(organization.role) ??
    capabilitiesForRole(organization.role);

  if (!options?.includeTenantOverrides) {
    return {
      ...organization,
      locale: "en-MY",
      capabilities: normalizeCapabilities(baseKeys, organization.role),
    };
  }

  const [overrides, settings] = await Promise.all([
    listRoleOverridesForOrganization({
      organizationId: organization.id,
    }),
    getTenantSettings({
      organizationId: organization.id,
    }),
  ]);
  const permissionKeys = applyRoleOverrides(
    baseKeys,
    overrides,
    organization.role,
  );

  const operatingContextLabels = readOrganizationOperatingContextLabels(
    settings?.branding,
  );

  return {
    ...organization,
    locale: settings?.locale ?? "en-MY",
    capabilities: normalizeCapabilities(permissionKeys, organization.role),
    ...(operatingContextLabels ? { operatingContextLabels } : {}),
  };
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

async function ensureDevSessionTenant(session: UserSession) {
  const organization = session.organizations[0];

  if (!organization) {
    return;
  }

  await ensureDevDemoTenant({
    authUserId: session.id,
    email: session.email,
    name: session.name,
    organizationId: organization.id,
    organizationName: organization.name,
    organizationSlug: organization.slug,
    membershipId: organization.membershipId,
  });
}

export async function bootstrapDevSessionTenant(session: UserSession) {
  await ensureDevSessionTenant(session);
}

async function loadSession(): Promise<UserSession | null> {
  if (isDevAuthBypassEnabled()) {
    // UI/dev loop: in-memory demo session only (no Neon, no tenant bootstrap queries).
    return defaultSession;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(AFENDA_SESSION_COOKIE)?.value;
  const devSession = value ? decodeSession(value) : null;

  if (isDevCookieAuthEnabled() && devSession) {
    await ensureDevSessionTenant(devSession);
    return devSession;
  }

  if (isNeonAuthReady()) {
    return getSessionFromNeonAuth();
  }

  if (devSession) {
    await ensureDevSessionTenant(devSession);
  }

  return devSession;
}

/** Request-scoped session resolution (React.cache dedupes Neon hydration per render). */
export const getSession = cache(loadSession);

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
  const cookieStore = await cookies();

  cookieStore.delete({
    name: AFENDA_SESSION_COOKIE,
    path: "/",
  });

  if (isNeonAuthReady()) {
    await getNeonAuthServer().signOut();
    return;
  }
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

async function loadOrganizationContext() {
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

/** Request-scoped org context (dedupes shell, dashboard, and governed permission gates). */
export const getOrganizationContext = cache(loadOrganizationContext);

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

export async function switchActiveOrganization(organizationId: string) {
  const session = await requireSession();
  const targetOrganization = session.organizations.find(
    (organization) => organization.id === organizationId,
  );

  if (!targetOrganization) {
    throw new Error("Organization is not available for this user.");
  }

  if (session.activeOrganizationId === organizationId) {
    return;
  }

  if (session.source === "neon") {
    const hasMembership = await userHasOrganizationMembership({
      authUserId: session.id,
      organizationId,
    });

    if (!hasMembership) {
      throw new Error("Organization membership is required.");
    }

    await setDefaultOrganizationForUser({
      authUserId: session.id,
      organizationId,
    });

    return;
  }

  const nextSession: UserSession = {
    ...session,
    activeOrganizationId: organizationId,
  };

  const cookieStore = await cookies();
  cookieStore.set(AFENDA_SESSION_COOKIE, createDevSessionCookie(nextSession), {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV === "production" &&
      process.env.AFENDA_E2E_DEV_AUTH !== "1",
    path: "/",
    maxAge: DEV_SESSION_MAX_AGE_SECONDS,
  });
}
