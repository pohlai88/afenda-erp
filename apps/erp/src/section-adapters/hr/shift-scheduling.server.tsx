import { hrSftUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrSftPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrSftUiCopy.page.title} — HR`,
  description: hrSftUiCopy.page.description,
};

export default async function HrShiftSchedulingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrSftPage(searchParams);
}
