import {
  buildSystemAdminMembershipsPageModel,
  requireSystemAdminMembershipsRead,
  SystemAdminMembershipsAccessDenied,
  SystemAdminMembershipsSection,
} from "@afenda/feature-system-admin/server";
import { systemAdminMembershipsUiCopy } from "@afenda/feature-system-admin/metadata";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { systemAdminRoutePaths } from "@afenda/feature-system-admin/client";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memberships — System admin",
  description: "Organization membership and role assignment review.",
};

export default async function SystemAdminMembershipsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminMembershipsRead>
  >["organization"];
  let context: Awaited<ReturnType<typeof requireSystemAdminMembershipsRead>>["context"];

  try {
    ({ organization, context } = await requireSystemAdminMembershipsRead());
  } catch {
    return <SystemAdminMembershipsAccessDenied />;
  }

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
      limit: 100,
    });

  const pageCopy = systemAdminMembershipsUiCopy.page;

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
          <Link href={systemAdminRoutePaths.users} className="font-medium underline">
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
