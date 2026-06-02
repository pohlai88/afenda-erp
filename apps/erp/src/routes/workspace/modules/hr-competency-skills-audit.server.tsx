import { hrCsfUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrCsfAuditPage } from "@/section-adapters/hr/competency-skills.server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrCsfUiCopy.audit.pageTitle} — HR`,
  description: hrCsfUiCopy.audit.pageDescription,
};

export default async function HrCompetencySkillsAuditPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrCsfAuditPage(searchParams);
}
