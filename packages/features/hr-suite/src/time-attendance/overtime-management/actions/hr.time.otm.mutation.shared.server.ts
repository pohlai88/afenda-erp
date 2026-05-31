import { runWithOrganizationContext } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrTimeOtmRoutePaths } from "../contracts/hr.time.otm-route.contract";
import { toHrTimeOtmActionFailure } from "../data/hr.time.otm-action-result.shared";

const OTM_REVALIDATE_PATH = hrTimeOtmRoutePaths.hub;

export type HrTimeOtmMutationAudit = {
  organizationId: string;
  actorId: string;
  action: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeHrTimeOtmMutation(
  organizationId: string,
  mutate: () => Promise<HrTimeOtmMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate();
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_overtime_request",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toHrTimeOtmActionFailure(error);
  }

  revalidatePath(OTM_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
