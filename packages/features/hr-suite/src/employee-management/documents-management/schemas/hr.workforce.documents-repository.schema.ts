import { z } from "zod";

export const registerHrEmployeeDocumentFormSchema = z.object({
  employeeId: z.string().trim().min(1),
  documentType: z.string().trim().min(1),
  title: z.string().trim().min(1),
  blobUrl: z.string().trim().min(1),
  pathname: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  sizeBytes: z.coerce.number().int().positive(),
  classification: z
    .enum(["internal", "confidential", "restricted"])
    .default("internal"),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().nullable().optional(),
});

export const upsertHrDocumentRequirementFormSchema = z.object({
  documentType: z.string().trim().min(1),
  title: z.string().trim().min(1),
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
    .nullable()
    .optional(),
  graceDaysBeforeDue: z.coerce.number().int().min(0).default(0),
});

export const verifyHrEmployeeDocumentFormSchema = z.object({
  documentId: z.string().trim().min(1),
});

export const rejectHrEmployeeDocumentFormSchema = z.object({
  documentId: z.string().trim().min(1),
  rejectionReason: z.string().trim().min(1),
});

export const replaceHrEmployeeDocumentFormSchema = z.object({
  documentId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  blobUrl: z.string().trim().min(1),
  pathname: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  sizeBytes: z.coerce.number().int().positive(),
  effectiveTo: z.coerce.date().nullable().optional(),
});

export const upsertHrDocumentRetentionPolicyFormSchema = z.object({
  documentType: z.string().trim().optional(),
  documentGroup: z.string().trim().optional(),
  retentionDays: z.coerce.number().int().positive(),
  archiveOnSeparation: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

export const recordHrDocumentAcknowledgmentFormSchema = z.object({
  employeeId: z.string().trim().min(1),
  policyKey: z.string().trim().min(1),
  policyVersion: z.string().trim().min(1),
  acknowledgmentMethod: z.string().trim().min(1),
  employeeDocumentId: z.string().trim().optional(),
});
