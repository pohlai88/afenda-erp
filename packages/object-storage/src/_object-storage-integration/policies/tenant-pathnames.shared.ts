import { randomUUID } from "node:crypto";
import type { ModuleId } from "@afenda/kernel";
import { uploadRouteCopy } from "@afenda/kernel";
import { UploadRouteError } from "../domain/upload-route.error.shared";

export const TENANT_OBJECT_ROOT = "tenants";

/** @deprecated Use TENANT_OBJECT_ROOT */
export const TENANT_BLOB_ROOT = TENANT_OBJECT_ROOT;

export const MULTIPART_UPLOAD_THRESHOLD_BYTES = 4 * 1024 * 1024;

/** @deprecated Use MULTIPART_UPLOAD_THRESHOLD_BYTES */
export const BLOB_MULTIPART_THRESHOLD_BYTES = MULTIPART_UPLOAD_THRESHOLD_BYTES;

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

/** Collision-safe key suffix (mirrors Vercel Blob `addRandomSuffix`). */
export function addRandomPathSuffix(pathname: string) {
  const lastSlash = pathname.lastIndexOf("/");
  const directory = lastSlash >= 0 ? pathname.slice(0, lastSlash + 1) : "";
  const filename = lastSlash >= 0 ? pathname.slice(lastSlash + 1) : pathname;
  const dotIndex = filename.lastIndexOf(".");
  const suffix = randomUUID().slice(0, 8);

  if (dotIndex > 0) {
    return `${directory}${filename.slice(0, dotIndex)}-${suffix}${filename.slice(dotIndex)}`;
  }

  return `${directory}${filename}-${suffix}`;
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
    throw new UploadRouteError(403, uploadRouteCopy.invalidRequest);
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
