import { hrCsfUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrCsfMatchingPage } from "@/section-adapters/hr/competency-skills.server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrCsfUiCopy.matching.pageTitle} — HR`,
  description: hrCsfUiCopy.matching.pageDescription,
};

export default async function HrCompetencySkillsMatchingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrCsfMatchingPage(searchParams);
}
