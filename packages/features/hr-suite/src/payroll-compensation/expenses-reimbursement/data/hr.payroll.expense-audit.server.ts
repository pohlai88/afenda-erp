import {
  appendHrExpenseAuditEventInTx,
  runWithOrganizationContext,
} from "@afenda/db";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";

import type { HrPayrollExpenseAuditAction } from "../events/hr.payroll.expense.event";

/** HRM-EXP-028 — domain audit row plus IAM execution audit. */
export async function emitHrExpenseAuditEvent(input: {
  organizationId: string;
  actorAuthUserId: string;
  action: HrPayrollExpenseAuditAction | string;
  claimId?: string | null;
  employeeId?: string | null;
  summary: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ auditEventId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const { auditEventId } = await appendHrExpenseAuditEventInTx(db, {
      organizationId: input.organizationId,
      claimId: input.claimId,
      employeeId: input.employeeId,
      actorUserId: input.actorAuthUserId,
      action: input.action,
      summary: input.summary,
      reason: input.reason,
      metadata: input.metadata,
    });

    await writeExecutionAuditEventInTransaction(db, {
      organizationId: input.organizationId,
      actorId: input.actorAuthUserId,
      actorType: "user",
      action: input.action,
      targetType: "hr_expense",
      targetId: input.claimId ?? auditEventId,
      summary: input.summary,
      ...(input.reason ? { reason: input.reason } : {}),
      metadata: input.metadata,
    });

    return { auditEventId };
  });
}
