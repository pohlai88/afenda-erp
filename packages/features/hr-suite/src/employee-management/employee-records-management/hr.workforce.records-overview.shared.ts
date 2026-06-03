import { loadHrEmployeeRecordsOverviewSnapshot } from "@afenda/db";

export type HrRecordsOverviewSnapshot = Awaited<
  ReturnType<typeof loadHrEmployeeRecordsOverviewSnapshot>
>;

export async function loadHrRecordsOverviewSnapshot(input: {
  organizationId: string;
}): Promise<HrRecordsOverviewSnapshot> {
  return loadHrEmployeeRecordsOverviewSnapshot(input);
}
