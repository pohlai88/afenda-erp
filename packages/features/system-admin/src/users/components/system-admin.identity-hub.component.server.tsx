import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";
import Link from "next/link";
import { InviteMemberForm, RoleOverrideForm } from "@afenda/feature-system-admin/client";
import {
  buildRoleOverridesListSurface,
  systemAdminRoleOverridesSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import { setRoleOverrideAction } from "@afenda/feature-system-admin/server";
import type { RoleOverrideRow } from "@afenda/db";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { inviteMemberAction } from "../actions/system-admin.identity-invitations.actions.server";

const identityDomainLinks = [
  {
    href: systemAdminRoutePaths.users,
    title: "Users",
    description:
      "Invite users, resend invitations, suspend or remove access, and inspect effective permissions.",
  },
  {
    href: systemAdminRoutePaths.memberships,
    title: "Memberships",
    description: "Review membership status and role assignment coverage.",
  },
  {
    href: systemAdminRoutePaths.roles,
    title: "Roles",
    description: "Browse the tenant role catalog and assignment posture.",
  },
  {
    href: systemAdminRoutePaths.permissions,
    title: "Permissions",
    description: "Inspect the declared permission catalog and role coverage.",
  },
] as const;

export function SystemAdminIdentityHub({
  overrides,
  canWriteOverrides,
  canInviteViaIdentity,
}: {
  overrides: readonly RoleOverrideRow[];
  canWriteOverrides: boolean;
  canInviteViaIdentity: boolean;
}) {
  const overridesSurface = buildRoleOverridesListSurface({ overrides });

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title="Identity & access"
        description="Tenant role overrides and navigation to user lifecycle surfaces. Invite, suspend, and remove users on the Users surface — not here."
      />

      {canInviteViaIdentity ? (
        <SectionPanel
          title="Invite member (identity policy)"
          description="Uses system-admin.identity.write. For the full user lifecycle (resend, suspend, inspect access), use the Users surface."
        >
          <InviteMemberForm inviteMemberAction={inviteMemberAction} />
        </SectionPanel>
      ) : null}

      <div className="grid gap-surface-md @md:grid-cols-2 @lg:grid-cols-4">
        {identityDomainLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              ui.radius.panel,
              "border border-line bg-card p-4 transition hover:bg-surface-strong",
            )}
          >
            <h2 className="type-card-title">{link.title}</h2>
            <p className="mt-2 type-muted">{link.description}</p>
          </Link>
        ))}
      </div>

      <GovernedPatternCListSection
        title="Role overrides"
        description="Overrides apply on top of the static role catalog when the session is refreshed."
        surfaceKey={systemAdminRoleOverridesSurfaceKey}
        listConfiguration={overridesSurface}
        parentAccessAllowed
        layout="embedded"
      />

      {canWriteOverrides ? (
        <SectionPanel title="Set role override">
          <RoleOverrideForm setRoleOverrideAction={setRoleOverrideAction} />
        </SectionPanel>
      ) : null}
    </div>
  );
}
