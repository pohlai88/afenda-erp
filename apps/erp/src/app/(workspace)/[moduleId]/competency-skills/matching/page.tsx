import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompetencySkillsMatchingPage from "@/workspace-routes/hr-competency-skills-matching.server";
export { metadata } from "@/workspace-routes/hr-competency-skills-matching.server";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

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
