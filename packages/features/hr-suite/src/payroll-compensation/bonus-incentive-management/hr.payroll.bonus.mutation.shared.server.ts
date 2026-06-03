import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrBonusRoutePaths } from "./hr.payroll.bonus-route.contract";
import type { HrPayrollBonusAuditAction } from "./hr.payroll.bonus.event";
import { toBonusActionFailure } from "./hr.payroll.bonus-action-result.shared";

const BONUS_REVALIDATE_PATH = hrBonusRoutePaths.bonus;

export type BonusMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrPayrollBonusAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeBonusMutation(
  organizationId: string,
  mutate: (db: AfendaTransaction) => Promise<BonusMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_bonus",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toBonusActionFailure(error);
  }

  revalidatePath(BONUS_REVALIDATE_PATH);
  return actionSuccess(undefined);
}

export async function finalizeBonusMutationWithData<T>(
  organizationId: string,
  mutate: (
    db: AfendaTransaction,
  ) => Promise<BonusMutationAudit & { data: T }>,
): Promise<ActionResult<T>> {
  try {
    const data = await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_bonus",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
      return audit.data;
    });

    revalidatePath(BONUS_REVALIDATE_PATH);
    return actionSuccess(data);
  } catch (error) {
    return toBonusActionFailure<T>(error);
  }
}

export { toBonusActionFailure } from "./hr.payroll.bonus-action-result.shared";
