import { notifyHrExpenseClaimEvent } from "@afenda/db";

import { hrPayrollExpenseAuditActions } from "./hr.payroll.expense.event";
import type { HrExpenseNotificationKind } from "./hr.payroll.expense-constants.shared";
import {
  buildHrExpenseNotificationCopy,
  hrExpenseNotificationSubjectTypes,
} from "./hr.payroll.expense-notification-templates.shared";
import { emitHrExpenseAuditEvent } from "./hrs-hr-payroll-expense-audit-server";

/** HRM-EXP-027 — notify employees and approvers of claim workflow events. */
export async function notifyHrExpenseClaimWorkflowEvent(input: {
  organizationId: string;
  actorAuthUserId: string;
  kind: HrExpenseNotificationKind;
  claimId: string;
  employeeId: string;
  claimNumber?: string;
  detail?: string;
  additionalRecipientAuthUserIds?: readonly string[];
}): Promise<{ enqueuedCount: number }> {
  const copy = buildHrExpenseNotificationCopy({
    kind: input.kind,
    claimNumber: input.claimNumber,
    detail: input.detail,
  });

  const result = await notifyHrExpenseClaimEvent({
    organizationId: input.organizationId,
    kind: input.kind,
    subjectType: hrExpenseNotificationSubjectTypes.claim,
    subjectId: input.claimId,
    employeeId: input.employeeId,
    title: copy.title,
    body: copy.body,
    additionalRecipientAuthUserIds: input.additionalRecipientAuthUserIds,
  });

  if (result.enqueuedCount > 0) {
    await emitHrExpenseAuditEvent({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      action: hrPayrollExpenseAuditActions.notification.enqueued,
      claimId: input.claimId,
      employeeId: input.employeeId,
      summary: copy.title,
      metadata: { kind: input.kind, enqueuedCount: result.enqueuedCount },
    });
  }

  return result;
}
