import "server-only";

import {
  getBaseEnv,
  getBlobEnv,
  getObjectStorageEnv,
  type BlobEnv,
  type ObjectStorageEnv,
} from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import { OBJECT_STORAGE_HTTP_ROUTES } from "../contracts/index";
import { UploadRouteError } from "../errors/upload-route.error.shared";

export function assertObjectStorageConfigured(): ObjectStorageEnv & {
  configured: true;
} {
  const env = getObjectStorageEnv();

  if (!env.configured) {
    throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
  }

  return env as ObjectStorageEnv & { configured: true };
}

/** @deprecated Use assertObjectStorageConfigured */
export function assertBlobConfigured(): BlobEnv & {
  BLOB_READ_WRITE_TOKEN: string;
} {
  const objectStorageEnv = assertObjectStorageConfigured();

  if (
    objectStorageEnv.provider !== "vercel-blob" ||
    !objectStorageEnv.vercelBlob?.BLOB_READ_WRITE_TOKEN
  ) {
    throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
  }

  return objectStorageEnv.vercelBlob;
}

export function resolveVercelBlobCallbackUrl(
  request: Request,
  blobEnv: Pick<BlobEnv, "VERCEL_BLOB_CALLBACK_URL">,
) {
  if (blobEnv.VERCEL_BLOB_CALLBACK_URL) {
    return blobEnv.VERCEL_BLOB_CALLBACK_URL;
  }

  const { NODE_ENV } = getBaseEnv();

  if (NODE_ENV === "production") {
    return undefined;
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!host) {
    return undefined;
  }

  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}${OBJECT_STORAGE_HTTP_ROUTES.upload}`;
}

/** @deprecated Use resolveVercelBlobCallbackUrl */
export const resolveBlobCallbackUrl = resolveVercelBlobCallbackUrl;

export function resolveUploadedDocumentSize(input: {
  declaredSizeBytes: number;
  blob: unknown;
}) {
  const blobRecord =
    typeof input.blob === "object" && input.blob !== null
      ? (input.blob as Record<string, unknown>)
      : undefined;
  const blobSize =
    typeof blobRecord?.size === "number" ? blobRecord.size : undefined;

  if (typeof blobSize === "number") {
    if (blobSize !== input.declaredSizeBytes) {
      throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
    }

    return blobSize;
  }

  return input.declaredSizeBytes;
}

export function getConfiguredBlobEnv() {
  return getBlobEnv();
}

export function getConfiguredObjectStorageEnv() {
  return getObjectStorageEnv();
}
