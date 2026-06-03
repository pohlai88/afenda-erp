import type { ModuleId } from "@afenda/kernel";
import { objectStorageRouteCopy } from "../contracts/upload-route-copy.shared";
import { UploadRouteError } from "../domain/upload-route.error.shared";

export const TENANT_OBJECT_ROOT = "tenants";

/** @deprecated Use TENANT_OBJECT_ROOT */
export const TENANT_BLOB_ROOT = TENANT_OBJECT_ROOT;

export const MULTIPART_UPLOAD_THRESHOLD_BYTES = 4 * 1024 * 1024;

/** @deprecated Use MULTIPART_UPLOAD_THRESHOLD_BYTES */
export const BLOB_MULTIPART_THRESHOLD_BYTES = MULTIPART_UPLOAD_THRESHOLD_BYTES;

export const DEFAULT_DOCUMENT_LIST_PAGE_SIZE = 6;

export function extractTenantPathnameFromObjectUrl(url: string): string | null {
  try {
    const objectPath = new URL(url).pathname.replace(/^\/+/, "");
    if (objectPath.startsWith(`${TENANT_OBJECT_ROOT}/`)) {
      return objectPath;
    }
  } catch {
    return null;
  }

  return null;
}

export function sanitizeUploadFilename(filename: string) {
  const trimmed = filename.trim();

  if (
    !trimmed ||
    trimmed === "." ||
    trimmed === ".." ||
    trimmed.includes("..") ||
    /[/\\]/.test(trimmed)
  ) {
    throw new UploadRouteError(400, objectStorageRouteCopy.invalidRequest);
  }

  if (trimmed.length > 200) {
    throw new UploadRouteError(400, objectStorageRouteCopy.invalidRequest);
  }

  return trimmed;
}

export function buildTenantObjectPathPrefix(input: {
  organizationId: string;
  moduleId: ModuleId;
}) {
  return `${TENANT_OBJECT_ROOT}/${input.organizationId}/${input.moduleId}`;
}

/** @deprecated Use buildTenantObjectPathPrefix */
export const buildTenantBlobPathPrefix = buildTenantObjectPathPrefix;

export function buildTenantObjectPathname(input: {
  organizationId: string;
  moduleId: ModuleId;
  filename: string;
}) {
  return `${buildTenantObjectPathPrefix(input)}/${sanitizeUploadFilename(input.filename)}`;
}

/** @deprecated Use buildTenantObjectPathname */
export const buildTenantBlobPathname = buildTenantObjectPathname;

export function assertUploadPathnameMatchesTenant(input: {
  pathname: string;
  organizationId: string;
  moduleId: ModuleId;
}) {
  const expectedPrefix = `${buildTenantObjectPathPrefix(input)}/`;

  if (!input.pathname.startsWith(expectedPrefix)) {
    throw new UploadRouteError(403, objectStorageRouteCopy.invalidRequest);
  }

  sanitizeUploadFilename(input.pathname.slice(expectedPrefix.length));
}

export function shouldUseMultipartUpload(sizeBytes: number) {
  return sizeBytes >= MULTIPART_UPLOAD_THRESHOLD_BYTES;
}

export function formatDownloadContentDisposition(filename: string) {
  const sanitized = filename.replace(/[\r\n"\\]/g, "_").trim() || "document";
  const asciiFallback = sanitized.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(sanitized);

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
