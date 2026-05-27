import { registerTenantDocument } from "@afenda/db";
import { uploadRouteCopy } from "@afenda/domain";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assertBlobConfigured,
  assertUploadPathnameMatchesTenant,
  resolveBlobCallbackUrl,
  resolveUploadedDocumentSize,
} from "@/lib/api/blob-upload";
import { requireBlobModuleAccess } from "@/lib/api/blob-route-auth";
import {
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "@/lib/document-upload-policy";
import {
  assertUploadTokenMatchesSession,
  getBlobRouteErrorResponse,
  UploadRouteError,
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "@/lib/api/upload-route";

function parseUploadTokenPayload(tokenPayload: string | null | undefined) {
  if (!tokenPayload) {
    throw new UploadRouteError(400, uploadRouteCopy.missingTokenPayload);
  }

  return uploadPayloadSchema
    .extend({
      organizationId: z.string().min(1),
      uploadedByAuthUserId: z.string().min(1),
    })
    .parse(JSON.parse(tokenPayload)) satisfies UploadTokenPayload;
}

export async function POST(request: Request): Promise<NextResponse> {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const route = "/api/uploads";
  const context = {
    requestId,
    module: "documents",
    operation: "blob.client_upload",
  };
  const accessByModule = new Map<
    UploadTokenPayload["moduleId"],
    Awaited<ReturnType<typeof requireBlobModuleAccess>>
  >();

  async function getUploadAccess(moduleId: UploadTokenPayload["moduleId"]) {
    const cached = accessByModule.get(moduleId);
    if (cached) {
      return cached;
    }

    const access = await requireBlobModuleAccess(moduleId, "upload");
    accessByModule.set(moduleId, access);
    return access;
  }

  try {
    const blobEnv = assertBlobConfigured();

    logServerEvent("info", "Upload route started.", context, { route });

    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      token: blobEnv.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const parsedPayload = uploadPayloadSchema.parse(
          JSON.parse(clientPayload ?? "{}"),
        );
        const { session, organization } = await getUploadAccess(
          parsedPayload.moduleId,
        );

        assertUploadPathnameMatchesTenant({
          pathname,
          organizationId: organization.id,
          moduleId: parsedPayload.moduleId,
        });

        logServerEvent(
          "info",
          "Upload token issued.",
          {
            requestId,
            organizationId: organization.id,
            userId: session.id,
            module: parsedPayload.moduleId,
            operation: "blob.issue_upload_token",
          },
          {
            route,
            contentType: parsedPayload.contentType,
            sizeBytes: parsedPayload.sizeBytes,
            pathname,
          },
        );

        return {
          addRandomSuffix: true,
          allowedContentTypes: [...documentUploadContentTypes],
          maximumSizeInBytes: documentUploadMaxSizeBytes,
          callbackUrl: resolveBlobCallbackUrl(request, blobEnv),
          tokenPayload: JSON.stringify({
            ...parsedPayload,
            organizationId: organization.id,
            uploadedByAuthUserId: session.id,
          } satisfies UploadTokenPayload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const parsedPayload = parseUploadTokenPayload(tokenPayload);
        const { organization, session } = await getUploadAccess(
          parsedPayload.moduleId,
        );

        assertUploadTokenMatchesSession(
          parsedPayload,
          organization,
          session,
        );
        assertUploadPathnameMatchesTenant({
          pathname: blob.pathname,
          organizationId: organization.id,
          moduleId: parsedPayload.moduleId,
        });

        const sizeBytes = resolveUploadedDocumentSize({
          declaredSizeBytes: parsedPayload.sizeBytes,
          blob,
        });

        await registerTenantDocument({
          organizationId: organization.id,
          moduleId: parsedPayload.moduleId,
          ownerEntityId: parsedPayload.ownerEntityId,
          title: parsedPayload.title,
          blobUrl: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType ?? parsedPayload.contentType,
          sizeBytes,
          access: parsedPayload.access,
          blobEtag: blob.etag,
          retentionClass: "standard",
          uploadedByAuthUserId: session.id,
          metadata: {
            source: "vercel-blob-client-upload",
            declaredContentType: parsedPayload.contentType,
            declaredSizeBytes: parsedPayload.sizeBytes,
          },
        });

        logServerEvent(
          "info",
          "Upload completed and registered.",
          {
            requestId,
            organizationId: organization.id,
            userId: session.id,
            module: parsedPayload.moduleId,
            operation: "blob.register_upload",
          },
          {
            route,
            durationMs: Date.now() - startedAt,
            pathname: blob.pathname,
            sizeBytes,
          },
        );
      },
    });

    logServerEvent("info", "Upload route completed.", context, {
      route,
      durationMs: Date.now() - startedAt,
      status: 200,
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const response = getBlobRouteErrorResponse(error);

    logServerEvent("error", "Upload route failed.", context, {
      route,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: response.message,
      },
      { status: response.status },
    );
  }
}
