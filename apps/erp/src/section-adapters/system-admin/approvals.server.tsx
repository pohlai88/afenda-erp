import { systemAdminApprovalsUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminApprovalsPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approvals — System admin",
  description: systemAdminApprovalsUiCopy.page.description,
};

export default SystemAdminApprovalsPage;
