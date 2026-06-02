import { hrIndustryUcbUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrIndustryUcbPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryUcbUiCopy.page.title} - HR`,
  description: hrIndustryUcbUiCopy.page.description,
};

export default async function HrUnionManagementPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrIndustryUcbPage(searchParams);
}
