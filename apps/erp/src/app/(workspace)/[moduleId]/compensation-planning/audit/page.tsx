import { assertHrModuleId } from "@/lib/hr-route.shared";
import HrCompensationPlanningAuditPage from "@/routes/workspace/modules/hr-compensation-planning-audit.server";
export { metadata } from "@/routes/workspace/modules/hr-compensation-planning-audit.server";

export const unstable_instant = false;

type PageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompensationPlanningAuditRoute({
  params,
  searchParams,
}: PageProps) {
  const { moduleId } = await params;
  assertHrModuleId(moduleId);
  return <HrCompensationPlanningAuditPage searchParams={searchParams} />;
}
