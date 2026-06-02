import { OBJECT_STORAGE_HTTP_ROUTES } from "@afenda/object-storage/client";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

/** Legacy download path — permanent redirect to ARCH-1004 internal route. */
export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { documentId } = await context.params;
  const source = new URL(request.url);
  const targetPath = OBJECT_STORAGE_HTTP_ROUTES.documentDownload.replace(
    "[documentId]",
    documentId,
  );

  return NextResponse.redirect(
    `${source.origin}${targetPath}${source.search}`,
    308,
  );
}
