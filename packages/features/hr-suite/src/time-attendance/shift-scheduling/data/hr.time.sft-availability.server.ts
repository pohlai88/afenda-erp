import "@afenda/kernel/server";

import { and, eq, gte, lte } from "drizzle-orm";
import {
  createEntityId,
  hrEmployees,
  hrShiftAssignments,
  hrShiftAvailability,
  hrShiftTemplates,
  runWithOrganizationContext,
} from "@afenda/db";

import {
  hrSftAssignHolidayShiftSchema,
  hrSftAssignRestOrOffDaySchema,
  hrSftCreateAvailabilitySchema,
  hrSftDeleteAvailabilitySchema,
  hrSftListAvailabilityQuerySchema,
  hrSftUpdateAvailabilitySchema,
  type HrSftAssignHolidayShiftInput,
  type HrSftAssignRestOrOffDayInput,
  type HrSftAvailabilityRow,
  type HrSftCreateAvailabilityInput,
  type HrSftListAvailabilityQuery,
  type HrSftUpdateAvailabilityInput,
} from "../schemas/hr.time.sft-availability.schema";
import { assertShiftAssignmentConflictsClear } from "./hr.time.sft-conflict.server";

export class HrSftAvailabilityError extends Error {
  readonly code:
    | "sft_availability_not_found"
    | "sft_employee_not_found"
    | "sft_template_not_found"
    | "sft_invalid_holiday_template";

  constructor(code: HrSftAvailabilityError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrSftAvailabilityError";
    this.code = code;
  }
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function combineDateAndTime(shiftDate: Date, timeHm: string): Date {
  if (!TIME_PATTERN.test(timeHm)) {
    throw new Error(`invalid_shift_time:${timeHm}`);
  }
  const [hoursPart, minutesPart] = timeHm.split(":");
  const combined = startOfUtcDay(shiftDate);
  combined.setUTCHours(Number(hoursPart), Number(minutesPart), 0, 0);
  return combined;
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
      throw new HrSftAvailabilityError("sft_employee_not_found");
    }
  });
}

function mapAvailabilityRow(row: {
  id: string;
  employeeId: string;
  availabilityKind: HrSftAvailabilityRow["availabilityKind"];
  startDate: Date;
  endDate: Date;
  preferredTemplateId: string | null;
  reason: string | null;
}): HrSftAvailabilityRow {
  return {
    id: row.id,
    employeeId: row.employeeId,
    availabilityKind: row.availabilityKind,
    startDate: row.startDate,
    endDate: row.endDate,
    preferredTemplateId: row.preferredTemplateId,
    reason: row.reason,
  };
}

/** HRM-SFT-011 — list employee availability windows. */
export async function listHrSftEmployeeAvailability(input: {
  organizationId: string;
  query: HrSftListAvailabilityQuery;
}): Promise<readonly HrSftAvailabilityRow[]> {
  const query = hrSftListAvailabilityQuerySchema.parse(input.query);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAvailability.organizationId, input.organizationId),
    ];

    if (query.employeeId) {
      conditions.push(eq(hrShiftAvailability.employeeId, query.employeeId));
    }
    if (query.periodStart && query.periodEnd) {
      conditions.push(
        lte(hrShiftAvailability.startDate, endOfUtcDay(query.periodEnd)),
        gte(hrShiftAvailability.endDate, startOfUtcDay(query.periodStart)),
      );
    }

    const rows = await db
      .select({
        id: hrShiftAvailability.id,
        employeeId: hrShiftAvailability.employeeId,
        availabilityKind: hrShiftAvailability.availabilityKind,
        startDate: hrShiftAvailability.startDate,
        endDate: hrShiftAvailability.endDate,
        preferredTemplateId: hrShiftAvailability.preferredTemplateId,
        reason: hrShiftAvailability.reason,
      })
      .from(hrShiftAvailability)
      .where(and(...conditions))
      .orderBy(hrShiftAvailability.startDate);

    return rows.map(mapAvailabilityRow);
  });
}

