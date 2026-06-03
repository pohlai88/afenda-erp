import { z } from "zod";

import type { OrganizationOperatingContextLabels } from "./auth.operating-context";
import { organizationOperatingContextBrandingSchema } from "./auth.operating-context";
import {
  appCapabilities,
  organizationRoles,
  type AppCapability,
  type OrganizationRole,
} from "./auth.capability-policy.shared";

export type OrganizationSummary = {
  membershipId: string;
  id: string;
  name: string;
  slug: string;
  locale: string;
  role: OrganizationRole;
  capabilities: AppCapability[];
  /** Parsed from `tenant_settings.branding.operatingContext` when present. */
  operatingContextLabels?: OrganizationOperatingContextLabels;
};

export type UserSession = {
  source: "dev" | "neon";
  id: string;
  name: string;
  email: string;
  activeOrganizationId: string;
  organizations: OrganizationSummary[];
};

const organizationRoleSchema = z.enum(organizationRoles);
const capabilitySchema = z.enum(appCapabilities);

export const organizationSummarySchema = z.object({
  membershipId: z.string().min(1).default("member_demo_owner"),
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  locale: z.string().min(2).default("en-MY"),
  role: organizationRoleSchema,
  capabilities: z.array(capabilitySchema),
  operatingContextLabels: organizationOperatingContextBrandingSchema.optional(),
});

export const userSessionSchema = z.object({
  source: z.enum(["dev", "neon"]),
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  activeOrganizationId: z.string(),
  organizations: z.array(organizationSummarySchema),
});
