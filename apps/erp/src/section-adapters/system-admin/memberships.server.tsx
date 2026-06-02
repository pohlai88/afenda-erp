import { systemAdminMembershipsUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminMembershipsPage as FeatureSystemAdminMembershipsPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memberships — System admin",
  description: systemAdminMembershipsUiCopy.page.description,
};

export default function SystemAdminMembershipsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <FeatureSystemAdminMembershipsPage searchParams={searchParams} />;
}
