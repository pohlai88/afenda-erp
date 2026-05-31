import type { AppCapability } from "@afenda/auth";
import {
  getUserProfile,
  resolveEmployeeIdsVisibleToActor,
  resolveHrEmployeeIdsForAuthUser,
} from "@afenda/db";
import {
  requireExecutionContext,
  requireExecutionPermission,
  hasExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import { HrTimeSftAccessDeniedError } from "../data/hr.time.sft-action-result.shared";

export { HrTimeSftAccessDeniedError as HrSftAccessDeniedError };

export type HrSftAccessScope = "self" | "team" | "org";

export type HrSftExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  accessScope: HrSftAccessScope;
  canManageShifts: boolean;
  canApprove: boolean;
  canOverride: boolean;
  canExport: boolean;
  canViewPayrollRefs: boolean;
  canViewAudit: boolean;
  actorEmployeeIds: readonly string[];
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(): Promise<readonly string[] | null>;
};

function resolveAccessScope(context: ExecutionContext): HrSftAccessScope {
  if (
    hasExecutionPermission(context, "hr.shifts.write") ||
    hasExecutionPermission(context, "system-admin.audit.read")
  ) {
    return "org";
  }
  if (hasExecutionPermission(context, "hr.leave.read")) {
    return "team";
  }
  return "self";
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

function toHrSftExecutionGuard(
  context: ExecutionContext,
  actorEmployeeIds: readonly string[],
): HrSftExecutionGuard {
  const canReadShifts = hasExecutionPermission(context, "hr.shifts.read");
  const canManageShifts =
    canReadShifts && hasExecutionPermission(context, "hr.shifts.write");
  const accessScope = resolveAccessScope(context);

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
    accessScope,
    canManageShifts,
    canApprove: canManageShifts || accessScope === "team",
    canOverride: canManageShifts,
    canExport: canReadShifts,
    canViewPayrollRefs:
      canReadShifts && hasExecutionPermission(context, "hr.attendance.read"),
    canViewAudit:
      canReadShifts &&
      (canManageShifts ||
        hasExecutionPermission(context, "system-admin.audit.read")),
    actorEmployeeIds,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    async resolveVisibleEmployeeIds() {
      if (accessScope === "org") {
        return null;
      }
      const selfEmployeeId = actorEmployeeIds[0] ?? null;
      return resolveEmployeeIdsVisibleToActor({
        organizationId: context.organizationId,
        actorAuthUserId: context.userId,
        scope: accessScope,
        selfEmployeeId,
      });
    },
  };
}

async function buildGuard(): Promise<HrSftExecutionGuard> {
  const context = await requireExecutionContext();
  try {
    requireExecutionPermission(context, "hr.shifts.read");
  } catch {
    throw new HrTimeSftAccessDeniedError("hr_sft_read_denied");
  }
  const actorEmployeeIds = await resolveActorEmployeeIds({
    organizationId: context.organizationId,
    authUserId: context.userId,
  });
  const guard = toHrSftExecutionGuard(context, actorEmployeeIds);
  if (guard.accessScope !== "org" && guard.actorEmployeeIds.length === 0) {
    throw new HrTimeSftAccessDeniedError("hr_sft_self_employee_link_required");
  }
  return guard;
}

/** HRM-SFT-029 — org read gate for shift scheduling workbench. */
export async function requireHrTimeSftRead(): Promise<HrSftExecutionGuard> {
  return buildGuard();
}

export const requireHrSftRead = requireHrTimeSftRead;

/** HRM-SFT-029 — planner / HR manage gate. */
export async function requireHrTimeSftManage(): Promise<HrSftExecutionGuard> {
  const guard = await requireHrTimeSftRead();
  if (!guard.canManageShifts) {
    throw new HrTimeSftAccessDeniedError("hr_sft_manage_denied");
  }
  return guard;
}

export const requireHrSftManage = requireHrTimeSftManage;

/** HRM-SFT-029 — swap and schedule-change approval. */
export async function requireHrSftApprove(): Promise<HrSftExecutionGuard> {
  const guard = await requireHrTimeSftRead();
  if (!guard.canApprove) {
    throw new HrTimeSftAccessDeniedError("hr_sft_approve_denied");
  }
  return guard;
}

/** HRM-SFT-029 — manager override on swaps and schedule changes. */
export async function requireHrSftOverride(): Promise<HrSftExecutionGuard> {
  const guard = await requireHrTimeSftRead();
  if (!guard.canOverride) {
    throw new HrTimeSftAccessDeniedError("hr_sft_override_denied");
  }
  return guard;
}

/** HRM-SFT-028 — report export within authorized scope. */
export async function requireHrSftReportExport(): Promise<HrSftExecutionGuard> {
  const guard = await requireHrTimeSftRead();
  if (!guard.canExport) {
    throw new HrTimeSftAccessDeniedError("hr_sft_export_denied");
  }
  return guard;
}

/** HRM-SFT-027 — payroll reference visibility. */
export async function requireHrSftPayrollRefRead(): Promise<HrSftExecutionGuard> {
  const guard = await requireHrTimeSftRead();
  if (!guard.canViewPayrollRefs) {
    throw new HrTimeSftAccessDeniedError("hr_sft_payroll_ref_read_denied");
  }
  return guard;
}

/** HRM-SFT-030 — audit trail visibility. */
export async function requireHrSftAuditRead(): Promise<HrSftExecutionGuard> {
  const guard = await requireHrTimeSftRead();
  if (!guard.canViewAudit) {
    throw new HrTimeSftAccessDeniedError("hr_sft_audit_read_denied");
  }
  return guard;
}
