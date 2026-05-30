import type { HrFwaArrangementKindInput } from "../schemas/hr.time.fwa-arrangement-types.schema";
import type { HrFwaEligibilityResultInput } from "../schemas/hr.time.fwa-eligibility.schema";
import type { HrFwaSchedulePatternDetailsInput } from "../schemas/hr.time.fwa-schedule.schema";
import { HrTimeFwaEligibilityBlockedError } from "./hr.time.fwa-action-result.shared";
import { assertHrTimeFwaExceptionPath } from "./hr.time.fwa-exception.server";
import {
  fwaDbCreateSchedulePattern,
  fwaDbSubmitRequest,
  fwaDbValidateRequestPrerequisites,
} from "./hr.time.fwa-db.shared.server";

export type HrTimeFwaEligibilityGateInput = {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKindInput;
  policyGroupCode?: string;
  startDate: Date;
  endDate?: Date | null;
  supportingDocumentId?: string | null;
  remoteLocationId?: string | null;
  exceptionRequested?: boolean;
  asOf?: Date;
};

export type SubmitHrTimeFwaRequestInput = {
  organizationId: string;
  actorAuthUserId: string;
  employeeId: string;
  initiatorKind: "employee" | "manager" | "hr";
  initiatorEmployeeId?: string | null;
  arrangementKind: HrFwaArrangementKindInput;
  startDate: Date;
  endDate?: Date | null;
  reason?: string | null;
  policyGroupCode?: string;
  remoteLocationId?: string | null;
  supportingDocumentId?: string | null;
  exceptionRequested?: boolean;
  schedulePatternLabel?: string | null;
  schedulePatternDetails?: HrFwaSchedulePatternDetailsInput;
};

async function resolveSchedulePatternId(
  input: SubmitHrTimeFwaRequestInput,
): Promise<string | null> {
  if (!input.schedulePatternDetails) {
    return null;
  }

  const created = await fwaDbCreateSchedulePattern({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    label: input.schedulePatternLabel,
    patternDetails: input.schedulePatternDetails,
  });
  return created.schedulePatternId;
}

/** HRM-FWA-004 / FWA-005 / FWA-006 / FWA-007 — submit with eligibility gate. */
export async function submitHrTimeFwaRequest(
  input: SubmitHrTimeFwaRequestInput,
): Promise<{
  requestId: string;
  eligibility: HrFwaEligibilityResultInput;
}> {
  const eligibilityGate: HrTimeFwaEligibilityGateInput = {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    arrangementKind: input.arrangementKind,
    policyGroupCode: input.policyGroupCode,
    startDate: input.startDate,
    endDate: input.endDate,
    supportingDocumentId: input.supportingDocumentId,
    remoteLocationId: input.remoteLocationId,
    exceptionRequested: input.exceptionRequested,
  };

  const eligibility = await validateHrTimeFwaRequestEligibility(eligibilityGate);
  assertHrTimeFwaExceptionPath({
    eligibility,
    exceptionRequested: input.exceptionRequested,
  });

  const schedulePatternId = await resolveSchedulePatternId(input);

  const { requestId } = await fwaDbSubmitRequest({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    arrangementKind: input.arrangementKind,
    startDate: input.startDate,
    endDate: input.endDate,
    reason: input.reason,
    policyGroupCode: input.policyGroupCode,
    initiatorKind: input.initiatorKind,
    initiatorEmployeeId: input.initiatorEmployeeId ?? input.employeeId,
    initiatorAuthUserId: input.actorAuthUserId,
    schedulePatternId,
    remoteLocationId: input.remoteLocationId,
    supportingDocumentId: input.supportingDocumentId,
    exceptionRequested: input.exceptionRequested ?? !eligibility.eligible,
  });

  return { requestId, eligibility };
}

/** HRM-FWA-007 — validate prerequisites and eligibility before submission. */
export async function validateHrTimeFwaRequestEligibility(
  input: HrTimeFwaEligibilityGateInput,
): Promise<HrFwaEligibilityResultInput> {
  return fwaDbValidateRequestPrerequisites({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    arrangementKind: input.arrangementKind,
    policyGroupCode: input.policyGroupCode,
    startDate: input.startDate,
    endDate: input.endDate,
    supportingDocumentId: input.supportingDocumentId,
    remoteLocationId: input.remoteLocationId,
    exceptionRequested: input.exceptionRequested,
  });
}

export async function previewHrTimeFwaRequestEligibility(
  input: HrTimeFwaEligibilityGateInput,
): Promise<HrFwaEligibilityResultInput> {
  try {
    return await validateHrTimeFwaRequestEligibility(input);
  } catch (error) {
    if (error instanceof HrTimeFwaEligibilityBlockedError) {
      return {
        eligible: false,
        requiresExceptionApproval: true,
        matchedRuleId: null,
        reason: error.eligibilityReason,
      };
    }
    throw error;
  }
}
