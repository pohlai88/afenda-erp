import {
  listAttendanceCorrectionRequestsWindow,
  listAttendanceExceptionsWindow,
  listHrAttendanceDaysWindow,
  listHrLamPayrollReferencesForPeriod,
  listHrLeaveBalancesWindow,
  listHrLeaveRequestsWindow,
  summarizeHrAttendanceForPeriod,
} from "@afenda/db";

import { listHrLamAuditTrailWindow } from "./hr.time.attendance.lam-audit-trail.shared.server";
import { settleHrLamListLoad } from "./hr.time.lam-list-load.shared";
import { buildHrLamAttendanceDaysListSurface } from "./hr.time.lam-attendance-days-list.surface";
import { buildHrLamAuditTrailListSurface } from "./hr.time.attendance.lam-audit-trail-list.surface";
import { buildHrLamCorrectionsListSurface } from "./hr.time.attendance.lam-corrections-list.surface";
import { buildHrLamExceptionsListSurface } from "./hr.time.attendance.lam-exceptions-list.surface";
import { buildHrLamLeaveBalancesListSurface } from "./hr.time.lam-leave-balances-list.surface";
import { buildHrLamLeaveRequestsListSurface } from "./hr.time.lam-leave-requests-list.surface";
import { buildHrLamPayrollRefsListSurface } from "./hr.time.attendance.lam-payroll-refs-list.surface";
import { buildHrLamReportsListSurface } from "./hr.time.attendance.lam-reports-list.surface";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";

export type HrLamPageModelInput = {
  organizationId: string;
  canWriteLeave: boolean;
  canWriteAttendance: boolean;
  canReadPayrollRefs?: boolean;
  canReadAudit?: boolean;
  periodStart?: Date;
  periodEnd?: Date;
  attendanceDaysSearch?: string;
  leaveRequestsSearch?: string;
  leaveBalancesSearch?: string;
};

const DEFAULT_PAGE_SIZE = 25;

function defaultPeriodRange(): { periodStart: Date; periodEnd: Date } {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setUTCMonth(periodStart.getUTCMonth() - 1);
  return { periodStart, periodEnd };
}

