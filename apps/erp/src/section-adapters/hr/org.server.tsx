import { hrOrgUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrOrgPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrOrgUiCopy.page.title} - HR`,
  description: hrOrgUiCopy.page.description,
};

export default async function HrOrgPage({ searchParams }: HrSectionPageProps) {
  return renderHrOrgPage(searchParams);
}
