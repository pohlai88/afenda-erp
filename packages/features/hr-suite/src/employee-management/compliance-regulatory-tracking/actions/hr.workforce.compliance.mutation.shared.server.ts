import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import type { HrWorkforceComplianceAuditAction } from "../events/hr.workforce.compliance.event";
import { hrComplianceRoutePaths } from "../contracts/hr.workforce.compliance-route.contract";
import { toComplianceActionFailure } from "../data/hr.workforce.compliance-action-result.shared";

const COMPLIANCE_REVALIDATE_PATH = hrComplianceRoutePaths.compliance;

export { toComplianceActionFailure } from "../data/hr.workforce.compliance-action-result.shared";
export {
  buildRequirementStatusAuditMetadata,
  resolveCertificationExpiresAtMutationInput,
  resolveFilingDeadlineMutationInput,
} from "../data/hr.workforce.compliance-mutation.shared";

export type ComplianceMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrWorkforceComplianceAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
};

export async function finalizeComplianceMutation(
  organizationId: string,
  mutate: (db: AfendaTransaction) => Promise<ComplianceMutationAudit>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate(db);
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: audit.organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_compliance",
        targetId: audit.targetId,
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toComplianceActionFailure(error);
  }

  revalidatePath(COMPLIANCE_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
