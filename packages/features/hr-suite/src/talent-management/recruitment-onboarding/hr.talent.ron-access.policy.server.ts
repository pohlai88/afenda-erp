import type { AppCapability } from "@afenda/kernel";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../hr-suite-integration/server";
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
} from "./hr.talent.ron-constants.shared";

export type HrRonExecutionGuard = {
  context: HrModuleExecutionGuard["context"];
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

function toHrRonExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrRonExecutionGuard {
  const { context } = moduleGuard;
  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite: moduleGuard.hasCapability(HR_RON_WRITE_CAPABILITY),
    canApproveRequisitions: moduleGuard.hasCapability(
      HR_RON_APPROVE_CAPABILITY,
    ),
    canWriteInterviews: moduleGuard.hasCapability(
      HR_RON_INTERVIEW_WRITE_CAPABILITY,
    ),
    canReadOffers: moduleGuard.hasCapability(HR_RON_OFFER_READ_CAPABILITY),
    canWriteOffers: moduleGuard.hasCapability(HR_RON_OFFER_WRITE_CAPABILITY),
    canApproveOffers: moduleGuard.hasCapability(
      HR_RON_OFFER_APPROVE_CAPABILITY,
    ),
    canReadOnboarding: moduleGuard.hasCapability(
      HR_RON_ONBOARDING_READ_CAPABILITY,
    ),
    canWriteOnboarding: moduleGuard.hasCapability(
      HR_RON_ONBOARDING_WRITE_CAPABILITY,
    ),
    canReadFinance: moduleGuard.hasCapability(HR_RON_FINANCE_READ_CAPABILITY),
    canReadIt: moduleGuard.hasCapability(HR_RON_IT_READ_CAPABILITY),
    canReadAudit: moduleGuard.hasCapability(HR_RON_AUDIT_READ_CAPABILITY),
    canReadSensitiveCandidateData: moduleGuard.hasCapability(
      HR_RON_SENSITIVE_READ_CAPABILITY,
    ),
    canConvertCandidate: moduleGuard.hasCapability(HR_RON_CONVERT_CAPABILITY),
    hasCapability(capability: AppCapability) {
      return moduleGuard.hasCapability(capability);
    },
  };
}

export async function requireHrRonRead() {
  return toHrRonExecutionGuard(
    await requireHrCapability(HR_RON_READ_CAPABILITY),
  );
}

export async function requireHrRonWrite() {
  return toHrRonExecutionGuard(
    await requireHrCapability(HR_RON_WRITE_CAPABILITY),
  );
}

export async function requireHrRonApprove() {
  return toHrRonExecutionGuard(
    await requireHrCapability(HR_RON_APPROVE_CAPABILITY),
  );
}

export async function requireHrRonOfferApprove() {
  return toHrRonExecutionGuard(
    await requireHrCapability(HR_RON_OFFER_APPROVE_CAPABILITY),
  );
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
