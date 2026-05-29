import { listHrOffboardingClearanceItems } from "@afenda/db";
import { clampHrPageSize } from "../../../contracts/pagination";
import type { HrOffboardingCaseRow } from "../contracts/hr-offboarding.contract";
import { listHrOffboardingCases } from "./hr-offboarding.query.server";

export async function buildHrOffboardingPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue =
    typeof input.searchParams?.offboardingQ === "string"
      ? input.searchParams.offboardingQ
      : undefined;
  const status =
    typeof input.searchParams?.status === "string"
      ? (input.searchParams.status as HrOffboardingCaseRow["status"])
      : undefined;

  const window = await listHrOffboardingCases({
    organizationId: input.organizationId,
    limit: clampHrPageSize(input.limit ?? 25),
    search: searchValue,
    status,
  });

  const activeCase = window.rows.find((row) => row.status === "in_progress");
  const clearanceItems = activeCase
    ? await listHrOffboardingClearanceItems({
        organizationId: input.organizationId,
        caseId: activeCase.id,
      })
    : [];

  return { window, searchValue, status, clearanceItems };
}
