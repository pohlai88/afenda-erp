import { and, eq } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { appendHrOvertimeAuditEvent, HrOtmCommandError } from "./hr-otm";
import type { HrLeaveType } from "./hr-leave-validation";
import { otmPayableMinutesToCompensatoryLeaveDays } from "./hr-otm-compensatory.shared";
import {
  hrLeaveBalanceLedger,
  hrLeaveBalances,
  hrOvertimeAuditEvents,
} from "./hr";

const COMPENSATORY_LEAVE_TYPES = new Set<HrLeaveType>([
  "replacement",
  "other",
  "annual",
]);

function resolveCompensatoryLeaveType(leaveTypeCode: string): HrLeaveType {
  const normalized = leaveTypeCode.trim().toLowerCase();
  if (COMPENSATORY_LEAVE_TYPES.has(normalized as HrLeaveType)) {
    return normalized as HrLeaveType;
  }
  return "replacement";
}

export { otmPayableMinutesToCompensatoryLeaveDays } from "./hr-otm-compensatory.shared";

const COMPENSATORY_AUDIT_METADATA_FLAG = "compensatoryLeaveCredit";

async function hasCompensatoryCreditAudit(
  organizationId: string,
  requestId: string,
): Promise<boolean> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const rows = await db
      .select({ metadata: hrOvertimeAuditEvents.metadata })
      .from(hrOvertimeAuditEvents)
      .where(
        and(
          eq(hrOvertimeAuditEvents.organizationId, organizationId),
          eq(hrOvertimeAuditEvents.requestId, requestId),
        ),
      );
    return rows.some(
      (row) =>
        row.metadata?.[COMPENSATORY_AUDIT_METADATA_FLAG] === true ||
        row.metadata?.auditKind === "erp.hrm.overtime.compensatory_leave.create",
    );
  });
}

/**
 * HRM-OTM-022 — credit compensatory leave on final approve; idempotent per request.
 */
export async function creditHrOvertimeCompensatoryLeave(input: {
  organizationId: string;
  requestId: string;
  employeeId: string;
  workDate: Date;
  payableMinutes: number;
  leaveTypeCode: string;
  policyGroupCode?: string;
  actorAuthUserId?: string | null;
}): Promise<{ credited: boolean; leaveDays: number; balanceId?: string }> {
  const leaveDays = otmPayableMinutesToCompensatoryLeaveDays(input.payableMinutes);
  if (leaveDays <= 0) {
    return { credited: false, leaveDays: 0 };
  }

  if (await hasCompensatoryCreditAudit(input.organizationId, input.requestId)) {
    return { credited: false, leaveDays };
  }

  const entitlementYear = input.workDate.getUTCFullYear();
  const leaveTypeCode = input.leaveTypeCode.trim();
  if (!leaveTypeCode) {
    throw new HrOtmCommandError("invalid_hours");
  }
  const leaveType = resolveCompensatoryLeaveType(leaveTypeCode);

  const { ensureHrLeaveBalance } = await import("./hr-lam");

  const balanceId = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const { balanceId: ensuredBalanceId } = await ensureHrLeaveBalance({
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        leaveType,
        entitlementYear,
        policyGroupCode: input.policyGroupCode ?? "default",
      });

      const [balance] = await db
        .select({ adjustedDays: hrLeaveBalances.adjustedDays })
        .from(hrLeaveBalances)
        .where(eq(hrLeaveBalances.id, ensuredBalanceId))
        .limit(1);

      if (!balance) {
        throw new HrOtmCommandError("employee_not_found");
      }

      const nextAdjusted = (
        Number(balance.adjustedDays) + leaveDays
      ).toFixed(2);

      await db
        .update(hrLeaveBalances)
        .set({ adjustedDays: nextAdjusted })
        .where(eq(hrLeaveBalances.id, ensuredBalanceId));

      const ledgerId = createEntityId("hr_lb_led");
      await db.insert(hrLeaveBalanceLedger).values({
        id: ledgerId,
        organizationId: input.organizationId,
        balanceId: ensuredBalanceId,
        kind: "manual_correction",
        amountDays: leaveDays.toFixed(2),
        reason: `Overtime compensatory credit (request ${input.requestId})`,
        authorizedByAuthUserId: input.actorAuthUserId ?? "system",
      });

      return ensuredBalanceId;
    },
  );

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId: input.requestId,
    employeeId: input.employeeId,
    action: "calculation_apply",
    actorAuthUserId: input.actorAuthUserId ?? null,
    summary: "Compensatory leave credited from approved overtime",
    metadata: {
      [COMPENSATORY_AUDIT_METADATA_FLAG]: true,
      overtimeRequestId: input.requestId,
      leaveTypeCode,
      leaveType,
      leaveDays,
      balanceId,
      auditKind: "erp.hrm.overtime.compensatory_leave.create",
    },
  });

  return { credited: true, leaveDays, balanceId };
}
