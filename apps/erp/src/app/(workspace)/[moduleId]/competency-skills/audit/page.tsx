import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompetencySkillsAuditPage from "@/routes/workspace/modules/hr-competency-skills-audit.server";
export { metadata } from "@/routes/workspace/modules/hr-competency-skills-audit.server";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type PageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompetencySkillsAuditPage({
  params,
  searchParams,
}: PageProps) {
  const { moduleId } = await params;
  assertHrModuleId(moduleId);
  return <HrCompetencySkillsAuditPage searchParams={searchParams} />;
}
