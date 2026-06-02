import { hrTalentSuccessionUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrSuccessionPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrTalentSuccessionUiCopy.page.title} — HR`,
  description: hrTalentSuccessionUiCopy.page.description,
};

export default async function HrSuccessionPlanningPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrSuccessionPage(searchParams);
}
