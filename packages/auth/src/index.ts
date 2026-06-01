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
  "hr.employees.read",
  "hr.employees.write",
  "hr.employees.sensitive.read",
  "hr.documents.read",
  "hr.documents.write",
  "hr.documents.sensitive.read",
  "hr.lifecycle.read",
  "hr.lifecycle.write",
  "hr.org.read",
  "hr.org.write",
  "hr.offboarding.read",
  "hr.offboarding.write",
  "hr.offboarding.sensitive.read",
  "hr.compliance.read",
  "hr.compliance.write",
  "hr.compliance.sensitive.read",
  "hr.benefits.read",
  "hr.benefits.write",
  "hr.benefits.sensitive.read",
  "hr.bonus.read",
  "hr.bonus.write",
  "hr.bonus.sensitive.read",
  "hr.bonus.finance.read",
  "hr.bonus.audit.read",
  "hr.bonus.approve",
  "hr.expense.read",
  "hr.expense.write",
  "hr.expense.approve",
  "hr.expense.finance.read",
  "hr.expense.audit.read",
  "hr.expense.sensitive.read",
  "hr.cpm.read",
  "hr.cpm.write",
  "hr.cpm.approve",
  "hr.mcp.read",
  "hr.mcp.write",
  "hr.mcp.admin",
  "hr.mcp.statutory.admin",
  "hr.mcp.audit.read",
  "hr.sbs.read",
  "hr.sbs.write",
  "hr.sbs.approve",
  "hr.talent.career_path.read",
  "hr.talent.career_path.write",
  "hr.csf.read",
  "hr.csf.write",
  "hr.csf.assess.self",
  "hr.csf.assess.manager",
  "hr.csf.assess.validate",
  "hr.lms.read",
  "hr.lms.write",
  "hr.performance.read",
  "hr.performance.write",
  "hr.performance.approve",
  "hr.performance.calibrate",
  "hr.performance.compensation.read",
  "hr.performance.audit.read",
  "hr.recruitment.read",
  "hr.recruitment.write",
  "hr.recruitment.approve",
  "hr.recruitment.interview.write",
  "hr.recruitment.offer.read",
  "hr.recruitment.offer.write",
  "hr.recruitment.offer.approve",
  "hr.recruitment.onboarding.read",
  "hr.recruitment.onboarding.write",
  "hr.recruitment.finance.read",
  "hr.recruitment.it.read",
  "hr.recruitment.audit.read",
  "hr.recruitment.sensitive.read",
  "hr.recruitment.convert",
  "hr.succession.read",
  "hr.succession.write",
  "hr.succession.approve",
  "hr.succession.audit.read",
  "hr.succession.restricted.read",
  "hr.succession.lifecycle.expose",
  "hr.training.read",
  "hr.training.write",
  "hr.training.approve",
  "hr.training.audit.read",
  "hr.training.restricted.read",
  "hr.training.integration.expose",
  "hr.frm.read",
  "hr.frm.write",
  "hr.frm.approve",
  "hr.frm.audit.read",
  "hr.frm.restricted.read",
  "hr.frm.integration.expose",
  "hr.fhc.read",
  "hr.fhc.write",
  "hr.fhc.approve",
  "hr.fhc.audit.read",
  "hr.fhc.restricted.read",
  "hr.fhc.integration.expose",
  "hr.gpg.read",
  "hr.gpg.write",
  "hr.gpg.approve",
  "hr.gpg.audit.read",
  "hr.gpg.restricted.read",
  "hr.gpg.integration.expose",
  "hr.msc.read",
  "hr.msc.write",
  "hr.msc.approve",
  "hr.msc.audit.read",
  "hr.msc.restricted.read",
  "hr.msc.integration.expose",
  "hr.rws.read",
  "hr.rws.write",
  "hr.rws.approve",
  "hr.rws.audit.read",
  "hr.rws.restricted.read",
  "hr.rws.labor-cost.read",
  "hr.rws.integration.expose",
  "hr.ucb.read",
  "hr.ucb.write",
  "hr.ucb.approve",
  "hr.ucb.audit.read",
  "hr.ucb.restricted.read",
  "hr.ucb.grievance.manage",
  "hr.ucb.legal-reference.read",
  "hr.ucb.payroll.expose",
  "hr.ucb.integration.expose",
  "hr.ucb.report.export",
  "hr.talent.read",
  "hr.talent.write",
  "hr.payroll.read",
  "hr.payroll.write",
  "hr.payroll.approve",
  "hr.payroll.audit.read",
  "hr.payroll.ess.read",
  "hr.leave.read",
  "hr.leave.write",
  "hr.onboarding.read",
  "hr.onboarding.write",
  "hr.attendance.read",
  "hr.attendance.write",
  "hr.fwa.read",
  "hr.fwa.write",
  "hr.frm.read",
  "hr.frm.write",
  "hr.frm.approve",
  "hr.frm.audit.read",
  "hr.frm.restricted.read",
  "hr.frm.integration.expose",
  "hr.fhc.read",
  "hr.fhc.write",
  "hr.fhc.approve",
  "hr.fhc.audit.read",
  "hr.fhc.restricted.read",
  "hr.fhc.integration.expose",
  "hr.geo.read",
  "hr.geo.write",
  "hr.geo.location.detail.read",
  "hr.timeClock.read",
  "hr.timeClock.write",
  "hr.timeClock.admin",
  "hr.overtime.read",
  "hr.overtime.write",
  "hr.shifts.read",
  "hr.shifts.write",
  "crm.view",
  "crm.documents.read",
  "crm.documents.write",
  "approvals.view",
  "approvals.documents.read",
  "approvals.documents.write",
  "reports.view",
  "reports.documents.read",
  "reports.documents.write",
  "system-admin.view",
  "system-admin.documents.read",
  "system-admin.documents.write",
  "system-admin.identity.read",
  "system-admin.identity.write",
  "system-admin.users.read",
  "system-admin.users.manage",
  "system-admin.memberships.read",
  "system-admin.memberships.manage",
  "system-admin.roles.read",
  "system-admin.roles.manage",
  "system-admin.permissions.read",
  "system-admin.permissions.manage",
  "system-admin.modules.read",
  "system-admin.modules.manage",
  "system-admin.capabilities.read",
  "system-admin.capabilities.manage",
  "system-admin.policies.read",
  "system-admin.policies.review",
  "system-admin.policies.manage",
  "system-admin.approvals.read",
  "system-admin.approvals.manage",
  "system-admin.settings.read",
  "system-admin.settings.write",
  "system-admin.audit.read",
  "system-admin.audit.review",
  "system-admin.audit.export",
  "system-admin.security.read",
  "system-admin.security.manage",
  "system-admin.organization.read",
  "system-admin.organization.manage",
  "system-admin.integrations.read",
  "system-admin.integrations.write",
  "system-admin.lynx.read",
  "system-admin.lynx.approve",
  "system-admin.reliability.read",
  "system-admin.billing.read",
  "system-admin.billing.manage",
  "system-admin.billing.export",
  "system-admin.diagnostics.read",

  "hr.rss.read",
  "hr.rss.write",
  "hr.rss.approve",
  "hr.rss.audit.read",
  "hr.rss.restricted.read",
  "hr.rss.integration.expose",
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
  membershipId: string;
  id: string;
  name: string;
  slug: string;
  locale: string;
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
  membershipId: z.string().min(1).default("member_demo_owner"),
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  locale: z.string().min(2).default("en-MY"),
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
  "system-admin",
]);

export function documentReadCapability(moduleId: string): AppCapability | null {
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
