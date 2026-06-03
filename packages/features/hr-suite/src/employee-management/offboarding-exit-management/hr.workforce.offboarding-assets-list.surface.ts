import {
  buildOffboardingListSearchToolbar,
  buildOffboardingOperationalListSurface,
  formatOffboardingEmployeeListCell,
  formatOffboardingListEnumCell,
} from "./hr.workforce.offboarding-list.shared";
import { hrOffboardingAssetsColumnsId } from "./hr.workforce.offboarding-surface-columns.shared";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

export const hrOffboardingAssetsSurfaceKey =
  "hr.workforce.offboarding.assets.list";

export const hrOffboardingAssetsSearchParam = "offboardingAssetsSearch";

export type HrOffboardingAssetWindow = {
  rows: readonly {
    id: string;
    caseId: string;
    employeeNumber: string;
    employeeDisplayName: string;
    assetCode: string;
    title: string;
    status: string;
    notes: string | null;
    resolvedAt: Date | null;
  }[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function buildHrOffboardingAssetsListSurface(input: {
  window: HrOffboardingAssetWindow;
  searchValue?: string;
}) {
  const copy = hrOffboardingUiCopy.assets;

  return buildOffboardingOperationalListSurface({
    primaryColumnId: "asset",
    searchToolbar: buildOffboardingListSearchToolbar({
      param: hrOffboardingAssetsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOffboardingAssetsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "asset",
        header: "Asset",
        priority: "primary",
        wrap: true,
        minWidth: 160,
      },
      {
        id: "employee",
        header: "Employee",
        minWidth: 180,
      },
      {
        id: "status",
        header: "Recovery status",
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowTone:
        row.status === "outstanding" ? ("attention" as const) : undefined,
      cells: {
        asset: row.title,
        employee: formatOffboardingEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        status: formatOffboardingListEnumCell(row.status),
        caseIdValue: row.caseId,
      },
    })),
  });
}
