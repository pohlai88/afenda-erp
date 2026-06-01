import { systemAdminDataManagementUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminDataManagementPageModel,
  exportSystemAdminDataManagementAction,
  requireSystemAdminDataManagementRead,
  SystemAdminDataManagementAccessDenied,
  SystemAdminDataManagementSection,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";
import type { SystemAdminSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: "Data Management — System admin",
  description: systemAdminDataManagementUiCopy.page.description,
};

export default async function SystemAdminDataManagementPage({
  searchParams,
}: SystemAdminSectionPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  let guard: Awaited<ReturnType<typeof requireSystemAdminDataManagementRead>>;

  try {
    guard = await requireSystemAdminDataManagementRead();
  } catch {
    return <SystemAdminDataManagementAccessDenied />;
  }

  const model = await buildSystemAdminDataManagementPageModel({
    organizationId: guard.organization.id,
    searchParams: resolvedSearchParams,
  });

  return (
    <SystemAdminDataManagementSection
      model={model}
      canManage={
        hasExecutionPermission(
          guard.context,
          "system-admin.data-management.manage",
        ) || hasExecutionPermission(guard.context, "system-admin.settings.write")
      }
      canRun={hasExecutionPermission(
        guard.context,
        "system-admin.data-management.run",
      )}
      canCancel={hasExecutionPermission(
        guard.context,
        "system-admin.data-management.cancel",
      )}
      canExport={hasExecutionPermission(
        guard.context,
        "system-admin.data-management.export",
      )}
      exportDataManagementAction={exportSystemAdminDataManagementAction}
    />
  );
}
