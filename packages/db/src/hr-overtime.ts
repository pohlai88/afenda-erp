import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { hrEmployees, hrOvertimeRequests } from "./schema/hr";

export type HrOvertimeRequestRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  overtimeType: (typeof hrOvertimeRequests.$inferSelect)["overtimeType"];
  status: (typeof hrOvertimeRequests.$inferSelect)["status"];
  workDate: Date;
  hours: string;
  reason: string | null;
  decisionNote: string | null;
  submittedAt: Date;
  decidedAt: Date | null;
};

export type HrOvertimeRequestWindow = {
  rows: readonly HrOvertimeRequestRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export class HrOvertimeCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "request_not_found"
    | "invalid_hours"
    | "request_not_pending";

  constructor(code: HrOvertimeCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_OVERTIME_HOURS = 24;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

function normalizeHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0 || hours > MAX_OVERTIME_HOURS) {
    throw new HrOvertimeCommandError("invalid_hours");
  }
  return hours.toFixed(2);
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
      throw new HrOvertimeCommandError("employee_not_found");
    }
  });
}

export async function listHrOvertimeRequestsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrOvertimeRequests.$inferSelect)["status"];
  employeeId?: string;
  pendingOnly?: boolean;
}): Promise<HrOvertimeRequestWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOvertimeRequests.organizationId, input.organizationId),
    ];

    if (input.pendingOnly) {
      conditions.push(eq(hrOvertimeRequests.status, "pending"));
    } else if (input.status) {
      conditions.push(eq(hrOvertimeRequests.status, input.status));
    }

    if (input.employeeId) {
      conditions.push(eq(hrOvertimeRequests.employeeId, input.employeeId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrOvertimeRequests.reason, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOvertimeRequests)
      .innerJoin(hrEmployees, eq(hrOvertimeRequests.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOvertimeRequests.id,
        employeeId: hrOvertimeRequests.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        overtimeType: hrOvertimeRequests.overtimeType,
        status: hrOvertimeRequests.status,
        workDate: hrOvertimeRequests.workDate,
        hours: hrOvertimeRequests.hours,
        reason: hrOvertimeRequests.reason,
        decisionNote: hrOvertimeRequests.decisionNote,
        submittedAt: hrOvertimeRequests.submittedAt,
        decidedAt: hrOvertimeRequests.decidedAt,
      })
      .from(hrOvertimeRequests)
      .innerJoin(hrEmployees, eq(hrOvertimeRequests.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrOvertimeRequests.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        overtimeType: row.overtimeType,
        status: row.status,
        workDate: row.workDate,
        hours: row.hours,
        reason: row.reason,
        decisionNote: row.decisionNote,
        submittedAt: row.submittedAt,
        decidedAt: row.decidedAt,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function submitHrOvertimeRequest(input: {
  organizationId: string;
  employeeId: string;
  overtimeType: (typeof hrOvertimeRequests.$inferInsert)["overtimeType"];
  workDate: Date;
  hours: number;
  reason?: string | null;
}): Promise<{ requestId: string }> {
  await assertEmployeeInOrg(input.organizationId, input.employeeId);
  const hours = normalizeHours(input.hours);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const requestId = createEntityId("hr_ot_req");
    await db.insert(hrOvertimeRequests).values({
      id: requestId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      overtimeType: input.overtimeType,
      workDate: input.workDate,
      hours,
      reason: input.reason?.trim() || null,
    });

    return { requestId };
  });
}

async function decideHrOvertimeRequest(input: {
  organizationId: string;
  requestId: string;
  status: "approved" | "rejected";
  decisionNote?: string | null;
}): Promise<{ requestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select({
        id: hrOvertimeRequests.id,
        status: hrOvertimeRequests.status,
      })
      .from(hrOvertimeRequests)
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.id, input.requestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrOvertimeCommandError("request_not_found");
    }
    if (request.status !== "pending") {
      throw new HrOvertimeCommandError("request_not_pending");
    }

    await db
      .update(hrOvertimeRequests)
      .set({
        status: input.status,
        decisionNote: input.decisionNote?.trim() || null,
        decidedAt: new Date(),
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));

    return { requestId: input.requestId };
  });
}

export async function approveHrOvertimeRequest(input: {
  organizationId: string;
  requestId: string;
  decisionNote?: string | null;
}): Promise<{ requestId: string }> {
  return decideHrOvertimeRequest({ ...input, status: "approved" });
}

export async function rejectHrOvertimeRequest(input: {
  organizationId: string;
  requestId: string;
  decisionNote?: string | null;
}): Promise<{ requestId: string }> {
  return decideHrOvertimeRequest({ ...input, status: "rejected" });
}

export async function cancelHrOvertimeRequest(input: {
  organizationId: string;
  requestId: string;
}): Promise<{ requestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select({
        id: hrOvertimeRequests.id,
        status: hrOvertimeRequests.status,
      })
      .from(hrOvertimeRequests)
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.id, input.requestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrOvertimeCommandError("request_not_found");
    }
    if (request.status !== "pending") {
      throw new HrOvertimeCommandError("request_not_pending");
    }

    await db
      .update(hrOvertimeRequests)
      .set({
        status: "cancelled",
        decidedAt: new Date(),
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));

    return { requestId: input.requestId };
  });
}
