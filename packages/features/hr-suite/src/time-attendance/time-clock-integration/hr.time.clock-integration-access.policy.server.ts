import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import { hrTimeClockCapabilities } from "./hr.time.clock-integration.contract";

export class HrTimeClockAccessDeniedError extends Error {
  readonly code:
    | "hr_time_clock_read_required"
    | "hr_time_clock_write_required"
    | "hr_time_clock_admin_required";

  constructor(code: HrTimeClockAccessDeniedError["code"]) {
    super(code);
    this.code = code;
  }
}

export type HrTimeClockExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canWrite: boolean;
  canAdmin: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toHrTimeClockExecutionGuard(
  context: ExecutionContext,
): HrTimeClockExecutionGuard {
  const canWrite = hasExecutionPermission(
    context,
    hrTimeClockCapabilities.write,
  );
  const canAdmin = hasExecutionPermission(
    context,
    hrTimeClockCapabilities.admin,
  );

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
    canWrite,
    canAdmin,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

/** HRM-TCI-001..005 read gate for device registry and mappings. */
export async function requireHrTimeClockRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.view");
  requireExecutionPermission(context, hrTimeClockCapabilities.read);
  return toHrTimeClockExecutionGuard(context);
}

/** Operational punch/sync mutations (future slices). */
export async function requireHrTimeClockWrite() {
  const guard = await requireHrTimeClockRead();
  if (!guard.canWrite) {
    throw new HrTimeClockAccessDeniedError("hr_time_clock_write_required");
  }
  return guard;
}

/** HRM-TCI-027 — device configuration and employee mapping mutations. */
export async function requireHrTimeClockAdmin() {
  const guard = await requireHrTimeClockRead();
  if (!guard.canAdmin) {
    throw new HrTimeClockAccessDeniedError("hr_time_clock_admin_required");
  }
  return guard;
}

export async function assertHrTimeClockCanConfigureDevices(
  guard: HrTimeClockExecutionGuard,
): Promise<void> {
  if (!guard.canAdmin) {
    throw new HrTimeClockAccessDeniedError("hr_time_clock_admin_required");
  }
}

export async function assertHrTimeClockCanManageMappings(
  guard: HrTimeClockExecutionGuard,
): Promise<void> {
  if (!guard.canAdmin) {
    throw new HrTimeClockAccessDeniedError("hr_time_clock_admin_required");
  }
}
