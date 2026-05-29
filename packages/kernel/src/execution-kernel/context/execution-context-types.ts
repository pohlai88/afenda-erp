import type {
  AppCapability,
  OrganizationRole,
  UserSession,
} from "@afenda/auth";
import type { ExecutionActorType } from "../actor/execution-actor";

/**
 * Minimum authority contract (ARCH-002 §5.2). Use when passing context across
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
