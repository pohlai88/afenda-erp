import "server-only";

import { uploadRouteCopy } from "@afenda/kernel";
import { logServerEvent } from "@afenda/observability";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type {
  ObjectStorageHandlerResult,
  ObjectStorageUploadHandlerDeps,
} from "../../_object-storage-integration/api/upload-registration.server";
import {
  assertStoredContentMatchesDeclared,
  parseUploadTokenPayload,
  registerUploadedDocument,
} from "../../_object-storage-integration/api/upload-registration.server";
import {
  documentMagicBytePrefixBytes,
} from "../../_object-storage-integration/policies/document-content-verification.shared";
import {
  assertUploadQuotaAllowed,
  getRequestSourceIp,
  recordEvidenceEvent,
  runUploadWithDeniedAudit,
  type UploadDeniedAuditContext,
} from "../../_object-storage-integration/api/evidence-governance.server";
import { incrementObjectStorageMetric } from "../../_object-storage-integration/api/object-storage-metrics.server";
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
      const sourceIp = getRequestSourceIp(request);
      const parsedPayload = uploadPayloadSchema.parse(
        JSON.parse(clientPayload ?? "{}"),
      );
      const deniedContext: UploadDeniedAuditContext = {
        sourceIp,
        moduleId: parsedPayload.moduleId,
        pathname,
        classification: parsedPayload.classification,
        retentionClass: parsedPayload.retentionClass,
      };

      return runUploadWithDeniedAudit({
        sink: deps.recordEvidenceEvent,
        context: deniedContext,
        action: async () => {
      const { session, organization } = await getUploadAccess(
        parsedPayload.moduleId,
      );
      deniedContext.organizationId = organization.id;
      deniedContext.userId = session.id;

      assertUploadPathnameMatchesTenant({
        pathname,
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
      });

      await assertUploadQuotaAllowed({
        quotaGate: deps.assertUploadQuota,
        recordDenied: deps.recordEvidenceEvent,
        sourceIp,
        quotaInput: {
          organizationId: organization.id,
          moduleId: parsedPayload.moduleId,
          pathname,
          sizeBytes: parsedPayload.sizeBytes,
          contentType: parsedPayload.contentType,
          access: parsedPayload.access,
          classification: parsedPayload.classification,
          retentionClass: parsedPayload.retentionClass,
          uploadedByAuthUserId: session.id,
        },
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
      });
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const parsedPayload = parseUploadTokenPayload(tokenPayload);
      const deniedContext: UploadDeniedAuditContext = {
        sourceIp: getRequestSourceIp(request),
        organizationId: parsedPayload.organizationId,
        moduleId: parsedPayload.moduleId,
        userId: parsedPayload.uploadedByAuthUserId,
        pathname: blob.pathname,
        classification: parsedPayload.classification,
        retentionClass: parsedPayload.retentionClass,
      };

      await runUploadWithDeniedAudit({
        sink: deps.recordEvidenceEvent,
        context: deniedContext,
        action: async () => {
      const { organization, session } = await getUploadAccess(
        parsedPayload.moduleId,
      );
      deniedContext.userId = session.id;

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

      const prefixResponse = await fetch(blob.url, {
        headers: {
          Range: `bytes=0-${documentMagicBytePrefixBytes - 1}`,
        },
      });

      if (!prefixResponse.ok) {
        throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
      }

      assertStoredContentMatchesDeclared({
        storedContentType: blob.contentType ?? parsedPayload.contentType,
        declaredContentType: parsedPayload.contentType,
        prefixBytes: new Uint8Array(await prefixResponse.arrayBuffer()),
      });

      if (parsedPayload.registerTenantDocument === false) {
        await recordEvidenceEvent({
          sink: deps.recordEvidenceEvent,
          event: {
            action: "DOCUMENT_UPLOADED",
            organizationId: organization.id,
            moduleId: parsedPayload.moduleId,
            userId: session.id,
            sessionId: session.id,
            pathname: blob.pathname,
            classification: parsedPayload.classification,
            retentionClass: parsedPayload.retentionClass,
            sourceIp: getRequestSourceIp(request),
            metadata: {
              source: "vercel-blob-client-upload-only",
              contentType: blob.contentType ?? parsedPayload.contentType,
              sizeBytes,
              access: parsedPayload.access,
            },
          },
        });

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

        incrementObjectStorageMetric("uploads_total", {
          requestId: context.requestId,
          organizationId: organization.id,
          moduleId: parsedPayload.moduleId,
          provider: "vercel-blob",
        });
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
        sourceIp: getRequestSourceIp(request),
      });
        },
      });
    },
  });

  return {
    status: 200,
    body: jsonResponse,
  };
}
