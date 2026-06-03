import {
  createHrOvertimeEligibilityRule,
  evaluateHrOvertimeEmployeeEligibility,
  listHrOvertimeEligibilityRules,
  validateHrOvertimeEligibilityForSubmit,
  type HrOvertimeEligibilityResult,
  type HrOvertimeType,
} from "@afenda/db";

/** HRM-OTM-004 — evaluate eligibility with legal entity, location, and policy group matrix. */
export async function evaluateHrTimeOtmEmployeeEligibility(input: {
  organizationId: string;
  employeeId: string;
  overtimeType: HrOvertimeType;
  policyGroupCode?: string;
  asOf?: Date;
}): Promise<HrOvertimeEligibilityResult> {
  return evaluateHrOvertimeEmployeeEligibility(input);
}

export async function validateHrTimeOtmEligibilityForSubmit(input: {
  organizationId: string;
  employeeId: string;
  overtimeType: HrOvertimeType;
  policyGroupCode?: string;
  eligibilityExceptionReason?: string | null;
}): Promise<HrOvertimeEligibilityResult> {
  return validateHrOvertimeEligibilityForSubmit(input);
}

/** Architecture alias for HRM-OTM-005. */
export const validateOtmEligibilityForSubmit = validateHrTimeOtmEligibilityForSubmit;

export {
  createHrOvertimeEligibilityRule,
  listHrOvertimeEligibilityRules,
};
