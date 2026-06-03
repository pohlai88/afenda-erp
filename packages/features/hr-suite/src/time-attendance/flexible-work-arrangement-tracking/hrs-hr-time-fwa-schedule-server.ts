import {
  createHrFwaSchedulePattern,
  getHrFwaSchedulePattern,
  type HrFwaSchedulePatternDetails,
} from "@afenda/db";

import {
  hrFwaSchedulePatternDetailsSchema,
  type HrFwaSchedulePatternDetailsInput,
} from "./hr.time.fwa-schedule.schema";

export type { HrFwaSchedulePatternDetails };

export function normalizeHrFwaSchedulePatternDetails(
  input: HrFwaSchedulePatternDetailsInput,
): HrFwaSchedulePatternDetails {
  const parsed = hrFwaSchedulePatternDetailsSchema.parse(input);
  return parsed;
}

export function isHrFwaCompressedSchedule(
  patternDetails: HrFwaSchedulePatternDetails,
): boolean {
  return (
    patternDetails.extendedDailyHours !== undefined &&
    patternDetails.compressedWorkingDaysPerWeek !== undefined
  );
}

export async function createHrFwaArrangementSchedulePattern(input: {
  organizationId: string;
  employeeId?: string | null;
  label?: string | null;
  patternDetails: HrFwaSchedulePatternDetailsInput;
}): Promise<{ schedulePatternId: string }> {
  const patternDetails = normalizeHrFwaSchedulePatternDetails(
    input.patternDetails,
  );

  return createHrFwaSchedulePattern({
    organizationId: input.organizationId,
    employeeId: input.employeeId ?? null,
    label: input.label ?? null,
    patternDetails,
  });
}

export async function getHrFwaArrangementSchedulePattern(input: {
  organizationId: string;
  schedulePatternId: string;
}) {
  return getHrFwaSchedulePattern(input);
}

export function summarizeHrFwaSchedulePattern(
  patternDetails: HrFwaSchedulePatternDetails,
) {
  return {
    officeDayCount: patternDetails.officeDays?.length ?? 0,
    remoteDayCount: patternDetails.remoteDays?.length ?? 0,
    workDayCount: patternDetails.workDays?.length ?? 0,
    restDayCount: patternDetails.restDays?.length ?? 0,
    expectedWeeklyHours: patternDetails.expectedWeeklyHours ?? null,
    hasCoreHours:
      patternDetails.coreHoursStartMinutes !== undefined &&
      patternDetails.coreHoursEndMinutes !== undefined,
    hasFlexibleHours:
      patternDetails.flexibleStartEarliestMinutes !== undefined ||
      patternDetails.flexibleEndLatestMinutes !== undefined,
    isCompressed: isHrFwaCompressedSchedule(patternDetails),
    extendedDailyHours: patternDetails.extendedDailyHours ?? null,
    compressedWorkingDaysPerWeek:
      patternDetails.compressedWorkingDaysPerWeek ?? null,
  };
}
