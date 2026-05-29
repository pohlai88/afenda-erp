import { z } from "zod";

const booleanFormSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const systemAdminOrganizationDefaultsActionSchema = z.object({
  timezone: z.string().min(1).max(64),
  locale: z.string().min(2).max(16),
  currency: z.string().length(3),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12),
  documentPrefix: z.string().trim().min(1).max(16),
  numberingPrefix: z.string().trim().min(1).max(16),
  dataRegion: z.string().min(2).max(32),
  zdrEnabled: booleanFormSchema,
});
