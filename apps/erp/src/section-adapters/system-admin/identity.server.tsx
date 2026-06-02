import { systemAdminUsersUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminIdentityPage as FeatureSystemAdminIdentityPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity — System admin",
  description: systemAdminUsersUiCopy.identity.page.description,
};

export default function SystemAdminIdentityPage() {
  return <FeatureSystemAdminIdentityPage />;
}
