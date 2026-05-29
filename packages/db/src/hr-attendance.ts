import { and, count, desc, eq, gte, ilike, isNull, lte, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { hrAttendanceRecords, hrEmployees } from "./schema/hr";

export type HrAttendanceRecordRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  punchType: (typeof hrAttendanceRecords.$inferSelect)["punchType"];
  status: (typeof hrAttendanceRecords.$inferSelect)["status"];
  source: (typeof hrAttendanceRecords.$inferSelect)["source"];
  punchedAt: Date;
  notes: string | null;
};

export type HrAttendanceRecordWindow = {
  rows: readonly HrAttendanceRecordRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export class HrAttendanceCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "record_not_found"
    | "record_already_voided";

  constructor(code: HrAttendanceCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

export async function listHrAttendanceRecordsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  punchType?: (typeof hrAttendanceRecords.$inferSelect)["punchType"];
  punchedFrom?: Date;
  punchedTo?: Date;
  activeOnly?: boolean;
}): Promise<HrAttendanceRecordWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrAttendanceRecords.organizationId, input.organizationId),
    ];

    if (input.activeOnly !== false) {
      conditions.push(eq(hrAttendanceRecords.status, "active"));
    }

    if (input.employeeId) {
      conditions.push(eq(hrAttendanceRecords.employeeId, input.employeeId));
    }

    if (input.punchType) {
      conditions.push(eq(hrAttendanceRecords.punchType, input.punchType));
    }

    if (input.punchedFrom) {
      conditions.push(gte(hrAttendanceRecords.punchedAt, input.punchedFrom));
    }

    if (input.punchedTo) {
      conditions.push(lte(hrAttendanceRecords.punchedAt, input.punchedTo));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrAttendanceRecords.notes, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrAttendanceRecords)
      .innerJoin(hrEmployees, eq(hrAttendanceRecords.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrAttendanceRecords.id,
        employeeId: hrAttendanceRecords.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        punchType: hrAttendanceRecords.punchType,
        status: hrAttendanceRecords.status,
        source: hrAttendanceRecords.source,
        punchedAt: hrAttendanceRecords.punchedAt,
        notes: hrAttendanceRecords.notes,
      })
      .from(hrAttendanceRecords)
      .innerJoin(hrEmployees, eq(hrAttendanceRecords.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrAttendanceRecords.punchedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        punchType: row.punchType,
        status: row.status,
        source: row.source,
        punchedAt: row.punchedAt,
        notes: row.notes,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function recordHrAttendancePunch(input: {
  organizationId: string;
  employeeId: string;
  punchType: (typeof hrAttendanceRecords.$inferInsert)["punchType"];
  punchedAt?: Date;
  source?: (typeof hrAttendanceRecords.$inferInsert)["source"];
  idempotencyKey?: string | null;
  notes?: string | null;
}): Promise<{ recordId: string; created: boolean }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const idempotencyKey = input.idempotencyKey?.trim() || null;

    if (idempotencyKey) {
      const [existing] = await db
        .select({ id: hrAttendanceRecords.id })
        .from(hrAttendanceRecords)
        .where(
          and(
            eq(hrAttendanceRecords.organizationId, input.organizationId),
            eq(hrAttendanceRecords.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);

      if (existing) {
        return { recordId: existing.id, created: false };
      }
    }

    const [employee] = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new HrAttendanceCommandError("employee_not_found");
    }

    const recordId = createEntityId("hr_att");
    await db.insert(hrAttendanceRecords).values({
      id: recordId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      punchType: input.punchType,
      punchedAt: input.punchedAt ?? new Date(),
      source: input.source ?? "manual",
      idempotencyKey,
      notes: input.notes?.trim() || null,
    });

    return { recordId, created: true };
  });
}

export async function voidHrAttendancePunch(input: {
  organizationId: string;
  recordId: string;
}): Promise<{ recordId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [record] = await db
      .select({
        id: hrAttendanceRecords.id,
        status: hrAttendanceRecords.status,
      })
      .from(hrAttendanceRecords)
      .where(
        and(
          eq(hrAttendanceRecords.organizationId, input.organizationId),
          eq(hrAttendanceRecords.id, input.recordId),
        ),
      )
      .limit(1);

    if (!record) {
      throw new HrAttendanceCommandError("record_not_found");
    }
    if (record.status === "voided") {
      throw new HrAttendanceCommandError("record_already_voided");
    }

    await db
      .update(hrAttendanceRecords)
      .set({ status: "voided", voidedAt: new Date() })
      .where(eq(hrAttendanceRecords.id, input.recordId));

    return { recordId: input.recordId };
  });
}
