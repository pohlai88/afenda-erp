import { runWithOrganizationContext, type AfendaTransaction } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import type { HrWorkforceComplianceAuditAction } from "./hr.workforce.compliance.event";
import { hrComplianceRoutePaths } from "./hr.workforce.compliance-route.contract";
import { toComplianceActionFailure } from "./hr.workforce.compliance-action-result.shared";

const COMPLIANCE_REVALIDATE_PATH = hrComplianceRoutePaths.compliance;

export { toComplianceActionFailure } from "./hr.workforce.compliance-action-result.shared";
export {
  buildRequirementStatusAuditMetadata,
  buildComplianceStatusUpdateAuditMetadata,
  resolveCertificationExpiresAtMutationInput,
  resolveFilingDeadlineMutationInput,
} from "./hr.workforce.compliance-mutation.shared";

export type ComplianceMutationAudit = {
  organizationId: string;
  actorId: string;
  action: HrWorkforceComplianceAuditAction;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
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
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toComplianceActionFailure(error);
  }

  revalidatePath(COMPLIANCE_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
