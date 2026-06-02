import { systemAdminPermissionsUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminPermissionsPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissions — System admin",
  description: systemAdminPermissionsUiCopy.page.description,
};

export default SystemAdminPermissionsPage;
