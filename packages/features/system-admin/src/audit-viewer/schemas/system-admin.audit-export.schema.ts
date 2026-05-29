import { z } from "zod";

export const systemAdminAuditExportFormatSchema = z.enum([
  "csv",
  "json",
  "xlsx",
  "pdf",
]);

export type SystemAdminAuditExportFormat = z.infer<
  typeof systemAdminAuditExportFormatSchema
>;
