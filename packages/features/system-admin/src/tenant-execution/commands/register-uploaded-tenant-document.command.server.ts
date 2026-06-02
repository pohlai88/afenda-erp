import { registerTenantDocument } from "@afenda/db";
import {
  type UploadRegistrationInput,
  uploadRetentionClassSchema,
} from "@afenda/object-storage";
import { logServerEvent } from "@afenda/observability";

import { processTenantDocumentScanCommand } from "./process-tenant-document-scan.command.server";

function enqueueTenantDocumentScan(input: {
  organizationId: string;
  documentId: string;
  moduleId: UploadRegistrationInput["moduleId"];
}) {
  void processTenantDocumentScanCommand(input).catch((error) => {
    logServerEvent(
      "error",
      "Document scan enqueue failed — cron sweep will retry.",
      {
        organizationId: input.organizationId,
        module: input.moduleId,
        operation: "document.scan.enqueue",
      },
      {
        documentId: input.documentId,
        error: error instanceof Error ? error.message : String(error),
      },
    );
  });
}

/** ARCH-1005 — ERP document registry write after object-storage upload completes. */
export async function registerUploadedTenantDocumentCommand(
  input: UploadRegistrationInput,
): Promise<string> {
  const retentionClass = uploadRetentionClassSchema.parse(input.retentionClass);

  const documentId = await registerTenantDocument({
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    ownerEntityId: input.ownerEntityId,
    title: input.title,
    blobUrl: input.blobUrl,
    pathname: input.pathname,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    access: input.access,
    blobEtag: input.blobEtag,
    classification: input.classification,
    retentionClass,
    scanStatus: "pending",
    uploadedByAuthUserId: input.uploadedByAuthUserId,
    metadata: {
      ...input.metadata,
      sourceProvider: input.metadata.source ?? "object-storage",
    },
  });

  enqueueTenantDocumentScan({
    organizationId: input.organizationId,
    documentId,
    moduleId: input.moduleId,
  });

  return documentId;
}
