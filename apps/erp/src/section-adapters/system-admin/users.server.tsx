import { systemAdminUsersUiCopy } from "@afenda/feature-system-admin/metadata";
import { SystemAdminUsersPage as FeatureSystemAdminUsersPage } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users — System admin",
  description: systemAdminUsersUiCopy.page.description,
};

export default function SystemAdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <FeatureSystemAdminUsersPage searchParams={searchParams} />;
}
