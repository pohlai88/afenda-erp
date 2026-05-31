import { hrCsfUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrCsfReportsPage } from "@/lib/hr-sections/competency-skills.server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrCsfUiCopy.reports.pageTitle} — HR`,
  description: hrCsfUiCopy.reports.pageDescription,
};

export default async function HrCompetencySkillsReportsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrCsfReportsPage(searchParams);
}
