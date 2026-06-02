import "server-only";

import { uploadRouteCopy } from "@afenda/kernel";
import { logServerEvent } from "@afenda/observability";
import { z } from "zod";
import type {
  ObjectStorageEvidenceAuditSink,
  ObjectStorageGateDecision,
  ObjectStorageUploadQuotaInput,
  UploadRegistrationInput,
} from "../contracts/index";
import { UploadRouteError } from "../domain/upload-route.error.shared";
import {
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "../schemas/upload-payload.shared";
import {
  documentMagicBytePrefixBytes,
  magicBytesMatchDeclaredContentType,
} from "../policies/document-content-verification.shared";
import { recordEvidenceEvent } from "./evidence-governance.server";
import { incrementObjectStorageMetric } from "./object-storage-metrics.server";

export type ObjectStorageHandlerResult = {
  status: number;
  body?: unknown;
  redirect?: string;
};

export type ObjectStorageUploadHandlerDeps = {
  registerUploadedDocument?: (
    input: UploadRegistrationInput,
  ) => Promise<string | void>;
  assertUploadQuota?: (
    input: ObjectStorageUploadQuotaInput,
  ) => Promise<ObjectStorageGateDecision | void>;
  recordEvidenceEvent?: ObjectStorageEvidenceAuditSink;
};

export function parseUploadTokenPayload(tokenPayload: string | null | undefined) {
  if (!tokenPayload) {
    throw new UploadRouteError(400, uploadRouteCopy.missingTokenPayload);
  }

  return uploadPayloadSchema
    .extend({
      organizationId: z.string().min(1),
      uploadedByAuthUserId: z.string().min(1),
      pathname: z.string().min(1).optional(),
    })
    .parse(JSON.parse(tokenPayload)) satisfies UploadTokenPayload;
}

export function storedContentTypeMatchesDeclared(
  storedContentType: string | undefined,
  declaredContentType: string,
) {
  if (!storedContentType || storedContentType === "application/octet-stream") {
    return true;
  }

  return storedContentType === declaredContentType;
}

export function assertStoredContentMatchesDeclared(input: {
  storedContentType?: string;
  declaredContentType: string;
  prefixBytes?: Uint8Array;
}) {
  if (
    !storedContentTypeMatchesDeclared(
      input.storedContentType,
      input.declaredContentType,
    )
  ) {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  if (
    input.prefixBytes &&
    input.prefixBytes.length >= documentMagicBytePrefixBytes &&
    !magicBytesMatchDeclaredContentType(
      input.declaredContentType,
      input.prefixBytes,
    )
  ) {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }
}

export function buildStoredObjectResult(input: {
  pathname: string;
  blobUrl: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
}) {
  return {
    pathname: input.pathname,
    blobUrl: input.blobUrl,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    etag: input.etag,
  };
}

export async function registerUploadedDocument(input: {
  deps: ObjectStorageUploadHandlerDeps;
  requestId: string;
  route: string;
  startedAt: number;
  parsedPayload: UploadTokenPayload;
  organization: { id: string };
  session: { id: string };
  pathname: string;
  blobUrl: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
  source: string;
  sourceIp?: string;
}) {
  if (!input.deps.registerUploadedDocument) {
    throw new UploadRouteError(503, uploadRouteCopy.uploadFailed);
  }

  const documentId = await input.deps.registerUploadedDocument({
    organizationId: input.organization.id,
    moduleId: input.parsedPayload.moduleId,
    ownerEntityId: input.parsedPayload.ownerEntityId,
    title: input.parsedPayload.title,
    blobUrl: input.blobUrl,
    pathname: input.pathname,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    access: input.parsedPayload.access,
    blobEtag: input.etag,
    classification: input.parsedPayload.classification,
    retentionClass: input.parsedPayload.retentionClass,
    uploadedByAuthUserId: input.session.id,
    metadata: {
      source: input.source,
      declaredContentType: input.parsedPayload.contentType,
      declaredSizeBytes: input.parsedPayload.sizeBytes,
    },
  });

  await recordEvidenceEvent({
    sink: input.deps.recordEvidenceEvent,
    event: {
      action: "DOCUMENT_UPLOADED",
      organizationId: input.organization.id,
      moduleId: input.parsedPayload.moduleId,
      userId: input.session.id,
      sessionId: input.session.id,
      documentId: typeof documentId === "string" ? documentId : undefined,
      pathname: input.pathname,
      classification: input.parsedPayload.classification,
      retentionClass: input.parsedPayload.retentionClass,
      sourceIp: input.sourceIp,
      metadata: {
        source: input.source,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        access: input.parsedPayload.access,
      },
    },
  });

  logServerEvent(
    "info",
    "Upload completed and registered.",
    {
      requestId: input.requestId,
      organizationId: input.organization.id,
      userId: input.session.id,
      module: input.parsedPayload.moduleId,
      operation: "object_storage.register_upload",
    },
    {
      route: input.route,
      durationMs: Date.now() - input.startedAt,
      pathname: input.pathname,
      sizeBytes: input.sizeBytes,
    },
  );

  incrementObjectStorageMetric("uploads_total", {
    requestId: input.requestId,
    organizationId: input.organization.id,
    moduleId: input.parsedPayload.moduleId,
  });
}
