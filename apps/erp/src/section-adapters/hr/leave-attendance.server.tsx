import { hrLamUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrLamPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrLamUiCopy.page.title} — HR`,
  description: hrLamUiCopy.page.description,
};

export default async function HrLeaveAttendancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrLamPage(searchParams);
}
