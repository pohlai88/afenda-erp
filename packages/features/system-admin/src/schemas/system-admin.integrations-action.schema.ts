import { z } from "zod";

export const systemAdminApiCredentialActionSchema = z.object({
  label: z.string().trim().min(1).max(120),
  scopes: z.string().trim().min(1),
});

export const systemAdminWebhookActionSchema = z.object({
  label: z.string().trim().min(1).max(120),
  url: z.url(),
  eventFilters: z.string().trim().min(1),
});

export const systemAdminSsoConnectionActionSchema = z.object({
  provider: z.string().trim().min(1).max(64),
  idpMetadataUrl: z.string().url().optional().or(z.literal("")),
  audience: z.string().trim().max(256).optional().or(z.literal("")),
  enabled: z.enum(["true", "false"]).transform((value) => value === "true"),
});
