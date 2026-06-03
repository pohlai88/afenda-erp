import { searchTenantAuditLogs } from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import { HR_TIME_AAT_AUDIT_MODULE_KEY } from "./hr.time.aat.contract";
import {
  hrTimeAatAuditActions,
  type HrTimeAatAuditAction,
} from "./hr.time.aat.event";

export { HR_TIME_AAT_AUDIT_MODULE_KEY };

export type HrAatAuditTrailRow = {
  id: string;
  occurredAt: Date;
  action: string;
  actorAuthUserId: string;
  targetId: string;
  summary: string | null;
};

export type HrAatAuditTrailWindow = {
  rows: readonly HrAatAuditTrailRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

/** HRM-AAT-029 — list AAT audit trail via tenant audit log search. */
export async function listHrAatAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrAatAuditTrailWindow> {
  const limit = input.limit ?? 25;
  const offset = input.offset ?? 0;

  const result = await searchTenantAuditLogs({
    organizationId: input.organizationId,
    limit,
    offset,
    filters: {
      moduleKey: HR_TIME_AAT_AUDIT_MODULE_KEY,
      ...(input.search ? { query: input.search } : {}),
      sortDirection: "desc",
    },
  });

  return {
    rows: result.rows.map((row) => ({
      id: row.id,
      occurredAt: row.createdAt,
      action: row.action,
      actorAuthUserId: row.actorAuthUserId,
      targetId: row.entityId,
      summary: row.summary,
    })),
    pageSize: limit,
    totalCount: result.totalCount,
    hasNextPage: offset + result.rows.length < result.totalCount,
  };
}

/** HRM-AAT-029 — persist audit event with hr.aat.* action prefix. */
export async function emitHrAatAuditEvent(input: {
  organizationId: string;
  actorAuthUserId: string;
  action: HrTimeAatAuditAction;
  targetType?: string;
  targetId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorAuthUserId,
    actorType: "user",
    action: input.action,
    targetType: input.targetType ?? "hr_aat",
    targetId: input.targetId ?? input.organizationId,
    summary: input.summary,
    metadata: input.metadata,
  });
}

export { hrTimeAatAuditActions };
