import { hrLifecycleUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrLifecyclePage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrLifecycleUiCopy.page.title} - HR`,
  description: hrLifecycleUiCopy.page.description,
};

export default async function HrLifecyclePage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrLifecyclePage(searchParams);
}
