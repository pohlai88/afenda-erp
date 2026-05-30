import {
  actionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import {
  getHrFwaCommandErrorClass,
  isHrFwaCommandError,
} from "./hr.time.fwa-db.shared.server";

const HR_FWA_COMMAND_ERROR_MESSAGES: Record<string, string> = {
  employee_not_found: "Employee record was not found.",
  policy_group_not_found: "Flexible work policy group was not found.",
  arrangement_type_not_configured:
    "This flexible work arrangement type is not configured.",
  arrangement_type_inactive:
    "This flexible work arrangement type is inactive.",
  not_eligible:
    "Employee is not eligible for this flexible work arrangement.",
  supporting_document_required: "A supporting document is required.",
  remote_location_required: "An approved remote location is required.",
  invalid_date_range: "End date must be on or after start date.",
  schedule_pattern_not_found: "Schedule pattern was not found.",
  remote_location_not_found: "Remote location was not found.",
  remote_location_not_approved: "Remote location is not approved.",
  arrangement_not_found: "Flexible work arrangement was not found.",
  request_not_found: "Flexible work request was not found.",
};

export class HrTimeFwaAccessDeniedError extends Error {
  constructor(message = "hr_fwa_access_denied") {
    super(message);
    this.name = "HrTimeFwaAccessDeniedError";
  }
}

export class HrTimeFwaEligibilityBlockedError extends Error {
  readonly eligibilityReason: string;

  constructor(reason: string) {
    super("hr_fwa_eligibility_blocked");
    this.name = "HrTimeFwaEligibilityBlockedError";
    this.eligibilityReason = reason;
  }
}

export async function toHrTimeFwaActionFailure(
  error: unknown,
): Promise<ActionResult> {
  if (error instanceof HrTimeFwaAccessDeniedError) {
    return actionFailure("You do not have permission to access flexible work records.");
  }
  if (error instanceof HrTimeFwaEligibilityBlockedError) {
    return actionFailure(
      error.eligibilityReason ||
        "Employee is not eligible unless an authorized exception is approved.",
    );
  }
  if (error instanceof Error && error.message === "hr_fwa_write_required") {
    return actionFailure("You do not have permission to modify flexible work records.");
  }
  if (error instanceof Error && error.message.startsWith("hr_fwa_db_exports_missing")) {
    return actionFailure(
      "Flexible work database commands are not wired yet. Coordinate @afenda/db hr-fwa exports.",
    );
  }

  if (error instanceof Error && error.message.startsWith("fwa_location_restriction:")) {
    return actionFailure(error.message.replace("fwa_location_restriction:", ""));
  }

  const HrFwaCommandError = await getHrFwaCommandErrorClass();
  if (isHrFwaCommandError(error, HrFwaCommandError)) {
    return actionFailure(
      HR_FWA_COMMAND_ERROR_MESSAGES[error.code] ??
        "Flexible work request could not be processed.",
    );
  }

  throw error;
}
