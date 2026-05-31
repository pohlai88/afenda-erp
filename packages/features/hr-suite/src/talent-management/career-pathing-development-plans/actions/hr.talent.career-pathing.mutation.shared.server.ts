import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrTalentCareerPathRoutePaths } from "../contracts/hr.talent.career-pathing.contract";
import type { HrTalentCareerPathAuditAction } from "../events/hr.talent.career-pathing.event";
import { toHrTalentCareerPathActionFailure } from "../data/hr.talent.career-pathing-action-result.shared";

const REVALIDATE_PATH = hrTalentCareerPathRoutePaths.hub;

export type CareerPathMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrTalentCareerPathAuditAction | string;
  targetId: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};

export async function finalizeHrTalentCareerPathMutation(
  organizationId: string,
  mutate: (db: AfendaTransaction) => Promise<CareerPathMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_career_path",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toHrTalentCareerPathActionFailure(error);
  }

  revalidatePath(REVALIDATE_PATH);
  return actionSuccess(undefined);
}

export { toHrTalentCareerPathActionFailure };
