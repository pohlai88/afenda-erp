import { hrPerformanceAppraisalsUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrPerformanceAppraisalsPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrPerformanceAppraisalsUiCopy.page.title} — HR`,
  description: hrPerformanceAppraisalsUiCopy.page.description,
};

export default async function HrPerformanceAppraisalsPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrPerformanceAppraisalsPage(searchParams);
}
