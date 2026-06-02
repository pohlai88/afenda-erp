import { hrIndustryGpgUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrIndustryGpgPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryGpgUiCopy.page.title} — HR`,
  description: hrIndustryGpgUiCopy.page.description,
};

export default async function HrGovernmentClassificationPayGradesPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrIndustryGpgPage(searchParams);
}
