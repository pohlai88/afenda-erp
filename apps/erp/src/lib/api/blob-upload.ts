import { getBaseEnv, getBlobEnv, type BlobEnv } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import {
  assertUploadPathnameMatchesTenant,
  buildTenantBlobPathPrefix,
  buildTenantBlobPathname,
  sanitizeUploadFilename,
  shouldUseMultipartUpload,
  formatDownloadContentDisposition,
  BLOB_MULTIPART_THRESHOLD_BYTES,
  DEFAULT_DOCUMENT_LIST_PAGE_SIZE,
  TENANT_BLOB_ROOT,
} from "@/lib/api/blob-pathnames.shared";
import { UploadRouteError } from "@/lib/api/upload-route";

export {
  assertUploadPathnameMatchesTenant,
  buildTenantBlobPathPrefix,
  buildTenantBlobPathname,
  sanitizeUploadFilename,
  shouldUseMultipartUpload,
  formatDownloadContentDisposition,
  BLOB_MULTIPART_THRESHOLD_BYTES,
  DEFAULT_DOCUMENT_LIST_PAGE_SIZE,
  TENANT_BLOB_ROOT,
};

export function assertBlobConfigured(): BlobEnv & {
  BLOB_READ_WRITE_TOKEN: string;
} {
  const blobEnv = getBlobEnv();

  if (!blobEnv.configured || !blobEnv.BLOB_READ_WRITE_TOKEN) {
    throw new UploadRouteError(503, uploadRouteCopy.blobNotConfigured);
  }

  return {
    ...blobEnv,
    BLOB_READ_WRITE_TOKEN: blobEnv.BLOB_READ_WRITE_TOKEN,
  };
}

export function resolveBlobCallbackUrl(
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
  return `${protocol}://${host}/api/uploads`;
}

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
