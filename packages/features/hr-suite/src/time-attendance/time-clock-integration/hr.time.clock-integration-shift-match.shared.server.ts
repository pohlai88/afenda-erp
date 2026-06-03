import {
  matchHrTimeClockPunchToShift,
  type HrTimeClockShiftMatch,
} from "@afenda/db";

export { matchHrTimeClockPunchToShift };
export type { HrTimeClockShiftMatch };

/**
 * HRM-TCI-020 — shift schedule matching when `hr_shift_assignments` rows exist;
 * otherwise falls back to `hr_attendance_policies` standard start/end minutes.
 * See `time-clock-integration-architecture.md` § Shift Matching Reference.
 */
export async function matchHrTimeClockPunchShiftForEmployee(input: {
  organizationId: string;
  employeeId: string;
  punchedAt: Date;
  policyGroupCode?: string;
}): Promise<HrTimeClockShiftMatch> {
  return matchHrTimeClockPunchToShift(input);
}
