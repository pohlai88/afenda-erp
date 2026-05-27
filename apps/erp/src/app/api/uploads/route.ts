import { getActiveOrganization, getSession } from "@afenda/auth/server";
import { registerTenantDocument } from "@afenda/db";
import { getErpModuleById, uploadRouteCopy } from "@afenda/domain";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "@/lib/document-upload-policy";
import {
  getUploadErrorResponse,
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

function getUploadModule(moduleId: UploadTokenPayload["moduleId"]) {
  const moduleDefinition = getErpModuleById(moduleId);

  if (!moduleDefinition) {
    throw new Error(`Unknown ERP module: ${moduleId}`);
  }

  return moduleDefinition;
}

async function requireUploadCapability(
  moduleId: UploadTokenPayload["moduleId"],
) {
  const moduleDefinition = getUploadModule(moduleId);
  const session = await getSession();

  if (!session) {
    throw new UploadRouteError(401, uploadRouteCopy.authenticationRequired);
  }

  const organization = getActiveOrganization(session);

  if (!organization) {
    throw new UploadRouteError(409, uploadRouteCopy.organizationRequired);
  }

  if (
    !organization.capabilities.includes(moduleDefinition.requiredCapability)
  ) {
    throw new UploadRouteError(403, uploadRouteCopy.uploadNotAllowed);
  }

  return {
    moduleDefinition,
    organization,
    session,
  };
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

  try {
    logServerEvent("info", "Upload route started.", context, { route });

    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const parsedPayload = uploadPayloadSchema.parse(
          JSON.parse(clientPayload ?? "{}"),
        );
        const { session, organization } = await requireUploadCapability(
          parsedPayload.moduleId,
        );

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
          },
        );

        return {
          addRandomSuffix: true,
          allowedContentTypes: [...documentUploadContentTypes],
          maximumSizeInBytes: documentUploadMaxSizeBytes,
          tokenPayload: JSON.stringify({
            ...parsedPayload,
            organizationId: organization.id,
            uploadedByAuthUserId: session.id,
          } satisfies UploadTokenPayload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const parsedPayload = parseUploadTokenPayload(tokenPayload);

        await registerTenantDocument({
          organizationId: parsedPayload.organizationId,
          moduleId: parsedPayload.moduleId,
          ownerEntityId: parsedPayload.ownerEntityId,
          title: parsedPayload.title,
          blobUrl: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType ?? parsedPayload.contentType,
          sizeBytes: parsedPayload.sizeBytes,
          access: parsedPayload.access,
          uploadedByAuthUserId: parsedPayload.uploadedByAuthUserId,
          metadata: {
            source: "vercel-blob-client-upload",
            declaredContentType: parsedPayload.contentType,
          },
        });

        logServerEvent(
          "info",
          "Upload completed and registered.",
          {
            requestId,
            organizationId: parsedPayload.organizationId,
            userId: parsedPayload.uploadedByAuthUserId,
            module: parsedPayload.moduleId,
            operation: "blob.register_upload",
          },
          {
            route,
            durationMs: Date.now() - startedAt,
            pathname: blob.pathname,
            sizeBytes: parsedPayload.sizeBytes,
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
    const response = getUploadErrorResponse(error);

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
