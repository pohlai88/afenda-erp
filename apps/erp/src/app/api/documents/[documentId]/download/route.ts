import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

/** Permanent redirect from legacy download path to ARCH-1004 internal route. */
export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { documentId } = await context.params;
  const url = new URL(request.url);
  const target = new URL(
    `/api/internal/v1/documents/${documentId}/download`,
    url.origin,
  );
  target.search = url.search;

  return NextResponse.redirect(target, 308);
}
