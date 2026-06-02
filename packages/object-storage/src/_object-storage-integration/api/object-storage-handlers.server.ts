import "server-only";

import { moduleIds } from "@afenda/config/module-ids";
import { uploadRouteCopy, type ModuleId } from "@afenda/kernel";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { z } from "zod";
import { handleVercelBlobUploadPost } from "../../blob/api/upload-handler.server";
import { requireUploadModuleAccess } from "../domain/upload-route-auth.server";
import { OBJECT_STORAGE_HTTP_ROUTES } from "../contracts/index";
import type { GetTenantDocumentForDownload } from "../contracts/index";
import type {
  ObjectStorageDocumentScanStatus,
  ObjectStorageEvidenceAuditSink,
  ObjectStorageGateDecision,
  ObjectStorageDownloadGovernanceInput,
} from "../contracts/index";
import { createObjectStore, resolveObjectStorageProviderId } from "../domain/create-object-store.server";
import { assertObjectStorageConfigured } from "../domain/object-storage-config.server";
import {
  UploadRouteError,
  getUploadRouteErrorResponse,
} from "../domain/upload-route.error.shared";
import {
  documentUploadAccept,
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "../policies/document-upload-policy.shared";
import { objectStorageGovernancePolicy } from "../policies/document-governance-policy.shared";
import {
  assertUploadPathnameMatchesTenant,
  buildTenantObjectPathPrefix,
  formatDownloadContentDisposition,
  MULTIPART_UPLOAD_THRESHOLD_BYTES,
} from "../policies/tenant-pathnames.shared";
import { handleR2UploadPost } from "../../r2/api/upload-handler.server";
import { handleS3UploadPost } from "../../s3/api/upload-handler.server";
import { handleServerEncryptedUploadPost, decryptStoredDocumentBody } from "./server-encrypted-upload.server";
import { buildObjectStorageEncryptionContext, resolveUploadMode } from "../domain/create-key-management.server";
import { parseDocumentEncryptionMetadata } from "../schemas/document-encryption-metadata.shared";
import type {
  ObjectStorageHandlerResult,
  ObjectStorageUploadHandlerDeps,
} from "./upload-registration.server";
import { uploadPayloadSchema } from "../schemas/upload-payload.shared";
import {
  assertDocumentScanPassed,
  assertGateDecisionAllowed,
  getRequestSourceIp,
  recordEvidenceEvent,
  recordGovernanceDeniedEvidenceEvent,
  recordUploadRouteDeniedEvidence,
} from "./evidence-governance.server";
import { incrementObjectStorageMetric } from "./object-storage-metrics.server";
import type { ObjectStorageProviderId } from "../domain/create-object-store.server";

export type ObjectStorageDownloadHandlerDeps = {
  getTenantDocument: GetTenantDocumentForDownload;
  authorizeDocumentDownload?: (
    input: ObjectStorageDownloadGovernanceInput,
  ) => Promise<ObjectStorageGateDecision | void>;
  getDocumentScanStatus?: (
    input: ObjectStorageDownloadGovernanceInput,
  ) => Promise<ObjectStorageDocumentScanStatus | null>;
  recordEvidenceEvent?: ObjectStorageEvidenceAuditSink;
  resolveOrganizationObjectStorageProvider?: (
    organizationId: string,
  ) => Promise<ObjectStorageProviderId | null | undefined>;
  resolveOrganizationEncryptionSettings?: ObjectStorageUploadHandlerDeps["resolveOrganizationEncryptionSettings"];
};

export type ObjectStorageHandlerDeps = ObjectStorageUploadHandlerDeps &
  ObjectStorageDownloadHandlerDeps;

export type { ObjectStorageHandlerResult, ObjectStorageUploadHandlerDeps };

const SIGNED_URL_TTL_MS = 5 * 60 * 1000;
const moduleIdSchema = z.enum(moduleIds);

function peekUploadModuleId(
  body: Record<string, unknown> | null,
): ModuleId | null {
  if (!body) {
    return null;
  }

  if (body.intent !== "presign" && body.intent !== "complete") {
    return null;
  }

  try {
    const payloadSource =
      body.intent === "complete" && typeof body.tokenPayload === "string"
        ? body.tokenPayload
        : typeof body.clientPayload === "string"
          ? body.clientPayload
          : null;

    if (!payloadSource) {
      return null;
    }

    const parsed = uploadPayloadSchema.parse(JSON.parse(payloadSource));
    return moduleIdSchema.parse(parsed.moduleId);
  } catch {
    return null;
  }
}

async function resolveEffectiveProviderForUploadRequest(
  request: Request,
  objectStorageEnv: ReturnType<typeof assertObjectStorageConfigured> & {
    configured: true;
  },
  deps: Pick<ObjectStorageHandlerDeps, "resolveOrganizationObjectStorageProvider">,
): Promise<ObjectStorageProviderId> {
  const requestBody = (await request.clone().json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const moduleId = peekUploadModuleId(requestBody);

  if (!moduleId) {
    return objectStorageEnv.provider;
  }

  const { organization } = await requireUploadModuleAccess(moduleId, "upload");
  const organizationProviderId =
    await deps.resolveOrganizationObjectStorageProvider?.(organization.id);

  return resolveObjectStorageProviderId(
    objectStorageEnv,
    organizationProviderId,
  );
}

export async function handleObjectStorageUploadPost(
  request: Request,
  deps: ObjectStorageUploadHandlerDeps = {},
): Promise<ObjectStorageHandlerResult> {
  const startedAt = Date.now();
  const requestId = getRequestId(request) ?? "unknown";
  const route = OBJECT_STORAGE_HTTP_ROUTES.upload;
  const context = {
    requestId,
    module: "documents",
    operation: "object_storage.client_upload",
  };

  try {
    const objectStorageEnv = assertObjectStorageConfigured();
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const result = await handleServerEncryptedUploadPost(
        request,
        {
          requestId,
          route,
          startedAt,
        },
        deps,
      );

      logServerEvent("info", "Upload route completed.", context, {
        route,
        durationMs: Date.now() - startedAt,
        status: result.status,
      });

      return result;
    }

    const requestBody = (await request.clone().json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    const hasR2Intent =
      requestBody?.intent === "presign" || requestBody?.intent === "complete";

    logServerEvent("info", "Upload route started.", context, { route });

    const effectiveProvider = await resolveEffectiveProviderForUploadRequest(
      request,
      objectStorageEnv,
      deps,
    );

    if (effectiveProvider === "r2" || effectiveProvider === "s3") {
      if (!hasR2Intent) {
        throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
      }

      const uploadHandler =
        effectiveProvider === "s3" ? handleS3UploadPost : handleR2UploadPost;
      const result = await uploadHandler(request, {
        requestId,
        route,
        startedAt,
      }, deps);

      logServerEvent("info", "Upload route completed.", context, {
        route,
        durationMs: Date.now() - startedAt,
        status: result.status,
      });

      return result;
    }

    if (hasR2Intent) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    const result = await handleVercelBlobUploadPost(request, {
      requestId,
      route,
      startedAt,
    }, deps);

    logServerEvent("info", "Upload route completed.", context, {
      route,
      durationMs: Date.now() - startedAt,
      status: result.status,
    });

    return result;
  } catch (error) {
    const response = getUploadRouteErrorResponse(error);

    if (
      error instanceof UploadRouteError &&
      (error.status === 403 || error.status === 429)
    ) {
      if (deps.recordEvidenceEvent) {
      const requestBody = (await request.clone().json().catch(() => null)) as
        | Record<string, unknown>
        | null;
      const clientPayload =
        requestBody?.payload && typeof requestBody.payload === "object"
          ? (requestBody.payload as Record<string, unknown>)
          : null;
      const moduleIdRaw =
        (typeof clientPayload?.moduleId === "string"
          ? clientPayload.moduleId
          : null) ??
        (typeof requestBody?.moduleId === "string" ? requestBody.moduleId : null);

      if (moduleIdRaw) {
        try {
          const moduleId = moduleIdSchema.parse(moduleIdRaw);
          const { organization, session } = await requireUploadModuleAccess(
            moduleId,
            "upload",
          );

          await recordUploadRouteDeniedEvidence({
            sink: deps.recordEvidenceEvent,
            error,
            context: {
              organizationId: organization.id,
              moduleId,
              userId: session.id,
              sourceIp: getRequestSourceIp(request),
            },
          });
        } catch {
          // Auth context unavailable — skip denied audit rather than fail the response.
        }
      }
      }

      incrementObjectStorageMetric("permission_denied", {
        requestId,
      });
    }

    incrementObjectStorageMetric("upload_failures", {
      requestId,
    });

    logServerEvent("error", "Upload route failed.", context, {
      route,
      durationMs: Date.now() - startedAt,
      status: response.status,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      status: response.status,
      body: { error: response.message },
    };
  }
}

export async function handleObjectStorageUploadConfigGet(
  request: Request,
  deps: Pick<
    ObjectStorageHandlerDeps,
    | "resolveOrganizationObjectStorageProvider"
    | "resolveOrganizationEncryptionSettings"
  > = {},
): Promise<ObjectStorageHandlerResult> {
  try {
    const objectStorageEnv = assertObjectStorageConfigured();
    const url = new URL(request.url);
    const moduleId = moduleIdSchema.parse(url.searchParams.get("moduleId"));
    const { organization } = await requireUploadModuleAccess(moduleId, "upload");
    const organizationProviderId =
      await deps.resolveOrganizationObjectStorageProvider?.(organization.id);
    const provider = resolveObjectStorageProviderId(
      objectStorageEnv,
      organizationProviderId,
    );
    const encryptionSettings =
      (await deps.resolveOrganizationEncryptionSettings?.(organization.id)) ?? {
        mode: "platform" as const,
        kmsAdapter: null,
        kmsKeyRef: null,
      };
    const uploadMode = resolveUploadMode(encryptionSettings);

    return {
      status: 200,
      body: {
        configured: true,
        provider,
        uploadMode,
        encryptionMode: encryptionSettings.mode,
        pathnamePrefix: buildTenantObjectPathPrefix({
          organizationId: organization.id,
          moduleId,
        }),
        uploadRoute: OBJECT_STORAGE_HTTP_ROUTES.upload,
        maxSizeBytes: documentUploadMaxSizeBytes,
        contentTypes: [...documentUploadContentTypes],
        accept: documentUploadAccept,
        governance: objectStorageGovernancePolicy,
        ...(provider === "vercel-blob"
          ? { multipartThresholdBytes: MULTIPART_UPLOAD_THRESHOLD_BYTES }
          : {}),
      },
    };
  } catch (error) {
    if (error instanceof UploadRouteError && error.status === 503) {
      const configuredResponse = getUploadRouteErrorResponse(error);

      return {
        status: configuredResponse.status,
        body: {
          configured: false,
          error: configuredResponse.message,
        },
      };
    }

    const response = getUploadRouteErrorResponse(error);

    return {
      status: response.status,
      body: {
        configured: true,
        authorized: false,
        error: response.message,
      },
    };
  }
}

export async function handleObjectStorageDocumentDownloadGet(
  input: {
    request: Request;
    documentId: string;
  },
  deps: ObjectStorageDownloadHandlerDeps,
): Promise<ObjectStorageHandlerResult> {
  const startedAt = Date.now();
  const requestId = getRequestId(input.request) ?? "unknown";
  const route = OBJECT_STORAGE_HTTP_ROUTES.documentDownload;
  let deniedAuditContext:
    | {
        organizationId: string;
        moduleId: ModuleId;
        documentId: string;
        pathname: string;
        classification?: ObjectStorageDownloadGovernanceInput["classification"];
        retentionClass?: ObjectStorageDownloadGovernanceInput["retentionClass"];
        userId: string;
        sessionId?: string;
        sourceIp?: string;
      }
    | undefined;

  try {
    const objectStorageEnv = assertObjectStorageConfigured();
    const moduleId = moduleIdSchema.parse(
      new URL(input.request.url).searchParams.get("moduleId"),
    );
    const { organization, session } = await requireUploadModuleAccess(
      moduleId,
      "download",
    );
    const organizationProviderId =
      await deps.resolveOrganizationObjectStorageProvider?.(organization.id);
    const encryptionSettings =
      (await deps.resolveOrganizationEncryptionSettings?.(organization.id)) ?? {
        mode: "platform" as const,
        kmsAdapter: null,
        kmsKeyRef: null,
      };
    const store = createObjectStore(objectStorageEnv, {
      organizationId: organization.id,
      organizationProviderId,
      encryption: buildObjectStorageEncryptionContext({
        organizationId: organization.id,
        settings: encryptionSettings,
      }),
      sseKmsKeyId: encryptionSettings.kmsKeyRef,
    });
    const sourceIp = getRequestSourceIp(input.request);
    const document = await deps.getTenantDocument({
      organizationId: organization.id,
      documentId: input.documentId,
      moduleId,
    });

    if (!document) {
      return {
        status: 404,
        body: { error: uploadRouteCopy.documentNotFound },
      };
    }

    assertUploadPathnameMatchesTenant({
      pathname: document.pathname,
      organizationId: organization.id,
      moduleId: document.moduleId,
    });

    const governanceInput: ObjectStorageDownloadGovernanceInput = {
      organizationId: organization.id,
      moduleId: document.moduleId,
      documentId: document.id,
      pathname: document.pathname,
      access: document.access,
      classification: document.classification,
      retentionClass: document.retentionClass,
      requestedByAuthUserId: session.id,
    };

    deniedAuditContext = {
      organizationId: organization.id,
      moduleId: document.moduleId,
      documentId: document.id,
      pathname: document.pathname,
      classification: document.classification,
      retentionClass: document.retentionClass,
      userId: session.id,
      sessionId: session.id,
      sourceIp,
    };

    assertDocumentScanPassed({ scanStatus: document.scanStatus });
    assertDocumentScanPassed({
      scanStatus: await deps.getDocumentScanStatus?.(governanceInput),
    });
    assertGateDecisionAllowed(
      await deps.authorizeDocumentDownload?.(governanceInput),
    );

    const contentDisposition = formatDownloadContentDisposition(document.title);
    const envelopeEncryption = parseDocumentEncryptionMetadata(document.metadata);

    if (envelopeEncryption) {
      const plaintext = await decryptStoredDocumentBody({
        organizationId: organization.id,
        pathname: document.pathname,
        metadata: document.metadata,
        store,
        deps,
      });

      if (!plaintext) {
        throw new UploadRouteError(500, uploadRouteCopy.uploadFailed);
      }

      incrementObjectStorageMetric("encryption_unwrap_total", {
        requestId,
        organizationId: organization.id,
        moduleId: document.moduleId,
        provider: store.providerId,
      });

      await recordEvidenceEvent({
        sink: deps.recordEvidenceEvent,
        event: {
          action: "DOCUMENT_DOWNLOADED",
          organizationId: organization.id,
          moduleId: document.moduleId,
          documentId: document.id,
          pathname: document.pathname,
          classification: document.classification,
          retentionClass: document.retentionClass,
          userId: governanceInput.requestedByAuthUserId,
          sessionId: session.id,
          sourceIp,
          metadata: {
            access: document.access,
            provider: store.providerId,
            encryptionAdapter: envelopeEncryption.adapter,
            delivery: "proxied-decrypt",
          },
        },
      });

      incrementObjectStorageMetric("encrypted_downloads_total", {
        requestId,
        organizationId: organization.id,
        moduleId: document.moduleId,
        provider: store.providerId,
      });

      incrementObjectStorageMetric("downloads_total", {
        requestId,
        organizationId: organization.id,
        moduleId: document.moduleId,
        provider: store.providerId,
      });

      return {
        status: 200,
        binaryBody: plaintext,
        responseHeaders: {
          "Content-Type": document.contentType ?? "application/octet-stream",
          "Content-Disposition": contentDisposition,
          "Cache-Control": "private, no-store",
        },
      };
    }

    const validUntil = Date.now() + SIGNED_URL_TTL_MS;
    const signed = await store.getSignedDownloadUrl({
      pathname: document.pathname,
      access: document.access,
      contentDisposition,
      validUntilMs: validUntil,
    });

    await recordEvidenceEvent({
      sink: deps.recordEvidenceEvent,
      event: {
        action: "DOCUMENT_DOWNLOADED",
        organizationId: organization.id,
        moduleId: document.moduleId,
        documentId: document.id,
        pathname: document.pathname,
        classification: document.classification,
        retentionClass: document.retentionClass,
        userId: governanceInput.requestedByAuthUserId,
        sessionId: session.id,
        sourceIp,
        metadata: {
          access: document.access,
          provider: store.providerId,
          validUntilMs: validUntil,
        },
      },
    });

    logServerEvent(
      "info",
      "Document download signed URL issued.",
      {
        requestId,
        organizationId: organization.id,
        module: moduleId,
        operation: "object_storage.download_signed_redirect",
      },
      {
        route,
        durationMs: Date.now() - startedAt,
        documentId: document.id,
        pathname: document.pathname,
        validUntilMs: validUntil,
        provider: store.providerId,
      },
    );

    incrementObjectStorageMetric("downloads_total", {
      requestId,
      organizationId: organization.id,
      moduleId: document.moduleId,
      provider: store.providerId,
    });

    return {
      status: 302,
      redirect: signed.url,
    };
  } catch (error) {
    if (error instanceof UploadRouteError) {
      if (deniedAuditContext) {
        await recordGovernanceDeniedEvidenceEvent({
          sink: deps.recordEvidenceEvent,
          action: "DOCUMENT_DOWNLOAD_DENIED",
          status: error.status,
          reason: error.message,
          event: {
            organizationId: deniedAuditContext.organizationId,
            moduleId: deniedAuditContext.moduleId,
            documentId: deniedAuditContext.documentId,
            pathname: deniedAuditContext.pathname,
            classification: deniedAuditContext.classification,
            retentionClass: deniedAuditContext.retentionClass,
            userId: deniedAuditContext.userId,
            sourceIp: deniedAuditContext.sourceIp,
          },
        });
      }

      if (error.status === 403 || error.status === 429) {
        incrementObjectStorageMetric("permission_denied", {
          requestId,
          organizationId: deniedAuditContext?.organizationId,
          moduleId: deniedAuditContext?.moduleId,
        });
      }

      incrementObjectStorageMetric("download_failures", {
        requestId,
        organizationId: deniedAuditContext?.organizationId,
        moduleId: deniedAuditContext?.moduleId,
      });

      return {
        status: error.status,
        body: { error: error.message },
      };
    }

    const response = getUploadRouteErrorResponse(error);

    incrementObjectStorageMetric("download_failures", {
      requestId,
    });

    logServerEvent(
      "error",
      "Document download failed.",
      {
        requestId,
        module: "documents",
        operation: "object_storage.download_signed_redirect",
      },
      {
        route,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
    );

    return {
      status: response.status,
      body: { error: response.message },
    };
  }
}
