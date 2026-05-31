import {
  listHrTimeClockPunchExceptionsWindow,
  type HrTimeClockPunchExceptionCode,
  type HrTimeClockPunchExceptionWindow,
} from "@afenda/db";

import type { HrTimeClockPunchExceptionCode as SchemaExceptionCode } from "../schemas/hr.time.clock-integration-exception.schema";

export type { HrTimeClockPunchExceptionWindow };

/** Maps HRM-TCI-017..019 exception codes to acceptance criteria. */
export const HR_TIME_CLOCK_EXCEPTION_CODE_LABELS: Record<
  SchemaExceptionCode,
  string
> = {
  missing_punch: "Missing punch",
  duplicate: "Duplicate punch",
  early_in: "Early clock-in",
  late_in: "Late clock-in",
  early_out: "Early clock-out",
  unmatched: "Unmatched punch",
  invalid_employee: "Inactive employee",
  unmapped_device: "Unmapped device identity",
};

export async function listHrTimeClockExceptionsForOrg(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  exceptionCode?: HrTimeClockPunchExceptionCode;
  deviceId?: string;
}) {
  return listHrTimeClockPunchExceptionsWindow(input);
}
