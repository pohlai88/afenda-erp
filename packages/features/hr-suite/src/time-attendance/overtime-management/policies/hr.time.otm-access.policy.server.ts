import type { AppCapability } from "@afenda/auth";
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

export class HrTimeOtmAccessDeniedError extends Error {
  constructor(message = "Access denied for overtime management.") {
    super(message);
    this.name = "HrTimeOtmAccessDeniedError";
  }
}

/** HRM-OTM-028 — actor roles for overtime access. */
export type HrTimeOtmAccessRole =
  | "employee"
  | "manager"
  | "hr"
  | "payroll"
  | "finance"
  | "auditor";

export type HrTimeOtmAccessScope = "self" | "team" | "org";

export type HrTimeOtmExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  accessRole: HrTimeOtmAccessRole;
  accessScope: HrTimeOtmAccessScope;
  canWriteOtm: boolean;
  canExport: boolean;
  canApprove: boolean;
  canViewPayrollRefs: boolean;
  actorEmployeeIds: readonly string[];
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(scope?: HrTimeOtmAccessScope): Promise<
    readonly string[] | null
  >;
};

function hasHrTimeOtmBaseRead(context: ExecutionContext): boolean {
  return hasExecutionPermission(context, "hr.overtime.read");
}

function resolveHrTimeOtmAccessRole(context: ExecutionContext): HrTimeOtmAccessRole {
  if (hasExecutionPermission(context, "system-admin.audit.read")) {
    return "auditor";
  }
  if (hasExecutionPermission(context, "hr.overtime.write")) {
    return "hr";
  }
  if (
    hasExecutionPermission(context, "hr.attendance.read") &&
    hasExecutionPermission(context, "hr.leave.read")
  ) {
    return "payroll";
  }
  if (hasExecutionPermission(context, "hr.compliance.read")) {
    return "finance";
  }
  if (hasExecutionPermission(context, "hr.overtime.read")) {
    return "manager";
  }
  return "employee";
}

function resolveHrTimeOtmAccessScope(
  accessRole: HrTimeOtmAccessRole,
): HrTimeOtmAccessScope {
  if (
    accessRole === "auditor" ||
    accessRole === "hr" ||
    accessRole === "payroll" ||
    accessRole === "finance"
  ) {
    return "org";
  }
  if (accessRole === "manager") {
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

function toHrTimeOtmExecutionGuard(
  context: ExecutionContext,
  actorEmployeeIds: readonly string[],
): HrTimeOtmExecutionGuard {
  const canReadOtm = hasHrTimeOtmBaseRead(context);
  const canWriteOtm = hasExecutionPermission(context, "hr.overtime.write");
  const accessRole = resolveHrTimeOtmAccessRole(context);
  const accessScope = resolveHrTimeOtmAccessScope(accessRole);

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
    accessRole,
    accessScope,
    canWriteOtm,
    canExport: canReadOtm,
    canApprove: canWriteOtm || accessScope === "team",
    canViewPayrollRefs:
      canReadOtm && hasExecutionPermission(context, "hr.attendance.read"),
    actorEmployeeIds,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    async resolveVisibleEmployeeIds(scope) {
      if (!canReadOtm) {
        return [];
      }
      const effectiveScope = scope ?? accessScope;
      if (effectiveScope === "org") {
        return null;
      }
      const selfEmployeeId = actorEmployeeIds[0] ?? null;
      return resolveEmployeeIdsVisibleToActor({
        organizationId: context.organizationId,
        actorAuthUserId: context.userId,
        scope: effectiveScope,
        selfEmployeeId,
      });
    },
  };
}

async function buildGuard(): Promise<HrTimeOtmExecutionGuard> {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.overtime.read");
  const actorEmployeeIds = await resolveActorEmployeeIds({
    organizationId: context.organizationId,
    authUserId: context.userId,
  });
  const guard = toHrTimeOtmExecutionGuard(context, actorEmployeeIds);
  if (guard.accessScope !== "org" && guard.actorEmployeeIds.length === 0) {
    throw new HrTimeOtmAccessDeniedError("hr_otm_self_employee_link_required");
  }
  return guard;
}

export async function requireHrTimeOtmRead() {
  return buildGuard();
}

export async function requireHrTimeOtmWrite() {
  const guard = await buildGuard();
  if (!guard.canWriteOtm) {
    throw new HrTimeOtmAccessDeniedError();
  }
  return guard;
}

export async function requireHrTimeOtmReportExport() {
  const guard = await buildGuard();
  if (!guard.canExport) {
    throw new HrTimeOtmAccessDeniedError();
  }
  return guard;
}

/** HRM-OTM-001 — employee self-service submit gate. */
export async function requireHrTimeOtmEmployeeSubmit(): Promise<
  HrTimeOtmExecutionGuard & { selfEmployeeId: string }
> {
  const guard = await buildGuard();
  const selfEmployeeId = guard.actorEmployeeIds[0];
  if (!selfEmployeeId) {
    throw new HrTimeOtmAccessDeniedError(
      "Your account is not linked to an employee record for overtime submission.",
    );
  }
  return { ...guard, selfEmployeeId };
}

/** HRM-OTM-001 — manager or HR on-behalf submit gate. */
export async function requireHrTimeOtmOnBehalfSubmit(): Promise<HrTimeOtmExecutionGuard> {
  const guard = await buildGuard();
  if (guard.canWriteOtm || guard.canApprove) {
    return guard;
  }
  throw new HrTimeOtmAccessDeniedError(
    "You do not have permission to submit overtime on behalf of employees.",
  );
}

export async function assertHrTimeOtmCanSubmitForEmployee(
  guard: HrTimeOtmExecutionGuard,
  employeeId: string,
): Promise<void> {
  if (guard.canWriteOtm) {
    return;
  }
  const visibleIds = await guard.resolveVisibleEmployeeIds("team");
  if (!visibleIds?.includes(employeeId)) {
    throw new HrTimeOtmAccessDeniedError(
      "You can only submit overtime for employees on your team.",
    );
  }
}

/** HRM-OTM-028 — resolve surface access for overtime module. */
export async function resolveOtmSurfaceAccess() {
  try {
    const guard = await buildGuard();
    return {
      canRead: true,
      canWrite: guard.canWriteOtm,
      canExport: guard.canExport,
      canApprove: guard.canApprove,
      canViewPayrollRefs: guard.canViewPayrollRefs,
      accessRole: guard.accessRole,
      accessScope: guard.accessScope,
      organizationId: guard.organization.id,
    };
  } catch {
    return {
      canRead: false,
      canWrite: false,
      canExport: false,
      canApprove: false,
      canViewPayrollRefs: false,
      accessRole: "employee" as const,
      accessScope: "self" as const,
      organizationId: null,
    };
  }
}
