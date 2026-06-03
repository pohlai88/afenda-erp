import { creditHrOvertimeCompensatoryLeave } from "@afenda/db";

/** HRM-OTM-022 — feature door for compensatory leave credit on final approve. */
export async function creditHrTimeOtmCompensatoryLeave(
  input: Parameters<typeof creditHrOvertimeCompensatoryLeave>[0],
) {
  return creditHrOvertimeCompensatoryLeave(input);
}
