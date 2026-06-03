import { type AfendaTransaction } from "@afenda/db";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";

import type { HrTimeAttendanceLamAuditAction } from "./hr.time.attendance.lam.event";

export async function writeHrLamAuditInTransaction(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorId: string;
    action: HrTimeAttendanceLamAuditAction;
    targetType: string;
    targetId: string;
    summary?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await writeExecutionAuditEventInTransaction(db, {
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: "user",
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    summary: input.summary,
    metadata: input.metadata,
  });
}
