import {
  appendHrShiftAuditEvent,
  listHrShiftAuditEventsWindow,
  type HrShiftAuditTrailWindow,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import { HR_TIME_SFT_AUDIT_MODULE_KEY } from "../contracts/hr.time.sft.contract";
import {
  hrTimeSftAuditActions,
  resolveHrTimeSftAuditStoreAction,
  type HrTimeSftAuditAction,
  type HrTimeSftAuditStoreAction,
} from "../events/hr.time.sft.event";

export { HR_TIME_SFT_AUDIT_MODULE_KEY };

export type HrSftAuditTrailRow = {
  id: string;
  occurredAt: Date;
  action: string;
  summary: string;
  actorAuthUserId: string | null;
  employeeId: string | null;
};

/** HRM-SFT-030 — list SFT audit trail from dedicated store. */
export async function listHrSftAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrShiftAuditTrailWindow> {
  return listHrShiftAuditEventsWindow(input);
}

/** HRM-SFT-030 — persist audit event to durable store and tenant audit log. */
export async function emitHrSftAuditEvent(input: {
  organizationId: string;
  actorAuthUserId: string;
  action: HrTimeSftAuditAction;
  storeAction?: HrTimeSftAuditStoreAction;
  targetType?: string;
  targetId?: string;
  summary?: string;
  templateId?: string | null;
  assignmentId?: string | null;
  publicationId?: string | null;
  employeeId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ auditEventId: string }> {
  const summary = input.summary ?? input.action;
  const storeAction =
    input.storeAction ?? resolveHrTimeSftAuditStoreAction(input.action);
  const result = await appendHrShiftAuditEvent({
    organizationId: input.organizationId,
    action: storeAction,
    summary,
    templateId: input.templateId,
    assignmentId: input.assignmentId,
    publicationId: input.publicationId,
    employeeId: input.employeeId,
    actorAuthUserId: input.actorAuthUserId,
    metadata: input.metadata,
  });

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorAuthUserId,
    actorType: "user",
    action: input.action,
    targetType: input.targetType ?? HR_TIME_SFT_AUDIT_MODULE_KEY,
    targetId: input.targetId ?? result.auditEventId,
    summary,
    metadata: input.metadata,
  });

  return result;
}

export { hrTimeSftAuditActions };
