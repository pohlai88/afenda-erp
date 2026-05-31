import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_RON_APPROVE_CAPABILITY,
  HR_RON_AUDIT_READ_CAPABILITY,
  HR_RON_CONVERT_CAPABILITY,
  HR_RON_FINANCE_READ_CAPABILITY,
  HR_RON_INTERVIEW_WRITE_CAPABILITY,
  HR_RON_IT_READ_CAPABILITY,
  HR_RON_OFFER_APPROVE_CAPABILITY,
  HR_RON_OFFER_READ_CAPABILITY,
  HR_RON_OFFER_WRITE_CAPABILITY,
  HR_RON_ONBOARDING_READ_CAPABILITY,
  HR_RON_ONBOARDING_WRITE_CAPABILITY,
  HR_RON_READ_CAPABILITY,
  HR_RON_SENSITIVE_READ_CAPABILITY,
  HR_RON_WRITE_CAPABILITY,
} from "../schemas/hr.talent.ron-constants.shared";

export type HrRonExecutionGuard = {
  context: ExecutionContext;
  organization: { id: string };
  session: { id: string };
  canWrite: boolean;
  canApproveRequisitions: boolean;
  canWriteInterviews: boolean;
  canReadOffers: boolean;
  canWriteOffers: boolean;
  canApproveOffers: boolean;
  canReadOnboarding: boolean;
  canWriteOnboarding: boolean;
  canReadFinance: boolean;
  canReadIt: boolean;
  canReadAudit: boolean;
  canReadSensitiveCandidateData: boolean;
  canConvertCandidate: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toHrRonExecutionGuard(context: ExecutionContext): HrRonExecutionGuard {
  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite: hasExecutionPermission(context, HR_RON_WRITE_CAPABILITY),
    canApproveRequisitions: hasExecutionPermission(
      context,
      HR_RON_APPROVE_CAPABILITY,
    ),
    canWriteInterviews: hasExecutionPermission(
      context,
      HR_RON_INTERVIEW_WRITE_CAPABILITY,
    ),
    canReadOffers: hasExecutionPermission(context, HR_RON_OFFER_READ_CAPABILITY),
    canWriteOffers: hasExecutionPermission(
      context,
      HR_RON_OFFER_WRITE_CAPABILITY,
    ),
    canApproveOffers: hasExecutionPermission(
      context,
      HR_RON_OFFER_APPROVE_CAPABILITY,
    ),
    canReadOnboarding: hasExecutionPermission(
      context,
      HR_RON_ONBOARDING_READ_CAPABILITY,
    ),
    canWriteOnboarding: hasExecutionPermission(
      context,
      HR_RON_ONBOARDING_WRITE_CAPABILITY,
    ),
    canReadFinance: hasExecutionPermission(context, HR_RON_FINANCE_READ_CAPABILITY),
    canReadIt: hasExecutionPermission(context, HR_RON_IT_READ_CAPABILITY),
    canReadAudit: hasExecutionPermission(context, HR_RON_AUDIT_READ_CAPABILITY),
    canReadSensitiveCandidateData: hasExecutionPermission(
      context,
      HR_RON_SENSITIVE_READ_CAPABILITY,
    ),
    canConvertCandidate: hasExecutionPermission(context, HR_RON_CONVERT_CAPABILITY),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrRonRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_RON_READ_CAPABILITY);
  return toHrRonExecutionGuard(context);
}

export async function requireHrRonWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_RON_WRITE_CAPABILITY);
  return toHrRonExecutionGuard(context);
}

export async function requireHrRonApprove() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_RON_APPROVE_CAPABILITY);
  return toHrRonExecutionGuard(context);
}

export async function requireHrRonOfferApprove() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_RON_OFFER_APPROVE_CAPABILITY);
  return toHrRonExecutionGuard(context);
}

export {
  HR_RON_APPROVE_CAPABILITY,
  HR_RON_AUDIT_READ_CAPABILITY,
  HR_RON_CONVERT_CAPABILITY,
  HR_RON_FINANCE_READ_CAPABILITY,
  HR_RON_INTERVIEW_WRITE_CAPABILITY,
  HR_RON_IT_READ_CAPABILITY,
  HR_RON_OFFER_APPROVE_CAPABILITY,
  HR_RON_OFFER_READ_CAPABILITY,
  HR_RON_OFFER_WRITE_CAPABILITY,
  HR_RON_ONBOARDING_READ_CAPABILITY,
  HR_RON_ONBOARDING_WRITE_CAPABILITY,
  HR_RON_READ_CAPABILITY,
  HR_RON_SENSITIVE_READ_CAPABILITY,
  HR_RON_WRITE_CAPABILITY,
};
