
import {
  appendHrFwaAuditEvent,
  computeHrFwaWeeklyScheduleMetrics,
  getHrFwaArrangementById,
  getHrFwaSchedulePattern,
  getOrCreateDefaultHrFwaPolicyGroup,
  listHrFwaComplianceBreaches,
  listHrFwaPolicyGroups,
  monitorHrFwaArrangementCompliance,
} from "@afenda/db";

import {
  compareHrFwaScheduleWithAttendance,
  countHrFwaObservedLocationDays,
} from "./hr.time.fwa-attendance-compare.server";
import {
  compareHrFwaRemoteScheduleWithCheckins,
  hasHrFwaUnapprovedRemoteLocation,
} from "./hr.time.fwa-remote-checkin-compare.server";
import {
  eachUtcDayInRange,
  estimateHrFwaDailyHours,
  hrFwaComplianceMonitoringResultSchema,
  hrFwaCompliancePeriodQuerySchema,
  isHrFwaAttendedStatus,
  normalizeHrFwaSchedulePattern,
  resolveHrFwaDayExpectation,
  type HrFwaComplianceBreachKind,
  type HrFwaComplianceMonitoringResult,
  type HrFwaSchedulePatternSnapshot,
} from "./hr.time.fwa-compliance.schema";

/** HRM-FWA-018 — evaluate minimum office-day requirements for a monitoring period. */
export function evaluateHrFwaOfficeDayCompliance(input: {
  expectedOfficeDays: number | null;
  observedOfficeDays: number;
}): HrFwaComplianceBreachKind | null {
  if (
    input.expectedOfficeDays !== null &&
    input.observedOfficeDays < input.expectedOfficeDays
  ) {
    return "missed_office_days";
  }
  return null;
}

/** HRM-FWA-019 — evaluate maximum remote-day limits for a monitoring period. */
export function evaluateHrFwaRemoteDayCompliance(input: {
  expectedRemoteDays: number | null;
  observedRemoteDays: number;
}): HrFwaComplianceBreachKind | null {
  if (
    input.expectedRemoteDays !== null &&
    input.observedRemoteDays > input.expectedRemoteDays
  ) {
    return "excessive_remote_days";
  }
  return null;
}

/** HRM-FWA-020 — evaluate expected working hours against approved flexible schedule. */
export function evaluateHrFwaWorkingHoursCompliance(input: {
  pattern: HrFwaSchedulePatternSnapshot;
  attendedWorkDays: number;
}): { compliant: boolean; breach: HrFwaComplianceBreachKind | null } {
  const expectedWeeklyHours = input.pattern.expectedWeeklyHours;
  if (expectedWeeklyHours === undefined || expectedWeeklyHours <= 0) {
    return { compliant: true, breach: null };
  }

  const dailyHours = estimateHrFwaDailyHours(input.pattern);
  const actualHours = input.attendedWorkDays * dailyHours;
  const compliant = actualHours >= expectedWeeklyHours;

  return {
    compliant,
    breach: compliant ? null : "working_hours_non_compliance",
  };
}

/** HRM-FWA-021 — derive breach kinds from comparison signals. */
export function flagHrFwaPolicyBreaches(input: {
  officeBreach: HrFwaComplianceBreachKind | null;
  remoteBreach: HrFwaComplianceBreachKind | null;
  hoursBreach: HrFwaComplianceBreachKind | null;
  unapprovedRemoteLocation: boolean;
  incompleteAttendance: boolean;
}): HrFwaComplianceBreachKind[] {
  const kinds = new Set<HrFwaComplianceBreachKind>();

  if (input.officeBreach) kinds.add(input.officeBreach);
  if (input.remoteBreach) kinds.add(input.remoteBreach);
  if (input.hoursBreach) kinds.add(input.hoursBreach);
  if (input.unapprovedRemoteLocation) {
    kinds.add("unapproved_remote_location");
  }
  if (input.incompleteAttendance) {
    kinds.add("incomplete_attendance");
  }

  return [...kinds];
}

async function resolvePolicyLimits(input: {
  organizationId: string;
  policyGroupCode: string;
  pattern: HrFwaSchedulePatternSnapshot;
}): Promise<{
  expectedOfficeDays: number | null;
  expectedRemoteDays: number | null;
  expectedWeeklyHours: number | null;
}> {
  const groups = await listHrFwaPolicyGroups({
    organizationId: input.organizationId,
    activeOnly: true,
  });
  const fallback = await getOrCreateDefaultHrFwaPolicyGroup({
    organizationId: input.organizationId,
  });
  const group =
    groups.find((entry) => entry.code === input.policyGroupCode) ?? fallback;

  const metrics = computeHrFwaWeeklyScheduleMetrics({
    patternDetails: input.pattern,
  });

  return {
    expectedOfficeDays:
      metrics.officeDays > 0
        ? metrics.officeDays
        : group.minOfficeDaysPerWeek,
    expectedRemoteDays:
      metrics.remoteDays > 0
        ? metrics.remoteDays
        : group.maxRemoteDaysPerWeek,
    expectedWeeklyHours: input.pattern.expectedWeeklyHours ?? null,
  };
}

