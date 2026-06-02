import { moduleIds } from "@afenda/config/module-ids";
import { uploadRouteCopy } from "@afenda/kernel";
import { z } from "zod";
import { UploadRouteError } from "../domain/upload-route.error.shared";
import {
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "../policies/document-upload-policy.shared";
import {
  defaultObjectStorageDocumentClassification,
  defaultObjectStorageRetentionClass,
  objectStorageDocumentClassifications,
  objectStorageRetentionClasses,
} from "../policies/document-governance-policy.shared";

export const uploadAccessSchema = z.enum(["private", "public"]);
export const uploadClassificationSchema = z.enum(
  objectStorageDocumentClassifications,
);
export const uploadRetentionClassSchema = z.enum(objectStorageRetentionClasses);

export const uploadPayloadSchema = z.object({
  moduleId: z.enum(moduleIds),
  title: z.string().trim().min(1).max(160),
  ownerEntityId: z.string().trim().min(1).max(160).optional(),
  contentType: z.enum(documentUploadContentTypes),
  sizeBytes: z.number().int().positive().max(documentUploadMaxSizeBytes),
  access: uploadAccessSchema.default("private"),
  classification: uploadClassificationSchema.default(
    defaultObjectStorageDocumentClassification,
  ),
  retentionClass: uploadRetentionClassSchema.default(
    defaultObjectStorageRetentionClass,
  ),
  /** When false, upload completes without ERP document registry write (HR attachments, etc.). */
  registerTenantDocument: z.boolean().default(true),
});

export type UploadTokenPayload = z.infer<typeof uploadPayloadSchema> & {
  organizationId: string;
  uploadedByAuthUserId: string;
  pathname?: string;
};

export const r2PresignBodySchema = z.object({
  intent: z.literal("presign"),
  pathname: z.string().min(1),
  clientPayload: z.string().min(1),
});

export const r2CompleteBodySchema = z.object({
  intent: z.literal("complete"),
  pathname: z.string().min(1),
  tokenPayload: z.string().min(1),
  etag: z.string().min(1).optional(),
});

export function assertUploadTokenMatchesSession(
  payload: UploadTokenPayload,
  organization: { id: string },
  session: { id: string },
) {
  if (
    payload.organizationId !== organization.id ||
    payload.uploadedByAuthUserId !== session.id
  ) {
    throw new UploadRouteError(403, uploadRouteCopy.tokenMismatch);
  }
}
