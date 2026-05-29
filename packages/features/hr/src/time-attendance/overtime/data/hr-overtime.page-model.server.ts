import { clampHrPageSize } from "../../../contracts/pagination";
import type { HrOvertimeRequestRow } from "../contracts/hr-overtime.contract";
import { listHrOvertimeRequests } from "./hr-overtime.query.server";

export async function buildHrOvertimePageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue =
    typeof input.searchParams?.overtimeQ === "string"
      ? input.searchParams.overtimeQ
      : undefined;
  const status =
    typeof input.searchParams?.status === "string"
      ? (input.searchParams.status as HrOvertimeRequestRow["status"])
      : undefined;

  const window = await listHrOvertimeRequests({
    organizationId: input.organizationId,
    limit: clampHrPageSize(input.limit ?? 25),
    search: searchValue,
    status,
  });

  const pendingWindow = await listHrOvertimeRequests({
    organizationId: input.organizationId,
    limit: 50,
    pendingOnly: true,
  });

  return { window, pendingWindow, searchValue, status };
}
