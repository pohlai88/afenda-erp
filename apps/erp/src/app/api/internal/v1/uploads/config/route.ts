import { handleObjectStorageUploadConfigGet, toObjectStorageResponse } from "@afenda/object-storage/server";
import { createTenantObjectStorageUploadConfigDeps } from "@afenda/feature-system-admin/server";

export async function GET(request: Request): Promise<Response> {
  const result = await handleObjectStorageUploadConfigGet(
    request,
    createTenantObjectStorageUploadConfigDeps(),
  );
  return toObjectStorageResponse(result);
}
