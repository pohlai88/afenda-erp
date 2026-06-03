import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  HrShiftCommandError,
  assertValidTime,
  clampPageSize,
  computeHrShiftWorkingMinutes,
  resolveShiftBounds,
  toUtcDayStart,
} from "./hr-shifts.shared";
import { hrEmployees } from "./hr";
import {
  hrShiftAssignments,
  hrShiftTemplates,
} from "./hr-shift-scheduling";

export {
  HrShiftCommandError,
  assertValidTime,
  computeHrShiftWorkingMinutes,
  resolveShiftBounds,
  toUtcDayStart,
} from "./hr-shifts.shared";

export * from "./hr-shifts-scheduling";

export type HrShiftTemplateRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
  workingHoursMinutes: number;
  shiftCategory: (typeof hrShiftTemplates.$inferSelect)["shiftCategory"];
  patternKind: (typeof hrShiftTemplates.$inferSelect)["patternKind"];
  status: (typeof hrShiftTemplates.$inferSelect)["status"];
};

export type HrShiftTemplateWindow = {
  rows: readonly HrShiftTemplateRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrShiftAssignmentRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  templateId: string;
  templateCode: string;
  templateName: string;
  status: (typeof hrShiftAssignments.$inferSelect)["status"];
  shiftDate: Date;
  shiftStart: Date;
  shiftEnd: Date;
  notes: string | null;
  publishedAt: Date | null;
};

export type HrShiftAssignmentWindow = {
  rows: readonly HrShiftAssignmentRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

async function assertEmployeeInOrg(
  organizationId: string,
  employeeId: string,
): Promise<void> {
  await runWithOrganizationContext(organizationId, async (db) => {
    const [employee] = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, organizationId),
          eq(hrEmployees.id, employeeId),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new HrShiftCommandError("employee_not_found");
    }
  });
}

async function getActiveTemplate(
  organizationId: string,
  templateId: string,
): Promise<(typeof hrShiftTemplates.$inferSelect)> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [template] = await db
      .select()
      .from(hrShiftTemplates)
      .where(
        and(
          eq(hrShiftTemplates.organizationId, organizationId),
          eq(hrShiftTemplates.id, templateId),
        ),
      )
      .limit(1);

    if (!template) {
      throw new HrShiftCommandError("template_not_found");
    }
    if (template.status !== "active") {
      throw new HrShiftCommandError("template_not_active");
    }

    return template;
  });
}

function mapTemplateRow(
  row: typeof hrShiftTemplates.$inferSelect,
): HrShiftTemplateRow {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    startTime: row.startTime,
    endTime: row.endTime,
    breakStartTime: row.breakStartTime,
    breakEndTime: row.breakEndTime,
    workingHoursMinutes: row.workingHoursMinutes,
    shiftCategory: row.shiftCategory,
    patternKind: row.patternKind,
    status: row.status,
  };
}

/** HRM-SFT-001 — list shift templates (Pattern B window). */
export async function listHrShiftTemplatesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  activeOnly?: boolean;
}): Promise<HrShiftTemplateWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftTemplates.organizationId, input.organizationId),
    ];

    if (input.activeOnly !== false) {
      conditions.push(eq(hrShiftTemplates.status, "active"));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrShiftTemplates.code, pattern),
          ilike(hrShiftTemplates.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftTemplates)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrShiftTemplates)
      .where(whereClause)
      .orderBy(hrShiftTemplates.code)
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map(mapTemplateRow),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

/** HRM-SFT-001 — fetch one shift template. */
export async function getHrShiftTemplate(input: {
  organizationId: string;
  templateId: string;
}): Promise<HrShiftTemplateRow | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
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

    return row ? mapTemplateRow(row) : null;
  });
}

