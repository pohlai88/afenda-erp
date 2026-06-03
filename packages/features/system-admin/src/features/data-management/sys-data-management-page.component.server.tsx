import { hasExecutionPermission } from "@afenda/kernel/execution";

import { exportSystemAdminDataManagementAction } from "../actions";
import { buildSystemAdminDataManagementPageModel } from "../data";
import { requireSystemAdminDataManagementRead } from "../policies";
import {
  SystemAdminDataManagementAccessDenied,
  SystemAdminDataManagementSection,
} from "./system-admin.data-management-section.component.server";

type SystemAdminDataManagementPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function SystemAdminDataManagementPage({
  searchParams,
}: SystemAdminDataManagementPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  let guard: Awaited<ReturnType<typeof requireSystemAdminDataManagementRead>>;

  try {
    guard = await requireSystemAdminDataManagementRead();
  } catch {
    return (
      <div
        data-testid="system-admin-data-management-access-denied"
        className="contents"
      >
        <SystemAdminDataManagementAccessDenied />
      </div>
    );
  }

  const model = await buildSystemAdminDataManagementPageModel({
    organizationId: guard.organization.id,
    searchParams: resolvedSearchParams,
  });

  return (
    <div data-testid="system-admin-data-management-page" className="contents">
      <SystemAdminDataManagementSection
        model={model}
        canManage={
          hasExecutionPermission(
            guard.context,
            "system-admin.data-management.manage",
          ) ||
          hasExecutionPermission(guard.context, "system-admin.settings.write")
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
    </div>
  );
}
