import { runWithOrganizationContext } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrLamRoutePaths } from "../contracts/hr.time.lam-route.contract";
import type { HrTimeLamAuditAction } from "../events/hr.time.lam.event";
import { toHrLamActionFailure } from "../data/hr.time.lam-action-result.shared";

const LAM_REVALIDATE_PATHS = [
  hrLamRoutePaths.leave,
  hrLamRoutePaths.attendance,
] as const;

export type LamMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrTimeLamAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeLamMutation(
  organizationId: string,
  mutate: () => Promise<LamMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate();
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_lam",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toHrLamActionFailure(error);
  }

  for (const path of LAM_REVALIDATE_PATHS) {
    revalidatePath(path);
  }
  return actionSuccess(undefined);
}