/** HRM-SFT-001/002/003 — create shift template. */
export async function createHrShiftTemplate(input: {
  organizationId: string;
  code: string;
  name: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  workingHoursMinutes?: number;
  shiftCategory?: (typeof hrShiftTemplates.$inferSelect)["shiftCategory"];
  patternKind?: (typeof hrShiftTemplates.$inferSelect)["patternKind"];
}): Promise<{ templateId: string }> {
  const code = input.code.trim();
  const name = input.name.trim();
  assertValidTime(input.startTime);
  assertValidTime(input.endTime);

  const workingHoursMinutes =
    input.workingHoursMinutes ??
    computeHrShiftWorkingMinutes({
      startTime: input.startTime,
      endTime: input.endTime,
      breakStartTime: input.breakStartTime,
      breakEndTime: input.breakEndTime,
    });

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrShiftTemplates.id })
      .from(hrShiftTemplates)
      .where(
        and(
          eq(hrShiftTemplates.organizationId, input.organizationId),
          eq(hrShiftTemplates.code, code),
        ),
      )
      .limit(1);

    if (existing) {
      throw new HrShiftCommandError("template_code_exists");
    }

    const templateId = createEntityId("hr_sh_tpl");
    await db.insert(hrShiftTemplates).values({
      id: templateId,
      organizationId: input.organizationId,
      code,
      name,
      description: input.description?.trim() || null,
      startTime: input.startTime,
      endTime: input.endTime,
      breakStartTime: input.breakStartTime ?? null,
      breakEndTime: input.breakEndTime ?? null,
      workingHoursMinutes,
      shiftCategory: input.shiftCategory ?? "day",
      patternKind: input.patternKind ?? "fixed",
    });

    return { templateId };
  });
}

/** HRM-SFT-001/002 — update shift template. */
export async function updateHrShiftTemplate(input: {
  organizationId: string;
  templateId: string;
  name?: string;
  description?: string | null;
  startTime?: string;
  endTime?: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  workingHoursMinutes?: number;
  shiftCategory?: (typeof hrShiftTemplates.$inferSelect)["shiftCategory"];
  patternKind?: (typeof hrShiftTemplates.$inferSelect)["patternKind"];
}): Promise<{ templateId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select()
      .from(hrShiftTemplates)
      .where(
        and(
          eq(hrShiftTemplates.organizationId, input.organizationId),
          eq(hrShiftTemplates.id, input.templateId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrShiftCommandError("template_not_found");
    }

    const startTime = input.startTime ?? existing.startTime;
    const endTime = input.endTime ?? existing.endTime;
    if (input.startTime) assertValidTime(input.startTime);
    if (input.endTime) assertValidTime(input.endTime);

    const breakStartTime =
      input.breakStartTime !== undefined
        ? input.breakStartTime
        : existing.breakStartTime;
    const breakEndTime =
      input.breakEndTime !== undefined
        ? input.breakEndTime
        : existing.breakEndTime;

    const workingHoursMinutes =
      input.workingHoursMinutes ??
      computeHrShiftWorkingMinutes({
        startTime,
        endTime,
        breakStartTime,
        breakEndTime,
      });

    await db
      .update(hrShiftTemplates)
      .set({
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
        ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
        ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
        breakStartTime,
        breakEndTime,
        workingHoursMinutes,
        ...(input.shiftCategory !== undefined
          ? { shiftCategory: input.shiftCategory }
          : {}),
        ...(input.patternKind !== undefined
          ? { patternKind: input.patternKind }
          : {}),
      })
      .where(eq(hrShiftTemplates.id, input.templateId));

    return { templateId: input.templateId };
  });
}

/** HRM-SFT-001 — archive shift template. */
export async function archiveHrShiftTemplate(input: {
  organizationId: string;
  templateId: string;
}): Promise<{ templateId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [template] = await db
      .select({ id: hrShiftTemplates.id })
      .from(hrShiftTemplates)
      .where(
        and(
          eq(hrShiftTemplates.organizationId, input.organizationId),
          eq(hrShiftTemplates.id, input.templateId),
        ),
      )
      .limit(1);

    if (!template) {
      throw new HrShiftCommandError("template_not_found");
    }

    await db
      .update(hrShiftTemplates)
      .set({
        status: "archived",
        archivedAt: new Date(),
      })
      .where(eq(hrShiftTemplates.id, input.templateId));

    return { templateId: input.templateId };
  });
}

