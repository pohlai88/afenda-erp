import {
  buildWorkforceAvailabilityIndicators,
  evaluateCoverageRisk,
  hrAatAvailabilityQuerySchema,
  type HrAatCoverageRiskFlag,
  type HrAatWorkforceAvailabilityIndicators,
} from "./hr.time.aat-comparison.schema";
import {
  loadHrAatActiveHeadcount,
  loadHrAatUnavailableCounts,
} from "./hr.time.aat-comparison.server";

/** HRM-AAT-014 — workforce availability indicators for the selected scope. */
export async function loadHrAatWorkforceAvailabilityIndicators(
  input: unknown,
): Promise<HrAatWorkforceAvailabilityIndicators> {
  const query = hrAatAvailabilityQuerySchema.parse(input);
  const [totalHeadcount, unavailable] = await Promise.all([
    loadHrAatActiveHeadcount({
      organizationId: query.organizationId,
      departmentId: query.departmentId,
      managerEmployeeId: query.managerEmployeeId,
      workLocationCode: query.workLocationCode,
    }),
    loadHrAatUnavailableCounts({
      organizationId: query.organizationId,
      periodStart: query.periodStart,
      periodEnd: query.periodEnd,
      departmentId: query.departmentId,
      managerEmployeeId: query.managerEmployeeId,
      workLocationCode: query.workLocationCode,
    }),
  ]);

  return buildWorkforceAvailabilityIndicators({
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    totalHeadcount,
    onLeaveCount: unavailable.onLeaveCount,
    absentCount: unavailable.absentCount,
  });
}

/** HRM-AAT-015 — flag workforce coverage risk when absence exceeds threshold. */
export async function loadHrAatCoverageRiskFlag(
  input: unknown,
): Promise<HrAatCoverageRiskFlag> {
  const query = hrAatAvailabilityQuerySchema.parse(input);
  const [totalHeadcount, unavailable] = await Promise.all([
    loadHrAatActiveHeadcount({
      organizationId: query.organizationId,
      departmentId: query.departmentId,
      managerEmployeeId: query.managerEmployeeId,
      workLocationCode: query.workLocationCode,
    }),
    loadHrAatUnavailableCounts({
      organizationId: query.organizationId,
      periodStart: query.periodStart,
      periodEnd: query.periodEnd,
      departmentId: query.departmentId,
      managerEmployeeId: query.managerEmployeeId,
      workLocationCode: query.workLocationCode,
    }),
  ]);

  return evaluateCoverageRisk({
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    totalHeadcount,
    unavailableCount: unavailable.onLeaveCount + unavailable.absentCount,
    thresholdPct: query.coverageRiskThresholdPct,
  });
}

/** Convenience loader returning availability indicators and coverage risk together. */
export async function loadHrAatAvailabilityBundle(input: unknown): Promise<{
  availability: HrAatWorkforceAvailabilityIndicators;
  coverageRisk: HrAatCoverageRiskFlag;
}> {
  const [availability, coverageRisk] = await Promise.all([
    loadHrAatWorkforceAvailabilityIndicators(input),
    loadHrAatCoverageRiskFlag(input),
  ]);

  return { availability, coverageRisk };
}
