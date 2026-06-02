import "server-only";

import { uploadRouteCopy } from "@afenda/kernel";
import { logServerEvent } from "@afenda/observability";
import { z } from "zod";
import type { UploadRegistrationInput } from "../contracts/index";
import { UploadRouteError } from "../domain/upload-route.error.shared";
import {
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "../schemas/upload-payload.shared";

export type ObjectStorageHandlerResult = {
  status: number;
  body?: unknown;
  redirect?: string;
};

export type ObjectStorageUploadHandlerDeps = {
  registerUploadedDocument?: (
    input: UploadRegistrationInput,
  ) => Promise<void>;
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
}) {
  if (!input.deps.registerUploadedDocument) {
    throw new UploadRouteError(503, uploadRouteCopy.uploadFailed);
  }

  await input.deps.registerUploadedDocument({
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
    uploadedByAuthUserId: input.session.id,
    metadata: {
      source: input.source,
      declaredContentType: input.parsedPayload.contentType,
      declaredSizeBytes: input.parsedPayload.sizeBytes,
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
}
