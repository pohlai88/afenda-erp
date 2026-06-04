import { z } from "zod";
import { systemAdminDiagnosticCategorySchema } from "./sys-diagnostics.schema";

export const systemAdminDiagnosticsSearchParamsSchema = z.object({
  diagnosticsCategory: systemAdminDiagnosticCategorySchema.optional(),
});

export type SystemAdminDiagnosticsSearchParams = z.infer<
  typeof systemAdminDiagnosticsSearchParamsSchema
>;
