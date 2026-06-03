import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HrBonusFinanceAccessError,
  HrBonusSensitiveAccessError,
} from "./hr.payroll.bonus-org-scope.shared";
import {
  HR_BONUS_AUDIT_READ_CAPABILITY,
  HR_BONUS_FINANCE_READ_CAPABILITY,
  HR_BONUS_READ_CAPABILITY,
  HR_BONUS_SENSITIVE_READ_CAPABILITY,
  HR_BONUS_WRITE_CAPABILITY,
  HR_BONUS_APPROVE_CAPABILITY,
} from "./hr.payroll.bonus-constants.shared";
import { maskBonusSensitiveDisplayText } from "./hr.payroll.bonus-sensitive-access.shared";

export type HrBonusExecutionGuard = {
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
  canViewFinance: boolean;
  canViewAudit: boolean;
  canApprove: boolean;
  hasCapability(capability: AppCapability): boolean;
  maskSensitiveDisplay(value: string | null | undefined): string;
};

function toHrBonusExecutionGuard(
  context: ExecutionContext,
): HrBonusExecutionGuard {
  const canViewSensitive = hasExecutionPermission(
    context,
    HR_BONUS_SENSITIVE_READ_CAPABILITY,
  );
  const canViewFinance =
    hasExecutionPermission(context, HR_BONUS_FINANCE_READ_CAPABILITY) ||
    hasExecutionPermission(context, HR_BONUS_WRITE_CAPABILITY);
  const canViewAudit =
    hasExecutionPermission(context, HR_BONUS_AUDIT_READ_CAPABILITY) ||
    hasExecutionPermission(context, HR_BONUS_WRITE_CAPABILITY);
  const canApprove = hasExecutionPermission(context, HR_BONUS_APPROVE_CAPABILITY);

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
    canViewSensitive,
    canViewFinance,
    canViewAudit,
    canApprove,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    maskSensitiveDisplay(value: string | null | undefined) {
      return maskBonusSensitiveDisplayText(value, canViewSensitive);
    },
  };
}

/** HRM-BON-029 — read bonus and incentive registers. */
export async function requireHrBonusRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_BONUS_READ_CAPABILITY);
  return toHrBonusExecutionGuard(context);
}

export async function requireHrBonusWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_BONUS_WRITE_CAPABILITY);
  return toHrBonusExecutionGuard(context);
}

export async function requireHrBonusSensitiveRead() {
  const guard = await requireHrBonusRead();
  if (!guard.canViewSensitive) {
    throw new HrBonusSensitiveAccessError();
  }
  return guard;
}

export async function requireHrBonusFinanceAccess() {
  const guard = await requireHrBonusRead();
  if (!guard.canViewFinance) {
    throw new HrBonusFinanceAccessError();
  }
  return guard;
}

export async function requireHrBonusAuditRead() {
  const guard = await requireHrBonusRead();
  if (!guard.canViewAudit) {
    throw new HrBonusSensitiveAccessError();
  }
  return guard;
}

/** BON-023 — approve, reject, return, or adjust payouts. */
export async function requireHrBonusApprove() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_BONUS_READ_CAPABILITY);
  requireExecutionPermission(context, HR_BONUS_APPROVE_CAPABILITY);
  return toHrBonusExecutionGuard(context);
}

export {
  HR_BONUS_AUDIT_READ_CAPABILITY,
  HR_BONUS_FINANCE_READ_CAPABILITY,
  HR_BONUS_READ_CAPABILITY,
  HR_BONUS_SENSITIVE_READ_CAPABILITY,
  HR_BONUS_WRITE_CAPABILITY,
  HR_BONUS_APPROVE_CAPABILITY,
};
