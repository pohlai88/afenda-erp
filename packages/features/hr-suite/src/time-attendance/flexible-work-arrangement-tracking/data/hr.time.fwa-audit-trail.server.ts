import {
  appendHrFwaAuditEvent,
  listHrFwaAuditEventsWindow,
  type HrFwaAuditTrailWindow,
} from "@afenda/db";

import { hrTimeFwaAuditActions } from "../events/hr.time.fwa.events";

export type { HrFwaAuditTrailWindow };

/** HRM-FWA-032 — paginated FWA audit events from dedicated store. */
export async function listHrFwaAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  arrangementId?: string;
  requestId?: string;
  employeeId?: string;
}): Promise<HrFwaAuditTrailWindow> {
  return listHrFwaAuditEventsWindow(input);
}

export async function emitHrFwaAuditTrailEvent(input: {
  organizationId: string;
  action: Parameters<typeof appendHrFwaAuditEvent>[0]["action"];
  summary: string;
  arrangementId?: string | null;
  requestId?: string | null;
  employeeId?: string | null;
  actorAuthUserId?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<{ auditEventId: string }> {
  return appendHrFwaAuditEvent(input);
}

export { hrTimeFwaAuditActions };
