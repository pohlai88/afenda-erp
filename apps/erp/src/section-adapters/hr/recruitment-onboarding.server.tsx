import { hrRonUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrRonPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrRonUiCopy.page.title} — HR`,
  description: hrRonUiCopy.page.description,
};

export default async function HrRecruitmentOnboardingPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrRonPage(searchParams);
}
