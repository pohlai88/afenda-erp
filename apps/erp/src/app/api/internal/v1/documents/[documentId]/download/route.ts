import { NextResponse } from "next/server";
import { createTenantObjectStorageDownloadDeps } from "@afenda/feature-system-admin/server";
import { handleObjectStorageDocumentDownloadGet } from "@afenda/object-storage/server";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { documentId } = await context.params;
  const result = await handleObjectStorageDocumentDownloadGet(
    { request, documentId },
    createTenantObjectStorageDownloadDeps(),
  );

  if (result.binaryBody) {
    return new NextResponse(result.binaryBody as BodyInit, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }

  return result.redirect
    ? NextResponse.redirect(result.redirect, 302)
    : NextResponse.json(result.body, { status: result.status });
}
