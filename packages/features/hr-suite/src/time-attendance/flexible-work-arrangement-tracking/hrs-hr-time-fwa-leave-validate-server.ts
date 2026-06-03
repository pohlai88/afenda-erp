
import {
  getHrFwaSchedulePattern,
  listHrFwaArrangementsWindow,
} from "@afenda/db";

import {
  eachUtcDayInRange,
  hrFwaLeaveValidationResultSchema,
  normalizeHrFwaSchedulePattern,
  resolveHrFwaDayExpectation,
  type HrFwaLeaveValidationResult,
  type HrFwaLeaveValidationViolation,
} from "./hr.time.fwa-compliance.schema";

async function resolveActiveArrangement(input: {
  organizationId: string;
  employeeId: string;
  asOf: Date;
}) {
  const window = await listHrFwaArrangementsWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    status: "active",
    limit: 25,
  });

  return window.rows.find((row) => {
    const starts = row.effectiveFrom.getTime() <= input.asOf.getTime();
    const ends =
      row.effectiveTo === null ||
      row.effectiveTo.getTime() >= input.asOf.getTime();
    return starts && ends;
  });
}

/** HRM-FWA-024 — validate leave application against approved flexible schedule. */
export async function validateHrLeaveApplicationAgainstFwaSchedule(input: {
  organizationId: string;
  employeeId: string;
  leaveStart: Date;
  leaveEnd: Date;
}): Promise<HrFwaLeaveValidationResult> {
  const arrangement = await resolveActiveArrangement({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    asOf: input.leaveStart,
  });

  if (!arrangement) {
    const result = {
      requirementCode: "HRM-FWA-024" as const,
      valid: true,
      employeeId: input.employeeId,
      arrangementId: null,
      leaveStart: input.leaveStart,
      leaveEnd: input.leaveEnd,
      violations: [] as HrFwaLeaveValidationViolation[],
    };
    return hrFwaLeaveValidationResultSchema.parse(result);
  }

  if (!arrangement.schedulePatternId) {
    const result = {
      requirementCode: "HRM-FWA-024" as const,
      valid: true,
      employeeId: input.employeeId,
      arrangementId: arrangement.id,
      leaveStart: input.leaveStart,
      leaveEnd: input.leaveEnd,
      violations: [] as HrFwaLeaveValidationViolation[],
    };
    return hrFwaLeaveValidationResultSchema.parse(result);
  }

  const schedulePattern = await getHrFwaSchedulePattern({
    organizationId: input.organizationId,
    schedulePatternId: arrangement.schedulePatternId,
  });
  const pattern = normalizeHrFwaSchedulePattern(schedulePattern.patternDetails);
  const violations: HrFwaLeaveValidationViolation[] = [];

  for (const workDate of eachUtcDayInRange(input.leaveStart, input.leaveEnd)) {
    const expectation = resolveHrFwaDayExpectation(
      pattern,
      workDate.getUTCDay(),
    );

    if (expectation === "off") {
      violations.push({
        code: "leave_outside_work_pattern",
        message: "Leave includes a day outside the approved work pattern",
        workDate,
      });
    }

    if (
      arrangement.arrangementKind === "hybrid" &&
      expectation === "office"
    ) {
      violations.push({
        code: "leave_spans_required_office_day",
        message:
          "Leave spans a required office day under the hybrid arrangement",
        workDate,
      });
    }

    if (
      expectation === "office" &&
      (arrangement.arrangementKind === "remote" ||
        arrangement.arrangementKind === "hybrid")
    ) {
      violations.push({
        code: "leave_on_office_day_conflict",
        message: "Leave conflicts with a scheduled office day",
        workDate,
      });
    }
  }

  const result = {
    requirementCode: "HRM-FWA-024" as const,
    valid: violations.length === 0,
    employeeId: input.employeeId,
    arrangementId: arrangement.id,
    leaveStart: input.leaveStart,
    leaveEnd: input.leaveEnd,
    violations,
  };

  return hrFwaLeaveValidationResultSchema.parse(result);
}