export async function buildHrLamPageModel(input: HrLamPageModelInput) {
  const attendanceCopy = hrLamUiCopy.attendanceDays;
  const leaveCopy = hrLamUiCopy.leaveRequests;
  const balanceCopy = hrLamUiCopy.leaveBalances;
  const { periodStart, periodEnd } =
    input.periodStart && input.periodEnd
      ? { periodStart: input.periodStart, periodEnd: input.periodEnd }
      : defaultPeriodRange();

  const [attendanceLoad, leaveRequestsLoad, leaveBalancesLoad, exceptionsLoad, correctionsLoad, payrollRefsLoad, summaryLoad, auditLoad] =
    await Promise.all([
      settleHrLamListLoad({
        sectionTitle: attendanceCopy.sectionTitle,
        load: () =>
          listHrAttendanceDaysWindow({
            organizationId: input.organizationId,
            search: input.attendanceDaysSearch,
            limit: DEFAULT_PAGE_SIZE,
          }),
      }),
      settleHrLamListLoad({
        sectionTitle: leaveCopy.sectionTitle,
        load: () =>
          listHrLeaveRequestsWindow({
            organizationId: input.organizationId,
            search: input.leaveRequestsSearch,
            limit: DEFAULT_PAGE_SIZE,
          }),
      }),
      settleHrLamListLoad({
        sectionTitle: balanceCopy.sectionTitle,
        load: () =>
          listHrLeaveBalancesWindow({
            organizationId: input.organizationId,
            search: input.leaveBalancesSearch,
            limit: DEFAULT_PAGE_SIZE,
          }),
      }),
      settleHrLamListLoad({
        sectionTitle: hrLamUiCopy.exceptions.sectionTitle,
        load: () =>
          listAttendanceExceptionsWindow({
            organizationId: input.organizationId,
            workDateFrom: periodStart,
            workDateTo: periodEnd,
            limit: DEFAULT_PAGE_SIZE,
          }),
      }),
      settleHrLamListLoad({
        sectionTitle: hrLamUiCopy.corrections.sectionTitle,
        load: () =>
          listAttendanceCorrectionRequestsWindow({
            organizationId: input.organizationId,
            status: "pending",
            limit: DEFAULT_PAGE_SIZE,
          }),
      }),
      input.canReadPayrollRefs
        ? settleHrLamListLoad({
            sectionTitle: hrLamUiCopy.payrollRefs.sectionTitle,
            load: async () => {
              const rows = await listHrLamPayrollReferencesForPeriod({
                organizationId: input.organizationId,
                periodStart,
                periodEnd,
              });
              return {
                rows,
                pageSize: rows.length,
                totalCount: rows.length,
                hasNextPage: false,
              };
            },
          })
        : Promise.resolve({ sectionTitle: hrLamUiCopy.payrollRefs.sectionTitle, data: null, loadError: undefined }),
      settleHrLamListLoad({
        sectionTitle: hrLamUiCopy.reports.sectionTitle,
        load: async () => {
          const rows = await summarizeHrAttendanceForPeriod({
            organizationId: input.organizationId,
            periodStart,
            periodEnd,
            groupBy: "employee",
          });
          return {
            rows,
            pageSize: rows.length,
            totalCount: rows.length,
            hasNextPage: false,
          };
        },
      }),
      input.canReadAudit
        ? settleHrLamListLoad({
            sectionTitle: hrLamUiCopy.audit.sectionTitle,
            load: () =>
              listHrLamAuditTrailWindow({
                organizationId: input.organizationId,
                limit: DEFAULT_PAGE_SIZE,
              }),
          })
        : Promise.resolve({ sectionTitle: hrLamUiCopy.audit.sectionTitle, data: null, loadError: undefined }),
    ]);

  return {
    canWriteLeave: input.canWriteLeave,
    canWriteAttendance: input.canWriteAttendance,
    attendanceDays: attendanceLoad.data
      ? buildHrLamAttendanceDaysListSurface({
          window: attendanceLoad.data,
          searchValue: input.attendanceDaysSearch,
        })
      : undefined,
    attendanceDaysLoadError: attendanceLoad.loadError,
    leaveRequests: leaveRequestsLoad.data
      ? buildHrLamLeaveRequestsListSurface({
          window: leaveRequestsLoad.data,
          searchValue: input.leaveRequestsSearch,
        })
      : undefined,
    leaveRequestsLoadError: leaveRequestsLoad.loadError,
    leaveBalances: leaveBalancesLoad.data
      ? buildHrLamLeaveBalancesListSurface({
          window: leaveBalancesLoad.data,
          searchValue: input.leaveBalancesSearch,
        })
      : undefined,
    leaveBalancesLoadError: leaveBalancesLoad.loadError,
    exceptions: exceptionsLoad.data
      ? buildHrLamExceptionsListSurface({
          rows: exceptionsLoad.data.rows.map((row) => ({
            attendanceDayId: row.attendanceDayId,
            employeeNumber: row.employeeNumber,
            employeeDisplayName: row.employeeDisplayName,
            workDate: row.workDate,
            status: row.status,
            exceptions: row.exceptions,
          })),
          pageSize: exceptionsLoad.data.pageSize,
          totalCount: exceptionsLoad.data.totalCount,
          hasNextPage: exceptionsLoad.data.hasNextPage,
        })
      : undefined,
    exceptionsLoadError: exceptionsLoad.loadError,
    corrections: correctionsLoad.data
      ? buildHrLamCorrectionsListSurface({
          rows: correctionsLoad.data.rows,
          pageSize: correctionsLoad.data.pageSize,
          totalCount: correctionsLoad.data.totalCount,
          hasNextPage: correctionsLoad.data.hasNextPage,
        })
      : undefined,
    correctionsLoadError: correctionsLoad.loadError,
    payrollRefs: payrollRefsLoad.data
      ? buildHrLamPayrollRefsListSurface({ rows: payrollRefsLoad.data.rows })
      : undefined,
    payrollRefsLoadError: payrollRefsLoad.loadError,
    reports: summaryLoad.data
      ? buildHrLamReportsListSurface({ rows: summaryLoad.data.rows })
      : undefined,
    reportsLoadError: summaryLoad.loadError,
    auditTrail: auditLoad.data
      ? buildHrLamAuditTrailListSurface({ window: auditLoad.data })
      : undefined,
    auditTrailLoadError: auditLoad.loadError,
  };
}

export type HrLamPageModel = Awaited<ReturnType<typeof buildHrLamPageModel>>;

export async function buildHrLeavePageModel(input: {
  organizationId: string;
  canWrite: boolean;
  searchValue?: string;
}) {
  const model = await buildHrLamPageModel({
    organizationId: input.organizationId,
    canWriteLeave: input.canWrite,
    canWriteAttendance: false,
    leaveRequestsSearch: input.searchValue,
    leaveBalancesSearch: input.searchValue,
  });

  return {
    window: model.leaveRequests
      ? {
          rows: [],
          pageSize: DEFAULT_PAGE_SIZE,
          totalCount: 0,
          hasNextPage: false,
        }
      : { rows: [], pageSize: DEFAULT_PAGE_SIZE, totalCount: 0, hasNextPage: false },
    pendingWindow: { rows: [], pageSize: DEFAULT_PAGE_SIZE, totalCount: 0, hasNextPage: false },
    searchValue: input.searchValue ?? "",
    lamModel: model,
  };
}

export async function buildHrAttendancePageModel(input: {
  organizationId: string;
  canWrite: boolean;
  searchValue?: string;
}) {
  const model = await buildHrLamPageModel({
    organizationId: input.organizationId,
    canWriteLeave: false,
    canWriteAttendance: input.canWrite,
    attendanceDaysSearch: input.searchValue,
  });

  return {
    window: { rows: [], pageSize: DEFAULT_PAGE_SIZE, totalCount: 0, hasNextPage: false },
    searchValue: input.searchValue ?? "",
    lamModel: model,
  };
}
