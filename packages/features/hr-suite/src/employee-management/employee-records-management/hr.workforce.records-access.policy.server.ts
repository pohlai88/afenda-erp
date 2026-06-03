import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import { HR_RECORDS_SENSITIVE_READ_CAPABILITY } from "./hr.workforce.records-sensitive-access.shared";

export type HrRecordsExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canViewSensitive: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toHrRecordsExecutionGuard(
  context: ExecutionContext,
): HrRecordsExecutionGuard {
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
    canViewSensitive: hasExecutionPermission(
      context,
      HR_RECORDS_SENSITIVE_READ_CAPABILITY,
    ),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrRecordsRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.employees.read");
  return toHrRecordsExecutionGuard(context);
}

export async function requireHrRecordsWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.employees.write");
  return toHrRecordsExecutionGuard(context);
}

export async function requireHrRecordsSensitiveWrite() {
  const guard = await requireHrRecordsWrite();
  if (!guard.canViewSensitive) {
    throw new Error("Sensitive employee field access denied.");
  }
  return guard;
}
