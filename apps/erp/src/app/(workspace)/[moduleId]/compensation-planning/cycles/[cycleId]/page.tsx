import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompensationPlanningCycleDetailPage from "@/routes/workspace/modules/hr-compensation-planning-cycle-detail.server";
export { metadata } from "@/routes/workspace/modules/hr-compensation-planning-cycle-detail.server";

export const unstable_instant = false;

type PageProps = {
  params: Promise<{ moduleId: string; cycleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompensationPlanningCycleDetailRoute({
  params,
  searchParams,
}: PageProps) {
  const { moduleId, cycleId } = await params;
  assertHrModuleId(moduleId);
  return (
    <HrCompensationPlanningCycleDetailPage
      params={Promise.resolve({ cycleId })}
      searchParams={searchParams}
    />
  );
}
