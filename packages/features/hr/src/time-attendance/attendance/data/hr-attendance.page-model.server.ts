import { clampHrPageSize } from "../../../contracts/pagination";
import { listHrAttendanceRecords } from "./hr-attendance.query.server";

export async function buildHrAttendancePageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue =
    typeof input.searchParams?.attendanceQ === "string"
      ? input.searchParams.attendanceQ
      : undefined;

  const window = await listHrAttendanceRecords({
    organizationId: input.organizationId,
    limit: clampHrPageSize(input.limit ?? 25),
    search: searchValue,
    activeOnly: true,
  });

  return { window, searchValue };
}
