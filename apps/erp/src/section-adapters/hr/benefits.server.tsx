import { hrBenefitsUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrBenefitsPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrBenefitsUiCopy.page.title} — HR`,
  description: hrBenefitsUiCopy.page.description,
};

export default async function HrBenefitsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrBenefitsPage(searchParams);
}
