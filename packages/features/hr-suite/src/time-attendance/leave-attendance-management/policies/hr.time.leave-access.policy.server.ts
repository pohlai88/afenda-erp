import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import { hrTimeLeaveCapabilities } from "../contracts/hr.time.leave.contract";

export async function requireHrTimeLeaveRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.view");
  requireExecutionPermission(context, hrTimeLeaveCapabilities.read);
  return {
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      locale: context.locale,
    },
    session: { id: context.userId },
    canWrite: hasExecutionPermission(context, hrTimeLeaveCapabilities.write),
  };
}

export async function requireHrTimeLeaveWrite() {
  const guard = await requireHrTimeLeaveRead();
  if (!guard.canWrite) {
    throw new Error("hr_leave_write_required");
  }
  return guard;
}
