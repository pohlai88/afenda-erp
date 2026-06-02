import { systemAdminCapabilitiesUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminCapabilitiesPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capabilities — System admin",
  description: systemAdminCapabilitiesUiCopy.page.description,
};

export default SystemAdminCapabilitiesPage;
