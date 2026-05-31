import { hrTalentLmsAuditActions } from "../events/hr.talent.lms.event";
import {
  appendHrLmsAuditToStore,
  listHrLmsAuditFromStore,
} from "./hr.talent.lms-store.shared";

export async function listHrLmsAuditTrail(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const { listHrLmsAuditTrailWindow } = await import("@afenda/db");
    return await listHrLmsAuditTrailWindow(input);
  } catch {
    const rows = listHrLmsAuditFromStore(input.organizationId);
    const limit = input.limit ?? 25;
    const offset = input.offset ?? 0;
    const slice = rows.slice(offset, offset + limit);
    return {
      rows: slice,
      totalCount: rows.length,
      pageSize: limit,
      hasNextPage: offset + limit < rows.length,
    };
  }
}

export async function emitHrLmsAuditTrailEvent(input: {
  organizationId: string;
  actorUserId: string;
  action: keyof typeof hrTalentLmsAuditActions;
  entityType: string;
  entityId: string;
  summary: string;
}) {
  return appendHrLmsAuditToStore({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: hrTalentLmsAuditActions[input.action],
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
  });
}

export { hrTalentLmsAuditActions };
