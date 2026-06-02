import { hrOffboardingUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrOffboardingPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrOffboardingUiCopy.page.title} - HR`,
  description: hrOffboardingUiCopy.page.description,
};

export default async function HrOffboardingPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrOffboardingPage(searchParams);
}
