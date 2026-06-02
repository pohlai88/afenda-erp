import { systemAdminModulesUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminModulesPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modules — System admin",
  description: systemAdminModulesUiCopy.page.description,
};

export default SystemAdminModulesPage;
