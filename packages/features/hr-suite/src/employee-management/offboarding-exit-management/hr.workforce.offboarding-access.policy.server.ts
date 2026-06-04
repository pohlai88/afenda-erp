import type { AppCapability } from "@afenda/kernel";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import { HR_OFFBOARDING_SENSITIVE_READ_CAPABILITY } from "./hr.workforce.offboarding-sensitive-access.shared";

export class HrOffboardingSensitiveAccessError extends Error {
  constructor() {
    super("Sensitive offboarding information requires elevated access.");
    this.name = "HrOffboardingSensitiveAccessError";
  }
}

export type HrOffboardingExecutionGuard = {
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

function toHrOffboardingExecutionGuard(
  context: ExecutionContext,
): HrOffboardingExecutionGuard {
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
      HR_OFFBOARDING_SENSITIVE_READ_CAPABILITY,
    ),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrOffboardingRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.offboarding.read");
  return toHrOffboardingExecutionGuard(context);
}

export async function requireHrOffboardingWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.offboarding.write");
  return toHrOffboardingExecutionGuard(context);
}

export async function requireHrOffboardingSensitiveWrite() {
  const guard = await requireHrOffboardingWrite();
  if (!guard.canViewSensitive) {
    throw new HrOffboardingSensitiveAccessError();
  }
  return guard;
}
