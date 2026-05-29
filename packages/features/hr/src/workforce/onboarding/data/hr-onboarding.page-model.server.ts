import { listHrOnboardingChecklistItems } from "@afenda/db";
import { clampHrPageSize } from "../../../contracts/pagination";
import type { HrOnboardingCaseRow } from "../contracts/hr-onboarding.contract";
import { listHrOnboardingCases } from "./hr-onboarding.query.server";

export async function buildHrOnboardingPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue =
    typeof input.searchParams?.onboardingQ === "string"
      ? input.searchParams.onboardingQ
      : undefined;
  const status =
    typeof input.searchParams?.status === "string"
      ? (input.searchParams.status as HrOnboardingCaseRow["status"])
      : undefined;

  const window = await listHrOnboardingCases({
    organizationId: input.organizationId,
    limit: clampHrPageSize(input.limit ?? 25),
    search: searchValue,
    status,
  });

  const activeCase = window.rows.find((row) => row.status === "in_progress");
  const checklistItems = activeCase
    ? await listHrOnboardingChecklistItems({
        organizationId: input.organizationId,
        caseId: activeCase.id,
      })
    : [];

  return { window, searchValue, status, checklistItems, activeCaseId: activeCase?.id };
}
