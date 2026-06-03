
import {
  getHrFwaSchedulePattern,
  listHrFwaArrangementsWindow,
} from "@afenda/db";

import {
  endOfUtcDay,
  hrFwaPayrollScheduleRefsResultSchema,
  normalizeHrFwaSchedulePattern,
  startOfUtcDay,
  type HrFwaPayrollScheduleRefRow,
  type HrFwaPayrollScheduleRefsResult,
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

function buildPayrollReference(arrangementId: string, existing: string | null) {
  return existing ?? `hr-fwa:${arrangementId}`;
}

function buildUnpaidScheduleReference(input: {
  arrangementId: string;
  arrangementKind: string;
  expectedWeeklyHours: number | null;
}): string | null {
  if (
    input.arrangementKind !== "part_time" &&
    (input.expectedWeeklyHours === null || input.expectedWeeklyHours >= 40)
  ) {
    return null;
  }
  return `fwa.unpaid:${input.arrangementId}`;
}

function buildAllowanceEligibilityReference(arrangementId: string): string {
  return `fwa.allowance:${arrangementId}`;
}

/** HRM-FWA-027 — expose payroll-relevant flexible schedule references. */
export async function listHrFwaPayrollScheduleRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  employeeId?: string;
}): Promise<HrFwaPayrollScheduleRefsResult> {
  const window = await listHrFwaArrangementsWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    status: "active",
    limit: 100,
  });

  const references: HrFwaPayrollScheduleRefRow[] = [];

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

    const expectedWeeklyHours = pattern.expectedWeeklyHours ?? null;

    references.push({
      referenceId: buildPayrollReference(
        arrangement.id,
        arrangement.payrollReference,
      ),
      boundary: "flexible_work_arrangement",
      arrangementId: arrangement.id,
      employeeId: arrangement.employeeId,
      employeeNumber: arrangement.employeeNumber,
      employeeDisplayName: arrangement.employeeDisplayName,
      arrangementKind: arrangement.arrangementKind,
      expectedWeeklyHours,
      unpaidScheduleReference: buildUnpaidScheduleReference({
        arrangementId: arrangement.id,
        arrangementKind: arrangement.arrangementKind,
        expectedWeeklyHours,
      }),
      allowanceEligibilityReference: buildAllowanceEligibilityReference(
        arrangement.id,
      ),
      effectiveFrom: arrangement.effectiveFrom,
      effectiveTo: arrangement.effectiveTo,
      readyForPayroll: arrangement.status === "active",
    });
  }

  const result = {
    requirementCode: "HRM-FWA-027" as const,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    references,
  };

  return hrFwaPayrollScheduleRefsResultSchema.parse(result);
}

/** Payroll consumer helper — resolve schedule reference for one employee on a work date. */
export async function getHrFwaPayrollScheduleRefForEmployeeDate(input: {
  organizationId: string;
  employeeId: string;
  workDate: Date;
}): Promise<HrFwaPayrollScheduleRefRow | null> {
  const refs = await listHrFwaPayrollScheduleRefs({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    periodStart: input.workDate,
    periodEnd: input.workDate,
  });
  return refs.references[0] ?? null;
}
