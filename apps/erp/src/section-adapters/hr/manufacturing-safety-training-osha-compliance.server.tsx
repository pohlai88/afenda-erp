import { hrIndustryMscUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrIndustryMscPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryMscUiCopy.page.title} — HR`,
  description: hrIndustryMscUiCopy.page.description,
};

export default async function HrManufacturingSafetyTrainingOshaCompliancePage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrIndustryMscPage(searchParams);
}
