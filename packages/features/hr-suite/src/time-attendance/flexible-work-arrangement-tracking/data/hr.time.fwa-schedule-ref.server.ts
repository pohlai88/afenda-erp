import "@afenda/kernel/server";

import {
  getHrFwaSchedulePattern,
  listHrFwaArrangementsWindow,
} from "@afenda/db";

import {
  endOfUtcDay,
  hrFwaLamScheduleRefsResultSchema,
  normalizeHrFwaSchedulePattern,
  startOfUtcDay,
  type HrFwaLamScheduleRefRow,
  type HrFwaLamScheduleRefsResult,
} from "../schemas/hr.time.fwa-compliance.schema";

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

function buildLamScheduleRef(input: {
  arrangement: Awaited<
    ReturnType<typeof listHrFwaArrangementsWindow>
  >["rows"][number];
  schedulePattern: ReturnType<typeof normalizeHrFwaSchedulePattern>;
}): HrFwaLamScheduleRefRow {
  return {
    referenceId: `fwa.schedule:${input.arrangement.id}`,
    boundary: "flexible_work_arrangement",
    arrangementId: input.arrangement.id,
    employeeId: input.arrangement.employeeId,
    employeeNumber: input.arrangement.employeeNumber,
    employeeDisplayName: input.arrangement.employeeDisplayName,
    arrangementKind: input.arrangement.arrangementKind,
    policyGroupCode: input.arrangement.policyGroupCode,
    effectiveFrom: input.arrangement.effectiveFrom,
    effectiveTo: input.arrangement.effectiveTo,
    schedulePattern: input.schedulePattern,
  };
}

/** HRM-FWA-025 — expose approved work schedule references to Leave & Attendance Management. */
export async function listHrFwaScheduleRefsForLam(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  employeeId?: string;
}): Promise<HrFwaLamScheduleRefsResult> {
  const window = await listHrFwaArrangementsWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    status: "active",
    limit: 100,
  });

  const references: HrFwaLamScheduleRefRow[] = [];

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

    const schedulePattern = arrangement.schedulePatternId
      ? normalizeHrFwaSchedulePattern(
          (
            await getHrFwaSchedulePattern({
              organizationId: input.organizationId,
              schedulePatternId: arrangement.schedulePatternId,
            })
          ).patternDetails,
        )
      : normalizeHrFwaSchedulePattern({});

    references.push(
      buildLamScheduleRef({
        arrangement,
        schedulePattern,
      }),
    );
  }

  const result = {
    requirementCode: "HRM-FWA-025" as const,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    references,
  };

  return hrFwaLamScheduleRefsResultSchema.parse(result);
}

/** LAM consumer helper — resolve schedule reference for one employee on a work date. */
export async function getHrFwaLamScheduleRefForEmployeeDate(input: {
  organizationId: string;
  employeeId: string;
  workDate: Date;
}): Promise<HrFwaLamScheduleRefRow | null> {
  const refs = await listHrFwaScheduleRefsForLam({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    periodStart: input.workDate,
    periodEnd: input.workDate,
  });
  return refs.references[0] ?? null;
}
