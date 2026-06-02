import { registerTenantDocument } from "@afenda/db";
import type { UploadRegistrationInput } from "@afenda/object-storage";

/** ARCH-1005 — ERP document registry write after object-storage upload completes. */
export async function registerUploadedTenantDocumentCommand(
  input: UploadRegistrationInput,
): Promise<void> {
  await registerTenantDocument({
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
    retentionClass: "standard",
    uploadedByAuthUserId: input.uploadedByAuthUserId,
    metadata: input.metadata,
  });
}
