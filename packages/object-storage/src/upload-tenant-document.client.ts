"use client";

import type { ModuleId } from "@afenda/kernel";
import { OBJECT_STORAGE_HTTP_ROUTES } from "./contracts/index";
import {
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "./policies/document-upload-policy.shared";
import {
  sanitizeUploadFilename,
  shouldUseMultipartUpload,
} from "./policies/tenant-pathnames.shared";
import type { UploadTokenPayload } from "./schemas/upload-payload.shared";

export type ObjectStorageUploadConfig = {
  configured: boolean;
  authorized?: boolean;
  provider?: "vercel-blob" | "r2";
  pathnamePrefix?: string;
  uploadRoute?: string;
  maxSizeBytes?: number;
  contentTypes?: string[];
  accept?: string;
  multipartThresholdBytes?: number;
  error?: string;
};

export type TenantDocumentUploadInput = {
  moduleId: ModuleId;
  file: File;
  title: string;
  ownerEntityId?: string;
  access?: UploadTokenPayload["access"];
  /** When false, skips ERP document registry (HR attachments, receipts). Default true. */
  registerTenantDocument?: boolean;
};

export type TenantObjectUploadResult = {
  pathname: string;
  blobUrl: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
};

type R2PresignResponse = {
  provider: "r2";
  uploadUrl: string;
  pathname: string;
  method: "PUT";
  headers: Record<string, string>;
  tokenPayload: string;
  error?: string;
};

type R2CompleteResponse = TenantObjectUploadResult & {
  provider: "r2";
  registered: boolean;
  error?: string;
};

function isAllowedContentType(contentType: string) {
  return documentUploadContentTypes.some((allowed) => allowed === contentType);
}

function readUploadError(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return fallback;
}

function buildPathnameFromConfig(config: ObjectStorageUploadConfig, filename: string) {
  if (!config.pathnamePrefix) {
    throw new Error("Upload configuration is missing a tenant pathname prefix.");
  }

  return `${config.pathnamePrefix}/${sanitizeUploadFilename(filename)}`;
}

function buildClientPayload(
  input: TenantDocumentUploadInput,
): Omit<UploadTokenPayload, "organizationId" | "uploadedByAuthUserId" | "pathname"> {
  return {
    moduleId: input.moduleId,
    title: input.title,
    ownerEntityId: input.ownerEntityId,
    contentType: input.file.type as UploadTokenPayload["contentType"],
    sizeBytes: input.file.size,
    access: input.access ?? "private",
    registerTenantDocument: input.registerTenantDocument ?? true,
  };
}

export async function fetchObjectStorageUploadConfig(
  moduleId: ModuleId,
): Promise<ObjectStorageUploadConfig> {
  const url = new URL(OBJECT_STORAGE_HTTP_ROUTES.uploadConfig, window.location.origin);
  url.searchParams.set("moduleId", moduleId);

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "same-origin",
  });

  return (await response.json()) as ObjectStorageUploadConfig;
}

async function uploadViaR2(
  input: TenantDocumentUploadInput,
  pathname: string,
  clientPayload: Omit<
    UploadTokenPayload,
    "organizationId" | "uploadedByAuthUserId" | "pathname"
  >,
): Promise<TenantObjectUploadResult> {
  const presignResponse = await fetch(OBJECT_STORAGE_HTTP_ROUTES.upload, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "presign",
      pathname,
      clientPayload: JSON.stringify(clientPayload),
    }),
  });

  const presigned = (await presignResponse.json()) as R2PresignResponse;

  if (!presignResponse.ok) {
    throw new Error(readUploadError(presigned, "Upload presign failed."));
  }

  const putResponse = await fetch(presigned.uploadUrl, {
    method: presigned.method,
    headers: presigned.headers,
    body: input.file,
    credentials: "omit",
  });

  if (!putResponse.ok) {
    throw new Error(
      `Upload to object storage failed (${putResponse.status}). Check R2 bucket CORS for browser PUT.`,
    );
  }

  const completeResponse = await fetch(OBJECT_STORAGE_HTTP_ROUTES.upload, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "complete",
      pathname: presigned.pathname,
      tokenPayload: presigned.tokenPayload,
      etag: putResponse.headers.get("etag")?.replaceAll('"', "") ?? undefined,
    }),
  });

  const completePayload = (await completeResponse.json()) as R2CompleteResponse;

  if (!completeResponse.ok) {
    throw new Error(readUploadError(completePayload, "Upload registration failed."));
  }

  return {
    pathname: completePayload.pathname,
    blobUrl: completePayload.blobUrl,
    contentType: completePayload.contentType,
    sizeBytes: completePayload.sizeBytes,
    etag: completePayload.etag,
  };
}

async function uploadViaVercelBlob(
  input: TenantDocumentUploadInput,
  pathname: string,
  clientPayload: Omit<
    UploadTokenPayload,
    "organizationId" | "uploadedByAuthUserId" | "pathname"
  >,
): Promise<TenantObjectUploadResult> {
  const { upload } = await import("@vercel/blob/client");
  const result = await upload(pathname, input.file, {
    access: input.access ?? "private",
    handleUploadUrl: OBJECT_STORAGE_HTTP_ROUTES.upload,
    multipart: shouldUseMultipartUpload(input.file.size),
    clientPayload: JSON.stringify(clientPayload),
  });

  return {
    pathname: result.pathname,
    blobUrl: result.url,
    contentType: result.contentType ?? input.file.type,
    sizeBytes: input.file.size,
    etag: result.etag,
  };
}

export async function uploadTenantObject(
  input: TenantDocumentUploadInput,
): Promise<TenantObjectUploadResult> {
  if (!isAllowedContentType(input.file.type)) {
    throw new Error("This file type is not accepted for ERP documents.");
  }

  if (input.file.size > documentUploadMaxSizeBytes) {
    throw new Error("Document exceeds the maximum upload size.");
  }

  const config = await fetchObjectStorageUploadConfig(input.moduleId);

  if (!config.configured || config.authorized === false) {
    throw new Error(config.error ?? "Document uploads are unavailable.");
  }

  if (!config.provider) {
    throw new Error(config.error ?? "Object storage provider is not configured.");
  }

  const pathname = buildPathnameFromConfig(config, input.file.name);
  const clientPayload = buildClientPayload(input);

  if (config.provider === "r2") {
    return uploadViaR2(input, pathname, clientPayload);
  }

  return uploadViaVercelBlob(input, pathname, clientPayload);
}

export async function uploadTenantDocument(
  input: TenantDocumentUploadInput,
): Promise<void> {
  await uploadTenantObject({
    ...input,
    registerTenantDocument: true,
  });
}
