import { clampHrPageSize } from "../../../contracts/pagination";
import type { HrShiftAssignmentRow } from "../contracts/hr-shifts.contract";
import {
  listHrShiftAssignments,
  listHrShiftTemplates,
} from "./hr-shifts.query.server";

export async function buildHrShiftsPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue =
    typeof input.searchParams?.shiftsQ === "string"
      ? input.searchParams.shiftsQ
      : undefined;
  const status =
    typeof input.searchParams?.status === "string"
      ? (input.searchParams.status as HrShiftAssignmentRow["status"])
      : undefined;

  const assignmentWindow = await listHrShiftAssignments({
    organizationId: input.organizationId,
    limit: clampHrPageSize(input.limit ?? 25),
    search: searchValue,
    status,
  });

  const scheduledWindow = await listHrShiftAssignments({
    organizationId: input.organizationId,
    limit: 50,
    scheduledOnly: true,
  });

  const templateWindow = await listHrShiftTemplates({
    organizationId: input.organizationId,
    limit: 100,
    activeOnly: true,
  });

  const cancellableWindow = await listHrShiftAssignments({
    organizationId: input.organizationId,
    limit: 50,
    cancellableOnly: true,
  });

  return {
    assignmentWindow,
    scheduledWindow,
    cancellableWindow,
    templateWindow,
    searchValue,
    status,
  };
}