/** HRM-SFT-011 — create employee availability window. */
export async function createHrSftEmployeeAvailability(input: {
  organizationId: string;
  payload: HrSftCreateAvailabilityInput;
}): Promise<HrSftAvailabilityRow> {
  const payload = hrSftCreateAvailabilitySchema.parse(input.payload);
  await assertEmployeeInOrg(input.organizationId, payload.employeeId);

  const availabilityId = createEntityId("hr_sh_avl");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrShiftAvailability).values({
      id: availabilityId,
      organizationId: input.organizationId,
      employeeId: payload.employeeId,
      availabilityKind: payload.availabilityKind,
      startDate: startOfUtcDay(payload.startDate),
      endDate: endOfUtcDay(payload.endDate),
      preferredTemplateId: payload.preferredTemplateId ?? null,
      reason: payload.reason?.trim() || null,
    });

    const [row] = await db
      .select({
        id: hrShiftAvailability.id,
        employeeId: hrShiftAvailability.employeeId,
        availabilityKind: hrShiftAvailability.availabilityKind,
        startDate: hrShiftAvailability.startDate,
        endDate: hrShiftAvailability.endDate,
        preferredTemplateId: hrShiftAvailability.preferredTemplateId,
        reason: hrShiftAvailability.reason,
      })
      .from(hrShiftAvailability)
      .where(eq(hrShiftAvailability.id, availabilityId))
      .limit(1);

    return mapAvailabilityRow(row!);
  });
}

/** HRM-SFT-011 — update employee availability window. */
export async function updateHrSftEmployeeAvailability(input: {
  organizationId: string;
  payload: HrSftUpdateAvailabilityInput;
}): Promise<HrSftAvailabilityRow> {
  const payload = hrSftUpdateAvailabilitySchema.parse(input.payload);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrShiftAvailability.id })
      .from(hrShiftAvailability)
      .where(
        and(
          eq(hrShiftAvailability.organizationId, input.organizationId),
          eq(hrShiftAvailability.id, payload.availabilityId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrSftAvailabilityError("sft_availability_not_found");
    }

    await db
      .update(hrShiftAvailability)
      .set({
        availabilityKind: payload.availabilityKind,
        startDate: payload.startDate
          ? startOfUtcDay(payload.startDate)
          : undefined,
        endDate: payload.endDate ? endOfUtcDay(payload.endDate) : undefined,
        preferredTemplateId: payload.preferredTemplateId,
        reason: payload.reason,
      })
      .where(eq(hrShiftAvailability.id, payload.availabilityId));

    const [row] = await db
      .select({
        id: hrShiftAvailability.id,
        employeeId: hrShiftAvailability.employeeId,
        availabilityKind: hrShiftAvailability.availabilityKind,
        startDate: hrShiftAvailability.startDate,
        endDate: hrShiftAvailability.endDate,
        preferredTemplateId: hrShiftAvailability.preferredTemplateId,
        reason: hrShiftAvailability.reason,
      })
      .from(hrShiftAvailability)
      .where(eq(hrShiftAvailability.id, payload.availabilityId))
      .limit(1);

    return mapAvailabilityRow(row!);
  });
}

/** HRM-SFT-011 — delete employee availability window. */
export async function deleteHrSftEmployeeAvailability(input: {
  organizationId: string;
  availabilityId: string;
}): Promise<{ availabilityId: string }> {
  const payload = hrSftDeleteAvailabilitySchema.parse({
    availabilityId: input.availabilityId,
  });

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrShiftAvailability.id })
      .from(hrShiftAvailability)
      .where(
        and(
          eq(hrShiftAvailability.organizationId, input.organizationId),
          eq(hrShiftAvailability.id, payload.availabilityId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrSftAvailabilityError("sft_availability_not_found");
    }

    await db
      .delete(hrShiftAvailability)
      .where(eq(hrShiftAvailability.id, payload.availabilityId));

    return { availabilityId: payload.availabilityId };
  });
}

