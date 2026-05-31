import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import { HR_TALENT_CAREER_PATHING_MODULE_KEY } from "../contracts/hr.talent.career-pathing.contract";
import type { HrTalentCareerPathingAuditAction } from "../events/hr.talent.career-pathing.event";
import {
  appendHrCareerPathingAuditEventToStore,
  listHrCareerPathingAuditEventsFromStore,
} from "./hr.talent.career-pathing-audit-store.shared";
import type { HrCareerPathingAuditTrailWindow } from "./hr.talent.career-pathing-audit.shared";

export {
  formatCareerPathingAuditActionLabel,
  type HrCareerPathingAuditTrailWindow,
} from "./hr.talent.career-pathing-audit.shared";

/** HRM-CAR-031 — paginated career pathing audit trail. */
export async function listHrCareerPathingAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  search?: string;
}): Promise<HrCareerPathingAuditTrailWindow> {
  return listHrCareerPathingAuditEventsFromStore(input);
}

/** HRM-CAR-031 — persist audit event to slice store and tenant audit log. */
export async function emitHrCareerPathingAuditEvent(input: {
  organizationId: string;
  action: HrTalentCareerPathingAuditAction | string;
  summary: string;
  actorAuthUserId?: string | null;
  employeeId?: string | null;
  planId?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<{ auditEventId: string }> {
  const event = appendHrCareerPathingAuditEventToStore(input);

  if (input.actorAuthUserId) {
    await writeExecutionAuditEvent({
      organizationId: input.organizationId,
      actorId: input.actorAuthUserId,
      actorType: "user",
      action: input.action,
      targetType: HR_TALENT_CAREER_PATHING_MODULE_KEY,
      targetId: event.id,
      summary: input.summary,
      metadata: input.metadata ?? undefined,
    });
  }

  return { auditEventId: event.id };
}

export { HR_TALENT_CAREER_PATHING_MODULE_KEY };
