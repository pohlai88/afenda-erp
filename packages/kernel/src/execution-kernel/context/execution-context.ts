import {
  getActiveOrganization,
  getCapabilitiesForOrganizationRole,
  isOrganizationRole,
  type AppCapability,
  type OrganizationSummary,
  type UserSession,
} from "@afenda/auth";
import { readNeonAuthSessionPayload } from "@afenda/auth/server";
import { getUserProfile, listOrganizationsForUser } from "@afenda/db";
import {
  ExecutionContextRequiredError,
  ExecutionInvalidStateError,
} from "../errors/execution-errors";
import {
  resolveExecutionActor,
  type ExecutionActorType,
} from "../actor/execution-actor";

export type {
  ExecutionAuthorityContext,
  ExecutionContext,
} from "./execution-context-types";
export { toExecutionAuthorityContext } from "./execution-context-types";
import type { ExecutionContext } from "./execution-context-types";

function buildExecutionContext(input: {
  session: UserSession;
  organization: OrganizationSummary;
  actorType?: ExecutionActorType;
}): ExecutionContext {
  const actor = resolveExecutionActor({
    session: input.session,
    actorType: input.actorType,
  });

  if (!input.organization.membershipId) {
    throw new ExecutionInvalidStateError(
      `Organization ${input.organization.id} is missing membership scope.`,
    );
  }

  return {
    organizationId: input.organization.id,
    organizationSlug: input.organization.slug,
    userId: actor.actorId,
    membershipId: input.organization.membershipId,
    locale: input.organization.locale,
    actorType: actor.actorType,
    capabilities: input.organization.capabilities,
    role: input.organization.role,
    sessionSource: actor.sessionSource,
  };
}

export async function resolveExecutionContext(input?: {
  actorType?: ExecutionActorType;
}) {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const organization = getActiveOrganization(session);
  if (!organization) {
    return null;
  }

  return buildExecutionContext({
    session,
    organization,
    actorType: input?.actorType,
  });
}

export async function getSession(): Promise<UserSession | null> {
  const neonSession = await readNeonAuthSessionPayload();
  if (!neonSession?.user) {
    return null;
  }

  const [profile, organizations] = await Promise.all([
    getUserProfile(neonSession.user.id),
    listOrganizationsForUser(neonSession.user.id),
  ]);

  const organizationSummaries: OrganizationSummary[] = organizations
    .filter((organization) => isOrganizationRole(organization.role))
    .map((organization) => ({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      membershipId: organization.membershipId,
      role: organization.role,
      locale: "en-MY",
      capabilities: getCapabilitiesForOrganizationRole(organization.role),
    }));

  const activeOrganizationId =
    organizationSummaries.find(
      (organization) => organization.id === profile?.defaultOrganizationId,
    )?.id ??
    organizationSummaries[0]?.id ??
    null;

  return {
    source: "neon",
    id: neonSession.user.id,
    name: neonSession.user.name,
    email: neonSession.user.email,
    user: {
      id: neonSession.user.id,
      name: neonSession.user.name,
      email: neonSession.user.email,
    },
    organizations: organizationSummaries,
    activeOrganizationId,
  };
}

export type OrganizationContext = {
  organization: OrganizationSummary;
  user: UserSession["user"];
  session: UserSession;
  capabilities: readonly AppCapability[];
  hasCapability: (capability: AppCapability) => boolean;
};

export type ApiAuthContext = OrganizationContext;

export async function getOrganizationContext(): Promise<OrganizationContext> {
  const session = await getSession();
  const organization = session ? getActiveOrganization(session) : null;

  if (!session || !organization) {
    throw new ExecutionContextRequiredError(
      "An authenticated actor and active organization are required.",
    );
  }

  return {
    organization,
    user: session.user,
    session,
    capabilities: organization.capabilities,
    hasCapability: (capability) => organization.capabilities.includes(capability),
  };
}

export async function getApiAuthContext(): Promise<ApiAuthContext | Response> {
  try {
    return await getOrganizationContext();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function requireCapability(capability: AppCapability) {
  const context = await getOrganizationContext();
  if (!context.hasCapability(capability)) {
    throw new ExecutionInvalidStateError(
      `Missing required capability: ${capability}`,
    );
  }
  return context;
}

export async function requireExecutionContext(input?: {
  actorType?: ExecutionActorType;
}) {
  const context = await resolveExecutionContext(input);

  if (!context) {
    throw new ExecutionContextRequiredError(
      "An authenticated actor and active organization are required.",
    );
  }

  return context;
}
