import { hrBonusUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrBonusPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrBonusUiCopy.page.title} — HR`,
  description: hrBonusUiCopy.page.description,
};

export default async function HrBonusPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrBonusPage(searchParams);
}
