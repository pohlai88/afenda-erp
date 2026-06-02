import { NextResponse } from "next/server";
import { registerUploadedTenantDocumentCommand } from "@afenda/feature-system-admin/server";
import { handleObjectStorageUploadPost } from "@afenda/object-storage/server";

export async function POST(request: Request): Promise<NextResponse> {
  const result = await handleObjectStorageUploadPost(request, {
    registerUploadedDocument: registerUploadedTenantDocumentCommand,
  });
  return NextResponse.json(result.body, { status: result.status });
}
