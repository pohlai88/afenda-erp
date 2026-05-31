import "@afenda/kernel/server";

import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { hrLeaveRequests, runWithOrganizationContext } from "@afenda/db";

import type { HrSftApprovedLeaveSlice } from "../schemas/hr.time.sft-conflict.schema";

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

/**
 * HRM-SFT-012 — LAM boundary: approved leave rows overlapping a shift date.
 * Reads `hr_leave_requests` only; leave workflow remains owned by LAM.
 */
export async function loadHrSftApprovedLeaveForEmployeeDate(input: {
  organizationId: string;
  employeeId: string;
  shiftDate: Date;
}): Promise<readonly HrSftApprovedLeaveSlice[]> {
  const periodStart = startOfUtcDay(input.shiftDate);
  const periodEnd = endOfUtcDay(input.shiftDate);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        leaveRequestId: hrLeaveRequests.id,
        employeeId: hrLeaveRequests.employeeId,
        leaveType: hrLeaveRequests.leaveType,
        startAt: hrLeaveRequests.startAt,
        endAt: hrLeaveRequests.endAt,
      })
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.organizationId, input.organizationId),
          eq(hrLeaveRequests.employeeId, input.employeeId),
          eq(hrLeaveRequests.status, "approved"),
          lte(hrLeaveRequests.startAt, periodEnd),
          gte(hrLeaveRequests.endAt, periodStart),
        ),
      );

    return rows.map((row) => ({
      leaveRequestId: row.leaveRequestId,
      employeeId: row.employeeId,
      leaveType: row.leaveType,
      startAt: row.startAt,
      endAt: row.endAt,
    }));
  });
}

/** HRM-SFT-012 — batch approved leave lookup for roster conflict scans. */
export async function loadHrSftApprovedLeaveForEmployeesPeriod(input: {
  organizationId: string;
  employeeIds: readonly string[];
  periodStart: Date;
  periodEnd: Date;
}): Promise<readonly HrSftApprovedLeaveSlice[]> {
  if (input.employeeIds.length === 0) {
    return [];
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        leaveRequestId: hrLeaveRequests.id,
        employeeId: hrLeaveRequests.employeeId,
        leaveType: hrLeaveRequests.leaveType,
        startAt: hrLeaveRequests.startAt,
        endAt: hrLeaveRequests.endAt,
      })
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.organizationId, input.organizationId),
          eq(hrLeaveRequests.status, "approved"),
          inArray(hrLeaveRequests.employeeId, [...input.employeeIds]),
          lte(hrLeaveRequests.startAt, endOfUtcDay(input.periodEnd)),
          gte(hrLeaveRequests.endAt, startOfUtcDay(input.periodStart)),
        ),
      );

    return rows.map((row) => ({
      leaveRequestId: row.leaveRequestId,
      employeeId: row.employeeId,
      leaveType: row.leaveType,
      startAt: row.startAt,
      endAt: row.endAt,
    }));
  });
}
