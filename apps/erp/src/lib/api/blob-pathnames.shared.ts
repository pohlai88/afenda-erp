import type { ModuleId } from "@afenda/kernel";
import { uploadRouteCopy } from "@afenda/kernel";
import { UploadRouteError } from "@/lib/api/upload-route";

export const TENANT_BLOB_ROOT = "tenants";
export const BLOB_MULTIPART_THRESHOLD_BYTES = 4 * 1024 * 1024;
export const DEFAULT_DOCUMENT_LIST_PAGE_SIZE = 6;

export function sanitizeUploadFilename(filename: string) {
  const trimmed = filename.trim();

  if (
    !trimmed ||
    trimmed === "." ||
    trimmed === ".." ||
    trimmed.includes("..") ||
    /[/\\]/.test(trimmed)
  ) {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  if (trimmed.length > 200) {
    throw new UploadRouteError(400, uploadRouteCopy.invalidRequest);
  }

  return trimmed;
}

export function buildTenantBlobPathPrefix(input: {
  organizationId: string;
  moduleId: ModuleId;
}) {
  return `${TENANT_BLOB_ROOT}/${input.organizationId}/${input.moduleId}`;
}

export function buildTenantBlobPathname(input: {
  organizationId: string;
  moduleId: ModuleId;
  filename: string;
}) {
  return `${buildTenantBlobPathPrefix(input)}/${sanitizeUploadFilename(input.filename)}`;
}

export function assertUploadPathnameMatchesTenant(input: {
  pathname: string;
  organizationId: string;
  moduleId: ModuleId;
}) {
  const expectedPrefix = `${buildTenantBlobPathPrefix(input)}/`;

  if (!input.pathname.startsWith(expectedPrefix)) {
    throw new UploadRouteError(403, uploadRouteCopy.invalidRequest);
  }

  sanitizeUploadFilename(input.pathname.slice(expectedPrefix.length));
}

export function shouldUseMultipartUpload(sizeBytes: number) {
  return sizeBytes >= BLOB_MULTIPART_THRESHOLD_BYTES;
}

export function formatDownloadContentDisposition(filename: string) {
  const sanitized = filename.replace(/[\r\n"\\]/g, "_").trim() || "document";
  const asciiFallback = sanitized.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(sanitized);

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
