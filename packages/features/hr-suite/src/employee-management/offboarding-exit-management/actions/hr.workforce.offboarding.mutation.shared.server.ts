import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrOffboardingRoutePaths } from "../contracts/hr.workforce.offboarding-route.contract";
import type { HrWorkforceOffboardingAuditAction } from "../events/hr.workforce.offboarding.event";
import { toOffboardingActionFailure } from "../data/hr.workforce.offboarding-action-result.shared";

const OFFBOARDING_REVALIDATE_PATH = hrOffboardingRoutePaths.offboarding;

export type OffboardingMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrWorkforceOffboardingAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeOffboardingMutation(
  organizationId: string,
  mutate: (db: AfendaTransaction) => Promise<OffboardingMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_offboarding",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toOffboardingActionFailure(error);
  }

  revalidatePath(OFFBOARDING_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
