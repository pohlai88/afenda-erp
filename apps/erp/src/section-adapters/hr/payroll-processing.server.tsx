import { hrPayrollUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrPayrollProcessingPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrPayrollUiCopy.page.title} - HR`,
  description: hrPayrollUiCopy.page.description,
};

export default async function HrPayrollProcessingPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrPayrollProcessingPage(searchParams);
}
