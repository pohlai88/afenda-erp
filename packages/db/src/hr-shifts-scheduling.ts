import {
  and,
  asc,
  count,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
} from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  HrShiftCommandError,
  clampPageSize,
  resolveShiftBounds,
  toUtcDayStart,
} from "./hr-shifts.shared";
import { hrDepartments, hrEmployees, hrPositions } from "./schema/hr";
import {
  hrShiftAssignments,
  hrShiftRecurrenceRules,
  hrShiftRotationCycleSteps,
  hrShiftRotationCycles,
  hrShiftTemplates,
} from "./schema/hr-shift-scheduling";

export type HrShiftRosterRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  departmentId: string | null;
  departmentName: string | null;
  positionId: string | null;
  positionTitle: string | null;
  locationCode: string | null;
  templateId: string;
  templateCode: string;
  templateName: string;
  assignmentKind: (typeof hrShiftAssignments.$inferSelect)["assignmentKind"];
  status: (typeof hrShiftAssignments.$inferSelect)["status"];
  shiftDate: Date;
  shiftStart: Date;
  shiftEnd: Date;
  notes: string | null;
  publishedAt: Date | null;
};

export type HrShiftRosterWindow = {
  rows: readonly HrShiftRosterRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftRecurrenceRuleRow = {
  id: string;
  code: string;
  name: string;
  templateId: string;
  employeeId: string | null;
  daysOfWeek: readonly number[];
  effectiveFrom: Date;
  effectiveTo: Date | null;
  status: (typeof hrShiftRecurrenceRules.$inferSelect)["status"];
};

export type HrShiftRecurrenceRuleWindow = {
  rows: readonly HrShiftRecurrenceRuleRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftRotationCycleRow = {
  id: string;
  code: string;
  name: string;
  cycleLengthDays: number;
  status: (typeof hrShiftRotationCycles.$inferSelect)["status"];
  stepCount: number;
};

export type HrShiftRotationCycleWindow = {
  rows: readonly HrShiftRotationCycleRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftBulkScheduleResult = {
  createdAssignmentIds: readonly string[];
  skippedDates: readonly string[];
};

/** HRM-SFT-004 — roster assignments with org-unit filters. */
export async function listHrShiftRosterWindow(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
  offset?: number;
  search?: string;
  departmentId?: string;
  teamId?: string;
  locationCode?: string;
  positionId?: string;
  legalEntityCode?: string;
  employeeId?: string;
  templateId?: string;
  status?: (typeof hrShiftAssignments.$inferSelect)["status"];
}): Promise<HrShiftRosterWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const periodStart = toUtcDayStart(input.periodStart);
  const periodEnd = toUtcDayStart(input.periodEnd);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAssignments.organizationId, input.organizationId),
      gte(hrShiftAssignments.shiftDate, periodStart),
      lte(hrShiftAssignments.shiftDate, periodEnd),
    ];

    if (input.status) {
      conditions.push(eq(hrShiftAssignments.status, input.status));
    } else {
      conditions.push(
        inArray(hrShiftAssignments.status, ["scheduled", "published"]),
      );
    }

    if (input.employeeId) {
      conditions.push(eq(hrShiftAssignments.employeeId, input.employeeId));
    }
    if (input.templateId) {
      conditions.push(eq(hrShiftAssignments.templateId, input.templateId));
    }
    if (input.departmentId) {
      conditions.push(eq(hrShiftAssignments.departmentId, input.departmentId));
    }
    if (input.positionId) {
      conditions.push(eq(hrShiftAssignments.positionId, input.positionId));
    }
    if (input.locationCode) {
      conditions.push(eq(hrShiftAssignments.locationCode, input.locationCode));
    }
    if (input.legalEntityCode) {
      conditions.push(
        eq(hrEmployees.legalEntityCode, input.legalEntityCode.trim()),
      );
    }
    if (input.teamId) {
      conditions.push(eq(hrEmployees.currentDepartmentId, input.teamId));
    } else if (input.departmentId) {
      conditions.push(eq(hrEmployees.currentDepartmentId, input.departmentId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrShiftAssignments.notes, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrShiftTemplates.code, pattern),
          ilike(hrShiftTemplates.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftAssignments)
      .innerJoin(hrEmployees, eq(hrShiftAssignments.employeeId, hrEmployees.id))
      .innerJoin(
        hrShiftTemplates,
        eq(hrShiftAssignments.templateId, hrShiftTemplates.id),
      )
      .leftJoin(
        hrDepartments,
        eq(hrShiftAssignments.departmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrShiftAssignments.positionId, hrPositions.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftAssignments.id,
        employeeId: hrShiftAssignments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrShiftAssignments.departmentId,
        departmentName: hrDepartments.name,
        positionId: hrShiftAssignments.positionId,
        positionTitle: hrPositions.title,
        locationCode: hrShiftAssignments.locationCode,
        templateId: hrShiftAssignments.templateId,
        templateCode: hrShiftTemplates.code,
        templateName: hrShiftTemplates.name,
        assignmentKind: hrShiftAssignments.assignmentKind,
        status: hrShiftAssignments.status,
        shiftDate: hrShiftAssignments.shiftDate,
        shiftStart: hrShiftAssignments.shiftStart,
        shiftEnd: hrShiftAssignments.shiftEnd,
        notes: hrShiftAssignments.notes,
        publishedAt: hrShiftAssignments.publishedAt,
      })
      .from(hrShiftAssignments)
      .innerJoin(hrEmployees, eq(hrShiftAssignments.employeeId, hrEmployees.id))
      .innerJoin(
        hrShiftTemplates,
        eq(hrShiftAssignments.templateId, hrShiftTemplates.id),
      )
      .leftJoin(
        hrDepartments,
        eq(hrShiftAssignments.departmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrShiftAssignments.positionId, hrPositions.id))
      .where(whereClause)
      .orderBy(asc(hrShiftAssignments.shiftDate), asc(hrEmployees.employeeNumber))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        departmentId: row.departmentId,
        departmentName: row.departmentName,
        positionId: row.positionId,
        positionTitle: row.positionTitle,
        locationCode: row.locationCode,
        templateId: row.templateId,
        templateCode: row.templateCode,
        templateName: row.templateName,
        assignmentKind: row.assignmentKind,
        status: row.status,
        shiftDate: row.shiftDate,
        shiftStart: row.shiftStart,
        shiftEnd: row.shiftEnd,
        notes: row.notes,
        publishedAt: row.publishedAt,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

async function snapshotEmployeeScope(
  organizationId: string,
  employeeId: string,
): Promise<{
  departmentId: string | null;
  positionId: string | null;
  locationCode: string | null;
}> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [employee] = await db
      .select({
        departmentId: hrEmployees.currentDepartmentId,
        positionId: hrEmployees.currentPositionId,
        locationCode: hrEmployees.workLocationCode,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, organizationId),
          eq(hrEmployees.id, employeeId),
        ),
      )
      .limit(1);

    return {
      departmentId: employee?.departmentId ?? null,
      positionId: employee?.positionId ?? null,
      locationCode: employee?.locationCode ?? null,
    };
  });
}

