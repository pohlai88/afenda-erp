import { systemAdminAuditUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminAuditPage as FeatureSystemAdminAuditPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit — System admin",
  description: systemAdminAuditUiCopy.page.description,
};

export default function SystemAdminAuditPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <FeatureSystemAdminAuditPage searchParams={searchParams} />;
}
