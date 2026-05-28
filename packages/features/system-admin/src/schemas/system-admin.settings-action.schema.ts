import { z } from "zod";

export const systemAdminTenantSettingsActionSchema = z.object({
  timezone: z.string().min(1).max(64),
  locale: z.string().min(2).max(16),
  currency: z.string().length(3),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12),
  dataRegion: z.string().min(2).max(32),
  zdrEnabled: z.enum(["true", "false"]).transform((value) => value === "true"),
});
