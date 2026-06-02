import { NextResponse } from "next/server";
import { handleObjectStorageDocumentDownloadGet } from "@afenda/object-storage/server";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { documentId } = await context.params;
  const result = await handleObjectStorageDocumentDownloadGet({ request, documentId });
  return result.redirect
    ? NextResponse.redirect(result.redirect, 302)
    : NextResponse.json(result.body, { status: result.status });
}
