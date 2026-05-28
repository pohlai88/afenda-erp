import { requireCapability } from "@afenda/auth/server";
import { getErpModuleById } from "@afenda/domain";
import { GovernedPatternBStatSection } from "@afenda/governed-surface/server";
import {
  buildOverviewStatGrid,
  getOverviewStatSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import { getHubGovernanceSnapshot } from "@afenda/feature-system-admin/server";
import { systemAdminRoutePaths } from "@afenda/feature-system-admin/client";
import { SectionPanel, StatusBadge } from "@afenda/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System admin",
  description: "Tenant governance hub for identity, settings, audit, and platform controls.",
};

const hubLinks = [
  {
    href: systemAdminRoutePaths.identity,
    title: "Identity",
    description: "Members, invitations, roles, and permission overrides.",
  },
  {
    href: systemAdminRoutePaths.settings,
    title: "Settings",
    description: "Locale, timezone, branding, and data-handling policy.",
  },
  {
    href: systemAdminRoutePaths.audit,
    title: "Audit",
    description: "Governance event log and retention policies.",
  },
  {
    href: systemAdminRoutePaths.integrations,
    title: "Integrations",
    description: "API credentials, webhooks, and SSO configuration.",
  },
  {
    href: systemAdminRoutePaths.machineLayer,
    title: "Machine layer",
    description: "Machine usage, approvals, sandboxes, and Lynx operations.",
  },
  {
    href: systemAdminRoutePaths.reliability,
    title: "Reliability",
    description: "Cron health, workflow sweeps, and observability drain.",
  },
  {
    href: systemAdminRoutePaths.billing,
    title: "Billing",
    description: "Marketplace usage and tenant billing posture.",
  },
] as const;

export default async function SystemAdminHubPage() {
  const { organization } = await requireCapability("system-admin.view");
  const moduleDefinition = getErpModuleById("system-admin");
  const snapshot = await getHubGovernanceSnapshot({
    organizationId: organization.id,
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        eyebrow="Tenant governance"
        headingLevel={1}
        title={moduleDefinition?.label ?? "System admin"}
        description={
          moduleDefinition?.summary ??
          "Identity, settings, audit, integrations, and machine-layer controls."
        }
        aside={
          <div className="flex flex-col items-end gap-3 text-right">
            <StatusBadge label="Governance hub" tone="warning" />
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {organization.slug}
            </div>
          </div>
        }
      >
        <GovernedPatternBStatSection
          title="Governance snapshot"
          surfaceKey={getOverviewStatSurfaceKey()}
          layout="embedded"
          statGroups={[
            {
              groupKey: "governance-hub",
              configuration: buildOverviewStatGrid({
                stats: [
                  { label: "Members", value: String(snapshot.memberCount) },
                  {
                    label: "Pending invites",
                    value: String(snapshot.pendingInviteCount),
                  },
                  {
                    label: "Recent audit events",
                    value: String(snapshot.recentAuditEventCount),
                  },
                  {
                    label: "Pending sandboxes",
                    value: String(snapshot.pendingSandboxCount),
                  },
                ],
              }),
            },
          ]}
        />
      </SectionPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hubLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-line bg-card p-4 transition hover:border-slate-300 hover:bg-surface-strong"
          >
            <h2 className="text-base font-semibold text-foreground">{link.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{link.description}</p>
          </Link>
        ))}
      </div>

      <SectionPanel
        title="Knowledge substrate"
        description="Lynx eval runs and retrieval settings remain on the knowledge admin route."
      >
        <Link
          href="/knowledge"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Open knowledge admin
        </Link>
      </SectionPanel>
    </div>
  );
}
