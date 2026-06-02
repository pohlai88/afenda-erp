import "server-only";

import { uploadRouteCopy } from "@afenda/kernel";
import { logServerEvent } from "@afenda/observability";
import type {
  ObjectStorageHandlerResult,
  ObjectStorageUploadHandlerDeps,
} from "../../_object-storage-integration/api/upload-registration.server";
import {
  buildStoredObjectResult,
  parseUploadTokenPayload,
  registerUploadedDocument,
  assertStoredContentMatchesDeclared,
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
import { requireUploadModuleAccess } from "../../_object-storage-integration/domain/upload-route-auth.server";
import { buildObjectStorageEncryptionContext } from "../../_object-storage-integration/domain/create-key-management.server";
import { createObjectStore } from "../../_object-storage-integration/domain/create-object-store.server";
import { usesEnvelopeEncryption } from "../../_object-storage-integration/domain/envelope-encryption.server";
import { assertObjectStorageConfigured } from "../../_object-storage-integration/domain/object-storage-config.server";
import { UploadRouteError } from "../../_object-storage-integration/domain/upload-route.error.shared";
import {
  addRandomPathSuffix,
  assertUploadPathnameMatchesTenant,
} from "../../_object-storage-integration/policies/tenant-pathnames.shared";
import {
  assertUploadTokenMatchesSession,
  r2CompleteBodySchema,
  r2PresignBodySchema,
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "../../_object-storage-integration/schemas/upload-payload.shared";

export async function handleR2UploadPost(
  request: Request,
  context: {
    requestId: string;
    route: string;
    startedAt: number;
  },
  deps: ObjectStorageUploadHandlerDeps,
): Promise<ObjectStorageHandlerResult> {
  const objectStorageEnv = assertObjectStorageConfigured();

  const body = (await request.json()) as Record<string, unknown>;

  async function createStoreForOrganization(organizationId: string) {
    const organizationProviderId =
      await deps.resolveOrganizationObjectStorageProvider?.(organizationId);
    const encryptionSettings =
      (await deps.resolveOrganizationEncryptionSettings?.(organizationId)) ?? {
        mode: "platform" as const,
        kmsAdapter: null,
        kmsKeyRef: null,
      };

    return createObjectStore(objectStorageEnv, {
      organizationId,
      organizationProviderId,
      encryption: buildObjectStorageEncryptionContext({
        organizationId,
        settings: encryptionSettings,
      }),
      sseKmsKeyId: encryptionSettings.kmsKeyRef,
    });
  }

  if (body.intent === "presign") {
    const parsed = r2PresignBodySchema.parse(body);
    const parsedPayload = uploadPayloadSchema.parse(
      JSON.parse(parsed.clientPayload),
    );
    const sourceIp = getRequestSourceIp(request);
    const deniedContext: UploadDeniedAuditContext = {
      sourceIp,
      moduleId: parsedPayload.moduleId,
      pathname: parsed.pathname,
      classification: parsedPayload.classification,
      retentionClass: parsedPayload.retentionClass,
    };

    return runUploadWithDeniedAudit({
      sink: deps.recordEvidenceEvent,
      context: deniedContext,
      action: async () => {
    const { session, organization } = await requireUploadModuleAccess(
      parsedPayload.moduleId,
      "upload",
    );
    deniedContext.organizationId = organization.id;
    deniedContext.userId = session.id;

    const encryptionSettings =
      (await deps.resolveOrganizationEncryptionSettings?.(organization.id)) ?? {
        mode: "platform" as const,
        kmsAdapter: null,
        kmsKeyRef: null,
      };

    if (usesEnvelopeEncryption(encryptionSettings)) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    assertUploadPathnameMatchesTenant({
      pathname: parsed.pathname,
      organizationId: organization.id,
      moduleId: parsedPayload.moduleId,
    });

    if (
      parsedPayload.access === "public" &&
      !objectStorageEnv.r2?.publicUrlBase
    ) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    const storagePathname = addRandomPathSuffix(parsed.pathname);
    deniedContext.pathname = storagePathname;

    await assertUploadQuotaAllowed({
      quotaGate: deps.assertUploadQuota,
      recordDenied: deps.recordEvidenceEvent,
      sourceIp,
      quotaInput: {
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
        pathname: storagePathname,
        sizeBytes: parsedPayload.sizeBytes,
        contentType: parsedPayload.contentType,
        access: parsedPayload.access,
        classification: parsedPayload.classification,
        retentionClass: parsedPayload.retentionClass,
        uploadedByAuthUserId: session.id,
      },
    });

    const store = await createStoreForOrganization(organization.id);

    if (!store.createPresignedUpload) {
      throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
    }

    const presigned = await store.createPresignedUpload({
      pathname: storagePathname,
      contentType: parsedPayload.contentType,
      sizeBytes: parsedPayload.sizeBytes,
      access: parsedPayload.access,
      governance: {
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
        classification: parsedPayload.classification,
        uploadedByAuthUserId: session.id,
      },
    });

    const tokenPayload = JSON.stringify({
      ...parsedPayload,
      organizationId: organization.id,
      uploadedByAuthUserId: session.id,
      pathname: storagePathname,
    } satisfies UploadTokenPayload);

    logServerEvent(
      "info",
      "R2 upload presign issued.",
      {
        requestId: context.requestId,
        organizationId: organization.id,
        userId: session.id,
        module: parsedPayload.moduleId,
        operation: "object_storage.r2_presign",
      },
      {
        route: context.route,
        pathname: storagePathname,
      },
    );

    return {
      status: 200,
      body: {
        provider: store.providerId,
        ...presigned,
        pathname: storagePathname,
        tokenPayload,
      },
    };
      },
    });
  }

  if (body.intent === "complete") {
    const parsed = r2CompleteBodySchema.parse(body);
    const parsedPayload = parseUploadTokenPayload(parsed.tokenPayload);
    const deniedContext: UploadDeniedAuditContext = {
      sourceIp: getRequestSourceIp(request),
      organizationId: parsedPayload.organizationId,
      moduleId: parsedPayload.moduleId,
      userId: parsedPayload.uploadedByAuthUserId,
      pathname: parsed.pathname,
      classification: parsedPayload.classification,
      retentionClass: parsedPayload.retentionClass,
    };

    return runUploadWithDeniedAudit({
      sink: deps.recordEvidenceEvent,
      context: deniedContext,
      action: async () => {
    const { organization, session } = await requireUploadModuleAccess(
      parsedPayload.moduleId,
      "upload",
    );
    deniedContext.userId = session.id;

    assertUploadTokenMatchesSession(parsedPayload, organization, session);

    if (!parsedPayload.pathname) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    if (parsed.pathname !== parsedPayload.pathname) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    assertUploadPathnameMatchesTenant({
      pathname: parsed.pathname,
      organizationId: organization.id,
      moduleId: parsedPayload.moduleId,
    });

    const store = await createStoreForOrganization(organization.id);
    const stored = await store.headObject(parsed.pathname);

    if (stored.sizeBytes !== parsedPayload.sizeBytes) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    const prefixBytes = store.readObjectPrefix
      ? await store.readObjectPrefix(
          parsed.pathname,
          documentMagicBytePrefixBytes,
        )
      : undefined;

    assertStoredContentMatchesDeclared({
      storedContentType: stored.contentType,
      declaredContentType: parsedPayload.contentType,
      prefixBytes,
    });

    if (parsed.etag && stored.etag && parsed.etag !== stored.etag) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    const storedResult = buildStoredObjectResult({
      pathname: stored.pathname,
      blobUrl: stored.url,
      contentType: stored.contentType ?? parsedPayload.contentType,
      sizeBytes: stored.sizeBytes,
      etag: stored.etag,
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
          pathname: stored.pathname,
          classification: parsedPayload.classification,
          retentionClass: parsedPayload.retentionClass,
          sourceIp: getRequestSourceIp(request),
          metadata: {
            source: "r2-presigned-upload-only",
            contentType: storedResult.contentType,
            sizeBytes: stored.sizeBytes,
            access: parsedPayload.access,
          },
        },
      });

      return {
        status: 200,
        body: {
          provider: store.providerId,
          registered: false,
          ...storedResult,
        },
      };
    }

    await registerUploadedDocument({
      deps,
      requestId: context.requestId,
      route: context.route,
      startedAt: context.startedAt,
      parsedPayload,
      organization,
      session,
      pathname: stored.pathname,
      blobUrl: stored.url,
      contentType: storedResult.contentType,
      sizeBytes: stored.sizeBytes,
      etag: stored.etag,
      source: "r2-presigned-upload",
      sourceIp: getRequestSourceIp(request),
    });

    return {
      status: 200,
      body: {
        provider: store.providerId,
        registered: true,
        ...storedResult,
      },
    };
      },
    });
  }

  throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
}
