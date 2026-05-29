import {
  buildSystemAdminOverviewStatGroups,
  systemAdminOverviewStatSurfaceKey,
} from "../surfaces";
import type { SystemAdminOverviewSnapshot } from "../contracts";
import { GovernedPatternBStatSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";
import Link from "next/link";
import { formatErpDateTime } from "@afenda/kernel";
import { systemAdminRoutePaths } from "../contracts/system-admin.route-paths.contract";

const overviewLinks = [
  {
    href: systemAdminRoutePaths.users,
    title: "Users",
    description: "Invite users and review access status.",
  },
  {
    href: systemAdminRoutePaths.memberships,
    title: "Memberships",
    description: "Inspect membership status and role coverage.",
  },
  {
    href: systemAdminRoutePaths.roles,
    title: "Roles",
    description: "Assign or remove seeded tenant roles.",
  },
  {
    href: systemAdminRoutePaths.policies,
    title: "Policies",
    description: "Configure lock, deny, and approval-required execution rules.",
  },
  {
    href: systemAdminRoutePaths.approvals,
    title: "Approvals",
    description: "Define approver roles and minimum approvals for governed actions.",
  },
  {
    href: systemAdminRoutePaths.audit,
    title: "Audit viewer",
    description: "Search administrative evidence with redacted metadata detail.",
  },
  {
    href: systemAdminRoutePaths.security,
    title: "Security",
    description: "Manage MFA, session policy, invite domains, and admin protections.",
  },
] as const;

export function SystemAdminOverviewPage({
  snapshot,
}: {
  snapshot: SystemAdminOverviewSnapshot;
}) {
  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title="System Admin"
        description="Tenant governance hub for identity, execution policy, approvals, and audit evidence."
      >
        <GovernedPatternBStatSection
          title="Tenant snapshot"
          surfaceKey={systemAdminOverviewStatSurfaceKey}
          layout="embedded"
          statGroups={buildSystemAdminOverviewStatGroups({ snapshot })}
        />
      </SectionPanel>

      <div className="grid gap-surface-md @md:grid-cols-3">
        {overviewLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              ui.radius.panel,
              "border border-line bg-card p-4 transition hover:bg-surface-strong",
            )}
          >
            <h2 className="type-card-title">
              {link.title}
            </h2>
            <p className="mt-2 type-muted">
              {link.description}
            </p>
          </Link>
        ))}
      </div>

      <SectionPanel
        title="Recent admin audit evidence"
        description="Latest administrative changes written to the audit contract."
      >
        {snapshot.recentAdminChanges.length === 0 ? (
          <p className="type-muted">
            No recent administrative audit events were found.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {snapshot.recentAdminChanges.map((event) => (
              <Link
                key={event.id}
                href={`${systemAdminRoutePaths.audit}?auditId=${encodeURIComponent(event.id)}`}
                className={cn(
                  ui.radius.chip,
                  "border border-line p-3 transition-colors hover:bg-muted/40",
                )}
              >
                <div className="type-body font-medium text-foreground">
                  {event.action}
                </div>
                <div className="mt-1 type-muted">
                  {event.summary}
                </div>
                <div className="mt-2 type-caption">
                  {formatErpDateTime(event.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
