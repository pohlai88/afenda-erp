import {
  SystemAdminInviteUserDialog,
  systemAdminRoutePaths,
} from "@afenda/feature-system-admin/client";
import { systemAdminUsersUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminUsersPageModel,
  inviteSystemAdminUser,
  requireSystemAdminUsersRead,
  SystemAdminUsersAccessDenied,
  SystemAdminUsersSection,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users — System admin",
  description: "User invitation and access review for the active tenant.",
};

export default async function SystemAdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = systemAdminUsersUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  let organization: Awaited<ReturnType<typeof requireSystemAdminUsersRead>>["organization"];
  let context: Awaited<ReturnType<typeof requireSystemAdminUsersRead>>["context"];

  try {
    ({ organization, context } = await requireSystemAdminUsersRead());
  } catch {
    return <SystemAdminUsersAccessDenied />;
  }

  const canManage = hasExecutionPermission(context, "system-admin.users.manage");
  const { users, searchValue, totalCount } = await buildSystemAdminUsersPageModel({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    searchParams: resolvedSearchParams,
    limit: 100,
  });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={pageCopy.title}
        description={pageCopy.description}
      />

      {canManage ? (
        <SectionPanel title={pageCopy.inviteSectionTitle}>
          <SystemAdminInviteUserDialog inviteAction={inviteSystemAdminUser} />
        </SectionPanel>
      ) : null}

      <Alert>
        <AlertTitle>{pageCopy.lifecycleAlertTitle}</AlertTitle>
        <AlertDescription>
          {pageCopy.lifecycleAlertBeforeMembershipsLink}
          <Link
            href={systemAdminRoutePaths.memberships}
            className="font-medium underline"
          >
            Memberships
          </Link>
          {pageCopy.lifecycleAlertBetweenLinks}
          <Link
            href={systemAdminRoutePaths.identity}
            className="font-medium underline"
          >
            Identity
          </Link>
          {pageCopy.lifecycleAlertAfterIdentityLink}
        </AlertDescription>
      </Alert>

      <SystemAdminUsersSection
        users={users}
        canMutate={canManage}
        searchValue={searchValue}
        totalCount={totalCount}
      />
    </div>
  );
}
