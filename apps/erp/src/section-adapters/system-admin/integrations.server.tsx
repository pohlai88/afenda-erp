import { systemAdminIntegrationsUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminIntegrationsPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — System admin",
  description: systemAdminIntegrationsUiCopy.page.description,
};

export default SystemAdminIntegrationsPage;
