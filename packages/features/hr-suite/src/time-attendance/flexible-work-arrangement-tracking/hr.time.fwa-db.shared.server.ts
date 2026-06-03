import {
  createHrFwaSchedulePattern,
  evaluateHrFwaEmployeeEligibility,
  HrFwaCommandError,
  submitHrFwaRequest,
  validateHrFwaRequestPrerequisites,
  type HrFwaArrangementKind,
  type HrFwaEligibilityResult,
} from "@afenda/db";

import type { HrFwaArrangementKindInput } from "./hr.time.fwa-arrangement-types.schema";
import type { HrFwaEligibilityResultInput } from "./hr.time.fwa-eligibility.schema";
import type { HrFwaSchedulePatternDetailsInput } from "./hr.time.fwa-schedule.schema";

export type SubmitHrFwaRequestDbInput = {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKindInput;
  startDate: Date;
  endDate?: Date | null;
  reason?: string | null;
  policyGroupCode?: string;
  initiatorKind?: "employee" | "manager" | "hr";
  initiatorEmployeeId?: string | null;
  initiatorAuthUserId?: string | null;
  schedulePatternId?: string | null;
  remoteLocationId?: string | null;
  supportingDocumentId?: string | null;
  exceptionRequested?: boolean;
};

export type EvaluateHrFwaEmployeeEligibilityDbInput = {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKindInput;
  policyGroupCode?: string;
  asOf?: Date;
};

export type ValidateHrFwaRequestPrerequisitesDbInput = {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKindInput;
  policyGroupCode?: string;
  startDate: Date;
  endDate?: Date | null;
  supportingDocumentId?: string | null;
  remoteLocationId?: string | null;
  exceptionRequested?: boolean;
};

export type CreateHrFwaSchedulePatternDbInput = {
  organizationId: string;
  employeeId?: string | null;
  label?: string | null;
  patternDetails: HrFwaSchedulePatternDetailsInput;
};

export async function fwaDbEvaluateEmployeeEligibility(
  input: EvaluateHrFwaEmployeeEligibilityDbInput,
): Promise<HrFwaEligibilityResultInput> {
  return evaluateHrFwaEmployeeEligibility({
    ...input,
    arrangementKind: input.arrangementKind as HrFwaArrangementKind,
  });
}

export async function fwaDbValidateRequestPrerequisites(
  input: ValidateHrFwaRequestPrerequisitesDbInput,
): Promise<HrFwaEligibilityResultInput> {
  return validateHrFwaRequestPrerequisites({
    ...input,
    arrangementKind: input.arrangementKind as HrFwaArrangementKind,
  });
}

export async function fwaDbCreateSchedulePattern(
  input: CreateHrFwaSchedulePatternDbInput,
): Promise<{ schedulePatternId: string }> {
  return createHrFwaSchedulePattern(input);
}

export async function fwaDbSubmitRequest(
  input: SubmitHrFwaRequestDbInput,
): Promise<{ requestId: string }> {
  return submitHrFwaRequest({
    ...input,
    arrangementKind: input.arrangementKind as HrFwaArrangementKind,
  });
}

export async function getHrFwaCommandErrorClass() {
  return HrFwaCommandError;
}

export function isHrFwaCommandError(
  error: unknown,
  HrFwaCommandErrorClass: typeof HrFwaCommandError,
): error is InstanceType<typeof HrFwaCommandError> {
  return error instanceof HrFwaCommandErrorClass;
}

export type { HrFwaEligibilityResult };
