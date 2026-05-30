import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { seedPermissionCatalog } from "../src/permissions";

const packageDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(packageDir, "../../..");

config({ path: resolve(rootDir, ".env.local") });
config({ path: resolve(rootDir, ".env.config"), override: false });
config({ path: resolve(rootDir, ".secret.config"), override: true });

const seedDatabaseUrl =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.NEON_PREVIEW_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!seedDatabaseUrl) {
  throw new Error(
    "A database URL is missing. Provide DATABASE_URL, NEON_PREVIEW_DATABASE_URL, or DATABASE_MIGRATION_URL before seeding permissions.",
  );
}

process.env.DATABASE_URL = seedDatabaseUrl;

const permissionCatalog = [
  {
    key: "dashboard.view",
    module: "dashboard",
    label: "View dashboard",
    description: "Read cross-module operating metrics and workspace summaries.",
  },
  {
    key: "finance.view",
    module: "finance",
    label: "View finance",
    description:
      "Read finance controls, receivables, payables, and close state.",
  },
  {
    key: "sales.view",
    module: "sales",
    label: "View sales",
    description:
      "Read quotes, orders, revenue blockers, and commercial handoffs.",
  },
  {
    key: "purchasing.view",
    module: "purchasing",
    label: "View purchasing",
    description:
      "Read supplier, purchase order, receipt, and spend-control state.",
  },
  {
    key: "inventory.view",
    module: "inventory",
    label: "View inventory",
    description:
      "Read stock health, locations, movement exceptions, and replenishment state.",
  },
  {
    key: "hr.view",
    module: "hr",
    label: "View HR",
    description:
      "Read people operations summaries and workforce exception state.",
  },
  {
    key: "hr.employees.read",
    module: "hr",
    label: "View workforce employees",
    description:
      "Read employee master profiles, directory registers, and assignment history.",
  },
  {
    key: "hr.employees.write",
    module: "hr",
    label: "Manage workforce employees",
    description:
      "Create, update, archive employees and record placement assignments.",
  },
  {
    key: "hr.employees.sensitive.read",
    module: "hr",
    label: "View sensitive employee fields",
    description:
      "Read masked-sensitive employee contact and identity fields in master profiles.",
  },
  {
    key: "hr.documents.read",
    module: "hr",
    label: "View HR documents",
    description: "Read employee document vault metadata and verification state.",
  },
  {
    key: "hr.documents.write",
    module: "hr",
    label: "Manage HR documents",
    description:
      "Register, verify, and archive employee document metadata in the vault.",
  },
  {
    key: "hr.documents.sensitive.read",
    module: "hr",
    label: "View sensitive HR documents",
    description:
      "Read confidential or restricted document titles and download protected artifacts.",
  },
  {
    key: "hr.lifecycle.read",
    module: "hr",
    label: "View HR lifecycle",
    description:
      "Read employment lifecycle overview, events, and pending transitions.",
  },
  {
    key: "hr.lifecycle.write",
    module: "hr",
    label: "Manage HR lifecycle",
    description:
      "Record status changes, probation outcomes, and employee movements.",
  },
  {
    key: "hr.org.read",
    module: "hr",
    label: "View HR organization",
    description:
      "Read organization units, positions, reporting lines, and org chart structure.",
  },
  {
    key: "hr.org.write",
    module: "hr",
    label: "Manage HR organization",
    description:
      "Create and update organization units, positions, and reporting relationships.",
  },
  {
    key: "hr.offboarding.read",
    module: "hr",
    label: "View HR offboarding",
    description: "Read offboarding cases and exit workflow status.",
  },
  {
    key: "hr.offboarding.write",
    module: "hr",
    label: "Manage HR offboarding",
    description: "Start, complete, and cancel employee offboarding cases.",
  },
  {
    key: "hr.compliance.read",
    module: "hr",
    label: "View HR compliance",
    description: "Read compliance obligations and exception queues.",
  },
  {
    key: "hr.compliance.write",
    module: "hr",
    label: "Manage HR compliance",
    description:
      "Register obligations, log exceptions, and resolve compliance items.",
  },
  {
    key: "hr.compliance.sensitive.read",
    module: "hr",
    label: "View sensitive HR compliance records",
    description:
      "Read identity numbers, restricted evidence titles, and sensitive compliance review notes.",
  },
  {
    key: "hr.leave.read",
    module: "hr",
    label: "View HR leave",
    description: "Read employee leave requests and approval status.",
  },
  {
    key: "hr.leave.write",
    module: "hr",
    label: "Manage HR leave",
    description: "Submit, approve, reject, and cancel leave requests.",
  },
  {
    key: "hr.onboarding.read",
    module: "hr",
    label: "View HR onboarding",
    description: "Read onboarding cases and checklist progress.",
  },
  {
    key: "hr.onboarding.write",
    module: "hr",
    label: "Manage HR onboarding",
    description: "Start, complete checklist items, and close onboarding cases.",
  },
  {
    key: "hr.attendance.read",
    module: "hr",
    label: "View HR attendance",
    description: "Read employee clock-in and clock-out punches.",
  },
  {
    key: "hr.attendance.write",
    module: "hr",
    label: "Manage HR attendance",
    description: "Record and void attendance punches with idempotent keys.",
  },
  {
    key: "hr.overtime.read",
    module: "hr",
    label: "View HR overtime",
    description: "Read employee overtime requests and approval status.",
  },
  {
    key: "hr.overtime.write",
    module: "hr",
    label: "Manage HR overtime",
    description: "Submit, approve, reject, and cancel overtime requests.",
  },
  {
    key: "hr.shifts.read",
    module: "hr",
    label: "View HR shifts",
    description: "Read shift templates and employee shift assignments.",
  },
  {
    key: "hr.shifts.write",
    module: "hr",
    label: "Manage HR shifts",
    description: "Create templates, schedule shifts, publish, and cancel assignments.",
  },
  {
    key: "crm.view",
    module: "crm",
    label: "View CRM",
    description: "Read accounts, contacts, leads, and activity coverage.",
  },
  {
    key: "approvals.view",
    module: "approvals",
    label: "View approvals",
    description: "Read approval queues, escalations, and decision trails.",
  },
  {
    key: "reports.view",
    module: "reports",
    label: "View reports",
    description:
      "Read saved views, exports, snapshots, and report freshness state.",
  },
  {
    key: "system-admin.view",
    module: "system-admin",
    label: "View system admin hub",
    description: "Access the tenant governance hub and navigation.",
  },
  {
    key: "system-admin.documents.read",
    module: "system-admin",
    label: "Read system admin documents",
    description: "Read governance documents attached to the system-admin module.",
  },
  {
    key: "system-admin.documents.write",
    module: "system-admin",
    label: "Manage system admin documents",
    description: "Upload and update governance documents for system-admin.",
  },
  {
    key: "system-admin.identity.read",
    module: "system-admin",
    label: "Read identity",
    description: "View members, roles, invitations, and permission matrix.",
  },
  {
    key: "system-admin.identity.write",
    module: "system-admin",
    label: "Manage identity",
    description: "Invite members, change roles, and edit role overrides.",
  },
  {
    key: "system-admin.users.read",
    module: "system-admin",
    label: "Read users",
    description: "View user access state and invitation coverage.",
  },
  {
    key: "system-admin.users.manage",
    module: "system-admin",
    label: "Manage users",
    description: "Invite, deactivate, and review organization users.",
  },
  {
    key: "system-admin.memberships.read",
    module: "system-admin",
    label: "Read memberships",
    description: "View organization membership and team assignment state.",
  },
  {
    key: "system-admin.memberships.manage",
    module: "system-admin",
    label: "Manage memberships",
    description: "Update organization membership and access assignments.",
  },
  {
    key: "system-admin.roles.read",
    module: "system-admin",
    label: "Read roles",
    description: "View role catalog, assignments, and role override state.",
  },
  {
    key: "system-admin.roles.manage",
    module: "system-admin",
    label: "Manage roles",
    description: "Assign roles and update tenant role overrides.",
  },
  {
    key: "system-admin.permissions.read",
    module: "system-admin",
    label: "Read permissions",
    description: "View the permission catalog and role coverage matrix.",
  },
  {
    key: "system-admin.permissions.manage",
    module: "system-admin",
    label: "Manage permissions",
    description: "Configure tenant permission overrides and bundles.",
  },
  {
    key: "system-admin.modules.read",
    module: "system-admin",
    label: "Read modules",
    description: "View module availability, readiness, and visibility settings.",
  },
  {
    key: "system-admin.modules.manage",
    module: "system-admin",
    label: "Manage modules",
    description: "Update tenant module visibility and readiness settings.",
  },
  {
    key: "system-admin.capabilities.read",
    module: "system-admin",
    label: "Read capabilities",
    description: "Inspect execution capability metadata and route coverage.",
  },
  {
    key: "system-admin.capabilities.manage",
    module: "system-admin",
    label: "Manage capabilities",
    description: "Configure tenant capability visibility and availability.",
  },
  {
    key: "system-admin.policies.read",
    module: "system-admin",
    label: "Read policies",
    description: "View tenant policy rules and enforcement posture.",
  },
  {
    key: "system-admin.policies.review",
    module: "system-admin",
    label: "Review policies",
    description:
      "Inspect policy coverage, readiness, and execution-law detail without mutating rules.",
  },
  {
    key: "system-admin.policies.manage",
    module: "system-admin",
    label: "Manage policies",
    description: "Update tenant policy rules evaluated by the execution kernel.",
  },
  {
    key: "system-admin.approvals.read",
    module: "system-admin",
    label: "Read approvals",
    description: "View approval configuration and escalation posture.",
  },
  {
    key: "system-admin.approvals.manage",
    module: "system-admin",
    label: "Manage approvals",
    description: "Update tenant approval chains and escalation settings.",
  },
  {
    key: "system-admin.settings.read",
    module: "system-admin",
    label: "Read tenant settings",
    description: "View locale, timezone, branding, and data-handling policy.",
  },
  {
    key: "system-admin.settings.write",
    module: "system-admin",
    label: "Manage tenant settings",
    description: "Update tenant profile and operational settings.",
  },
  {
    key: "system-admin.audit.read",
    module: "system-admin",
    label: "Read audit log",
    description: "Browse tenant audit events and governance trails.",
  },
  {
    key: "system-admin.audit.review",
    module: "system-admin",
    label: "Review audit evidence",
    description:
      "Investigate audit timelines, retention posture, and coverage gaps.",
  },
  {
    key: "system-admin.audit.export",
    module: "system-admin",
    label: "Export audit log",
    description: "Export audit evidence for compliance review.",
  },
  {
    key: "system-admin.security.read",
    module: "system-admin",
    label: "Read security",
    description: "View tenant security posture and sensitive action policy.",
  },
  {
    key: "system-admin.security.manage",
    module: "system-admin",
    label: "Manage security",
    description: "Update tenant MFA, session, and trusted domain policy.",
  },
  {
    key: "system-admin.organization.read",
    module: "system-admin",
    label: "Read organization settings",
    description: "View organization profile, locale, calendar, and numbering defaults.",
  },
  {
    key: "system-admin.organization.manage",
    module: "system-admin",
    label: "Manage organization settings",
    description: "Update organization operating defaults and document prefixes.",
  },
  {
    key: "system-admin.integrations.read",
    module: "system-admin",
    label: "Read integrations",
    description: "View API credentials, webhooks, and SSO configuration.",
  },
  {
    key: "system-admin.integrations.write",
    module: "system-admin",
    label: "Manage integrations",
    description: "Rotate API keys, register webhooks, and update SSO config.",
  },
  {
    key: "system-admin.lynx.read",
    module: "system-admin",
    label: "Read Lynx governance",
    description: "View AI usage, approvals, sandboxes, and Lynx eval state.",
  },
  {
    key: "system-admin.lynx.approve",
    module: "system-admin",
    label: "Approve Lynx actions",
    description: "Approve or reject AI action sandboxes and proposals.",
  },
  {
    key: "system-admin.reliability.read",
    module: "system-admin",
    label: "Read reliability",
    description: "View cron health, workflow sweeps, and observability drain.",
  },
  {
    key: "system-admin.billing.read",
    module: "system-admin",
    label: "Read billing",
    description: "View marketplace usage and billing posture.",
  },
  {
    key: "system-admin.billing.manage",
    module: "system-admin",
    label: "Manage billing",
    description: "Update billing contacts and commercial metadata.",
  },
  {
    key: "system-admin.billing.export",
    module: "system-admin",
    label: "Export billing",
    description: "Export billing summary for audit and finance review.",
  },
  {
    key: "system-admin.diagnostics.read",
    module: "system-admin",
    label: "Read diagnostics",
    description: "View configuration drift, coverage, reliability, and spend posture.",
  },
] as const;

const roleCapabilities = {
  owner: permissionCatalog.map((permission) => permission.key),
  admin: permissionCatalog.map((permission) => permission.key),
  "finance-manager": [
    "dashboard.view",
    "finance.view",
    "sales.view",
    "purchasing.view",
    "reports.view",
    "approvals.view",
  ],
  "operations-manager": [
    "dashboard.view",
    "sales.view",
    "purchasing.view",
    "inventory.view",
    "crm.view",
    "approvals.view",
    "reports.view",
  ],
  staff: [
    "dashboard.view",
    "sales.view",
    "purchasing.view",
    "inventory.view",
    "crm.view",
    "approvals.view",
  ],
  viewer: ["dashboard.view", "reports.view"],
} as const;

const rolePermissionRows = Object.entries(roleCapabilities).flatMap(
  ([role, permissionKeys]) =>
    permissionKeys.map((permissionKey) => ({
      role: role as keyof typeof roleCapabilities,
      permissionKey,
    })),
);

await seedPermissionCatalog({
  permissions: permissionCatalog,
  rolePermissions: rolePermissionRows,
});

process.stdout.write("Permission catalog seeded.\n");
