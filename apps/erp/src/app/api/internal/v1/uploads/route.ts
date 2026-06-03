import {
  createTenantObjectStorageUploadDeps,
  registerUploadedTenantDocumentCommand,
} from "@afenda/feature-system-admin/server";
import { handleObjectStorageUploadPost, toObjectStorageResponse } from "@afenda/object-storage/server";

export async function POST(request: Request): Promise<Response> {
  const result = await handleObjectStorageUploadPost(
    request,
    createTenantObjectStorageUploadDeps({
      registerUploadedDocument: registerUploadedTenantDocumentCommand,
    }),
  );
  return toObjectStorageResponse(result);
}
