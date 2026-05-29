import {
  getSystemAdminOverview,
  requireSystemAdminRead,
  SystemAdminOverviewPage,
} from "@afenda/feature-system-admin/server";

export async function SystemAdminModuleHubSection() {
  const { organization } = await requireSystemAdminRead();
  const snapshot = await getSystemAdminOverview({
    organizationId: organization.id,
  });

  return <SystemAdminOverviewPage snapshot={snapshot} />;
}
