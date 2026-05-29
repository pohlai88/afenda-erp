import { clampHrPageSize } from "../../../contracts/pagination";
import type { HrLeaveRequestRow } from "../contracts/hr-leave.contract";
import { listHrLeaveRequests } from "./hr-leave.query.server";

export async function buildHrLeavePageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue =
    typeof input.searchParams?.leaveQ === "string"
      ? input.searchParams.leaveQ
      : undefined;
  const status =
    typeof input.searchParams?.status === "string"
      ? (input.searchParams.status as HrLeaveRequestRow["status"])
      : undefined;

  const window = await listHrLeaveRequests({
    organizationId: input.organizationId,
    limit: clampHrPageSize(input.limit ?? 25),
    search: searchValue,
    status,
  });

  const pendingWindow = await listHrLeaveRequests({
    organizationId: input.organizationId,
    limit: 50,
    pendingOnly: true,
  });

  return { window, pendingWindow, searchValue, status };
}
