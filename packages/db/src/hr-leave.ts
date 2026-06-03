import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { hrEmployees, hrLeaveRequests } from "./hr";

export type HrLeaveRequestRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  leaveType: (typeof hrLeaveRequests.$inferSelect)["leaveType"];
  status: (typeof hrLeaveRequests.$inferSelect)["status"];
  approvalStage?: (typeof hrLeaveRequests.$inferSelect)["approvalStage"];
  startAt: Date;
  endAt: Date;
  durationDays: string;
  reason: string | null;
  decisionNote: string | null;
  rejectionReason?: string | null;
  payrollDeductionReference?: string | null;
  submittedAt: Date;
  decidedAt: Date | null;
};

export type HrLeaveRequestWindow = {
  rows: readonly HrLeaveRequestRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export class HrLeaveCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "request_not_found"
    | "invalid_date_range"
    | "request_not_pending";

  constructor(code: HrLeaveCommandError["code"], message?: string) {
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

export async function listHrLeaveRequestsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrLeaveRequests.$inferSelect)["status"];
  employeeId?: string;
  pendingOnly?: boolean;
}): Promise<HrLeaveRequestWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrLeaveRequests.organizationId, input.organizationId),
    ];

    if (input.pendingOnly) {
      conditions.push(eq(hrLeaveRequests.status, "pending"));
    } else if (input.status) {
      conditions.push(eq(hrLeaveRequests.status, input.status));
    }

    if (input.employeeId) {
      conditions.push(eq(hrLeaveRequests.employeeId, input.employeeId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrLeaveRequests.reason, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrLeaveRequests)
      .innerJoin(hrEmployees, eq(hrLeaveRequests.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrLeaveRequests.id,
        employeeId: hrLeaveRequests.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        leaveType: hrLeaveRequests.leaveType,
        status: hrLeaveRequests.status,
        startAt: hrLeaveRequests.startAt,
        endAt: hrLeaveRequests.endAt,
        durationDays: hrLeaveRequests.durationDays,
        reason: hrLeaveRequests.reason,
        decisionNote: hrLeaveRequests.decisionNote,
        submittedAt: hrLeaveRequests.submittedAt,
        decidedAt: hrLeaveRequests.decidedAt,
      })
      .from(hrLeaveRequests)
      .innerJoin(hrEmployees, eq(hrLeaveRequests.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrLeaveRequests.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        leaveType: row.leaveType,
        status: row.status,
        startAt: row.startAt,
        endAt: row.endAt,
        durationDays: row.durationDays,
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

export async function submitHrLeaveRequest(input: {
  organizationId: string;
  employeeId: string;
  leaveType: (typeof hrLeaveRequests.$inferInsert)["leaveType"];
  startAt: Date;
  endAt: Date;
  reason?: string | null;
  supportingDocumentId?: string | null;
  policyGroupCode?: string;
}): Promise<{ requestId: string }> {
  const { submitHrLeaveApplication } = await import("./hr-lam");
  return submitHrLeaveApplication(input);
}

export async function approveHrLeaveRequest(input: {
  organizationId: string;
  requestId: string;
  decisionNote?: string | null;
  actorAuthUserId: string;
  actorCanHrApprove: boolean;
  actorManagerEmployeeIds?: readonly string[];
}): Promise<{ requestId: string }> {
  const { decideHrLeaveApplication } = await import("./hr-lam-workflow");
  const result = await decideHrLeaveApplication({
    ...input,
    decision: "approve",
  });
  return { requestId: result.requestId };
}

export async function rejectHrLeaveRequest(input: {
  organizationId: string;
  requestId: string;
  rejectionReason: string;
  decisionNote?: string | null;
  actorAuthUserId: string;
  actorCanHrApprove: boolean;
}): Promise<{ requestId: string }> {
  const { decideHrLeaveApplication } = await import("./hr-lam-workflow");
  const result = await decideHrLeaveApplication({
    organizationId: input.organizationId,
    requestId: input.requestId,
    decision: "reject",
    rejectionReason: input.rejectionReason,
    decisionNote: input.decisionNote,
    actorAuthUserId: input.actorAuthUserId,
    actorCanHrApprove: input.actorCanHrApprove,
  });
  return { requestId: result.requestId };
}

export async function cancelHrLeaveRequest(input: {
  organizationId: string;
  requestId: string;
}): Promise<{ requestId: string }> {
  const { cancelHrLeaveApplication } = await import("./hr-lam-workflow");
  return cancelHrLeaveApplication(input);
}
