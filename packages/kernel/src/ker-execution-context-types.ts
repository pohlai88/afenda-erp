import type {
  AppCapability,
  OrganizationRole,
  UserSession,
} from "./ker-app-capabilities";
import type { ExecutionActorType } from "./ker-execution-actor";

/**
 * Minimum authority contract (ARCH-1002 §5.2). Use when passing context across
 * package boundaries without leaking session-derived capability lists.
 */
export type ExecutionAuthorityContext = {
  organizationId: string;
  organizationSlug: string;
  userId: string;
  membershipId: string;
  locale: string;
  actorType: ExecutionActorType;
};

/** Resolved server execution scope: authority fields plus session-derived access. */
export type ExecutionContext = ExecutionAuthorityContext & {
  capabilities: readonly AppCapability[];
  role: OrganizationRole;
  sessionSource: UserSession["source"];
};

export function toExecutionAuthorityContext(
  context: ExecutionContext,
): ExecutionAuthorityContext {
  return {
    organizationId: context.organizationId,
    organizationSlug: context.organizationSlug,
    userId: context.userId,
    membershipId: context.membershipId,
    locale: context.locale,
    actorType: context.actorType,
  };
}
