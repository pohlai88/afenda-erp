import { hrAttendanceUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrAttendancePage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrAttendanceUiCopy.page.title} — HR`,
  description: hrAttendanceUiCopy.page.description,
};

export default async function HrAttendancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrAttendancePage(searchParams);
}
