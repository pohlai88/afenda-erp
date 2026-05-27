import { z } from "zod";

export const AFENDA_SESSION_COOKIE = "afenda-dev-session";
export const DEV_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

/** Canonical demo tenant identifiers for dev cookie sessions. */
export const DEMO_USER_ID = "user_demo_owner";
export const DEMO_ORG_ID = "org_afenda_demo";
export const DEMO_ORG_NAME = "Afenda Operations";
export const DEMO_USER_NAME = "Demo Operator";
export const DEMO_USER_EMAIL = "owner@afenda.local";

export const appCapabilities = [
  "dashboard.view",
  "finance.view",
  "finance.documents.read",
  "finance.documents.write",
  "sales.view",
  "sales.documents.read",
  "sales.documents.write",
  "purchasing.view",
  "purchasing.documents.read",
  "purchasing.documents.write",
  "inventory.view",
  "inventory.documents.read",
  "inventory.documents.write",
  "hr.view",
  "hr.documents.read",
  "hr.documents.write",
  "crm.view",
  "crm.documents.read",
  "crm.documents.write",
  "approvals.view",
  "approvals.documents.read",
  "approvals.documents.write",
  "reports.view",
  "reports.documents.read",
  "reports.documents.write",
  "admin.view",
  "admin.documents.read",
  "admin.documents.write",
] as const;

export const organizationRoles = [
  "owner",
  "admin",
  "finance-manager",
  "operations-manager",
  "staff",
  "viewer",
] as const;

export type AppCapability = (typeof appCapabilities)[number];
export type OrganizationRole = (typeof organizationRoles)[number];

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
  capabilities: AppCapability[];
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
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  role: organizationRoleSchema,
  capabilities: z.array(capabilitySchema),
});

export const userSessionSchema = z.object({
  source: z.enum(["dev", "neon"]),
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  activeOrganizationId: z.string(),
  organizations: z.array(organizationSummarySchema),
});

export const devSignInSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
  organizationName: z.string().trim().min(1).max(120),
});

export const credentialsSignInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const credentialsSignUpSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const organizationOnboardingSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
});

const roleCapabilities: Record<OrganizationRole, AppCapability[]> = {
  owner: [...appCapabilities],
  admin: [...appCapabilities],
  "finance-manager": [
    "dashboard.view",
    "finance.view",
    "finance.documents.read",
    "finance.documents.write",
    "sales.view",
    "sales.documents.read",
    "purchasing.view",
    "purchasing.documents.read",
    "reports.view",
    "reports.documents.read",
    "approvals.view",
    "approvals.documents.read",
  ],
  "operations-manager": [
    "dashboard.view",
    "sales.view",
    "sales.documents.read",
    "sales.documents.write",
    "purchasing.view",
    "purchasing.documents.read",
    "purchasing.documents.write",
    "inventory.view",
    "inventory.documents.read",
    "inventory.documents.write",
    "crm.view",
    "crm.documents.read",
    "approvals.view",
    "approvals.documents.read",
    "reports.view",
    "reports.documents.read",
  ],
  staff: [
    "dashboard.view",
    "sales.view",
    "sales.documents.read",
    "sales.documents.write",
    "purchasing.view",
    "purchasing.documents.read",
    "purchasing.documents.write",
    "inventory.view",
    "inventory.documents.read",
    "inventory.documents.write",
    "crm.view",
    "crm.documents.read",
    "approvals.view",
    "approvals.documents.read",
  ],
  viewer: ["dashboard.view", "reports.view", "reports.documents.read"],
};

export function capabilitiesForRole(role: OrganizationRole) {
  return [...roleCapabilities[role]];
}

const documentCapabilityModules = new Set([
  "finance",
  "sales",
  "purchasing",
  "inventory",
  "hr",
  "crm",
  "approvals",
  "reports",
  "admin",
]);

export function documentReadCapability(
  moduleId: string,
): AppCapability | null {
  const cap = `${moduleId}.documents.read`;
  if (isAppCapability(cap)) {
    return cap;
  }

  return null;
}

export function documentWriteCapability(
  moduleId: string,
): AppCapability | null {
  const cap = `${moduleId}.documents.write`;
  if (isAppCapability(cap)) {
    return cap;
  }

  return null;
}

export function hasDocumentReadAccess(
  capabilities: readonly AppCapability[],
  moduleId: string,
): boolean {
  if (!documentCapabilityModules.has(moduleId)) {
    return capabilities.some((c) => c === `${moduleId}.view`);
  }

  const readCap = documentReadCapability(moduleId);
  return readCap !== null && capabilities.includes(readCap);
}

export function hasDocumentWriteAccess(
  capabilities: readonly AppCapability[],
  moduleId: string,
): boolean {
  if (!documentCapabilityModules.has(moduleId)) {
    return capabilities.some((c) => c === `${moduleId}.view`);
  }

  const writeCap = documentWriteCapability(moduleId);
  return writeCap !== null && capabilities.includes(writeCap);
}

const appCapabilitySet = new Set<string>(appCapabilities);

export function isAppCapability(value: string): value is AppCapability {
  return appCapabilitySet.has(value);
}

export function normalizeCapabilities(
  values: readonly string[],
  fallbackRole: OrganizationRole,
) {
  const capabilities = values.filter(isAppCapability);

  return capabilities.length > 0
    ? capabilities
    : capabilitiesForRole(fallbackRole);
}

export function normalizeOrganizationSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
