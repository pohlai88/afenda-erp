import { systemAdminBillingUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminBillingPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing — System admin",
  description: systemAdminBillingUiCopy.page.description,
};

export default SystemAdminBillingPage;
