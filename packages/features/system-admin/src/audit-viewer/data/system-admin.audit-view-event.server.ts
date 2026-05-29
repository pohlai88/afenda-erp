import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { systemAdminAuditActions } from "../contracts/system-admin.audit-actions.contract";
import type { SystemAdminAuditEventDetail } from "../contracts/system-admin.audit-event.contract";
import type { SystemAdminAuditSearchParams } from "../schemas/system-admin.audit-filter.schema";

export function shouldRecordSystemAdminAuditListView(
  params: SystemAdminAuditSearchParams,
) {
  return (params.auditPage ?? 1) === 1;
}

export async function recordSystemAdminAuditViewerViewEvent(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  params: SystemAdminAuditSearchParams;
  selected: SystemAdminAuditEventDetail | null;
  resultCount: number;
}) {
  if (input.selected) {
    await writeExecutionAuditEvent({
      organizationId: input.organizationId,
      actorId: input.actorId,
      actorType: input.actorType,
      action: systemAdminAuditActions.view,
      targetType: input.selected.entityType,
      targetId: input.selected.entityId,
      metadata: {
        auditLogId: input.selected.id,
        action: input.selected.action,
        moduleKey: input.selected.moduleKey,
        timelineCount: input.selected.timeline.length,
      },
    });
    return;
  }

  if (!shouldRecordSystemAdminAuditListView(input.params)) {
    return;
  }

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: systemAdminAuditActions.view,
    targetType: "organization",
    targetId: input.organizationId,
    metadata: {
      filters: {
        auditQ: input.params.auditQ ?? null,
        auditActor: input.params.auditActor ?? null,
        auditAction: input.params.auditAction ?? null,
        auditTargetType: input.params.auditTargetType ?? null,
        auditTargetId: input.params.auditTargetId ?? null,
        auditModule: input.params.auditModule ?? null,
      },
      resultCount: input.resultCount,
    },
  });
}
