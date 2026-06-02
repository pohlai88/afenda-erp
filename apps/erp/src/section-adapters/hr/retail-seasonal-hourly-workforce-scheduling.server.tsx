import { hrIndustryRwsUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrIndustryRwsPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryRwsUiCopy.page.title} — HR`,
  description: hrIndustryRwsUiCopy.page.description,
};

export default async function HrRetailSeasonalHourlyWorkforceSchedulingPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrIndustryRwsPage(searchParams);
}
