import type { AppCapability } from "@afenda/auth";
import {
  resolveEmployeeIdsVisibleToActor,
} from "@afenda/db";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_CSF_READ_CAPABILITY,
  HR_CSF_WRITE_CAPABILITY,
} from "../schemas/hr.talent.csf-constants.shared";

export type HrCsfAccessScope = "self" | "team" | "org";

export type HrCsfExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canWriteCsf: boolean;
  canReadAudit: boolean;
  canReadReadiness: boolean;
  canExposePerformance: boolean;
  canExposeSuccession: boolean;
  isAuditor: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrCsfAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrCsfExecutionGuard(context: ExecutionContext): HrCsfExecutionGuard {
  const canReadCsf = hasExecutionPermission(context, HR_CSF_READ_CAPABILITY);
  const canWriteCsf = hasExecutionPermission(context, HR_CSF_WRITE_CAPABILITY);
  const isAuditor = hasExecutionPermission(context, "system-admin.audit.read");
  const isLeadership =
    context.role === "owner" || context.role === "admin" || canWriteCsf;

  return {
    context,
    session: { id: context.userId },
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      locale: context.locale,
      role: context.role,
      capabilities: context.capabilities,
    },
    canWriteCsf,
    canReadAudit: canReadCsf && (canWriteCsf || isAuditor),
    canReadReadiness: canReadCsf && isLeadership,
    canExposePerformance: canReadCsf && (canWriteCsf || isLeadership),
    canExposeSuccession: canReadCsf && (canWriteCsf || isLeadership),
    isAuditor,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      if (!canReadCsf) {
        return [];
      }

      let scope = scopeInput.scope;
      if (scope === "org" && !canWriteCsf && !isLeadership) {
        scope = "team";
      }
      if (scope === "team" && !canWriteCsf && context.role === "member") {
        scope = "self";
      }

      return resolveEmployeeIdsVisibleToActor({
        organizationId: context.organizationId,
        actorAuthUserId: context.userId,
        scope,
        selfEmployeeId: scopeInput.selfEmployeeId,
      });
    },
  };
}

/** HRM-CSF-030 — employee / manager / HR / leadership / auditor read gate. */
export async function requireHrCsfRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_CSF_READ_CAPABILITY);
  return toHrCsfExecutionGuard(context);
}

export async function requireHrCsfWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_CSF_WRITE_CAPABILITY);
  return toHrCsfExecutionGuard(context);
}

export function canHrCsfViewEmployeeProfile(
  guard: HrCsfExecutionGuard,
  employeeId: string,
  visibleEmployeeIds: readonly string[] | null,
): boolean {
  if (guard.canWriteCsf) {
    return true;
  }
  if (!visibleEmployeeIds) {
    return true;
  }
  return visibleEmployeeIds.includes(employeeId);
}

export function canHrCsfModifyAssessment(guard: HrCsfExecutionGuard): boolean {
  return guard.canWriteCsf;
}

export {
  HR_CSF_READ_CAPABILITY,
  HR_CSF_WRITE_CAPABILITY,
};
