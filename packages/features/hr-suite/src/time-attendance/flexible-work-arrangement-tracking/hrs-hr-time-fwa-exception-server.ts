import type { HrFwaEligibilityResultInput } from "./hr.time.fwa-eligibility.schema";
import { HrTimeFwaEligibilityBlockedError } from "./hr.time.fwa-action-result.shared";
import { summarizeHrTimeFwaEligibility } from "./hr.time.fwa-eligibility.server";

/**
 * HRM-FWA-008 — block ineligible employees unless an authorized exception
 * is explicitly requested (routes to exception approval workflow).
 */
export function assertHrTimeFwaExceptionPath(input: {
  eligibility: HrFwaEligibilityResultInput;
  exceptionRequested?: boolean;
}): void {
  if (input.eligibility.eligible) {
    return;
  }

  if (input.exceptionRequested) {
    if (!input.eligibility.requiresExceptionApproval) {
      throw new HrTimeFwaEligibilityBlockedError(
        "This employee is ineligible and exception approval is not permitted by policy.",
      );
    }
    return;
  }

  throw new HrTimeFwaEligibilityBlockedError(
    summarizeHrTimeFwaEligibility(input.eligibility),
  );
}

export function canSubmitHrTimeFwaWithException(input: {
  eligibility: HrFwaEligibilityResultInput;
  exceptionRequested?: boolean;
}): boolean {
  if (input.eligibility.eligible) {
    return true;
  }
  return (
    input.exceptionRequested === true &&
    input.eligibility.requiresExceptionApproval
  );
}

export function describeHrTimeFwaExceptionRequirement(
  eligibility: HrFwaEligibilityResultInput,
): string | null {
  if (eligibility.eligible) {
    return null;
  }
  if (!eligibility.requiresExceptionApproval) {
    return "Employee is ineligible and exceptions are not allowed.";
  }
  return "Employee is ineligible. Request an authorized exception to continue.";
}
