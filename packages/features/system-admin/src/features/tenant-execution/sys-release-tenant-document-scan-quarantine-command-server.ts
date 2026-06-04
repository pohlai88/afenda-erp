import {
  releaseTenantDocumentFromScanQuarantine,
  TenantDocumentMutationError,
} from "@afenda/db";
import type { ModuleId } from "@afenda/kernel";

import { recordTenantDocumentEvidenceEvent } from "./sys-object-storage-governance.server";

export { TenantDocumentMutationError };

/** Operator approval after AV quarantine — enables download when hold permits. */
export async function releaseTenantDocumentScanQuarantineCommand(input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
  actorAuthUserId: string;
}): Promise<void> {
  const document = await releaseTenantDocumentFromScanQuarantine({
    organizationId: input.organizationId,
    documentId: input.documentId,
    actorAuthUserId: input.actorAuthUserId,
  });

  await recordTenantDocumentEvidenceEvent({
    action: "DOCUMENT_SCAN_QUARANTINE_RELEASED",
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    userId: input.actorAuthUserId,
    timestamp: new Date().toISOString(),
    documentId: document.id,
    pathname: document.pathname,
    classification: document.classification,
    retentionClass: document.retentionClass,
    metadata: {
      title: document.title,
      previousScanStatus: document.previousScanStatus,
      scanStatus: "passed",
      source: "operator-scan-review",
    },
  });
}
