import "server-only";

import { uploadRouteCopy } from "@afenda/kernel";
import { logServerEvent } from "@afenda/observability";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type {
  ObjectStorageHandlerResult,
  ObjectStorageUploadHandlerDeps,
} from "../../_object-storage-integration/api/upload-registration.server";
import {
  parseUploadTokenPayload,
  registerUploadedDocument,
} from "../../_object-storage-integration/api/upload-registration.server";
import { requireUploadModuleAccess } from "../../_object-storage-integration/domain/upload-route-auth.server";
import {
  assertObjectStorageConfigured,
  resolveUploadedDocumentSize,
  resolveVercelBlobCallbackUrl,
} from "../../_object-storage-integration/domain/object-storage-config.server";
import { UploadRouteError } from "../../_object-storage-integration/domain/upload-route.error.shared";
import {
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "../../_object-storage-integration/policies/document-upload-policy.shared";
import { assertUploadPathnameMatchesTenant } from "../../_object-storage-integration/policies/tenant-pathnames.shared";
import {
  assertUploadTokenMatchesSession,
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "../../_object-storage-integration/schemas/upload-payload.shared";

export async function handleVercelBlobUploadPost(
  request: Request,
  context: {
    requestId: string;
    route: string;
    startedAt: number;
  },
  deps: ObjectStorageUploadHandlerDeps,
): Promise<ObjectStorageHandlerResult> {
  const objectStorageEnv = assertObjectStorageConfigured();

  if (
    objectStorageEnv.provider !== "vercel-blob" ||
    !objectStorageEnv.vercelBlob?.BLOB_READ_WRITE_TOKEN
  ) {
    throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
  }

  const blobEnv = objectStorageEnv.vercelBlob;
  const accessByModule = new Map<
    UploadTokenPayload["moduleId"],
    Awaited<ReturnType<typeof requireUploadModuleAccess>>
  >();

  async function getUploadAccess(moduleId: UploadTokenPayload["moduleId"]) {
    const cached = accessByModule.get(moduleId);
    if (cached) {
      return cached;
    }

    const access = await requireUploadModuleAccess(moduleId, "upload");
    accessByModule.set(moduleId, access);
    return access;
  }

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
          requestId: context.requestId,
          organizationId: organization.id,
          userId: session.id,
          module: parsedPayload.moduleId,
          operation: "object_storage.issue_upload_token",
        },
        {
          route: context.route,
          contentType: parsedPayload.contentType,
          sizeBytes: parsedPayload.sizeBytes,
          pathname,
        },
      );

      return {
        addRandomSuffix: true,
        allowedContentTypes: [...documentUploadContentTypes],
        maximumSizeInBytes: documentUploadMaxSizeBytes,
        callbackUrl: resolveVercelBlobCallbackUrl(request, blobEnv),
        tokenPayload: JSON.stringify({
          ...parsedPayload,
          organizationId: organization.id,
          uploadedByAuthUserId: session.id,
          pathname,
        } satisfies UploadTokenPayload),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const parsedPayload = parseUploadTokenPayload(tokenPayload);
      const { organization, session } = await getUploadAccess(
        parsedPayload.moduleId,
      );

      assertUploadTokenMatchesSession(parsedPayload, organization, session);
      assertUploadPathnameMatchesTenant({
        pathname: blob.pathname,
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
      });

      const sizeBytes = resolveUploadedDocumentSize({
        declaredSizeBytes: parsedPayload.sizeBytes,
        blob,
      });

      if (parsedPayload.registerTenantDocument === false) {
        logServerEvent(
          "info",
          "Upload completed without ERP registry write.",
          {
            requestId: context.requestId,
            organizationId: organization.id,
            userId: session.id,
            module: parsedPayload.moduleId,
            operation: "object_storage.upload_only",
          },
          {
            route: context.route,
            pathname: blob.pathname,
            sizeBytes,
          },
        );
        return;
      }

      await registerUploadedDocument({
        deps,
        requestId: context.requestId,
        route: context.route,
        startedAt: context.startedAt,
        parsedPayload,
        organization,
        session,
        pathname: blob.pathname,
        blobUrl: blob.url,
        contentType: blob.contentType ?? parsedPayload.contentType,
        sizeBytes,
        etag: blob.etag,
        source: "vercel-blob-client-upload",
      });
    },
  });

  return {
    status: 200,
    body: jsonResponse,
  };
}
