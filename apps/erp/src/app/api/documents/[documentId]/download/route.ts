import { moduleIds } from "@afenda/config/module-ids";
import { getTenantDocument } from "@afenda/db";
import { uploadRouteCopy } from "@afenda/domain";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assertBlobConfigured,
  assertUploadPathnameMatchesTenant,
  formatDownloadContentDisposition,
} from "@/lib/api/blob-upload";
import { requireBlobModuleAccess } from "@/lib/api/blob-route-auth";
import {
  getBlobRouteErrorResponse,
  UploadRouteError,
} from "@/lib/api/upload-route";

const moduleIdSchema = z.enum(moduleIds);

/** Signed URL TTL: 5 minutes. Short-lived so the CDN enforces re-auth. */
const SIGNED_URL_TTL_MS = 5 * 60 * 1000;

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const route = "/api/documents/[documentId]/download";

  try {
    assertBlobConfigured();
    const { documentId } = await context.params;
    const moduleId = moduleIdSchema.parse(
      new URL(request.url).searchParams.get("moduleId"),
    );
    const { organization } = await requireBlobModuleAccess(moduleId, "download");
    const document = await getTenantDocument({
      organizationId: organization.id,
      documentId,
      moduleId,
    });

    if (!document) {
      return NextResponse.json(
        { error: uploadRouteCopy.documentNotFound },
        { status: 404 },
      );
    }

    assertUploadPathnameMatchesTenant({
      pathname: document.pathname,
      organizationId: organization.id,
      moduleId: document.moduleId,
    });

    // Issue a short-lived signed token scoped to this exact pathname, then
    // redirect the client. The CDN validates the signature — no bytes proxy
    // through this function. The audit log is written before the redirect so
    // every authorised download is recorded even if the client never fetches
    // the signed URL.
    const validUntil = Date.now() + SIGNED_URL_TTL_MS;

    const signedToken = await issueSignedToken({
      pathname: document.pathname,
      operations: ["get"],
      validUntil,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      operation: "get",
      pathname: document.pathname,
      access: document.access as "public" | "private",
      validUntil,
    });

    // Append Content-Disposition as a query param via a wrapper for browsers
    // that honour it. The CDN passes it through when present in the signed URL.
    const redirectUrl = new URL(presignedUrl);
    redirectUrl.searchParams.set(
      "response-content-disposition",
      formatDownloadContentDisposition(document.title),
    );

    logServerEvent(
      "info",
      "Document download signed URL issued.",
      {
        requestId,
        organizationId: organization.id,
        module: moduleId,
        operation: "blob.download_signed_redirect",
      },
      {
        route,
        durationMs: Date.now() - startedAt,
        documentId: document.id,
        pathname: document.pathname,
        validUntilMs: validUntil,
      },
    );

    return NextResponse.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    if (error instanceof UploadRouteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const response = getBlobRouteErrorResponse(error);

    logServerEvent(
      "error",
      "Document download failed.",
      {
        requestId,
        module: "documents",
        operation: "blob.download_signed_redirect",
      },
      {
        route,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
    );

    return NextResponse.json(
      { error: response.message },
      { status: response.status },
    );
  }
}