/** HRM-FWA-018 … FWA-021 — monitor arrangement compliance and persist breaches. */
export async function monitorHrFwaComplianceForPeriod(
  input: unknown,
): Promise<HrFwaComplianceMonitoringResult> {
  const query = hrFwaCompliancePeriodQuerySchema.parse(input);

  if (!query.arrangementId) {
    throw new Error("arrangementId is required for compliance monitoring");
  }

  const arrangement = await getHrFwaArrangementById({
    organizationId: query.organizationId,
    arrangementId: query.arrangementId,
  });

  const pattern = arrangement.schedulePatternId
    ? normalizeHrFwaSchedulePattern(
        (
          await getHrFwaSchedulePattern({
            organizationId: query.organizationId,
            schedulePatternId: arrangement.schedulePatternId,
          })
        ).patternDetails,
      )
    : normalizeHrFwaSchedulePattern({});

  const attendanceCompare = await compareHrFwaScheduleWithAttendance({
    organizationId: query.organizationId,
    arrangementId: query.arrangementId,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
  });

  const remoteCompare = await compareHrFwaRemoteScheduleWithCheckins({
    organizationId: query.organizationId,
    arrangementId: query.arrangementId,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
  });

  const { observedOfficeDays, observedRemoteDays } = countHrFwaObservedLocationDays(
    { compareRows: attendanceCompare.rows },
  );

  const attendedWorkDays = attendanceCompare.rows.filter((row) =>
    isHrFwaAttendedStatus(row.attendanceStatus),
  ).length;

  const incompleteAttendance = attendanceCompare.rows.some(
    (row) => row.mismatchReason === "incomplete_attendance",
  );

  const limits = await resolvePolicyLimits({
    organizationId: query.organizationId,
    policyGroupCode: arrangement.policyGroupCode,
    pattern,
  });

  const officeBreach = evaluateHrFwaOfficeDayCompliance({
    expectedOfficeDays: limits.expectedOfficeDays,
    observedOfficeDays,
  });
  const remoteBreach = evaluateHrFwaRemoteDayCompliance({
    expectedRemoteDays: limits.expectedRemoteDays,
    observedRemoteDays,
  });
  const hoursEvaluation = evaluateHrFwaWorkingHoursCompliance({
    pattern,
    attendedWorkDays,
  });

  const breachKinds = flagHrFwaPolicyBreaches({
    officeBreach,
    remoteBreach,
    hoursBreach: hoursEvaluation.breach,
    unapprovedRemoteLocation: hasHrFwaUnapprovedRemoteLocation(remoteCompare),
    incompleteAttendance,
  });

  const { breachIds } = await monitorHrFwaArrangementCompliance({
    organizationId: query.organizationId,
    arrangementId: query.arrangementId,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    observedOfficeDays,
    observedRemoteDays,
    unapprovedRemoteLocation: breachKinds.includes("unapproved_remote_location"),
    incompleteAttendance,
  });

  await appendHrFwaAuditEvent({
    organizationId: query.organizationId,
    action: "compliance_breach",
    summary: `Compliance monitoring completed with ${breachKinds.length} breach kind(s)`,
    arrangementId: query.arrangementId,
    employeeId: arrangement.employeeId,
    metadata: {
      breachKinds,
      breachIds,
      observedOfficeDays,
      observedRemoteDays,
      attendedWorkDays,
    },
  });

  const storedBreaches = await listHrFwaComplianceBreaches({
    organizationId: query.organizationId,
    arrangementId: query.arrangementId,
    detectedFrom: query.periodStart,
    detectedTo: query.periodEnd,
    limit: 100,
  });

  const result = {
    requirementCodes: [
      "HRM-FWA-018",
      "HRM-FWA-019",
      "HRM-FWA-020",
      "HRM-FWA-021",
    ] as const,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    observedOfficeDays,
    observedRemoteDays,
    expectedOfficeDays: limits.expectedOfficeDays,
    expectedRemoteDays: limits.expectedRemoteDays,
    expectedWeeklyHours: limits.expectedWeeklyHours,
    actualAttendedDays: attendedWorkDays,
    workingHoursCompliant: hoursEvaluation.compliant,
    breachKinds,
    breaches: storedBreaches
      .filter((breach) => breachIds.includes(breach.id))
      .map((breach) => ({
        breachId: breach.id,
        arrangementId: breach.arrangementId,
        employeeId: breach.employeeId,
        breachKind: breach.breachKind,
        description: breach.description,
        expectedValue: breach.expectedValue,
        actualValue: breach.actualValue,
        periodStart: breach.periodStart,
        periodEnd: breach.periodEnd,
        detectedAt: breach.detectedAt,
      })),
  };

  return hrFwaComplianceMonitoringResultSchema.parse(result);
}

/** Summarize expected work days in a period for downstream validation. */
export function countHrFwaExpectedWorkDays(input: {
  pattern: HrFwaSchedulePatternSnapshot;
  periodStart: Date;
  periodEnd: Date;
}): number {
  return eachUtcDayInRange(input.periodStart, input.periodEnd).filter(
    (day) => {
      const expectation = resolveHrFwaDayExpectation(
        input.pattern,
        day.getUTCDay(),
      );
      return (
        expectation === "office" ||
        expectation === "remote" ||
        expectation === "work"
      );
    },
  ).length;
}
