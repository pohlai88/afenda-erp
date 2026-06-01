import { z } from "zod";

export const systemAdminDataManagementImportJobStatuses = [
  "uploaded",
  "validating",
  "ready",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;

export const systemAdminDataManagementImportRowStatuses = [
  "pending",
  "validated",
  "applied",
  "failed",
  "skipped",
] as const;

export const systemAdminDataManagementExportJobStatuses = [
  "ready",
  "failed",
  "expired",
] as const;

export const systemAdminImportJobStatusSchema = z.enum(
  systemAdminDataManagementImportJobStatuses,
);

export const systemAdminImportRowStatusSchema = z.enum(
  systemAdminDataManagementImportRowStatuses,
);

export const systemAdminExportJobStatusSchema = z.enum(
  systemAdminDataManagementExportJobStatuses,
);

export const createSystemAdminImportJobSchema = z.object({
  templateId: z.string().min(1),
  sourceLabel: z.string().trim().min(1).max(120),
  filename: z.string().trim().max(180).optional(),
  sourceData: z
    .string()
    .min(1, "Import source data is required.")
    .max(256_000, "Import source data may not exceed 256 KB."),
});

export const systemAdminImportJobCommandSchema = z.object({
  jobId: z.string().min(1),
});

export const exportSystemAdminDataManagementSchema = z.object({
  scope: z.enum(["jobs", "failures", "exports"]).default("jobs"),
});

export type CreateSystemAdminImportJobInput = z.infer<
  typeof createSystemAdminImportJobSchema
>;

export type SystemAdminImportJobCommandInput = z.infer<
  typeof systemAdminImportJobCommandSchema
>;
