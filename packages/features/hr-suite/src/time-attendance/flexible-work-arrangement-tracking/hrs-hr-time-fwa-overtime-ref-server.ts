
import {
  getHrFwaSchedulePattern,
  listHrFwaArrangementsWindow,
} from "@afenda/db";

import {
  endOfUtcDay,
  hrFwaOvertimeWorkHourRefsResultSchema,
  normalizeHrFwaSchedulePattern,
  startOfUtcDay,
  type HrFwaOvertimeWorkHourRefRow,
  type HrFwaOvertimeWorkHourRefsResult,
} from "./hr.time.fwa-compliance.schema";

function overlapsPeriod(input: {
  effectiveFrom: Date;
  effectiveTo: Date | null;
  periodStart: Date;
  periodEnd: Date;
}): boolean {
  const start = startOfUtcDay(input.periodStart).getTime();
  const end = endOfUtcDay(input.periodEnd).getTime();
  const effectiveStart = input.effectiveFrom.getTime();
  const effectiveEnd =
    input.effectiveTo?.getTime() ?? Number.POSITIVE_INFINITY;
  return effectiveStart <= end && effectiveEnd >= start;
}

/** HRM-FWA-026 — expose approved work-hour references to Overtime Management. */
export async function listHrFwaWorkHourRefsForOvertime(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  employeeId?: string;
}): Promise<HrFwaOvertimeWorkHourRefsResult> {
  const window = await listHrFwaArrangementsWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    status: "active",
    limit: 100,
  });

  const references: HrFwaOvertimeWorkHourRefRow[] = [];

  for (const arrangement of window.rows) {
    if (
      !overlapsPeriod({
        effectiveFrom: arrangement.effectiveFrom,
        effectiveTo: arrangement.effectiveTo,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      })
    ) {
      continue;
    }

    const pattern = arrangement.schedulePatternId
      ? normalizeHrFwaSchedulePattern(
          (
            await getHrFwaSchedulePattern({
              organizationId: input.organizationId,
              schedulePatternId: arrangement.schedulePatternId,
            })
          ).patternDetails,
        )
      : normalizeHrFwaSchedulePattern({});

    references.push({
      referenceId: `fwa.hours:${arrangement.id}`,
      boundary: "flexible_work_arrangement",
      arrangementId: arrangement.id,
      employeeId: arrangement.employeeId,
      employeeNumber: arrangement.employeeNumber,
      employeeDisplayName: arrangement.employeeDisplayName,
      expectedWeeklyHours: pattern.expectedWeeklyHours ?? null,
      coreHoursStartMinutes: pattern.coreHoursStartMinutes ?? null,
      coreHoursEndMinutes: pattern.coreHoursEndMinutes ?? null,
      extendedDailyHours: pattern.extendedDailyHours ?? null,
      compressedWorkingDaysPerWeek:
        pattern.compressedWorkingDaysPerWeek ?? null,
      workDays: [...pattern.workDays],
      effectiveFrom: arrangement.effectiveFrom,
      effectiveTo: arrangement.effectiveTo,
    });
  }

  const result = {
    requirementCode: "HRM-FWA-026" as const,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    references,
  };

  return hrFwaOvertimeWorkHourRefsResultSchema.parse(result);
}

/** OTM consumer helper — resolve work-hour reference for one employee on a work date. */
export async function getHrFwaOvertimeWorkHourRefForEmployeeDate(input: {
  organizationId: string;
  employeeId: string;
  workDate: Date;
}): Promise<HrFwaOvertimeWorkHourRefRow | null> {
  const refs = await listHrFwaWorkHourRefsForOvertime({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    periodStart: input.workDate,
    periodEnd: input.workDate,
  });
  return refs.references[0] ?? null;
}
