import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { seedPermissionCatalog } from "../src/permissions";

const packageDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(packageDir, "../../..");

config({ path: resolve(rootDir, ".env.local") });
config({ path: resolve(rootDir, ".env.config"), override: false });

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
    key: "system-admin.audit.export",
    module: "system-admin",
    label: "Export audit log",
    description: "Export audit evidence for compliance review.",
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
    key: "system-admin.machine-layer.read",
    module: "system-admin",
    label: "Read machine layer ops",
    description: "View AI usage, approvals, sandboxes, and Lynx eval state.",
  },
  {
    key: "system-admin.machine-layer.approve",
    module: "system-admin",
    label: "Approve machine actions",
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
