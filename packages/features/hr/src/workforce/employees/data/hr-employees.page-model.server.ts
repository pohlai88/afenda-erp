import { clampHrPageSize } from "../../../contracts";
import type { HrEmployeeDirectoryWindow } from "../contracts";
import { listHrEmployeeDirectory } from "./hr-employees.query.server";

function resolveEmployeesSearch(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): string | undefined {
  const raw = searchParams?.employeesQ ?? searchParams?.q;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

export async function buildHrEmployeesPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}): Promise<{
  window: HrEmployeeDirectoryWindow;
  searchValue?: string;
}> {
  const searchValue = resolveEmployeesSearch(input.searchParams);
  const pageSize = clampHrPageSize(input.limit);

  const window = await listHrEmployeeDirectory({
    organizationId: input.organizationId,
    limit: pageSize,
    offset: 0,
    search: searchValue,
  });

  return { window, searchValue };
}
