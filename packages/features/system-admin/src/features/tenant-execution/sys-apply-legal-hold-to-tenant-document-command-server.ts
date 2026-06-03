import {
  applyTenantDocumentLegalHold,
  TenantDocumentMutationError,
} from "@afenda/db";
import type { ModuleId } from "@afenda/kernel";

import { recordTenantDocumentEvidenceEvent } from "../api/system-admin.object-storage-governance.server";

export { TenantDocumentMutationError };

/** Applies legal hold to an ERP registry document and records evidence audit. */
export async function applyLegalHoldToTenantDocumentCommand(input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
  actorAuthUserId: string;
}): Promise<void> {
  const document = await applyTenantDocumentLegalHold({
    organizationId: input.organizationId,
    documentId: input.documentId,
    actorAuthUserId: input.actorAuthUserId,
  });

  await recordTenantDocumentEvidenceEvent({
    action: "DOCUMENT_LEGAL_HOLD_APPLIED",
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    userId: input.actorAuthUserId,
    timestamp: new Date().toISOString(),
    documentId: document.id,
    retentionClass: "legal-hold",
    metadata: {
      title: document.title,
      previousRetentionClass: document.retentionClass,
    },
  });
}
