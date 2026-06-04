import type { HrFwaEligibilityResultInput } from "./hr.time.fwa-eligibility.schema";
import {
  assertHrTimeFwaExceptionPath,
  canSubmitHrTimeFwaWithException,
} from "./hrs-hr-time-fwa-exception-server";
import type { HrTimeFwaEligibilityGateInput } from "./hrs-hr-time-fwa-request-server";

export type { HrTimeFwaEligibilityGateInput };

/** HRM-FWA-007 / FWA-008 — enforce eligibility before submission. */
export function assertHrTimeFwaSubmissionAllowed(
  eligibility: HrFwaEligibilityResultInput,
  exceptionRequested?: boolean,
): void {
  assertHrTimeFwaExceptionPath({ eligibility, exceptionRequested });
}

export function canSubmitHrTimeFwaRequest(input: {
  eligibility: HrFwaEligibilityResultInput;
  exceptionRequested?: boolean;
}): boolean {
  return canSubmitHrTimeFwaWithException(input);
}

export function shouldRouteHrTimeFwaExceptionApproval(input: {
  eligibility: HrFwaEligibilityResultInput;
  exceptionRequested?: boolean;
}): boolean {
  return !input.eligibility.eligible && input.exceptionRequested === true;
}
