import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompensationPlanningHubPage from "@/routes/workspace/modules/hr-compensation-planning-hub.server";
export { metadata } from "@/routes/workspace/modules/hr-compensation-planning-hub.server";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type PageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompensationPlanningPage({
  params,
  searchParams,
}: PageProps) {
  const { moduleId } = await params;
  assertHrModuleId(moduleId);
  return <HrCompensationPlanningHubPage searchParams={searchParams} />;
}
