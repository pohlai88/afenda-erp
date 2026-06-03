import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrLifecycleRoutePaths } from "./hr.workforce.lifecycle-route.contract";
import type { HrWorkforceLifecycleAuditAction } from "./hr.workforce.lifecycle.event";
import { toLifecycleActionFailure } from "./hr.workforce.lifecycle-action-result.shared";

const LIFECYCLE_REVALIDATE_PATH = hrLifecycleRoutePaths.lifecycle;

export type LifecycleMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrWorkforceLifecycleAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeLifecycleMutation(
  organizationId: string,
  mutate: (db: AfendaTransaction) => Promise<LifecycleMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_lifecycle",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toLifecycleActionFailure(error);
  }

  revalidatePath(LIFECYCLE_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
