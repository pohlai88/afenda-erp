import { z } from "zod";
import { HR_DOCUMENT_TYPES } from "../contracts/hr-document.contract";

const isoDateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const hrRegisterDocumentActionSchema = z.object({
  employeeId: z.string().trim().min(1),
  documentType: z.enum(HR_DOCUMENT_TYPES),
  title: z.string().trim().min(1).max(512),
  blobUrl: z.string().url().startsWith("https://"),
  mimeType: z.string().trim().min(3).max(128),
  sizeBytes: z.coerce.number().int().min(1).max(80 * 1024 * 1024),
  classification: z.enum(["internal", "confidential", "restricted"]).optional(),
  effectiveFrom: isoDateOnly.optional(),
  effectiveTo: isoDateOnly.optional(),
});

export const hrArchiveDocumentActionSchema = z.object({
  documentId: z.string().trim().min(1),
});

export const hrVerifyDocumentActionSchema = z.object({
  documentId: z.string().trim().min(1),
});

export const hrRejectDocumentActionSchema = z.object({
  documentId: z.string().trim().min(1),
  rejectionReason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required.")
    .max(1000),
});

export const hrUpsertDocumentRequirementActionSchema = z.object({
  documentType: z.enum(HR_DOCUMENT_TYPES),
  title: z.string().trim().min(1).max(256),
  requiredForStatus: z
    .enum([
      "onboarding",
      "active",
      "probation",
      "confirmed",
      "suspended",
      "notice_period",
      "offboarding",
    ])
    .optional(),
  graceDaysBeforeDue: z.coerce.number().int().min(0).max(365).optional(),
});
