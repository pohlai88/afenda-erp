import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrTimeLeaveRoutePaths } from "../contracts/hr.time.leave.contract";
import type { HrTimeLeaveAuditAction } from "../events/hr.time.leave.event";
import { toHrTimeLeaveActionFailure } from "../data/hr.time.leave-action-result.shared";

const LEAVE_REVALIDATE_PATH = hrTimeLeaveRoutePaths.leave;

export type LeaveMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrTimeLeaveAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeHrTimeLeaveMutation(
  organizationId: string,
  mutate: (db: AfendaTransaction) => Promise<LeaveMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_leave",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toHrTimeLeaveActionFailure(error);
  }

  revalidatePath(LEAVE_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
