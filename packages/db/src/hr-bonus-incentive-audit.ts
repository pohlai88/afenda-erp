import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { hrBonusAuditEvents } from "./dbx-hr-bonus-incentive";

export async function appendHrBonusIncentiveAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    action: string;
    summary?: string;
    metadata?: Record<string, unknown>;
    planId?: string | null;
    targetId?: string | null;
    achievementId?: string | null;
    employeeId?: string | null;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_bon_audit");

  await db.insert(hrBonusAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    planId: input.planId ?? null,
    targetId: input.targetId ?? null,
    achievementId: input.achievementId ?? null,
    employeeId: input.employeeId ?? null,
    actorUserId: input.actorUserId,
    action: input.action,
    summary: input.summary ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    occurredAt: input.occurredAt ?? new Date(),
  });

  return { auditEventId };
}

