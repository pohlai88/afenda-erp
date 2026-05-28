import type {
  AppCapability,
  OrganizationRole,
  OrganizationSummary,
  UserSession,
} from "@afenda/auth";
import { getActiveOrganization, getSession } from "@afenda/auth/server";
import {
  ExecutionContextRequiredError,
  ExecutionInvalidStateError,
} from "../errors/execution-errors";
import {
  resolveExecutionActor,
  type ExecutionActorType,
} from "../actor/execution-actor";

export type ExecutionContext = {
  organizationId: string;
  organizationSlug: string;
  userId: string;
  membershipId: string;
  locale: string;
  actorType: ExecutionActorType;
  capabilities: readonly AppCapability[];
  role: OrganizationRole;
  sessionSource: UserSession["source"];
};

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
