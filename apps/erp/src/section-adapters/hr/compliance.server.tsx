import { hrComplianceUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrCompliancePage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrComplianceUiCopy.page.title} - HR`,
  description: hrComplianceUiCopy.page.description,
};

export default async function HrCompliancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrCompliancePage(searchParams);
}
