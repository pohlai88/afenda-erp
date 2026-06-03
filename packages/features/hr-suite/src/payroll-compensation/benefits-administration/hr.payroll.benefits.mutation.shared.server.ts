import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrBenefitsRoutePaths } from "./hr.payroll.benefits-route.contract";
import type { HrPayrollBenefitsAuditAction } from "./hr.payroll.benefits.event";
import { toBenefitsActionFailure } from "./hr.payroll.benefits-action-result.shared";

const BENEFITS_REVALIDATE_PATH = hrBenefitsRoutePaths.benefits;

export type BenefitsMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrPayrollBenefitsAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeBenefitsMutation(
  organizationId: string,
  mutate: (db: AfendaTransaction) => Promise<BenefitsMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_benefits",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toBenefitsActionFailure(error);
  }

  revalidatePath(BENEFITS_REVALIDATE_PATH);
  return actionSuccess(undefined);
}

export { toBenefitsActionFailure } from "./hr.payroll.benefits-action-result.shared";
