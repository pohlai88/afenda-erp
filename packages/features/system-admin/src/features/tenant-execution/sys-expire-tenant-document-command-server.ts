import type { ModuleId } from "@afenda/kernel";

import { recordTenantDocumentEvidenceEvent } from "./sys-object-storage-governance.server";
import { deleteTenantDocumentCommand } from "./sys-delete-tenant-document-command-server";

/** Records retention expiry evidence, then purges bytes and deletes the registry row. */
export async function expireTenantDocumentCommand(input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
  actorAuthUserId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await recordTenantDocumentEvidenceEvent({
    action: "DOCUMENT_RETENTION_EXPIRED",
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    userId: input.actorAuthUserId,
    timestamp: new Date().toISOString(),
    documentId: input.documentId,
    metadata: input.metadata,
  });

  await deleteTenantDocumentCommand({
    organizationId: input.organizationId,
    documentId: input.documentId,
    moduleId: input.moduleId,
    actorAuthUserId: input.actorAuthUserId,
  });
}
