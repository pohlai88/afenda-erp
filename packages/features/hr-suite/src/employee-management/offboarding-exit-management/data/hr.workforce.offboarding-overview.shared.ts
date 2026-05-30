import { loadHrOffboardingOverviewSnapshot } from "@afenda/db";

export async function loadHrOffboardingOverview(input: {
  organizationId: string;
}) {
  return loadHrOffboardingOverviewSnapshot(input);
}
