import { z } from "zod";

export const systemAdminRetentionPolicyActionSchema = z.object({
  entityType: z.enum([
    "organization",
    "membership",
    "user-profile",
    "erp-record",
    "workflow-item",
    "saved-view",
    "document",
    "system",
  ]),
  retentionDays: z.coerce.number().int().min(1).max(3650),
  legalHold: z.enum(["true", "false"]).transform((value) => value === "true"),
});
