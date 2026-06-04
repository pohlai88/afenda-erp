import type { AppCapability } from "@afenda/kernel";
import {
  getUserProfile,
  resolveEmployeeIdsVisibleToActor,
  resolveHrEmployeeIdsForAuthUser,
} from "@afenda/db";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import { HrTimeFwaAccessDeniedError } from "./hr.time.fwa-action-result.shared";
import { resolveHrFwaApproverContext } from "./hr.time.fwa-approver-context.shared.server";

export type HrFwaAccessScope = "self" | "team" | "org";

export type HrFwaExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canWriteFwa: boolean;
  canReadPayrollRefs: boolean;
  canReadCompliance: boolean;
  canReadAudit: boolean;
  isAuditor: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrFwaAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrFwaExecutionGuard(context: ExecutionContext): HrFwaExecutionGuard {
  const canReadFwa = hasExecutionPermission(context, "hr.fwa.read");
  const canWriteFwa = hasExecutionPermission(context, "hr.fwa.write");
  const canReadCompliance = hasExecutionPermission(context, "hr.compliance.read");
  const canReadPayrollRefs =
    canReadFwa && hasExecutionPermission(context, "hr.attendance.read");
  const isAuditor = hasExecutionPermission(context, "system-admin.audit.read");
  const canReadAudit =
    canReadFwa &&
    (canWriteFwa || canReadCompliance || isAuditor);

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
    canWriteFwa,
    canReadPayrollRefs,
    canReadCompliance,
    canReadAudit,
    isAuditor,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      if (!canReadFwa) {
        return [];
      }
      const scope =
        scopeInput.scope === "org" && !canWriteFwa ? "team" : scopeInput.scope;
      return resolveEmployeeIdsVisibleToActor({
        organizationId: context.organizationId,
        actorAuthUserId: context.userId,
        scope,
        selfEmployeeId: scopeInput.selfEmployeeId,
      });
    },
  };
}

/** Employee / manager / HR read gate (HRM-FWA-031). */
export async function requireHrFwaRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.fwa.read");
  return toHrFwaExecutionGuard(context);
}

/** HR mutation gate for requests, renewals, and reviews. */
export async function requireHrFwaWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.fwa.write");
  return toHrFwaExecutionGuard(context);
}

/** Compliance operators — breaches and policy monitoring. */
export async function requireHrFwaComplianceRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.compliance.read");
  const guard = toHrFwaExecutionGuard(context);
  if (!guard.hasCapability("hr.fwa.read")) {
    requireExecutionPermission(context, "hr.fwa.read");
  }
  return guard;
}

/** Payroll schedule reference visibility. */
export async function requireHrFwaPayrollRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.fwa.read");
  requireExecutionPermission(context, "hr.attendance.read");
  return toHrFwaExecutionGuard(context);
}

async function resolveActorEmployeeIds(input: {
  organizationId: string;
  authUserId: string;
}): Promise<readonly string[]> {
  const profile = await getUserProfile(input.authUserId);
  return resolveHrEmployeeIdsForAuthUser({
    organizationId: input.organizationId,
    authUserId: input.authUserId,
    authUserEmail: profile?.email ?? null,
  });
}

/** Aliases for request/eligibility slice (HRM-FWA-004..008). */
export const requireHrTimeFwaRead = requireHrFwaRead;
export const requireHrTimeFwaWrite = requireHrFwaWrite;

export async function requireHrTimeFwaEmployeeSubmit(): Promise<
  HrFwaExecutionGuard & { selfEmployeeId: string }
> {
  const guard = await requireHrFwaRead();
  const actorEmployeeIds = await resolveActorEmployeeIds({
    organizationId: guard.organization.id,
    authUserId: guard.session.id,
  });
  const selfEmployeeId = actorEmployeeIds[0];
  if (!selfEmployeeId) {
    throw new HrTimeFwaAccessDeniedError("hr_fwa_employee_identity_required");
  }
  return { ...guard, selfEmployeeId };
}

export async function requireHrTimeFwaInitiate(): Promise<HrFwaExecutionGuard> {
  const guard = await requireHrFwaRead();
  if (guard.canWriteFwa) {
    return guard;
  }

  const visibleIds = await guard.resolveVisibleEmployeeIds({ scope: "team" });
  if (!visibleIds || visibleIds.length === 0) {
    throw new HrTimeFwaAccessDeniedError("hr_fwa_initiate_denied");
  }

  return guard;
}

export async function assertHrTimeFwaCanInitiateForEmployee(
  guard: HrFwaExecutionGuard,
  employeeId: string,
): Promise<void> {
  if (guard.canWriteFwa) {
    return;
  }

  const visibleIds = await guard.resolveVisibleEmployeeIds({ scope: "team" });
  if (!visibleIds?.includes(employeeId)) {
    throw new HrTimeFwaAccessDeniedError("hr_fwa_target_employee_denied");
  }
}

export async function resolveHrTimeFwaApproverContext(
  guard: HrFwaExecutionGuard,
) {
  return resolveHrFwaApproverContext({
    organizationId: guard.organization.id,
    authUserId: guard.session.id,
    canWrite: guard.canWriteFwa,
  });
}

export async function requireHrTimeFwaDecide() {
  const guard = await requireHrFwaRead();
  const approver = await resolveHrTimeFwaApproverContext(guard);
  return { ...guard, ...approver };
}
