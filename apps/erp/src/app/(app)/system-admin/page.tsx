import {
  getSystemAdminOverview,
  requireSystemAdminRead,
  SystemAdminOverviewPage,
} from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System admin",
  description:
    "Tenant governance hub for identity, settings, audit, and platform controls.",
};

export default async function SystemAdminHubPage() {
  const { organization } = await requireSystemAdminRead();
  const snapshot = await getSystemAdminOverview({
    organizationId: organization.id,
  });

  return <SystemAdminOverviewPage snapshot={snapshot} />;
}
