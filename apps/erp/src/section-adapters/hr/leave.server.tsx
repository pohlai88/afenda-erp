import { hrLamUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrLeavePage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrLamUiCopy.page.title} — Leave`,
  description: hrLamUiCopy.page.description,
};

export default async function HrLeavePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrLeavePage(searchParams);
}
