import { hasExecutionPermission } from "@afenda/kernel/execution";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { inviteSystemAdminUser } from "../actions";
import { buildSystemAdminUsersPageModel } from "../data";
import { requireSystemAdminUsersRead } from "../policies";
import { systemAdminUsersUiCopy } from "../surface/system-admin.users-ui.copy.shared";
import { SystemAdminInviteUserDialog } from "./system-admin.invite-user-dialog.component.client";
import {
  SystemAdminUsersAccessDenied,
  SystemAdminUsersSection,
} from "./system-admin.users-section.component.server";

const SYSTEM_ADMIN_USERS_WINDOW_LIMIT = 100;

export async function SystemAdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageCopy = systemAdminUsersUiCopy.page;
  let guard: Awaited<ReturnType<typeof requireSystemAdminUsersRead>>;

  try {
    guard = await requireSystemAdminUsersRead();
  } catch {
    return <SystemAdminUsersAccessDenied />;
  }

  const { context, organization } = guard;
  const canManage = hasExecutionPermission(
    context,
    "system-admin.users.manage",
  );
  const { users, searchValue, totalCount } =
    await buildSystemAdminUsersPageModel({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      searchParams: resolvedSearchParams,
      limit: SYSTEM_ADMIN_USERS_WINDOW_LIMIT,
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
