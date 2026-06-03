import {
  hrBenefitsOpenEnrollmentSearchParam,
  hrBenefitsOpenEnrollmentSurfaceKey,
} from "./hr.payroll.benefits-search-params.parse.shared";
import {
  buildBenefitsListSearchToolbar,
  buildBenefitsOperationalListSurface,
  formatBenefitsEnumLabel,
} from "./hr.payroll.benefits-list.shared";
import { hrBenefitsOpenEnrollmentColumnsId } from "./hr.payroll.benefits-surface-columns.shared";
import { hrBenefitsUiCopy } from "./hr.payroll.benefits-ui.copy.shared";

export { hrBenefitsOpenEnrollmentSurfaceKey };

export function buildHrBenefitsOpenEnrollmentListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      code: string;
      name: string;
      status: string;
      enrollmentStartAt: string | Date;
      enrollmentEndAt: string | Date;
      planCount: number;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBenefitsUiCopy.openEnrollment;

  return buildBenefitsOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildBenefitsListSearchToolbar({
      param: hrBenefitsOpenEnrollmentSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBenefitsOpenEnrollmentColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, cellKind: { kind: "text" } },
      {
        id: "name",
        header: copy.colName,
        pin: "start",
        minWidth: 180,
        cellKind: { kind: "text" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "enrollmentStart",
        header: copy.colEnrollmentStart,
        cellKind: { kind: "date" },
      },
      {
        id: "enrollmentEnd",
        header: copy.colEnrollmentEnd,
        cellKind: { kind: "date" },
      },
      { id: "planCount", header: copy.colPlanCount, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        status: formatBenefitsEnumLabel(row.status),
        enrollmentStart:
          row.enrollmentStartAt instanceof Date
            ? row.enrollmentStartAt.toISOString()
            : row.enrollmentStartAt,
        enrollmentEnd:
          row.enrollmentEndAt instanceof Date
            ? row.enrollmentEndAt.toISOString()
            : row.enrollmentEndAt,
        planCount: String(row.planCount),
      },
      cellKinds: {
        status: {
          kind: "badge",
          tone: row.status === "active" ? "default" : "attention",
        },
      },
    })),
  });
}
