import {
  hrLamAttendanceDaysSearchParam,
  hrLamLeaveBalancesSearchParam,
  hrLamLeaveRequestsSearchParam,
} from "../surface/hr.time.lam-surface-metadata.shared";

export type HrLamSearchParams = {
  attendanceDaysSearch?: string;
  leaveRequestsSearch?: string;
  leaveBalancesSearch?: string;
};

export function parseHrLamSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrLamSearchParams {
  if (!searchParams) return {};

  const read = (key: string) => {
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  return {
    attendanceDaysSearch: read(hrLamAttendanceDaysSearchParam),
    leaveRequestsSearch: read(hrLamLeaveRequestsSearchParam),
    leaveBalancesSearch: read(hrLamLeaveBalancesSearchParam),
  };
}

export function toHrLamPageModelInput(input: {
  organizationId: string;
  canWriteLeave: boolean;
  canWriteAttendance: boolean;
  canReadPayrollRefs?: boolean;
  canReadAudit?: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrLamSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    canWriteLeave: input.canWriteLeave,
    canWriteAttendance: input.canWriteAttendance,
    canReadPayrollRefs: input.canReadPayrollRefs ?? true,
    canReadAudit: input.canReadAudit ?? true,
    attendanceDaysSearch: parsed.attendanceDaysSearch,
    leaveRequestsSearch: parsed.leaveRequestsSearch,
    leaveBalancesSearch: parsed.leaveBalancesSearch,
  };
}
