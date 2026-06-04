import { hasExecutionPermission } from "@afenda/kernel/execution";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { buildSystemAdminMembershipsPageModel } from "../data";
import { requireSystemAdminMembershipsRead } from "./sys-memberships.policy.server";
import { systemAdminMembershipsUiCopy } from "../surface/system-admin.memberships-ui.copy.shared";
import {
  SystemAdminMembershipsAccessDenied,
  SystemAdminMembershipsSection,
} from "./system-admin.memberships-section.component.server";

const SYSTEM_ADMIN_MEMBERSHIPS_WINDOW_LIMIT = 100;

export async function SystemAdminMembershipsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageCopy = systemAdminMembershipsUiCopy.page;
  let guard: Awaited<ReturnType<typeof requireSystemAdminMembershipsRead>>;

  try {
    guard = await requireSystemAdminMembershipsRead();
  } catch {
    return <SystemAdminMembershipsAccessDenied />;
  }

  const { context, organization } = guard;
  const canManageMemberships = hasExecutionPermission(
    context,
    "system-admin.memberships.manage",
  );
  const canManageRoles =
    hasExecutionPermission(context, "system-admin.roles.manage") ||
    hasExecutionPermission(context, "system-admin.identity.write");
  const { memberships, searchValue, totalCount } =
    await buildSystemAdminMembershipsPageModel({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      searchParams: resolvedSearchParams,
      limit: SYSTEM_ADMIN_MEMBERSHIPS_WINDOW_LIMIT,
    });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={pageCopy.title}
        description={pageCopy.description}
      />

      <Alert>
        <AlertTitle>{pageCopy.lifecycleAlertTitle}</AlertTitle>
        <AlertDescription>
          {pageCopy.lifecycleAlertBeforeUsersLink}
          <Link
            href={systemAdminRoutePaths.users}
            className="font-medium underline"
          >
            Users
          </Link>
          {pageCopy.lifecycleAlertAfterUsersLink}
        </AlertDescription>
      </Alert>

      <SystemAdminMembershipsSection
        memberships={memberships}
        canMutate={canManageMemberships}
        canManageRoles={canManageRoles}
        searchValue={searchValue}
        totalCount={totalCount}
      />
    </div>
  );
}
