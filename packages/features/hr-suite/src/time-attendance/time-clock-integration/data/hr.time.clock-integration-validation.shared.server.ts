import {
  HR_TIME_CLOCK_ACTIVE_EMPLOYMENT_STATUSES,
  runHrTimeClockPunchValidationPipeline,
  type HrTimeClockValidationPipelineResult,
} from "@afenda/db";

export {
  HR_TIME_CLOCK_ACTIVE_EMPLOYMENT_STATUSES,
  runHrTimeClockPunchValidationPipeline,
};
/** HRM-TCI-014 — active employment gate for punch validation. */
export function isHrTimeClockActiveEmploymentStatus(
  status: string,
): boolean {
  return (
    HR_TIME_CLOCK_ACTIVE_EMPLOYMENT_STATUSES as readonly string[]
  ).includes(status);
}

export async function validateHrTimeClockRawPunchAfterIngest(input: {
  organizationId: string;
  rawPunchId: string;
  policyGroupCode?: string;
  actorAuthUserId?: string | null;
}): Promise<HrTimeClockValidationPipelineResult> {
  return runHrTimeClockPunchValidationPipeline(input);
}
