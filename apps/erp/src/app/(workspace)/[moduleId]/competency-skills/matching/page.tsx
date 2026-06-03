import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompetencySkillsMatchingPage from "@/routes/workspace/modules/hr-competency-skills-matching.server";
export { metadata } from "@/routes/workspace/modules/hr-competency-skills-matching.server";

export const unstable_instant = false;

type PageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompetencySkillsMatchingPage({
  params,
  searchParams,
}: PageProps) {
  const { moduleId } = await params;
  assertHrModuleId(moduleId);
  return <HrCompetencySkillsMatchingPage searchParams={searchParams} />;
}
