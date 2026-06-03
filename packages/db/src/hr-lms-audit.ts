import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { hrLmsAuditEvents } from "./hr-lms";

export type AppendHrLmsAuditEventInput = {
  organizationId: string;
  actorUserId: string;
  action: (typeof hrLmsAuditEvents.$inferInsert)["action"];
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function appendHrLmsAuditEventInTx(
  db: AfendaTransaction,
  input: AppendHrLmsAuditEventInput,
): Promise<void> {
  await db.insert(hrLmsAuditEvents).values({
    id: createEntityId("hr_lms_audit"),
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    metadata: input.metadata ?? {},
    occurredAt: new Date(),
  });
}

export const HR_LMS_AUDIT_ACTIONS = [
  "course_setup",
  "learning_path_setup",
  "assignment",
  "enrollment",
  "progress_update",
  "assessment",
  "completion",
  "failure",
  "certification",
  "renewal",
  "reminder",
  "report_export",
] as const satisfies readonly AppendHrLmsAuditEventInput["action"][];
