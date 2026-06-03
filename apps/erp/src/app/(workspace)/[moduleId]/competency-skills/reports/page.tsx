import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompetencySkillsReportsPage from "@/routes/workspace/modules/hr-competency-skills-reports.server";
export { metadata } from "@/routes/workspace/modules/hr-competency-skills-reports.server";

export const unstable_instant = false;

type PageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompetencySkillsReportsPage({
  params,
  searchParams,
}: PageProps) {
  const { moduleId } = await params;
  assertHrModuleId(moduleId);
  return <HrCompetencySkillsReportsPage searchParams={searchParams} />;
}
