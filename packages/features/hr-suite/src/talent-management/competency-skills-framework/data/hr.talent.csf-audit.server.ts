import { hrTalentCsfAuditActions } from "../events/hr.talent.csf-audit.event";
import {
  appendHrCsfAuditEventToStore,
  listHrCsfAuditEventsFromStore,
  type HrCsfAuditEventRecord,
} from "./hr.talent.csf-store.shared";

export type HrCsfAuditTrailWindow = {
  rows: HrCsfAuditEventRecord[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

/** HRM-CSF-031 — paginated CSF audit events. */
export async function listHrCsfAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  search?: string;
}): Promise<HrCsfAuditTrailWindow> {
  return listHrCsfAuditEventsFromStore(input);
}

export async function emitHrCsfAuditTrailEvent(input: {
  organizationId: string;
  action: string;
  summary: string;
  actorAuthUserId?: string | null;
  employeeId?: string | null;
  itemCode?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<{ auditEventId: string }> {
  const event = appendHrCsfAuditEventToStore(input);
  return { auditEventId: event.id };
}

export { hrTalentCsfAuditActions };
