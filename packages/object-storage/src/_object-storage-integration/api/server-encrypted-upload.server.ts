import "server-only";

import { uploadRouteCopy } from "@afenda/kernel";
import { logServerEvent } from "@afenda/observability/server";
import type {
  ObjectStorageHandlerResult,
  ObjectStorageUploadHandlerDeps,
} from "../../_object-storage-integration/api/upload-registration.server";
import {
  buildStoredObjectResult,
  registerUploadedDocument,
} from "../../_object-storage-integration/api/upload-registration.server";
import {
  assertUploadQuotaAllowed,
  getRequestSourceIp,
  recordEvidenceEvent,
  runUploadWithDeniedAudit,
  type UploadDeniedAuditContext,
} from "../../_object-storage-integration/api/evidence-governance.server";
import { incrementObjectStorageMetric } from "../../_object-storage-integration/api/object-storage-metrics.server";
import { buildObjectStorageEncryptionContext } from "../../_object-storage-integration/domain/create-key-management.server";
import { createObjectStore } from "../../_object-storage-integration/domain/create-object-store.server";
import { assertObjectStorageConfigured } from "../../_object-storage-integration/domain/object-storage-config.server";
import {
  decryptObjectEnvelope,
  encryptObjectEnvelope,
  usesEnvelopeEncryption,
} from "../../_object-storage-integration/domain/envelope-encryption.server";
import { UploadRouteError } from "../../_object-storage-integration/domain/upload-route.error.shared";
import {
  assertStoredContentMatchesDeclared,
} from "../../_object-storage-integration/api/upload-registration.server";
import {
  addRandomPathSuffix,
} from "../policies/tenant-pathnames.server";
import {
  assertUploadPathnameMatchesTenant,
} from "../../_object-storage-integration/policies/tenant-pathnames.shared";
import {
  parseDocumentEncryptionMetadata,
} from "../../_object-storage-integration/schemas/document-encryption-metadata.shared";
import {
  assertUploadTokenMatchesSession,
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "../../_object-storage-integration/schemas/upload-payload.shared";
import { requireUploadModuleAccess } from "../../_object-storage-integration/domain/upload-route-auth.server";

async function createStoreForOrganization(
  organizationId: string,
  deps: ObjectStorageUploadHandlerDeps,
) {
  const objectStorageEnv = assertObjectStorageConfigured();
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

export async function handleServerEncryptedUploadPost(
  request: Request,
  context: {
    requestId: string;
    route: string;
    startedAt: number;
  },
  deps: ObjectStorageUploadHandlerDeps,
): Promise<ObjectStorageHandlerResult> {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent !== "server-upload") {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  const pathnameRaw = formData.get("pathname");
  const clientPayloadRaw = formData.get("clientPayload");
  const file = formData.get("file");

  if (
    typeof pathnameRaw !== "string" ||
    typeof clientPayloadRaw !== "string" ||
    !(file instanceof File)
  ) {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  const parsedPayload = uploadPayloadSchema.parse(
    JSON.parse(clientPayloadRaw),
  );
  const sourceIp = getRequestSourceIp(request);
  const deniedContext: UploadDeniedAuditContext = {
    sourceIp,
    moduleId: parsedPayload.moduleId,
    pathname: pathnameRaw,
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

      if (!usesEnvelopeEncryption(encryptionSettings)) {
        throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
      }

      if (!encryptionSettings.kmsAdapter) {
        throw new UploadRouteError(503, uploadRouteCopy.uploadFailed);
      }

      assertUploadPathnameMatchesTenant({
        pathname: pathnameRaw,
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
      });

      const storagePathname = addRandomPathSuffix(pathnameRaw);
      deniedContext.pathname = storagePathname;

      await assertUploadQuotaAllowed({
        quotaGate: deps.assertUploadQuota,
        recordDenied: deps.recordEvidenceEvent,
        sourceIp,
        quotaInput: {
          organizationId: organization.id,
          moduleId: parsedPayload.moduleId,
          pathname: storagePathname,
          sizeBytes: file.size,
          contentType: parsedPayload.contentType,
          access: parsedPayload.access,
          classification: parsedPayload.classification,
          retentionClass: parsedPayload.retentionClass,
          uploadedByAuthUserId: session.id,
        },
      });

      const store = await createStoreForOrganization(organization.id, deps);

      if (!store.putObject) {
        throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
      }

      const plaintext = new Uint8Array(await file.arrayBuffer());
      assertStoredContentMatchesDeclared({
        storedContentType: parsedPayload.contentType,
        declaredContentType: parsedPayload.contentType,
        prefixBytes: plaintext.slice(0, 16),
      });

      const encryptionContext = buildObjectStorageEncryptionContext({
        organizationId: organization.id,
        settings: encryptionSettings,
      });

      if (!encryptionContext.keyManagement) {
        throw new UploadRouteError(503, uploadRouteCopy.uploadFailed);
      }

      const { ciphertext, encryption } = await encryptObjectEnvelope({
        plaintext,
        organizationId: organization.id,
        pathname: storagePathname,
        kmsAdapter: encryptionSettings.kmsAdapter,
        keyManagement: encryptionContext.keyManagement,
      });

      incrementObjectStorageMetric("encryption_wrap_total", {
        requestId: context.requestId,
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
      });

      const stored = await store.putObject({
        pathname: storagePathname,
        body: ciphertext,
        contentType: "application/octet-stream",
      });

      const tokenPayload = {
        ...parsedPayload,
        organizationId: organization.id,
        uploadedByAuthUserId: session.id,
        pathname: storagePathname,
      } satisfies UploadTokenPayload;

      assertUploadTokenMatchesSession(tokenPayload, organization, session);

      const storedResult = buildStoredObjectResult({
        pathname: stored.pathname,
        blobUrl: stored.url,
        contentType: parsedPayload.contentType,
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
            sourceIp,
            metadata: {
              source: "server-encrypted-upload-only",
              contentType: storedResult.contentType,
              sizeBytes: stored.sizeBytes,
              access: parsedPayload.access,
              encryptionAdapter: encryption.adapter,
            },
          },
        });

        incrementObjectStorageMetric("encrypted_uploads_total", {
          requestId: context.requestId,
          organizationId: organization.id,
          moduleId: parsedPayload.moduleId,
          provider: store.providerId,
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
        parsedPayload: tokenPayload,
        organization,
        session,
        pathname: stored.pathname,
        blobUrl: stored.url,
        contentType: parsedPayload.contentType,
        sizeBytes: stored.sizeBytes,
        etag: stored.etag,
        source: "server-encrypted-upload",
        sourceIp,
        registrationMetadata: {
          encryption,
        },
      });

      incrementObjectStorageMetric("encrypted_uploads_total", {
        requestId: context.requestId,
        organizationId: organization.id,
        moduleId: parsedPayload.moduleId,
        provider: store.providerId,
      });

      logServerEvent(
        "info",
        "Server encrypted upload completed.",
        {
          requestId: context.requestId,
          organizationId: organization.id,
          userId: session.id,
          module: parsedPayload.moduleId,
          operation: "object_storage.server_encrypted_upload",
        },
        {
          route: context.route,
          pathname: storagePathname,
          encryptionAdapter: encryption.adapter,
        },
      );

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

export async function decryptStoredDocumentBody(input: {
  organizationId: string;
  pathname: string;
  metadata?: Record<string, unknown>;
  store: Awaited<ReturnType<typeof createStoreForOrganization>>;
  deps: ObjectStorageUploadHandlerDeps;
}): Promise<Uint8Array | null> {
  const encryption = parseDocumentEncryptionMetadata(input.metadata);

  if (!encryption) {
    return null;
  }

  if (!input.store.getObjectBody) {
    throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
  }

  const encryptionSettings =
    (await input.deps.resolveOrganizationEncryptionSettings?.(
      input.organizationId,
    )) ?? {
      mode: "platform" as const,
      kmsAdapter: null,
      kmsKeyRef: null,
    };

  const encryptionContext = buildObjectStorageEncryptionContext({
    organizationId: input.organizationId,
    settings: encryptionSettings,
  });

  if (!encryptionContext.keyManagement) {
    throw new UploadRouteError(503, uploadRouteCopy.uploadFailed);
  }

  const ciphertext = await input.store.getObjectBody(input.pathname);

  return decryptObjectEnvelope({
    ciphertext,
    encryption,
    organizationId: input.organizationId,
    keyManagement: encryptionContext.keyManagement,
  });
}
