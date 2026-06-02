import { systemAdminPoliciesUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminPoliciesPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies — System admin",
  description: systemAdminPoliciesUiCopy.page.description,
};

export default SystemAdminPoliciesPage;
