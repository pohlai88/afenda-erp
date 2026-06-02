import { NextResponse } from "next/server";
import { handleObjectStorageUploadConfigGet } from "@afenda/object-storage/server";
import { createTenantObjectStorageUploadConfigDeps } from "@afenda/feature-system-admin/server";

export async function GET(request: Request): Promise<NextResponse> {
  const result = await handleObjectStorageUploadConfigGet(
    request,
    createTenantObjectStorageUploadConfigDeps(),
  );
  return NextResponse.json(result.body, { status: result.status });
}
