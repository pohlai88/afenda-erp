import { systemAdminRolesUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminRolesPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles — System admin",
  description: systemAdminRolesUiCopy.page.description,
};

export default SystemAdminRolesPage;
