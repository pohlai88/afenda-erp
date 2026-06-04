import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { clampPageSize } from "./hr-benefits.shared";
import {
  hrExpenseAuditActionEnum,
  hrExpenseAuditEvents,
} from "./dbx-hr-expense";

export type HrExpenseAuditTrailWindow = {
  rows: readonly {
    id: string;
    action: string;
    summary: string;
    occurredAt: Date;
  }[];
  total: number;
  pageSize: number;
  offset: number;
};

type HrExpenseAuditActionValue =
  (typeof hrExpenseAuditActionEnum.enumValues)[number];

const EXPENSE_AUDIT_ACTION_ALIASES: Record<string, HrExpenseAuditActionValue> = {
  "hr.expense.claim.submit": "claim_submit",
  "hr.expense.claim.approve": "claim_approve",
  "hr.expense.claim.reject": "claim_reject",
  "hr.expense.claim.return": "claim_return",
  "hr.expense.receipt.upload": "receipt_uploaded",
  "hr.expense.payroll.integrate": "payment_payroll_staged",
  "hr.expense.ap.integrate": "payment_ap_staged",
  "hr.expense.payment.record": "payment_reference_recorded",
  "hr.expense.accounting.allocate": "accounting_allocated",
  "hr.expense.report.export": "report_exported",
  "hr.expense.notification.enqueue": "notification_enqueued",
};

export function resolveHrExpenseAuditAction(
  action: string,
): HrExpenseAuditActionValue {
  if ((hrExpenseAuditActionEnum.enumValues as readonly string[]).includes(action)) {
    return action as HrExpenseAuditActionValue;
  }

  const mapped = EXPENSE_AUDIT_ACTION_ALIASES[action];
  if (mapped) {
    return mapped;
  }

  return "notification_enqueued";
}

export async function appendHrExpenseAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    action: string;
    summary: string;
    claimId?: string | null;
    employeeId?: string | null;
    actorUserId?: string | null;
    metadata?: Record<string, unknown>;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_exp_audit");
  await db.insert(hrExpenseAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    claimId: input.claimId ?? null,
    employeeId: input.employeeId ?? null,
    action: resolveHrExpenseAuditAction(input.action),
    actorUserId: input.actorUserId ?? null,
    summary: input.summary,
    metadata: input.metadata ?? null,
    occurredAt: input.occurredAt ?? new Date(),
  });
  return { auditEventId };
}

export async function listHrExpenseAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrExpenseAuditTrailWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrExpenseAuditEvents.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrExpenseAuditEvents.action, pattern),
          ilike(hrExpenseAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrExpenseAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrExpenseAuditEvents.id,
        action: hrExpenseAuditEvents.action,
        summary: hrExpenseAuditEvents.summary,
        occurredAt: hrExpenseAuditEvents.occurredAt,
      })
      .from(hrExpenseAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrExpenseAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    return {
      rows,
      total: Number(totalRow?.total ?? 0),
      pageSize,
      offset,
    };
  });
}

