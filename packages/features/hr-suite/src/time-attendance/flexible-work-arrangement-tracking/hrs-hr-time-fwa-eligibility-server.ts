import type { HrFwaArrangementKindInput } from "./hr.time.fwa-arrangement-types.schema";
import type { HrFwaEligibilityResultInput } from "./hr.time.fwa-eligibility.schema";
import { fwaDbEvaluateEmployeeEligibility } from "./hr.time.fwa-db.shared.server";

/** HRM-FWA-007 — evaluate eligibility against configured rules. */
export async function evaluateHrTimeFwaEmployeeEligibility(input: {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKindInput;
  policyGroupCode?: string;
  asOf?: Date;
}): Promise<HrFwaEligibilityResultInput> {
  return fwaDbEvaluateEmployeeEligibility({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    arrangementKind: input.arrangementKind,
    policyGroupCode: input.policyGroupCode,
    asOf: input.asOf,
  });
}

export function summarizeHrTimeFwaEligibility(
  result: HrFwaEligibilityResultInput,
): string {
  if (result.eligible) {
    return result.reason;
  }
  if (result.requiresExceptionApproval) {
    return `${result.reason} An authorized exception approval is required.`;
  }
  return result.reason;
}

export function isHrTimeFwaEligibleWithoutException(
  result: HrFwaEligibilityResultInput,
): boolean {
  return result.eligible;
}

export function requiresHrTimeFwaExceptionApproval(
  result: HrFwaEligibilityResultInput,
): boolean {
  return !result.eligible && result.requiresExceptionApproval;
}
