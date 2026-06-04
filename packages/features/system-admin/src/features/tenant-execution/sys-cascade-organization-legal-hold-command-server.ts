import { cascadeOrganizationLegalHoldToDocuments } from "@afenda/db";
import type { ModuleId } from "@afenda/kernel";

import { recordTenantDocumentEvidenceEvent } from "./sys-object-storage-governance.server";

/** Propagates org policy legal hold to ERP and HR registry rows. */
export async function cascadeOrganizationLegalHoldCommand(input: {
  organizationId: string;
  actorAuthUserId: string;
}): Promise<{ erpUpdatedCount: number; hrUpdatedCount: number }> {
  const result = await cascadeOrganizationLegalHoldToDocuments({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
  });

  if (result.erpUpdatedCount === 0 && result.hrUpdatedCount === 0) {
    return result;
  }

  await recordTenantDocumentEvidenceEvent({
    action: "DOCUMENT_ORG_LEGAL_HOLD_CASCADED",
    organizationId: input.organizationId,
    moduleId: "system-admin" as ModuleId,
    userId: input.actorAuthUserId,
    timestamp: new Date().toISOString(),
    metadata: {
      erpUpdatedCount: result.erpUpdatedCount,
      hrUpdatedCount: result.hrUpdatedCount,
    },
  });

  return result;
}
