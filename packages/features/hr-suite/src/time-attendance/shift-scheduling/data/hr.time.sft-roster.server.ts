import {
  listHrShiftRosterWindow,
  type HrShiftRosterRow,
  type HrShiftRosterWindow,
} from "@afenda/db";

import type { HrSftRosterQuery } from "../schemas/hr.time.sft-roster.schema";

export type { HrShiftRosterRow, HrShiftRosterWindow };

/** HRM-SFT-004 — employee roster by period with department, team, location, role, and legal entity filters. */
export async function listHrTimeSftShiftRoster(input: {
  organizationId: string;
  query: HrSftRosterQuery;
}): Promise<HrShiftRosterWindow> {
  return listHrShiftRosterWindow({
    organizationId: input.organizationId,
    periodStart: input.query.periodStart,
    periodEnd: input.query.periodEnd,
    limit: input.query.limit,
    offset: input.query.offset,
    search: input.query.search,
    departmentId: input.query.departmentId,
    teamId: input.query.teamId,
    locationCode: input.query.locationCode,
    positionId: input.query.positionId,
    legalEntityCode: input.query.legalEntityCode,
    employeeId: input.query.employeeId,
    templateId: input.query.templateId,
    status: input.query.status,
  });
}
