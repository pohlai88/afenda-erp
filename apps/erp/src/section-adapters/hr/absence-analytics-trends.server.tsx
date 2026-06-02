import { hrAatUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrAatPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrAatUiCopy.page.title} — HR`,
  description: hrAatUiCopy.page.description,
};

export default async function HrAbsenceAnalyticsTrendsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrAatPage(searchParams);
}
