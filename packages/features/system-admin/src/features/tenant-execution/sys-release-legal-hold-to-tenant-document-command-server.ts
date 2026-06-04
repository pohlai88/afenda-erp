import {
  releaseTenantDocumentLegalHold,
  TenantDocumentMutationError,
} from "@afenda/db";
import type { ModuleId } from "@afenda/kernel";

import { recordTenantDocumentEvidenceEvent } from "./sys-object-storage-governance.server";

export { TenantDocumentMutationError };

/** Restores prior retention class after document-level legal hold. */
export async function releaseLegalHoldToTenantDocumentCommand(input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
  actorAuthUserId: string;
}): Promise<void> {
  const document = await releaseTenantDocumentLegalHold({
    organizationId: input.organizationId,
    documentId: input.documentId,
    actorAuthUserId: input.actorAuthUserId,
  });

  await recordTenantDocumentEvidenceEvent({
    action: "DOCUMENT_LEGAL_HOLD_RELEASED",
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    userId: input.actorAuthUserId,
    timestamp: new Date().toISOString(),
    documentId: document.id,
    retentionClass: document.retentionClass as "standard",
    metadata: {
      title: document.title,
      previousRetentionClass: "legal-hold",
    },
  });
}
