/**
 * Generates index.ts, client.ts, server.ts, metadata.ts per system-admin vertical slice.
 * Run: pnpm exec tsx packages/features/system-admin/scripts/sync-slice-doors.mts
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "..",
);
const srcDir = path.join(root, "packages/features/system-admin/src");

const slices = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const templateBuckets = [
  "actions",
  "components",
  "contracts",
  "data",
  "events",
  "policies",
  "schemas",
  "tests",
] as const;

function exists(rel: string) {
  return fs.existsSync(path.join(srcDir, rel));
}

function readText(rel: string) {
  return fs.readFileSync(path.join(srcDir, rel), "utf8");
}

function write(rel: string, content: string) {
  const full = path.join(srcDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

function bucketIndexIsPlaceholder(content: string) {
  return /export\s*\{\s*\}\s*;/.test(content) && content.length < 200;
}

function ensureBucketIndex(slice: string, bucket: string) {
  const dir = path.join(srcDir, slice, bucket);
  if (!fs.existsSync(dir)) return;
  const indexPath = path.join(dir, "index.ts");
  if (fs.existsSync(indexPath)) {
    const existing = fs.readFileSync(indexPath, "utf8");
    if (!bucketIndexIsPlaceholder(existing)) return;
  }
  if (bucket === "tests") {
    write(`${slice}/tests/.gitkeep`, "");
    write(
      `${slice}/tests/index.ts`,
      `/** @afenda-bucket tests */\nexport {};\n`,
    );
    return;
  }
  write(
    `${slice}/${bucket}/index.ts`,
    `/** @afenda-bucket ${bucket} — barrel placeholder; add exports as the slice grows. */\nexport {};\n`,
  );
}

function clientComponentModules(slice: string): string[] {
  const compDir = path.join(srcDir, slice, "components");
  if (!fs.existsSync(compDir)) return [];
  return fs
    .readdirSync(compDir)
    .filter((file) => /\.component\.client\.tsx?$/.test(file))
    .map((file) => `./components/${file.replace(/\.tsx?$/, "")}`)
    .sort();
}

function metadataBody(slice: string): string {
  const header = `/**
 * Governed metadata door — system-admin/${slice}
 * List surfaces, surface keys, and metadata-only copy. No tenant I/O.
 */\n`;

  if (slice === "overview") {
    return `${header}export * from "./surfaces";
