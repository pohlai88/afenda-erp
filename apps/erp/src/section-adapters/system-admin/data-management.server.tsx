import { systemAdminDataManagementUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminDataManagementPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Management — System admin",
  description: systemAdminDataManagementUiCopy.page.description,
};

export default SystemAdminDataManagementPage;
