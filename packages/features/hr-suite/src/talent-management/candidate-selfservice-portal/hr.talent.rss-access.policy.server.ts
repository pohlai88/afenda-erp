import type { AppCapability } from "@afenda/kernel";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../hr-suite-integration/server";
import {
  HR_TALENT_RSS_APPROVE_CAPABILITY,
  HR_TALENT_RSS_AUDIT_READ_CAPABILITY,
  HR_TALENT_RSS_INTEGRATION_EXPOSE_CAPABILITY,
  HR_TALENT_RSS_READ_CAPABILITY,
  HR_TALENT_RSS_RESTRICTED_READ_CAPABILITY,
  HR_TALENT_RSS_WRITE_CAPABILITY,
} from "./hr.talent.rss-constants.shared";

export type HrTalentRssExecutionGuard = {
  readonly context: HrModuleExecutionGuard["context"];
  readonly organization: { readonly id: string };
  readonly session: { readonly id: string };
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleCandidateIds(input?: {
    readonly selfCandidateId?: string | null;
    readonly assignedCandidateIds?: readonly string[] | null;
  }): Promise<readonly string[] | null>;
};

function toHrTalentRssExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrTalentRssExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_TALENT_RSS_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_TALENT_RSS_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(
    HR_TALENT_RSS_APPROVE_CAPABILITY,
  );
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_TALENT_RSS_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_TALENT_RSS_RESTRICTED_READ_CAPABILITY)),
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(
          HR_TALENT_RSS_INTEGRATION_EXPOSE_CAPABILITY,
        )),
    hasCapability(capability) {
      return moduleGuard.hasCapability(capability);
    },
    async resolveVisibleCandidateIds(input) {
      if (!canRead) {
        return [];
      }
      if (isLeadership || canWrite || canApprove) {
        return null;
      }
      if (input?.assignedCandidateIds?.length) {
        return input.assignedCandidateIds;
      }
      if (input?.selfCandidateId) {
        return [input.selfCandidateId];
      }
      return [];
    },
  };
}

export async function requireHrTalentRssRead() {
  return toHrTalentRssExecutionGuard(
    await requireHrCapability(HR_TALENT_RSS_READ_CAPABILITY),
  );
}

export async function requireHrTalentRssWrite() {
  return toHrTalentRssExecutionGuard(
    await requireHrCapability(HR_TALENT_RSS_WRITE_CAPABILITY),
  );
}

export async function requireHrTalentRssApprove() {
  return toHrTalentRssExecutionGuard(
    await requireHrCapability(HR_TALENT_RSS_APPROVE_CAPABILITY),
  );
}
