import {
  deleteHrEmployeeDocument,
  getHrEmployeeDocumentStorageRef,
  HrDocumentCommandError,
  isHrEmployeeDocumentOnLegalHold,
  isOrganizationDocumentLegalHoldActive,
} from "@afenda/db";

import { recordTenantDocumentEvidenceEvent } from "./sys-object-storage-governance.server";
import { purgeTenantDocumentObjectCommand } from "./sys-purge-tenant-document-object-command-server";

export { HrDocumentCommandError };

/** Purges archived HR document bytes and removes the registry row. */
export async function destroyHrEmployeeDocumentCommand(input: {
  organizationId: string;
  documentId: string;
  actorAuthUserId: string;
}): Promise<void> {
  const storageRef = await getHrEmployeeDocumentStorageRef({
    organizationId: input.organizationId,
    documentId: input.documentId,
  });

  if (!storageRef) {
    throw new HrDocumentCommandError("document_not_found");
  }

  if (storageRef.lifecycleStatus !== "archived") {
    throw new HrDocumentCommandError("document_not_archived");
  }

  if (
    isHrEmployeeDocumentOnLegalHold(storageRef.legalHold) ||
    (await isOrganizationDocumentLegalHoldActive(input.organizationId))
  ) {
    throw new HrDocumentCommandError("document_legal_hold");
  }

  await purgeTenantDocumentObjectCommand({
    pathname: storageRef.pathname,
    blobUrl: storageRef.blobUrl,
  });

  const document = await deleteHrEmployeeDocument({
    organizationId: input.organizationId,
    documentId: input.documentId,
    actorAuthUserId: input.actorAuthUserId,
  });

  await recordTenantDocumentEvidenceEvent({
    action: "DOCUMENT_DELETED",
    organizationId: input.organizationId,
    moduleId: "hr",
    userId: input.actorAuthUserId,
    timestamp: new Date().toISOString(),
    documentId: document.id,
    pathname: document.pathname,
    classification: document.classification,
    retentionClass: "standard",
    metadata: {
      title: document.title,
      source: "hr-archived-destruction",
    },
  });
}