async function resolveRestOrOffTemplate(input: {
  organizationId: string;
  assignmentKind: "rest_day" | "off_day";
  templateId?: string;
}): Promise<{ templateId: string; startTime: string; endTime: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const expectedCategory = input.assignmentKind === "rest_day" ? "rest" : "off";

    if (input.templateId) {
      const [template] = await db
        .select({
          id: hrShiftTemplates.id,
          startTime: hrShiftTemplates.startTime,
          endTime: hrShiftTemplates.endTime,
          shiftCategory: hrShiftTemplates.shiftCategory,
        })
        .from(hrShiftTemplates)
        .where(
          and(
            eq(hrShiftTemplates.organizationId, input.organizationId),
            eq(hrShiftTemplates.id, input.templateId),
            eq(hrShiftTemplates.status, "active"),
          ),
        )
        .limit(1);

      if (!template) {
        throw new HrSftAvailabilityError("sft_template_not_found");
      }
      if (template.shiftCategory !== expectedCategory) {
        throw new HrSftAvailabilityError(
          "sft_invalid_holiday_template",
          `Template category must be ${expectedCategory}`,
        );
      }

      return {
        templateId: template.id,
        startTime: template.startTime,
        endTime: template.endTime,
      };
    }

    const [template] = await db
      .select({
        id: hrShiftTemplates.id,
        startTime: hrShiftTemplates.startTime,
        endTime: hrShiftTemplates.endTime,
      })
      .from(hrShiftTemplates)
      .where(
        and(
          eq(hrShiftTemplates.organizationId, input.organizationId),
          eq(hrShiftTemplates.shiftCategory, expectedCategory),
          eq(hrShiftTemplates.status, "active"),
        ),
      )
      .limit(1);

    if (!template) {
      throw new HrSftAvailabilityError("sft_template_not_found");
    }

    return {
      templateId: template.id,
      startTime: template.startTime,
      endTime: template.endTime,
    };
  });
}

async function upsertNonWorkingAssignment(input: {
  organizationId: string;
  employeeId: string;
  templateId: string;
  assignmentKind: "rest_day" | "off_day" | "holiday";
  shiftDate: Date;
  startTime: string;
  endTime: string;
  notes?: string | null;
  assignedByAuthUserId?: string;
}): Promise<{ assignmentId: string }> {
  const shiftDay = startOfUtcDay(input.shiftDate);
  const shiftStart = combineDateAndTime(shiftDay, input.startTime);
  let shiftEnd = combineDateAndTime(shiftDay, input.endTime);
  if (shiftEnd.getTime() <= shiftStart.getTime()) {
    shiftEnd = new Date(shiftEnd.getTime() + 86_400_000);
  }

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
      await db
        .update(hrShiftAssignments)
        .set({
          templateId: input.templateId,
          assignmentKind: input.assignmentKind,
          shiftStart,
          shiftEnd,
          notes: input.notes?.trim() || null,
          status: "scheduled",
          assignedByAuthUserId: input.assignedByAuthUserId ?? null,
          cancelledAt: null,
        })
        .where(eq(hrShiftAssignments.id, existing.id));

      return { assignmentId: existing.id };
    }

    const assignmentId = createEntityId("hr_sh_asg");
    await db.insert(hrShiftAssignments).values({
      id: assignmentId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      templateId: input.templateId,
      assignmentKind: input.assignmentKind,
      shiftDate: shiftDay,
      shiftStart,
      shiftEnd,
      notes: input.notes?.trim() || null,
      assignedByAuthUserId: input.assignedByAuthUserId ?? null,
    });

    return { assignmentId };
  });
}

