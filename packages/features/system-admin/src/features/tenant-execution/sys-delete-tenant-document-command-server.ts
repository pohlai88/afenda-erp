import {
  deleteTenantDocument,
  getTenantDocumentStorageRef,
  isOrganizationDocumentLegalHoldActive,
  TenantDocumentMutationError,
} from "@afenda/db";
import type { ModuleId } from "@afenda/kernel";

import { recordTenantDocumentEvidenceEvent } from "./sys-object-storage-governance.server";
import { purgeTenantDocumentObjectCommand } from "./sys-purge-tenant-document-object-command-server";

export { TenantDocumentMutationError };

/** Deletes registry row, purges object bytes, and records evidence audit. */
export async function deleteTenantDocumentCommand(input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
  actorAuthUserId: string;
}): Promise<void> {
  const storageRef = await getTenantDocumentStorageRef({
    organizationId: input.organizationId,
    documentId: input.documentId,
  });

  if (!storageRef) {
    throw new TenantDocumentMutationError("not_found");
  }

  if (storageRef.retentionClass === "legal-hold") {
    throw new TenantDocumentMutationError("legal_hold");
  }

  if (await isOrganizationDocumentLegalHoldActive(input.organizationId)) {
    throw new TenantDocumentMutationError("legal_hold");
  }

  await purgeTenantDocumentObjectCommand({
    pathname: storageRef.pathname,
    blobUrl: storageRef.blobUrl,
  });

  const document = await deleteTenantDocument({
    organizationId: input.organizationId,
    documentId: input.documentId,
    actorAuthUserId: input.actorAuthUserId,
  });

  await recordTenantDocumentEvidenceEvent({
    action: "DOCUMENT_DELETED",
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
      scanStatus: document.scanStatus,
    },
  });
}
