import {
  buildDiagnosticsListSurface,
  getBillingPostureSnapshot,
  getCronHealthSurfaceRows,
  listTenantModuleSettings,
  requireSystemAdminDiagnosticsRead,
  systemAdminDiagnosticsSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { listExecutionCapabilities } from "@afenda/kernel/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnostics — System admin",
  description: "Configuration drift, permission coverage, reliability, and spend posture.",
};

export default async function SystemAdminDiagnosticsPage() {
  const { organization } = await requireSystemAdminDiagnosticsRead();
  const [moduleSettings, cronRows, billing] = await Promise.all([
    listTenantModuleSettings({ organizationId: organization.id, limit: 100 }),
    getCronHealthSurfaceRows(),
    getBillingPostureSnapshot({ organizationId: organization.id }),
  ]);
  const capabilities = listExecutionCapabilities();
  const inactiveModules = moduleSettings.filter(
    (setting) => !setting.enabled || !setting.visible,
  );
  const blockedPolicies = moduleSettings.filter(
    (setting) => setting.readiness === "blocked",
  );

  const diagnostics = [
    {
      id: "inactive-modules",
      check: "Inactive modules",
      status: inactiveModules.length > 0 ? "watch" : "clear",
      detail: `${inactiveModules.length} module settings are disabled or hidden.`,
    },
    {
      id: "capability-coverage",
      check: "Capability coverage",
      status: capabilities.length > 0 ? "clear" : "blocked",
      detail: `${capabilities.length} execution capabilities are declared.`,
    },
    {
      id: "policy-drift",
      check: "Policy drift",
      status: blockedPolicies.length > 0 ? "watch" : "clear",
      detail: `${blockedPolicies.length} module settings are blocked.`,
    },
    {
      id: "cron-state",
      check: "Cron state",
      status: cronRows.some((row) => row.status === "failed") ? "watch" : "clear",
      detail: `${cronRows.length} cron routes are configured.`,
    },
    {
      id: "gateway-spend",
      check: "Gateway spend posture",
      status: billing.gatewaySpendAvailable ? "clear" : "watch",
      detail: billing.gatewaySpendAvailable
        ? `${billing.gatewaySpendEntryCount} spend entries available.`
        : "Gateway spend report is not available.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Diagnostics"
        description="Operational evidence for inactive modules, audit coverage, permission coverage, policy drift, cron state, and spend posture."
      />

      <GovernedPatternCListSection
        title="Diagnostics checklist"
        surfaceKey={systemAdminDiagnosticsSurfaceKey}
        listConfiguration={buildDiagnosticsListSurface({ rows: diagnostics })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