export {
  getSystemAdminSurfaceKeys,
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiUsageSurfaceKey,
  systemAdminApiCredentialsSurfaceKey,
  systemAdminApprovalsSurfaceKey,
  systemAdminAuditViewerSurfaceKey,
  systemAdminBillingSurfaceKey,
  systemAdminCapabilitiesSurfaceKey,
  systemAdminCronSurfaceKey,
  systemAdminReliabilityOperationalLinksSurfaceKey,
  systemAdminReliabilitySurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
  systemAdminGatewaySpendSurfaceKey,
  systemAdminUsersSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminModulesSurfaceKey,
  systemAdminOrganizationSurfaceKey,
  systemAdminPermissionsSurfaceKey,
  systemAdminRolesSurfaceKey,
  systemAdminPoliciesSurfaceKey,
  systemAdminRetentionSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
  systemAdminSecuritySurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "./surfaces/system-admin.surface-keys.shared";
`;
  }

  if (slice === "lynx") {
    return `${header}export * from "./surface";
`;
  }

  if (slice === "capabilities") {
    return `${header}export * from "./surface";
`;
  }

  if (slice === "modules") {
    return `${header}export * from "./surface";
`;
  }

  if (slice === "organization") {
    return `${header}export * from "./surface";
`;
  }

  if (slice === "roles") {
    return `${header}export * from "./surface";
`;
  }

  if (slice === "policies") {
    return `${header}export * from "./surface";
`;
  }

  if (slice === "memberships") {
    return `${header}export { buildMembersListSurface } from "./surface/system-admin.memberships-list.surface";
export { systemAdminMembershipsUiCopy } from "./surface/system-admin.memberships-ui.copy.shared";
export { systemAdminMembershipsGalleryRows } from "./surface/system-admin.memberships-gallery.fixtures.shared";
`;
  }

  if (slice === "tenant-execution") {
    return `${header}export type { SystemAdminActionResult } from "./contracts/system-admin.action-result.contract";
`;
  }

  if (exists(`${slice}/surface/index.ts`)) {
    return `${header}export * from "./surface";
`;
  }

  if (exists(`${slice}/surface`)) {
    const files = fs
      .readdirSync(path.join(srcDir, slice, "surface"))
      .filter((f) => f.endsWith(".ts") && f !== "index.ts");
    if (files.length > 0) {
      const exports = files
        .map((f) => `export * from "./surface/${f.replace(/\.ts$/, "")}";`)
        .join("\n");
      return `${header}${exports}\n`;
    }
  }

  return `${header}export {};\n`;
}

function serverBody(slice: string): string {
  const lines = [
    `/**`,
    ` * Server door — system-admin/${slice}`,
    ` * Actions, queries, policies, and server components.`,
    ` */`,
  ];

  const buckets = ["actions", "data", "events", "policies", "schemas", "contracts"] as const;
  for (const b of buckets) {
    if (exists(`${slice}/${b}/index.ts`) || exists(`${slice}/${b}`)) {
      lines.push(`export * from "./${b}";`);
    }
  }

  if (exists(`${slice}/components/index.ts`)) {
    lines.push(`export * from "./components";`);
  } else if (exists(`${slice}/components`)) {
    for (const f of fs.readdirSync(path.join(srcDir, slice, "components"))) {
      if (f.endsWith(".component.server.tsx")) {
        const mod = f.replace(/\.tsx$/, "");
        lines.push(`export * from "./components/${mod}";`);
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

function clientBody(slice: string): string {
  const modules = clientComponentModules(slice);
  const lines = [
    `/**`,
    ` * Client door — system-admin/${slice}`,
    ` * Browser-safe components and catalogs only.`,
    ` */`,
  ];

  if (modules.length === 0) {
    lines.push(`export {};`);
    return `${lines.join("\n")}\n`;
  }

  for (const mod of modules) {
    lines.push(`export * from "${mod}";`);
  }
  return `${lines.join("\n")}\n`;
}

function indexBody(slice: string): string {
  const parts = [`export * from "./metadata";`, `export * from "./client";`];
  for (const b of ["contracts", "schemas"] as const) {
    if (exists(`${slice}/${b}`)) parts.push(`export * from "./${b}";`);
  }
  return `/**
 * Environment-neutral door — system-admin/${slice}
 * Buckets: actions, components, contracts, data, events, policies, schemas, surface, tests
 */
${parts.join("\n")}
`;
}

for (const slice of slices) {
  for (const bucket of templateBuckets) {
    if (exists(`${slice}/${bucket}`)) ensureBucketIndex(slice, bucket);
  }

  write(`${slice}/metadata.ts`, metadataBody(slice));
  write(`${slice}/server.ts`, serverBody(slice));
  write(`${slice}/client.ts`, clientBody(slice));
  write(`${slice}/index.ts`, indexBody(slice));
}

const packageMetadata = `import { createModuleFeatureMetadata } from "@afenda/kernel";

export const {
  moduleId,
  buildRecordListSurface,
  buildWorkItemListSurface,
  buildCountStatGrid,
  buildStatGrid,
  buildOverviewStatGrid,
  buildSavedViewsListSurface,
  buildDocumentRegistryListSurface,
  buildRecordDetailTabs,
  buildWorkItemDetailTabs,
  buildWorkItemKanbanSurface,
  getListSurfaceKeys,
  getOverviewStatSurfaceKey,
  getStatSurfaceKey,
  getWorkItemKanbanSurfaceKey,
} = createModuleFeatureMetadata("system-admin");

${slices.map((s) => `export * from "./${s}/metadata";`).join("\n")}
`;

const packageServer = `/**
 * Server-only exports for @afenda/feature-system-admin.
 */
import "@afenda/kernel/server";
import "./tenant-execution/policies/register-tenant-execution-policies.server";

export * from "./metadata";

${slices.map((s) => `export * from "./${s}/server";`).join("\n")}
`;

const packageClient = `/**
 * Client-safe exports for @afenda/feature-system-admin.
 */

${slices
  .filter((s) => s !== "tenant-execution")
  .map((s) => `export * from "./${s}/client";`)
  .join("\n")}

export { systemAdminRoutePaths } from "./overview/contracts/system-admin.route-paths.contract";
export {
  isSystemAdminApiScope,
  isSystemAdminWebhookEvent,
  systemAdminApiScopes,
  systemAdminWebhookEvents,
  systemAdminDefaultWebhookEventPresets,
  type SystemAdminApiScope,
  type SystemAdminWebhookEvent,
} from "./integrations/contracts/system-admin.integrations-catalog.contract";
export {
  isSystemAdminPermissionKey,
  systemAdminPermissionCatalog,
  type SystemAdminCatalogOption,
} from "./permissions/contracts/system-admin.permission-catalog.contract";
export {
  isSystemAdminDeprecatedPermissionKey,
  requiresElevatedPermissionConfirmation,
  requiresHighRiskPermissionConfirmation,
  resolveSystemAdminPermissionRiskLevel,
} from "./permissions/contracts/system-admin.permission-risk.shared";
export {
  getSystemAdminLynxOutcomeMonitorThresholdCatalog,
  systemAdminLynxOutcomeMonitorThresholdCatalog,
  type SystemAdminLynxOutcomeMonitorId,
  type SystemAdminLynxOutcomeMonitorThresholdKey,
} from "./lynx/contracts/system-admin.lynx-outcome-monitor-catalog.contract";
export type { SystemAdminActionResult } from "./tenant-execution/contracts/system-admin.action-result.contract";
export type {
  CreateApiCredentialActionData,
  CreateWebhookActionData,
} from "./integrations/contracts/system-admin.integrations-action-dtos.contract";
export type { InviteMemberActionData } from "./memberships/contracts/system-admin.memberships-action-dtos.contract";
export type { OrganizationSecuritySettings } from "./security/contracts/system-admin.security-settings.contract";
export type {
  SecurityReadinessReport,
  SecurityReadinessVerdict,
} from "./security/contracts/system-admin.security-readiness.contract";
export type { OrganizationDefaultsFormDefaults } from "./organization/components/system-admin.organization-defaults-form.component.client";
`;

const packageIndex = `export * from "./metadata";
export { systemAdminRoutePaths } from "./overview/contracts/system-admin.route-paths.contract";
export {
  resolveSystemAdminNavItems,
  systemAdminNavItems,
  type SystemAdminNavItem,
} from "./overview/contracts/system-admin.nav.contract";
`;

write("metadata.ts", packageMetadata);
write("server.ts", packageServer);
write("client.ts", packageClient);
write("index.ts", packageIndex);

console.log(`[sync-slice-doors] Updated ${slices.length} slices and package doors.`);
