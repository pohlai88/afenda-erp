import { z } from "zod";

export const systemAdminReadinessSchema = z.enum([
  "preview",
  "active",
  "blocked",
  "deprecated",
]);

const booleanFormSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const systemAdminModuleSettingsActionSchema = z.object({
  moduleKey: z.string().trim().min(1).max(80),
  enabled: booleanFormSchema,
  visible: booleanFormSchema,
  readiness: systemAdminReadinessSchema,
});
