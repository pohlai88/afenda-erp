import type { HrOffboardingClearanceWindow } from "@afenda/db";

import { buildHrOffboardingClearanceListSurface } from "./hr.workforce.offboarding-clearance-list.surface";

export const hrOffboardingOverdueSurfaceKey =
  "hr.workforce.offboarding.overdue.list";

export const hrOffboardingOverdueSearchParam = "offboardingOverdueSearch";

export function buildHrOffboardingOverdueListSurface(input: {
  window: HrOffboardingClearanceWindow;
  searchValue?: string;
}) {
  return buildHrOffboardingClearanceListSurface(input);
}
