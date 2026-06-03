import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";
import Link from "next/link";
import { setRoleOverrideAction } from "../../permissions/actions/system-admin.permission-bundle.actions.server";
import { RoleOverrideForm } from "../../permissions/components/system-admin.role-override-form.component.client";
import {
  buildRoleOverridesListSurface,
  systemAdminRoleOverridesSurfaceKey,
} from "../../permissions/surface/system-admin.role-overrides-list.surface";
import { InviteMemberForm } from "../../client";
import type { RoleOverrideRow } from "@afenda/db";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { systemAdminUsersUiCopy } from "../surface/system-admin.users-ui.copy.shared";
import { inviteMemberAction } from "../actions/system-admin.identity-invitations.actions.server";

const identityDomainLinkHrefs = [
  systemAdminRoutePaths.users,
  systemAdminRoutePaths.memberships,
  systemAdminRoutePaths.roles,
  systemAdminRoutePaths.permissions,
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
  const copy = systemAdminUsersUiCopy.identity;
  if (identityDomainLinkHrefs.length !== copy.domainLinks.length) {
    throw new Error(
      "system-admin identity domain link hrefs out of sync with metadata copy",
    );
  }
  const identityDomainLinks = copy.domainLinks.map((link, index) => {
    const href = identityDomainLinkHrefs[index];
    if (href === undefined) {
      throw new Error(
        `system-admin identity domain link missing href for "${link.title}"`,
      );
    }

    return { ...link, href };
  });

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      {canInviteViaIdentity ? (
        <SectionPanel
          title={copy.inviteSection.title}
          description={copy.inviteSection.description}
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
        title={copy.overridesList.title}
        description={copy.overridesList.description}
        surfaceKey={systemAdminRoleOverridesSurfaceKey}
        listConfiguration={overridesSurface}
        parentAccessAllowed
        layout="embedded"
      />

      {canWriteOverrides ? (
        <SectionPanel title={copy.overrideForm.title}>
          <RoleOverrideForm setRoleOverrideAction={setRoleOverrideAction} />
        </SectionPanel>
      ) : null}
    </div>
  );
}
