import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  hrEmployees,
  hrShiftAssignments,
  hrShiftTemplates,
} from "./schema/hr";

export type HrShiftTemplateRow = {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
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

export class HrShiftCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "template_not_found"
    | "template_not_active"
    | "template_code_exists"
    | "assignment_not_found"
    | "assignment_not_scheduled"
    | "invalid_time_format";

  constructor(code: HrShiftCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

function assertValidTime(value: string): void {
  if (!TIME_PATTERN.test(value)) {
    throw new HrShiftCommandError("invalid_time_format");
  }
}

function toUtcDayStart(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function combineDateAndTime(shiftDate: Date, timeHm: string): Date {
  assertValidTime(timeHm);
  const [hoursPart, minutesPart] = timeHm.split(":");
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  const combined = toUtcDayStart(shiftDate);
  combined.setUTCHours(hours, minutes, 0, 0);
  return combined;
}

function resolveShiftBounds(input: {
  shiftDate: Date;
  startTime: string;
  endTime: string;
}): { shiftStart: Date; shiftEnd: Date } {
  const shiftStart = combineDateAndTime(input.shiftDate, input.startTime);
  let shiftEnd = combineDateAndTime(input.shiftDate, input.endTime);
  if (shiftEnd.getTime() <= shiftStart.getTime()) {
    shiftEnd = new Date(shiftEnd.getTime() + 86_400_000);
  }
  return { shiftStart, shiftEnd };
}

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
      .select({
        id: hrShiftTemplates.id,
        code: hrShiftTemplates.code,
        name: hrShiftTemplates.name,
        startTime: hrShiftTemplates.startTime,
        endTime: hrShiftTemplates.endTime,
        status: hrShiftTemplates.status,
      })
      .from(hrShiftTemplates)
      .where(whereClause)
      .orderBy(hrShiftTemplates.code)
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function createHrShiftTemplate(input: {
  organizationId: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
}): Promise<{ templateId: string }> {
  const code = input.code.trim();
  const name = input.name.trim();
  assertValidTime(input.startTime);
  assertValidTime(input.endTime);

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
      startTime: input.startTime,
      endTime: input.endTime,
    });

    return { templateId };
  });
}

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

export async function scheduleHrShiftAssignment(input: {
  organizationId: string;
  employeeId: string;
  templateId: string;
  shiftDate: Date;
  notes?: string | null;
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

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const assignmentId = createEntityId("hr_sh_asg");
    await db.insert(hrShiftAssignments).values({
      id: assignmentId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      templateId: input.templateId,
      shiftDate: shiftDay,
      shiftStart,
      shiftEnd,
      notes: input.notes?.trim() || null,
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
