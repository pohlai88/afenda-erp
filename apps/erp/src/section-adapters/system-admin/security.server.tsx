import { systemAdminSecurityUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminSecurityPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — System admin",
  description: systemAdminSecurityUiCopy.page.description,
};

export default SystemAdminSecurityPage;
