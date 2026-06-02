import type { ModuleId } from "@afenda/kernel";
import type {
  ObjectStorageDocumentClassification,
  ObjectStorageRetentionClass,
} from "../policies/document-governance-policy.shared";

export const OBJECT_STORAGE_HTTP_ROUTES = {
  upload: "/api/internal/v1/uploads",
  uploadConfig: "/api/internal/v1/uploads/config",
  documentDownload: "/api/internal/v1/documents/[documentId]/download",
} as const;

export type ObjectStorageAccess = "private" | "public";

export type ObjectStorageDocumentScanStatus =
  | "pending"
  | "scanning"
  | "passed"
  | "failed"
  | "quarantined";

export type ObjectStorageGateDecision =
  | { allowed: true; metadata?: Record<string, unknown> }
  | {
    allowed: false;
    status?: 400 | 403 | 409 | 423 | 429;
    reason: string;
    metadata?: Record<string, unknown>;
  };

export type ObjectStorageEvidenceAction =
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_DOWNLOADED"
  | "DOCUMENT_UPLOAD_DENIED"
  | "DOCUMENT_DOWNLOAD_DENIED"
  | "DOCUMENT_DELETED"
  | "DOCUMENT_LEGAL_HOLD_APPLIED"
  | "DOCUMENT_LEGAL_HOLD_RELEASED"
  | "DOCUMENT_ORG_LEGAL_HOLD_CASCADED"
  | "DOCUMENT_SCAN_QUARANTINE_RELEASED"
  | "DOCUMENT_RETENTION_EXPIRED"
  | "DOCUMENT_MALWARE_DETECTED";

export type ObjectStorageEvidenceAuditEvent = {
  action: ObjectStorageEvidenceAction;
  organizationId: string;
  moduleId: ModuleId;
  userId: string;
  timestamp: string;
  documentId?: string;
  pathname?: string;
  classification?: ObjectStorageDocumentClassification;
  retentionClass?: ObjectStorageRetentionClass;
  sourceIp?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
};

export type ObjectStorageEvidenceAuditSink = (
  event: ObjectStorageEvidenceAuditEvent,
) => Promise<void>;

export type ObjectStorageUploadQuotaInput = {
  organizationId: string;
  moduleId: ModuleId;
  pathname: string;
  sizeBytes: number;
  contentType: string;
  access: ObjectStorageAccess;
  classification: ObjectStorageDocumentClassification;
  retentionClass: ObjectStorageRetentionClass;
  uploadedByAuthUserId: string;
};

export type ObjectStorageDownloadGovernanceInput = {
  organizationId: string;
  moduleId: ModuleId;
  documentId: string;
  pathname: string;
  access: ObjectStorageAccess;
  classification?: ObjectStorageDocumentClassification;
  retentionClass?: ObjectStorageRetentionClass;
  requestedByAuthUserId: string;
};

export type StoredObjectMetadata = {
  pathname: string;
  url: string;
  contentType?: string;
  sizeBytes: number;
  etag?: string;
};

export type ObjectStorageGovernanceMetadata = {
  organizationId: string;
  moduleId: string;
  classification: string;
  uploadedByAuthUserId: string;
};

export type PresignedUploadInput = {
  pathname: string;
  contentType: string;
  sizeBytes: number;
  access: ObjectStorageAccess;
  governance?: ObjectStorageGovernanceMetadata;
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

  readObjectPrefix?(
    pathname: string,
    maxBytes: number,
  ): Promise<Uint8Array>;

  getSignedDownloadUrl(
    input: SignedDownloadInput,
  ): Promise<SignedDownloadResult>;

  deleteObject(input: {
    pathname: string;
    blobUrl?: string;
  }): Promise<void>;
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
  classification: ObjectStorageDocumentClassification;
  retentionClass: ObjectStorageRetentionClass;
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
  classification?: ObjectStorageDocumentClassification;
  retentionClass?: ObjectStorageRetentionClass;
  scanStatus?: ObjectStorageDocumentScanStatus;
};

export type GetTenantDocumentForDownload = (input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
}) => Promise<TenantDocumentDownloadRecord | null>;
