import { z } from "zod";
import { systemAdminDiagnosticCategorySchema } from "./system-admin.diagnostics.schema";

export const systemAdminDiagnosticsSearchParamsSchema = z.object({
  diagnosticsCategory: systemAdminDiagnosticCategorySchema.optional(),
});

export type SystemAdminDiagnosticsSearchParams = z.infer<
  typeof systemAdminDiagnosticsSearchParamsSchema
>;