/** HRM-SFT-009 — assign rest day or off day for an employee on a date. */
export async function assignHrSftRestOrOffDay(input: {
  organizationId: string;
  payload: HrSftAssignRestOrOffDayInput;
  assignedByAuthUserId?: string;
}): Promise<{ assignmentId: string; assignmentKind: "rest_day" | "off_day" }> {
  const payload = hrSftAssignRestOrOffDaySchema.parse(input.payload);
  await assertEmployeeInOrg(input.organizationId, payload.employeeId);

  const template = await resolveRestOrOffTemplate({
    organizationId: input.organizationId,
    assignmentKind: payload.assignmentKind,
    templateId: payload.templateId,
  });

  const result = await upsertNonWorkingAssignment({
    organizationId: input.organizationId,
    employeeId: payload.employeeId,
    templateId: template.templateId,
    assignmentKind: payload.assignmentKind,
    shiftDate: payload.shiftDate,
    startTime: template.startTime,
    endTime: template.endTime,
    notes: payload.notes,
    assignedByAuthUserId: input.assignedByAuthUserId,
  });

  return {
    assignmentId: result.assignmentId,
    assignmentKind: payload.assignmentKind,
  };
}

/** HRM-SFT-010 — schedule holiday shift assignment. */
export async function assignHrSftHolidayShift(input: {
  organizationId: string;
  payload: HrSftAssignHolidayShiftInput;
  assignedByAuthUserId?: string;
}): Promise<{ assignmentId: string }> {
  const payload = hrSftAssignHolidayShiftSchema.parse(input.payload);
  await assertEmployeeInOrg(input.organizationId, payload.employeeId);

  const template = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select({
          id: hrShiftTemplates.id,
          startTime: hrShiftTemplates.startTime,
          endTime: hrShiftTemplates.endTime,
          shiftCategory: hrShiftTemplates.shiftCategory,
        })
        .from(hrShiftTemplates)
        .where(
          and(
            eq(hrShiftTemplates.organizationId, input.organizationId),
            eq(hrShiftTemplates.id, payload.templateId),
            eq(hrShiftTemplates.status, "active"),
          ),
        )
        .limit(1);

      if (!row) {
        throw new HrSftAvailabilityError("sft_template_not_found");
      }
      if (row.shiftCategory !== "holiday") {
        throw new HrSftAvailabilityError(
          "sft_invalid_holiday_template",
          "Template category must be holiday",
        );
      }

      return row;
    },
  );

  await assertShiftAssignmentConflictsClear({
    organizationId: input.organizationId,
    employeeId: payload.employeeId,
    templateId: template.id,
    shiftDate: payload.shiftDate,
    assignmentKind: "holiday",
  });

  return upsertNonWorkingAssignment({
    organizationId: input.organizationId,
    employeeId: payload.employeeId,
    templateId: template.id,
    assignmentKind: "holiday",
    shiftDate: payload.shiftDate,
    startTime: template.startTime,
    endTime: template.endTime,
    notes: payload.notes,
    assignedByAuthUserId: input.assignedByAuthUserId,
  });
}

export type HrSftAvailabilityWindow = {
  rows: readonly HrSftAvailabilityRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

const SFT_AVAILABILITY_DEFAULT_PAGE_SIZE = 25;

/** HRM-SFT-011 — paginated availability window for Pattern B list. */
export async function loadHrTimeSftAvailabilityWindow(input: {
  organizationId: string;
  employeeId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  limit?: number;
  offset?: number;
}): Promise<HrSftAvailabilityWindow> {
  const pageSize = input.limit ?? SFT_AVAILABILITY_DEFAULT_PAGE_SIZE;
  const offset = Math.max(0, input.offset ?? 0);

  const rows = await listHrSftEmployeeAvailability({
    organizationId: input.organizationId,
    query: {
      employeeId: input.employeeId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    },
  });

  const pageRows = rows.slice(offset, offset + pageSize);

  return {
    rows: pageRows,
    pageSize,
    totalCount: rows.length,
    hasNextPage: offset + pageSize < rows.length,
  };
}
