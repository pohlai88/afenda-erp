import { runWithOrganizationContext } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrFwaRoutePaths } from "./hr.time.fwa-route.contract";
import { toHrTimeFwaActionFailure } from "./hr.time.fwa-action-result.shared";
import type { HrTimeFwaAuditAction } from "../events/hr.time.fwa-workflow.events";

const FWA_REVALIDATE_PATH = hrFwaRoutePaths.hub;

export type HrTimeFwaMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrTimeFwaAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeHrTimeFwaMutation(
  organizationId: string,
  mutate: () => Promise<HrTimeFwaMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate();
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_fwa_request",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toHrTimeFwaActionFailure(error);
  }

  revalidatePath(FWA_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
