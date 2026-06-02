import type { ModuleId } from "@afenda/kernel";

export const OBJECT_STORAGE_HTTP_ROUTES = {
  upload: "/api/internal/v1/uploads",
  uploadConfig: "/api/internal/v1/uploads/config",
  documentDownload: "/api/internal/v1/documents/[documentId]/download",
  /** @deprecated Use documentDownload — kept for redirect compatibility */
  legacyDocumentDownload: "/api/documents/[documentId]/download",
} as const;

export type ObjectStorageAccess = "private" | "public";

export type StoredObjectMetadata = {
  pathname: string;
  url: string;
  contentType?: string;
  sizeBytes: number;
  etag?: string;
};

export type PresignedUploadInput = {
  pathname: string;
  contentType: string;
  sizeBytes: number;
  access: ObjectStorageAccess;
};

export type PresignedUploadResult = {
  uploadUrl: string;
  pathname: string;
  method: "PUT";
  headers: Record<string, string>;
};

export type SignedDownloadInput = {
  pathname: string;
  access: ObjectStorageAccess;
  contentDisposition: string;
  validUntilMs: number;
};

export type SignedDownloadResult = {
  url: string;
  validUntilMs: number;
};

export type ObjectStorePort = {
  readonly providerId: "vercel-blob" | "r2";

  createPresignedUpload?(
    input: PresignedUploadInput,
  ): Promise<PresignedUploadResult>;

  headObject(pathname: string): Promise<StoredObjectMetadata>;

  getSignedDownloadUrl(
    input: SignedDownloadInput,
  ): Promise<SignedDownloadResult>;
};

export type UploadRegistrationInput = {
  organizationId: string;
  moduleId: ModuleId;
  ownerEntityId?: string;
  title: string;
  blobUrl: string;
  pathname: string;
  contentType: string;
  sizeBytes: number;
  access: ObjectStorageAccess;
  blobEtag?: string;
  uploadedByAuthUserId: string;
  metadata: Record<string, unknown>;
};

/** Document row required for signed download — resolved via injected data port (ARCH-1002 §8). */
export type TenantDocumentDownloadRecord = {
  id: string;
  title: string;
  pathname: string;
  access: ObjectStorageAccess;
  moduleId: ModuleId;
};

export type GetTenantDocumentForDownload = (input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
}) => Promise<TenantDocumentDownloadRecord | null>;