/** HRM-SFT-006 — bulk shift assignment for authorized planners. */
export async function bulkScheduleHrShiftAssignments(input: {
  organizationId: string;
  templateId: string;
  entries: readonly {
    employeeId: string;
    shiftDate: Date;
    notes?: string | null;
  }[];
  assignedByAuthUserId?: string | null;
  recurrenceRuleId?: string | null;
  rotationCycleId?: string | null;
}): Promise<HrShiftBulkScheduleResult> {
  if (input.entries.length === 0) {
    return { createdAssignmentIds: [], skippedDates: [] };
  }

  const template = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select()
        .from(hrShiftTemplates)
        .where(
          and(
            eq(hrShiftTemplates.organizationId, input.organizationId),
            eq(hrShiftTemplates.id, input.templateId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new HrShiftCommandError("template_not_found");
      }
      if (row.status !== "active") {
        throw new HrShiftCommandError("template_not_active");
      }
      return row;
    },
  );

  const createdAssignmentIds: string[] = [];
  const skippedDates: string[] = [];

  for (const entry of input.entries) {
    const shiftDay = toUtcDayStart(entry.shiftDate);
    const dayKey = shiftDay.toISOString().slice(0, 10);

    try {
      const scope = await snapshotEmployeeScope(
        input.organizationId,
        entry.employeeId,
      );
      const { shiftStart, shiftEnd } = resolveShiftBounds({
        shiftDate: shiftDay,
        startTime: template.startTime,
        endTime: template.endTime,
      });

      const assignmentId = await runWithOrganizationContext(
        input.organizationId,
        async (db) => {
          const [existing] = await db
            .select({ id: hrShiftAssignments.id })
            .from(hrShiftAssignments)
            .where(
              and(
                eq(hrShiftAssignments.organizationId, input.organizationId),
                eq(hrShiftAssignments.employeeId, entry.employeeId),
                eq(hrShiftAssignments.shiftDate, shiftDay),
              ),
            )
            .limit(1);

          if (existing) {
            throw new HrShiftCommandError("assignment_date_conflict");
          }

          const id = createEntityId("hr_sh_asg");
          await db.insert(hrShiftAssignments).values({
            id,
            organizationId: input.organizationId,
            employeeId: entry.employeeId,
            templateId: input.templateId,
            departmentId: scope.departmentId,
            positionId: scope.positionId,
            locationCode: scope.locationCode,
            shiftDate: shiftDay,
            shiftStart,
            shiftEnd,
            notes: entry.notes?.trim() || null,
            assignedByAuthUserId: input.assignedByAuthUserId ?? null,
            recurrenceRuleId: input.recurrenceRuleId ?? null,
            rotationCycleId: input.rotationCycleId ?? null,
          });
          return id;
        },
      );

      createdAssignmentIds.push(assignmentId);
    } catch (error) {
      if (
        error instanceof HrShiftCommandError &&
        error.code === "assignment_date_conflict"
      ) {
        skippedDates.push(dayKey);
        continue;
      }
      throw error;
    }
  }

  return { createdAssignmentIds, skippedDates };
}

