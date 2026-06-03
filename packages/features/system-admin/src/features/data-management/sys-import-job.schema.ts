import { z } from "zod";
import {
  SYSTEM_ADMIN_IMPORT_FILENAME_MAX_LENGTH,
  SYSTEM_ADMIN_IMPORT_SOURCE_DATA_MAX_BYTES,
  SYSTEM_ADMIN_IMPORT_SOURCE_LABEL_MAX_LENGTH,
} from "../contracts/system-admin.data-management.limits.shared";

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
  templateId: z.string().trim().min(1),
  sourceLabel: z
    .string()
    .trim()
    .min(1)
    .max(SYSTEM_ADMIN_IMPORT_SOURCE_LABEL_MAX_LENGTH),
  filename: z
    .string()
    .trim()
    .max(SYSTEM_ADMIN_IMPORT_FILENAME_MAX_LENGTH)
    .optional(),
  sourceData: z
    .string()
    .min(1, "Import source data is required.")
    .max(
      SYSTEM_ADMIN_IMPORT_SOURCE_DATA_MAX_BYTES,
      "Import source data may not exceed 256 KB.",
    ),
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
