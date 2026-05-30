export {
  isOpenEnrollmentWindowActive,
  type HrBenefitOpenEnrollmentWindowRow,
} from "@afenda/db";

/** HRM-BEN-006 — open enrollment enrollments require an active window for the plan. */
export function assertOpenEnrollmentChannelAllowed(input: {
  enrollmentChannel: string;
  windowActive: boolean;
  planInWindow: boolean;
  eligibilityOverrideReference?: string | null;
}): { allowed: boolean; reason?: string } {
  if (input.enrollmentChannel !== "open_enrollment") {
    return { allowed: true };
  }
  if (input.eligibilityOverrideReference?.trim()) {
    return { allowed: true };
  }
  if (!input.windowActive) {
    return { allowed: false, reason: "open_enrollment_closed" };
  }
  if (!input.planInWindow) {
    return {
      allowed: false,
      reason: "open_enrollment_plan_not_in_window",
    };
  }
  return { allowed: true };
}
