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

/** HRM-AAT-025 — actor roles for absence analytics access. */
export type HrAatAccessRole =
  | "employee"
  | "manager"
  | "hr"
  | "payroll"
  | "compliance"
  | "auditor";

export type HrAatAccessScope = "self" | "team" | "org";

export type HrAatExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  accessRole: HrAatAccessRole;
  accessScope: HrAatAccessScope;
  canExport: boolean;
  canViewSensitiveReasons: boolean;
  canViewPayrollRefs: boolean;
  /** HRM-AAT-020 — HR, managers, payroll, compliance, and auditors. */
  canViewRiskIndicators: boolean;
  /** HRM-AAT-018 — org-wide threshold configuration. */
  canConfigureRiskThresholds: boolean;
  actorEmployeeIds: readonly string[];
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(): Promise<readonly string[] | null>;
};

export class HrAatAccessDeniedError extends Error {
  constructor(message = "hr_aat_access_denied") {
    super(message);
    this.name = "HrAatAccessDeniedError";
  }
}

function hasHrAatBaseRead(context: ExecutionContext): boolean {
  return (
    hasExecutionPermission(context, "hr.leave.read") ||
    hasExecutionPermission(context, "hr.attendance.read") ||
    hasExecutionPermission(context, "hr.compliance.read") ||
    hasExecutionPermission(context, "system-admin.audit.read")
  );
}

function resolveHrAatAccessRole(context: ExecutionContext): HrAatAccessRole {
  if (hasExecutionPermission(context, "system-admin.audit.read")) {
    return "auditor";
  }
  if (
    hasExecutionPermission(context, "hr.attendance.write") ||
    hasExecutionPermission(context, "hr.leave.write")
  ) {
    return "hr";
  }
  if (hasExecutionPermission(context, "hr.compliance.read")) {
    return "compliance";
  }
  if (
    hasExecutionPermission(context, "hr.leave.read") &&
    hasExecutionPermission(context, "hr.attendance.read")
  ) {
    return "payroll";
  }
  if (hasExecutionPermission(context, "hr.leave.read")) {
    return "manager";
  }
  return "employee";
}

function resolveHrAatAccessScope(accessRole: HrAatAccessRole): HrAatAccessScope {
  if (
    accessRole === "auditor" ||
    accessRole === "hr" ||
    accessRole === "compliance" ||
    accessRole === "payroll"
  ) {
    return "org";
  }
  if (accessRole === "manager") {
    return "team";
  }
  return "self";
}

function canViewHrAatSensitiveReasons(context: ExecutionContext): boolean {
  return (
    hasExecutionPermission(context, "hr.leave.write") ||
    hasExecutionPermission(context, "hr.compliance.sensitive.read") ||
    hasExecutionPermission(context, "hr.employees.sensitive.read")
  );
}

/** HRM-AAT-020 — managers and HR-facing roles; not unscoped self-only employees. */
function canViewHrAatRiskIndicators(
  context: ExecutionContext,
  accessRole: HrAatAccessRole,
): boolean {
  if (!hasHrAatBaseRead(context)) {
    return false;
  }
  return accessRole !== "employee";
}

/** HRM-AAT-018 — HR operators with attendance write. */
function canConfigureHrAatRiskThresholds(
  context: ExecutionContext,
  accessRole: HrAatAccessRole,
): boolean {
  return (
    accessRole === "hr" &&
    hasExecutionPermission(context, "hr.attendance.write")
  );
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

function toHrAatExecutionGuard(
  context: ExecutionContext,
  actorEmployeeIds: readonly string[],
): HrAatExecutionGuard {
  const accessRole = resolveHrAatAccessRole(context);
  const accessScope = resolveHrAatAccessScope(accessRole);

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
    canExport: hasHrAatBaseRead(context),
    canViewSensitiveReasons: canViewHrAatSensitiveReasons(context),
    canViewPayrollRefs:
      hasExecutionPermission(context, "hr.leave.read") &&
      hasExecutionPermission(context, "hr.attendance.read"),
    canViewRiskIndicators: canViewHrAatRiskIndicators(context, accessRole),
    canConfigureRiskThresholds: canConfigureHrAatRiskThresholds(
      context,
      accessRole,
    ),
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

/** HRM-AAT-025 — minimum read gate for analytics and reports. */
export async function requireHrAatReportRead(): Promise<HrAatExecutionGuard> {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.view");

  if (!hasHrAatBaseRead(context)) {
    throw new HrAatAccessDeniedError();
  }

  const actorEmployeeIds = await resolveActorEmployeeIds({
    organizationId: context.organizationId,
    authUserId: context.userId,
  });

  const guard = toHrAatExecutionGuard(context, actorEmployeeIds);

  if (guard.accessScope !== "org" && guard.actorEmployeeIds.length === 0) {
    throw new HrAatAccessDeniedError("hr_aat_self_employee_link_required");
  }

  return guard;
}

/** HRM-AAT-024 — export requires read access within resolved scope. */
export async function requireHrAatReportExport(): Promise<HrAatExecutionGuard> {
  const guard = await requireHrAatReportRead();
  if (!guard.canExport) {
    throw new HrAatAccessDeniedError("hr_aat_export_denied");
  }
  return guard;
}

/** HRM-AAT-020 — absence risk indicators for authorized HR and managers. */
export async function requireHrAatRiskRead(): Promise<HrAatExecutionGuard> {
  const guard = await requireHrAatReportRead();
  if (!guard.canViewRiskIndicators) {
    throw new HrAatAccessDeniedError("hr_aat_risk_read_denied");
  }
  return guard;
}

/** HRM-AAT-018 — configure org absence risk thresholds. */
export async function requireHrAatRiskThresholdWrite(): Promise<HrAatExecutionGuard> {
  const guard = await requireHrAatRiskRead();
  if (!guard.canConfigureRiskThresholds) {
    throw new HrAatAccessDeniedError("hr_aat_risk_threshold_write_denied");
  }
  return guard;
}

/** HRM-AAT-022 — payroll deduction refs via LAM boundary (read-only). */
export async function requireHrAatPayrollRefRead(): Promise<HrAatExecutionGuard> {
  const guard = await requireHrAatReportRead();
  if (!guard.canViewPayrollRefs) {
    throw new HrAatAccessDeniedError("hr_aat_payroll_ref_read_denied");
  }
  return guard;
}

/** HRM-AAT-021 — link corrective action references to insights. */
export async function requireHrAatCorrectiveRefWrite(): Promise<HrAatExecutionGuard> {
  const guard = await requireHrAatRiskRead();
  if (
    guard.accessRole !== "hr" &&
    guard.accessRole !== "compliance" &&
    !guard.hasCapability("hr.attendance.write")
  ) {
    throw new HrAatAccessDeniedError("hr_aat_corrective_ref_write_denied");
  }
  return guard;
}
