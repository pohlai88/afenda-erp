import { OBJECT_STORAGE_HTTP_ROUTES } from "@afenda/object-storage/metadata";
import { NextResponse } from "next/server";

const INTERNAL_DOCUMENT_DOWNLOAD_ROUTE_PREFIX = "/api/internal/v1/documents/";

export async function GET(
  request: Request,
  context: { params: Promise<{ documentId: string }> },
): Promise<Response> {
  const { documentId } = await context.params;
  const url = new URL(request.url);
  const internalPath = OBJECT_STORAGE_HTTP_ROUTES.documentDownload.replace(
    "[documentId]",
    encodeURIComponent(documentId),
  );
  if (!internalPath.startsWith(INTERNAL_DOCUMENT_DOWNLOAD_ROUTE_PREFIX)) {
    throw new Error("Invalid internal document download route.");
  }

  url.pathname = internalPath;

  return NextResponse.redirect(url, 308);
}