/** HRM-SFT-007 — create weekly recurrence rule. */
export async function createHrShiftRecurrenceRule(input: {
  organizationId: string;
  code: string;
  name: string;
  templateId: string;
  employeeId?: string | null;
  daysOfWeek: readonly number[];
  effectiveFrom: Date;
  effectiveTo?: Date | null;
}): Promise<{ recurrenceRuleId: string }> {
  const code = input.code.trim();
  const name = input.name.trim();
  if (input.daysOfWeek.length === 0) {
    throw new HrShiftCommandError("recurrence_days_required");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrShiftRecurrenceRules.id })
      .from(hrShiftRecurrenceRules)
      .where(
        and(
          eq(hrShiftRecurrenceRules.organizationId, input.organizationId),
          eq(hrShiftRecurrenceRules.code, code),
        ),
      )
      .limit(1);

    if (existing) {
      throw new HrShiftCommandError("recurrence_code_exists");
    }

    const recurrenceRuleId = createEntityId("hr_sh_rec");
    await db.insert(hrShiftRecurrenceRules).values({
      id: recurrenceRuleId,
      organizationId: input.organizationId,
      code,
      name,
      templateId: input.templateId,
      employeeId: input.employeeId ?? null,
      daysOfWeek: [...input.daysOfWeek],
      effectiveFrom: toUtcDayStart(input.effectiveFrom),
      effectiveTo: input.effectiveTo ? toUtcDayStart(input.effectiveTo) : null,
    });

    return { recurrenceRuleId };
  });
}

export async function listHrShiftRecurrenceRulesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  activeOnly?: boolean;
}): Promise<HrShiftRecurrenceRuleWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftRecurrenceRules.organizationId, input.organizationId),
    ];

    if (input.activeOnly !== false) {
      conditions.push(eq(hrShiftRecurrenceRules.status, "active"));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrShiftRecurrenceRules.code, pattern),
          ilike(hrShiftRecurrenceRules.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftRecurrenceRules)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftRecurrenceRules.id,
        code: hrShiftRecurrenceRules.code,
        name: hrShiftRecurrenceRules.name,
        templateId: hrShiftRecurrenceRules.templateId,
        employeeId: hrShiftRecurrenceRules.employeeId,
        daysOfWeek: hrShiftRecurrenceRules.daysOfWeek,
        effectiveFrom: hrShiftRecurrenceRules.effectiveFrom,
        effectiveTo: hrShiftRecurrenceRules.effectiveTo,
        status: hrShiftRecurrenceRules.status,
      })
      .from(hrShiftRecurrenceRules)
      .where(whereClause)
      .orderBy(hrShiftRecurrenceRules.code)
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        templateId: row.templateId,
        employeeId: row.employeeId,
        daysOfWeek: row.daysOfWeek ?? [],
        effectiveFrom: row.effectiveFrom,
        effectiveTo: row.effectiveTo,
        status: row.status,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

function eachUtcDayInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = toUtcDayStart(start);
  const last = toUtcDayStart(end);
  while (cursor.getTime() <= last.getTime()) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

/** HRM-SFT-007 — materialize recurrence rule into assignments. */
export async function applyHrShiftRecurrenceRule(input: {
  organizationId: string;
  recurrenceRuleId: string;
  applyThrough?: Date;
  assignedByAuthUserId?: string | null;
}): Promise<HrShiftBulkScheduleResult> {
  const rule = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select()
        .from(hrShiftRecurrenceRules)
        .where(
          and(
            eq(hrShiftRecurrenceRules.organizationId, input.organizationId),
            eq(hrShiftRecurrenceRules.id, input.recurrenceRuleId),
          ),
        )
        .limit(1);

      if (!row) {
        throw new HrShiftCommandError("recurrence_not_found");
      }
      if (row.status !== "active") {
        throw new HrShiftCommandError("recurrence_not_active");
      }
      if (!row.employeeId) {
        throw new HrShiftCommandError("recurrence_employee_required");
      }

      return row;
    },
  );

  const rangeEnd = input.applyThrough
    ? toUtcDayStart(input.applyThrough)
    : rule.effectiveTo
      ? toUtcDayStart(rule.effectiveTo)
      : toUtcDayStart(new Date());

  const daySet = new Set(rule.daysOfWeek ?? []);
  const entries = eachUtcDayInRange(rule.effectiveFrom, rangeEnd)
    .filter((day) => daySet.has(day.getUTCDay()))
    .map((shiftDate) => ({
      employeeId: rule.employeeId!,
      shiftDate,
    }));

  const result = await bulkScheduleHrShiftAssignments({
    organizationId: input.organizationId,
    templateId: rule.templateId,
    entries,
    assignedByAuthUserId: input.assignedByAuthUserId,
    recurrenceRuleId: rule.id,
  });

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrShiftRecurrenceRules)
      .set({ updatedAt: new Date() })
      .where(eq(hrShiftRecurrenceRules.id, rule.id));
  });

  return result;
}

/** HRM-SFT-008 — create rotating shift cycle. */
export async function createHrShiftRotationCycle(input: {
  organizationId: string;
  code: string;
  name: string;
  description?: string | null;
  cycleLengthDays: number;
}): Promise<{ rotationCycleId: string }> {
  const code = input.code.trim();
  const name = input.name.trim();
  if (input.cycleLengthDays < 1) {
    throw new HrShiftCommandError("rotation_cycle_length_invalid");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrShiftRotationCycles.id })
      .from(hrShiftRotationCycles)
      .where(
        and(
          eq(hrShiftRotationCycles.organizationId, input.organizationId),
          eq(hrShiftRotationCycles.code, code),
        ),
      )
      .limit(1);

    if (existing) {
      throw new HrShiftCommandError("rotation_code_exists");
    }

    const rotationCycleId = createEntityId("hr_sh_rot");
    await db.insert(hrShiftRotationCycles).values({
      id: rotationCycleId,
      organizationId: input.organizationId,
      code,
      name,
      description: input.description?.trim() || null,
      cycleLengthDays: input.cycleLengthDays,
    });

    return { rotationCycleId };
  });
}

/** HRM-SFT-008 — append a step to a rotation cycle. */
export async function addHrShiftRotationCycleStep(input: {
  organizationId: string;
  cycleId: string;
  stepIndex: number;
  templateId?: string | null;
  isRestDay?: boolean;
  label?: string | null;
}): Promise<{ stepId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [cycle] = await db
      .select({ id: hrShiftRotationCycles.id })
      .from(hrShiftRotationCycles)
      .where(
        and(
          eq(hrShiftRotationCycles.organizationId, input.organizationId),
          eq(hrShiftRotationCycles.id, input.cycleId),
        ),
      )
      .limit(1);

    if (!cycle) {
      throw new HrShiftCommandError("rotation_not_found");
    }

    const stepId = createEntityId("hr_sh_rst");
    await db.insert(hrShiftRotationCycleSteps).values({
      id: stepId,
      organizationId: input.organizationId,
      cycleId: input.cycleId,
      stepIndex: input.stepIndex,
      templateId: input.templateId ?? null,
      isRestDay: input.isRestDay ?? false,
      label: input.label?.trim() || null,
    });

    return { stepId };
  });
}

export async function listHrShiftRotationCyclesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  activeOnly?: boolean;
}): Promise<HrShiftRotationCycleWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftRotationCycles.organizationId, input.organizationId),
    ];

    if (input.activeOnly !== false) {
      conditions.push(eq(hrShiftRotationCycles.status, "active"));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrShiftRotationCycles.code, pattern),
          ilike(hrShiftRotationCycles.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftRotationCycles)
      .where(whereClause);

    const cycles = await db
      .select({
        id: hrShiftRotationCycles.id,
        code: hrShiftRotationCycles.code,
        name: hrShiftRotationCycles.name,
        cycleLengthDays: hrShiftRotationCycles.cycleLengthDays,
        status: hrShiftRotationCycles.status,
      })
      .from(hrShiftRotationCycles)
      .where(whereClause)
      .orderBy(hrShiftRotationCycles.code)
      .limit(pageSize)
      .offset(offset);

    const stepCounts = await db
      .select({
        cycleId: hrShiftRotationCycleSteps.cycleId,
        stepCount: count(),
      })
      .from(hrShiftRotationCycleSteps)
      .where(
        inArray(
          hrShiftRotationCycleSteps.cycleId,
          cycles.map((cycle) => cycle.id),
        ),
      )
      .groupBy(hrShiftRotationCycleSteps.cycleId);

    const stepCountByCycle = new Map(
      stepCounts.map((row) => [row.cycleId, Number(row.stepCount)]),
    );

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: cycles.map((cycle) => ({
        id: cycle.id,
        code: cycle.code,
        name: cycle.name,
        cycleLengthDays: cycle.cycleLengthDays,
        status: cycle.status,
        stepCount: stepCountByCycle.get(cycle.id) ?? 0,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + cycles.length < actualTotal,
    };
  });
}

/** HRM-SFT-008 — assign rotation cycle across a date range for one employee. */
export async function applyHrShiftRotationCycle(input: {
  organizationId: string;
  rotationCycleId: string;
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  assignedByAuthUserId?: string | null;
}): Promise<HrShiftBulkScheduleResult> {
  const cycle = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select()
        .from(hrShiftRotationCycles)
        .where(
          and(
            eq(hrShiftRotationCycles.organizationId, input.organizationId),
            eq(hrShiftRotationCycles.id, input.rotationCycleId),
          ),
        )
        .limit(1);

      if (!row) {
        throw new HrShiftCommandError("rotation_not_found");
      }
      if (row.status !== "active") {
        throw new HrShiftCommandError("rotation_not_active");
      }

      const steps = await db
        .select()
        .from(hrShiftRotationCycleSteps)
        .where(eq(hrShiftRotationCycleSteps.cycleId, row.id))
        .orderBy(asc(hrShiftRotationCycleSteps.stepIndex));

      if (steps.length === 0) {
        throw new HrShiftCommandError("rotation_steps_required");
      }

      return { cycle: row, steps };
    },
  );

  const createdAssignmentIds: string[] = [];
  const skippedDates: string[] = [];
  const days = eachUtcDayInRange(input.periodStart, input.periodEnd);

  for (let index = 0; index < days.length; index += 1) {
    const shiftDate = days[index]!;
    const step =
      cycle.steps[index % cycle.steps.length] ??
      cycle.steps[index % cycle.cycle.cycleLengthDays];

    if (!step || step.isRestDay || !step.templateId) {
      continue;
    }

    const dayKey = shiftDate.toISOString().slice(0, 10);
    try {
      const bulk = await bulkScheduleHrShiftAssignments({
        organizationId: input.organizationId,
        templateId: step.templateId,
        entries: [{ employeeId: input.employeeId, shiftDate }],
        assignedByAuthUserId: input.assignedByAuthUserId,
        rotationCycleId: cycle.cycle.id,
      });
      createdAssignmentIds.push(...bulk.createdAssignmentIds);
      skippedDates.push(...bulk.skippedDates);
    } catch (error) {
      if (
        error instanceof HrShiftCommandError &&
        error.code === "assignment_date_conflict"
      ) {
        skippedDates.push(dayKey);
        continue;
      }
      throw error;
    }
  }

  return { createdAssignmentIds, skippedDates };
}
