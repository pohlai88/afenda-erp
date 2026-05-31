import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompetencySkillsHubPage from "@/lib/hr-sections/competency-skills.server";
export { metadata } from "@/lib/hr-sections/competency-skills.server";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type PageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompetencySkillsPage({
  params,
  searchParams,
}: PageProps) {
  const { moduleId } = await params;
  assertHrModuleId(moduleId);
  return <HrCompetencySkillsHubPage searchParams={searchParams} />;
}
