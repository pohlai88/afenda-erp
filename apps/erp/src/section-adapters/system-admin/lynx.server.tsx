import {
  SystemAdminLynxPage as SystemAdminLynxPageSection,
} from "@afenda/feature-system-admin/server";
import { systemAdminLynxUiCopy } from "@afenda/feature-system-admin/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lynx — System admin",
  description: systemAdminLynxUiCopy.page.metadataDescription,
};

export default async function SystemAdminLynxPage() {
  return <SystemAdminLynxPageSection />;
}
