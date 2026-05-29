import { clampHrPageSize } from "../../../contracts/pagination";
import type { HrEmploymentStatus } from "../../employees/contracts/hr-employee.contract";
import { listHrLifecycleOverview } from "./hr-lifecycle.query.server";

export async function buildHrLifecyclePageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue =
    typeof input.searchParams?.lifecycleQ === "string"
      ? input.searchParams.lifecycleQ
      : undefined;
  const employmentStatus =
    typeof input.searchParams?.employmentStatus === "string"
      ? (input.searchParams.employmentStatus as HrEmploymentStatus)
      : undefined;

  const window = await listHrLifecycleOverview({
    organizationId: input.organizationId,
    limit: clampHrPageSize(input.limit ?? 25),
    search: searchValue,
    employmentStatus,
  });

  return { window, searchValue, employmentStatus };
}
