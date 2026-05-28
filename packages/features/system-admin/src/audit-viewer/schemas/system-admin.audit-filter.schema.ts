import { z } from "zod";

const auditEntityTypeSchema = z.enum([
  "organization",
  "membership",
  "user-profile",
  "erp-record",
  "workflow-item",
  "saved-view",
  "document",
  "system",
]);

export const systemAdminAuditSearchParamsSchema = z.object({
  auditQ: z.string().trim().max(200).optional(),
  auditActor: z.string().trim().max(120).optional(),
  auditAction: z.string().trim().max(160).optional(),
  auditTargetType: auditEntityTypeSchema.optional(),
  auditModule: z.string().trim().max(80).optional(),
  auditFrom: z.string().trim().max(40).optional(),
  auditTo: z.string().trim().max(40).optional(),
  auditPage: z.coerce.number().int().min(1).default(1),
  auditPageSize: z.coerce.number().int().min(10).max(100).default(25),
  auditId: z.string().trim().min(1).optional(),
});

export type SystemAdminAuditSearchParams = z.infer<
  typeof systemAdminAuditSearchParamsSchema
>;
