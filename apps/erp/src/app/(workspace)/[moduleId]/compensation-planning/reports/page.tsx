import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompensationPlanningReportsPage from "@/routes/workspace/modules/hr-compensation-planning-reports.server";
export { metadata } from "@/routes/workspace/modules/hr-compensation-planning-reports.server";

export const unstable_instant = false;

type PageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompensationPlanningReportsRoute({
  params,
  searchParams,
}: PageProps) {
  const { moduleId } = await params;
  assertHrModuleId(moduleId);
  return <HrCompensationPlanningReportsPage searchParams={searchParams} />;
}
