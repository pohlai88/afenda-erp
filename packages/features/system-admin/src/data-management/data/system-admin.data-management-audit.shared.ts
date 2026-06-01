import {
  writeExecutionAuditEvent,
  type ExecutionActorType,
} from "@afenda/kernel/execution";
import { SYSTEM_ADMIN_DATA_MANAGEMENT_AUDIT_TARGET_TYPE } from "../contracts/system-admin.data-management.limits.shared";
import type { SystemAdminDataManagementAuditAction } from "../events/system-admin.data-management.event";

export async function writeSystemAdminDataManagementAudit(input: {
  organizationId: string;
  actorId: string;
  actorType: ExecutionActorType;
  action: SystemAdminDataManagementAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: input.action,
    targetType: SYSTEM_ADMIN_DATA_MANAGEMENT_AUDIT_TARGET_TYPE,
    targetId: input.targetId,
    metadata: input.metadata,
  });
}
