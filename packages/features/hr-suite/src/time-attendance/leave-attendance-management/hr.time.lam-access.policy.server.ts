import type { AppCapability } from "@afenda/auth";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

export type HrLamAccessScope = "self" | "team" | "org";

export type HrLamExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canWriteLeave: boolean;
  canWriteAttendance: boolean;
  canReadPayrollRefs: boolean;
  canReadAudit: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrLamAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrLamExecutionGuard(context: ExecutionContext): HrLamExecutionGuard {
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
    canWriteLeave: hasExecutionPermission(context, "hr.leave.write"),
    canWriteAttendance: hasExecutionPermission(context, "hr.attendance.write"),
    canReadPayrollRefs:
      hasExecutionPermission(context, "hr.leave.read") &&
      hasExecutionPermission(context, "hr.attendance.read"),
    canReadAudit:
      hasExecutionPermission(context, "hr.leave.read") ||
      hasExecutionPermission(context, "hr.attendance.read"),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      if (!hasExecutionPermission(context, "hr.leave.read")) {
        return [];
      }
      const scope =
        scopeInput.scope === "org" &&
        !hasExecutionPermission(context, "hr.attendance.write")
          ? "team"
          : scopeInput.scope;
      return resolveEmployeeIdsVisibleToActor({
        organizationId: context.organizationId,
        actorAuthUserId: context.userId,
        scope,
        selfEmployeeId: scopeInput.selfEmployeeId,
      });
    },
  };
}

export async function requireHrLamRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.leave.read");
  return toHrLamExecutionGuard(context);
}

export async function requireHrLamLeaveWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.leave.write");
  return toHrLamExecutionGuard(context);
}

export async function requireHrLamAttendanceRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.attendance.read");
  return toHrLamExecutionGuard(context);
}

export async function requireHrLamAttendanceWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.attendance.write");
  return toHrLamExecutionGuard(context);
}
