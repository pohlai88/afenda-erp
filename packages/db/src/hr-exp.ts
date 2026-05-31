import { and, eq } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  hrExpenseAuditEvents,
  hrExpenseClaims,
  hrExpenseExceptions,
} from "./schema/hr";

export * from "./hr-exp.shared";

export class HrExpCommandError extends Error {
  readonly code:
    | "claim_not_found"
    | "invalid_status_transition"
    | "claim_not_actionable"
    | "rejection_reason_required"
    | "return_reason_required"
    | "clarification_reason_required"
    | "unauthorized_approver"
    | "open_exceptions_block_approval"
    | "exception_not_found";

  constructor(code: HrExpCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export async function appendHrExpenseAuditEvent(input: {
  organizationId: string;
  claimId: string;
  employeeId?: string | null;
  action: (typeof hrExpenseAuditEvents.$inferSelect)["action"];
  actorAuthUserId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrExpenseAuditEvents).values({
      id: createEntityId("hr_exp_audit"),
      organizationId: input.organizationId,
      claimId: input.claimId,
      employeeId: input.employeeId ?? null,
      action: input.action,
      actorAuthUserId: input.actorAuthUserId ?? null,
      summary: input.summary,
      metadata: input.metadata ?? null,
      occurredAt: new Date(),
    });
  });
}

export async function hasOpenHrExpenseExceptions(input: {
  organizationId: string;
  claimId: string;
}): Promise<boolean> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({ id: hrExpenseExceptions.id })
      .from(hrExpenseExceptions)
      .where(
        and(
          eq(hrExpenseExceptions.organizationId, input.organizationId),
          eq(hrExpenseExceptions.claimId, input.claimId),
          eq(hrExpenseExceptions.status, "open"),
        ),
      )
      .limit(1);
    return rows.length > 0;
  });
}

export async function getHrExpenseClaimById(input: {
  organizationId: string;
  claimId: string;
}): Promise<(typeof hrExpenseClaims.$inferSelect) | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrExpenseClaims)
      .where(
        and(
          eq(hrExpenseClaims.organizationId, input.organizationId),
          eq(hrExpenseClaims.id, input.claimId),
        ),
      )
      .limit(1);
    return row ?? null;
  });
}
