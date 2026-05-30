import {
  hrBenefitsEnrollmentsSearchParam,
  hrBenefitsEnrollmentsSurfaceKey,
} from "../data/hr.payroll.benefits-search-params.parse.shared";
import {
  buildBenefitsListSearchToolbar,
  buildBenefitsOperationalListSurface,
  formatBenefitsEnumLabel,
  resolveBenefitsEnrollmentTrailingAction,
} from "./hr.payroll.benefits-list.shared";
import { hrBenefitsEnrollmentsColumnsId } from "./hr.payroll.benefits-surface-columns.shared";
import { maskBenefitsSensitiveDisplayText } from "../data/hr.payroll.benefits-sensitive-access.shared";
import { hrBenefitsUiCopy } from "./hr.payroll.benefits-ui.copy.shared";

export { hrBenefitsEnrollmentsSurfaceKey };

export function buildHrBenefitsEnrollmentsListSurface(input: {
  canWrite: boolean;
  canViewSensitive?: boolean;
  window: {
    rows: Array<{
      id: string;
      employeeId: string;
      planId: string;
      employeeLabel: string;
      planName: string;
      coverageLevel: string;
      coverageStatus: string;
      coverageStartDate: string | Date;
      coverageEndDate: string | Date | null;
      allowsDependents: boolean;
      unverifiedDependentCount: number;
      employeeContributionAmount: string | null;
      employerContributionAmount: string | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBenefitsUiCopy.enrollments;
  const canViewSensitive = input.canViewSensitive ?? false;

  return buildBenefitsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildBenefitsListSearchToolbar({
      param: hrBenefitsEnrollmentsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBenefitsEnrollmentsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "plan", header: copy.colPlan, cellKind: { kind: "text" } },
      { id: "coverageLevel", header: copy.colCoverageLevel, cellKind: { kind: "badge", tone: "default" } },
      { id: "coverageStatus", header: copy.colCoverageStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "coverageStart", header: copy.colCoverageStart, cellKind: { kind: "date" } },
      {
        id: "employeeContribution",
        header: copy.colEmployeeContribution,
        cellKind: { kind: "text" },
      },
      {
        id: "employerContribution",
        header: copy.colEmployerContribution,
        cellKind: { kind: "text" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: row.employeeLabel,
        plan: row.planName,
        coverageLevel: formatBenefitsEnumLabel(row.coverageLevel),
        coverageStatus: formatBenefitsEnumLabel(row.coverageStatus),
        coverageStart:
          row.coverageStartDate instanceof Date
            ? row.coverageStartDate.toISOString()
            : row.coverageStartDate,
        employeeContribution: maskBenefitsSensitiveDisplayText(
          row.employeeContributionAmount,
          canViewSensitive,
        ),
        employerContribution: maskBenefitsSensitiveDisplayText(
          row.employerContributionAmount,
          canViewSensitive,
        ),
        enrollmentIdValue: row.id,
        employeeIdValue: row.employeeId,
        planIdValue: row.planId,
        coverageLevelValue: row.coverageLevel,
        coverageStatusValue: row.coverageStatus,
        coverageStartInput:
          row.coverageStartDate instanceof Date
            ? row.coverageStartDate.toISOString().slice(0, 16)
            : row.coverageStartDate,
        coverageEndInput:
          row.coverageEndDate instanceof Date
            ? row.coverageEndDate.toISOString().slice(0, 16)
            : row.coverageEndDate ?? "",
        allowsDependentsValue: row.allowsDependents ? "true" : "false",
        unverifiedDependentCountValue: String(row.unverifiedDependentCount),
      },
      trailingAction: resolveBenefitsEnrollmentTrailingAction({
        canWrite: input.canWrite,
        coverageStatus: row.coverageStatus,
        allowsDependents: row.allowsDependents,
        coverageLevel: row.coverageLevel,
        unverifiedDependentCount: row.unverifiedDependentCount,
      }),
    })),
  });
}
