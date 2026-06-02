import { hrIndustryFrmUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrIndustryFrmPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryFrmUiCopy.page.title} — HR`,
  description: hrIndustryFrmUiCopy.page.description,
};

export default async function HrFieldWorkerRemoteWorkforceManagementPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrIndustryFrmPage(searchParams);
}