export async function listHrShiftAssignmentsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrShiftAssignments.$inferSelect)["status"];
  employeeId?: string;
  scheduledOnly?: boolean;
  cancellableOnly?: boolean;
}): Promise<HrShiftAssignmentWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAssignments.organizationId, input.organizationId),
    ];

    if (input.cancellableOnly) {
      conditions.push(
        inArray(hrShiftAssignments.status, ["scheduled", "published"]),
      );
    } else if (input.scheduledOnly) {
      conditions.push(eq(hrShiftAssignments.status, "scheduled"));
    } else if (input.status) {
      conditions.push(eq(hrShiftAssignments.status, input.status));
    }

    if (input.employeeId) {
      conditions.push(eq(hrShiftAssignments.employeeId, input.employeeId));
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
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftAssignments.id,
        employeeId: hrShiftAssignments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        templateId: hrShiftAssignments.templateId,
        templateCode: hrShiftTemplates.code,
        templateName: hrShiftTemplates.name,
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
      .where(whereClause)
      .orderBy(desc(hrShiftAssignments.shiftStart))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        templateId: row.templateId,
        templateCode: row.templateCode,
        templateName: row.templateName,
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

/** HRM-SFT-005 — assign one employee to a shift on a date. */
export async function scheduleHrShiftAssignment(input: {
  organizationId: string;
  employeeId: string;
  templateId: string;
  shiftDate: Date;
  notes?: string | null;
  assignedByAuthUserId?: string | null;
}): Promise<{ assignmentId: string }> {
  await assertEmployeeInOrg(input.organizationId, input.employeeId);
  const template = await getActiveTemplate(
    input.organizationId,
    input.templateId,
  );
  const shiftDay = toUtcDayStart(input.shiftDate);
  const { shiftStart, shiftEnd } = resolveShiftBounds({
    shiftDate: shiftDay,
    startTime: template.startTime,
    endTime: template.endTime,
  });

  const scope = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [employee] = await db
        .select({
          departmentId: hrEmployees.currentDepartmentId,
          positionId: hrEmployees.currentPositionId,
          locationCode: hrEmployees.workLocationCode,
        })
        .from(hrEmployees)
        .where(eq(hrEmployees.id, input.employeeId))
        .limit(1);

      return {
        departmentId: employee?.departmentId ?? null,
        positionId: employee?.positionId ?? null,
        locationCode: employee?.locationCode ?? null,
      };
    },
  );

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrShiftAssignments.id })
      .from(hrShiftAssignments)
      .where(
        and(
          eq(hrShiftAssignments.organizationId, input.organizationId),
          eq(hrShiftAssignments.employeeId, input.employeeId),
          eq(hrShiftAssignments.shiftDate, shiftDay),
        ),
      )
      .limit(1);

    if (existing) {
      throw new HrShiftCommandError("assignment_date_conflict");
    }

    const assignmentId = createEntityId("hr_sh_asg");
    await db.insert(hrShiftAssignments).values({
      id: assignmentId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      templateId: input.templateId,
      departmentId: scope.departmentId,
      positionId: scope.positionId,
      locationCode: scope.locationCode,
      shiftDate: shiftDay,
      shiftStart,
      shiftEnd,
      notes: input.notes?.trim() || null,
      assignedByAuthUserId: input.assignedByAuthUserId ?? null,
    });

    return { assignmentId };
  });
}

export async function publishHrShiftAssignment(input: {
  organizationId: string;
  assignmentId: string;
}): Promise<{ assignmentId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [assignment] = await db
      .select({
        id: hrShiftAssignments.id,
        status: hrShiftAssignments.status,
      })
      .from(hrShiftAssignments)
      .where(
        and(
          eq(hrShiftAssignments.organizationId, input.organizationId),
          eq(hrShiftAssignments.id, input.assignmentId),
        ),
      )
      .limit(1);

    if (!assignment) {
      throw new HrShiftCommandError("assignment_not_found");
    }
    if (assignment.status !== "scheduled") {
      throw new HrShiftCommandError("assignment_not_scheduled");
    }

    await db
      .update(hrShiftAssignments)
      .set({
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(hrShiftAssignments.id, input.assignmentId));

    return { assignmentId: input.assignmentId };
  });
}

export async function cancelHrShiftAssignment(input: {
  organizationId: string;
  assignmentId: string;
}): Promise<{ assignmentId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [assignment] = await db
      .select({
        id: hrShiftAssignments.id,
        status: hrShiftAssignments.status,
      })
      .from(hrShiftAssignments)
      .where(
        and(
          eq(hrShiftAssignments.organizationId, input.organizationId),
          eq(hrShiftAssignments.id, input.assignmentId),
        ),
      )
      .limit(1);

    if (!assignment) {
      throw new HrShiftCommandError("assignment_not_found");
    }
    if (assignment.status === "cancelled") {
      throw new HrShiftCommandError("assignment_not_scheduled");
    }

    await db
      .update(hrShiftAssignments)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(hrShiftAssignments.id, input.assignmentId));

    return { assignmentId: input.assignmentId };
  });
}
