import { createTenantObjectStorageDownloadDeps } from "@afenda/feature-system-admin/server";
import { handleObjectStorageDocumentDownloadGet, toObjectStorageResponse } from "@afenda/object-storage/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ documentId: string }> },
): Promise<Response> {
  const { documentId } = await context.params;
  const result = await handleObjectStorageDocumentDownloadGet(
    { request, documentId },
    createTenantObjectStorageDownloadDeps(),
  );
  // binaryBody is serialized by the package helper, keeping this route thin.
  return toObjectStorageResponse(result);
}
