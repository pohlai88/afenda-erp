import { formatErpDateTime } from "@afenda/kernel";
import { SectionPanel } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";
import Link from "next/link";
import { systemAdminRoutePaths } from "../../contracts";
import type { SystemAdminOverviewSnapshot } from "../contracts";

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
] as const;

export function SystemAdminOverviewPage({
  snapshot,
}: {
  snapshot: SystemAdminOverviewSnapshot;
}) {
  const stats = [
    { label: "Users", value: snapshot.userCount },
    { label: "Pending invites", value: snapshot.pendingInviteCount },
    { label: "Active memberships", value: snapshot.activeMembershipCount },
    { label: "Roles", value: snapshot.roleCount },
    { label: "Recent admin changes", value: snapshot.recentAdminChangeCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="System Admin"
        description="Phase 1 control surface for users, memberships, roles, and recent audit evidence."
      >
        <div className="grid gap-3 md:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(ui.radius.panel, "border border-line bg-card p-4")}
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>

      <div className="grid gap-4 md:grid-cols-3">
        {overviewLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              ui.radius.panel,
              "border border-line bg-card p-4 transition hover:bg-surface-strong",
            )}
          >
            <h2 className="text-base font-semibold text-foreground">
              {link.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
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
          <p className="text-sm text-muted-foreground">
            No recent administrative audit events were found.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {snapshot.recentAdminChanges.map((event) => (
              <div
                key={event.id}
                className={cn(ui.radius.chip, "border border-line p-3")}
              >
                <div className="text-sm font-medium text-foreground">
                  {event.action}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {event.summary}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatErpDateTime(event.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
