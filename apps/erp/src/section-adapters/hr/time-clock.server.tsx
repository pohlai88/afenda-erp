import { hrTimeClockUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrTimeClockPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrTimeClockUiCopy.page.title} — HR`,
  description: hrTimeClockUiCopy.page.description,
};

export default async function HrTimeClockPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrTimeClockPage(searchParams);
}
