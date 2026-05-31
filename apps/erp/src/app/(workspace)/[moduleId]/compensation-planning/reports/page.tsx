import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompensationPlanningReportsPage from "@/workspace-routes/hr-compensation-planning-reports.server";
export { metadata } from "@/workspace-routes/hr-compensation-planning-reports.server";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

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
