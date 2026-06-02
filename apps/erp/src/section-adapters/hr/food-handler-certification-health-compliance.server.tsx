import { hrIndustryFhcUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrIndustryFhcPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryFhcUiCopy.page.title} — HR`,
  description: hrIndustryFhcUiCopy.page.description,
};

export default async function HrFoodHandlerCertificationHealthCompliancePage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrIndustryFhcPage(searchParams);
}
