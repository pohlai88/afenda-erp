import { and, eq, gte, lte } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { appendHrOvertimeAuditEvent } from "./hr-otm";
import { hrEmployees, hrOvertimeRequests } from "./hr";

/** HRM-OTM-024 — only this request status may be consumed by payroll export. */
export const HRM_OTM_PAYROLL_EXPORTABLE_STATUS = "payroll_ready" as const;

/** Payroll consumption line (HRM-OTM-023 / AC 21). */
export type HrOvertimePayrollEarningLine = {
  requestId: string;
  employeeId: string;
  workDate: Date;
  payableMinutes: number;
  payMultiplier: number;
  earningCode: string;
  amountCents: number;
  overtimeType: (typeof hrOvertimeRequests.$inferSelect)["overtimeType"];
};

/**
 * HRM-OTM-023 + HRM-OTM-024 — only `payroll_ready` rows are exportable to payroll.
 */
export async function listHrOvertimePayrollEarningsForEmployeePeriod(input: {
  organizationId: string;
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
}): Promise<readonly HrOvertimePayrollEarningLine[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        requestId: hrOvertimeRequests.id,
        employeeId: hrOvertimeRequests.employeeId,
        workDate: hrOvertimeRequests.workDate,
        payableMinutes: hrOvertimeRequests.payableMinutes,
        amountCents: hrOvertimeRequests.amountCents,
        earningCode: hrOvertimeRequests.earningCode,
        overtimeType: hrOvertimeRequests.overtimeType,
        hours: hrOvertimeRequests.hours,
      })
      .from(hrOvertimeRequests)
      .innerJoin(hrEmployees, eq(hrOvertimeRequests.employeeId, hrEmployees.id))
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.employeeId, input.employeeId),
          eq(hrOvertimeRequests.status, HRM_OTM_PAYROLL_EXPORTABLE_STATUS),
          gte(hrOvertimeRequests.workDate, input.periodStart),
          lte(hrOvertimeRequests.workDate, input.periodEnd),
        ),
      )
      .orderBy(hrOvertimeRequests.workDate);

    return rows
      .filter(
        (row) =>
          row.payableMinutes !== null &&
          row.payableMinutes > 0 &&
          row.amountCents !== null &&
          row.earningCode,
      )
      .map((row) => {
        const hours = Number(row.hours);
        const impliedMultiplier =
          row.payableMinutes && hours > 0
            ? row.payableMinutes / (hours * 60)
            : 1;
        return {
          requestId: row.requestId,
          employeeId: row.employeeId,
          workDate: row.workDate,
          payableMinutes: row.payableMinutes!,
          payMultiplier: Number(impliedMultiplier.toFixed(2)),
          earningCode: row.earningCode!,
          amountCents: row.amountCents!,
          overtimeType: row.overtimeType,
        };
      });
  });
}

/** Alias for payroll engine integration (HRM-OTM-023). */
export const listApprovedOvertimeEarningsForEmployeePeriod =
  listHrOvertimePayrollEarningsForEmployeePeriod;

export async function recordHrOvertimePayrollExportAudit(input: {
  organizationId: string;
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  requestIds: readonly string[];
  actorAuthUserId?: string | null;
}): Promise<void> {
  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    action: "payroll_export",
    actorAuthUserId: input.actorAuthUserId ?? null,
    summary: "Overtime payroll earnings exported",
    metadata: {
      periodStart: input.periodStart.toISOString(),
      periodEnd: input.periodEnd.toISOString(),
      requestIds: [...input.requestIds],
      exportCount: input.requestIds.length,
    },
  });
}
