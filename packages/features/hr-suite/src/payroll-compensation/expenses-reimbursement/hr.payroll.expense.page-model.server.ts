import { buildHrExpenseAuditTrailListSurface } from "./hr.payroll.expense-audit-trail-list.surface";
import { buildHrExpenseClaimsListSurface } from "./hr.payroll.expense-claims-list.surface";
import { buildHrExpenseReportsListSurface } from "./hr.payroll.expense-reports-list.surface";
import {
  hrExpenseAuditTrailSurfaceKey,
  hrExpenseClaimsSurfaceKey,
  hrExpenseReportsSurfaceKey,
} from "./hr.payroll.expense-search-params.parse.shared";
import {
  buildHrExpenseReportRows,
  listHrExpenseAuditEvents,
  listHrExpenseClaimsForOrg,
} from "./hr.payroll.expense-store.shared";

const EXPENSE_DEFAULT_PAGE_SIZE = 25;

function matchesSearch(blob: string, search: string | undefined): boolean {
  const token = search?.trim().toLowerCase();
  if (!token) return true;
  return blob.toLowerCase().includes(token);
}

function toWindow<T>(rows: T[]) {
  const totalCount = rows.length;
  const pageSize = Math.min(EXPENSE_DEFAULT_PAGE_SIZE, totalCount || EXPENSE_DEFAULT_PAGE_SIZE);
  return {
    rows: rows.slice(0, EXPENSE_DEFAULT_PAGE_SIZE),
    pageSize,
    totalCount,
    hasNextPage: totalCount > EXPENSE_DEFAULT_PAGE_SIZE,
  };
}

export type HrExpensePageModelInput = {
  organizationId: string;
  canWrite: boolean;
  canApprove: boolean;
  claimsSearch?: string;
  reportsSearch?: string;
  auditTrailSearch?: string;
};

export type HrExpensePageModel = {
  claimsList: ReturnType<typeof buildHrExpenseClaimsListSurface>;
  reportsList: ReturnType<typeof buildHrExpenseReportsListSurface>;
  auditTrailList: ReturnType<typeof buildHrExpenseAuditTrailListSurface>;
  canWrite: boolean;
  canApprove: boolean;
  surfaceKeys: {
    claims: typeof hrExpenseClaimsSurfaceKey;
    reports: typeof hrExpenseReportsSurfaceKey;
    auditTrail: typeof hrExpenseAuditTrailSurfaceKey;
  };
};

export async function buildHrExpensePageModel(
  input: HrExpensePageModelInput,
): Promise<HrExpensePageModel> {
  const [claimsRows, reportRows, auditRows] = await Promise.all([
    Promise.resolve(listHrExpenseClaimsForOrg(input.organizationId)),
    Promise.resolve(buildHrExpenseReportRows(input.organizationId)),
    Promise.resolve(listHrExpenseAuditEvents(input.organizationId)),
  ]);

  const filteredClaims = claimsRows.filter((row) =>
    matchesSearch(
      [
        row.claimReference,
        row.employeeDisplayName,
        row.employeeNumber,
        row.category,
        row.status,
        row.description,
      ].join(" "),
      input.claimsSearch,
    ),
  );

  const filteredReports = reportRows.filter((row) =>
    matchesSearch(
      [row.department, row.category, row.status, row.periodLabel].join(" "),
      input.reportsSearch,
    ),
  );

  const filteredAudit = auditRows.filter((row) =>
    matchesSearch(
      [row.claimReference, row.action, row.detail, row.actorUserId].join(" "),
      input.auditTrailSearch,
    ),
  );

  const [claimsList, reportsList, auditTrailList] = await Promise.all([
    Promise.resolve(
      buildHrExpenseClaimsListSurface({
        window: toWindow(filteredClaims),
        searchValue: input.claimsSearch,
        canApprove: input.canApprove,
        canWrite: input.canWrite,
      }),
    ),
    Promise.resolve(
      buildHrExpenseReportsListSurface({
        window: toWindow(filteredReports),
        searchValue: input.reportsSearch,
      }),
    ),
    Promise.resolve(
      buildHrExpenseAuditTrailListSurface({
        window: toWindow(filteredAudit),
        searchValue: input.auditTrailSearch,
      }),
    ),
  ]);

  return {
    claimsList,
    reportsList,
    auditTrailList,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    surfaceKeys: {
      claims: hrExpenseClaimsSurfaceKey,
      reports: hrExpenseReportsSurfaceKey,
      auditTrail: hrExpenseAuditTrailSurfaceKey,
    },
  };
}
