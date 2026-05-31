import {
  promoteValidatedHrTimeClockPunchToLam,
  HrTimeClockCommandError,
} from "@afenda/db";

export { HrTimeClockCommandError };

/**
 * HRM-TCI-029 — promotes validated raw punches into `hr_attendance_records`
 * with `source=time_clock` and idempotency `time_clock:{rawPunchId}`.
 * Raw substrate remains in `hr_time_clock_raw_punches`.
 */
export async function promoteHrTimeClockPunchToLamCommand(input: {
  organizationId: string;
  rawPunchId: string;
  actorAuthUserId: string;
}) {
  return promoteValidatedHrTimeClockPunchToLam(input);
}
