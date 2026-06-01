import type { HrLifecycleContractReviewWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import { deriveContractReviewPosture } from "../data/hr.workforce.lifecycle-contract.shared";
import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
  formatLifecycleEmploymentStatusLabel,
} from "./hr.workforce.lifecycle-list.shared";
import { hrLifecycleContractReviewsColumnsId } from "./hr.workforce.lifecycle-surface-columns.shared";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";

export const hrLifecycleContractReviewsSurfaceKey =
  "hr.workforce.lifecycle.contract-reviews.list";

export const hrLifecycleContractReviewsSearchParam =
  "lifecycleContractReviewsSearch";

export function buildHrLifecycleContractReviewsListSurface(input: {
  window: HrLifecycleContractReviewWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrLifecycleUiCopy.contractReviews;
  const now = new Date();

  return buildLifecycleOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLifecycleListSearchToolbar({
      param: hrLifecycleContractReviewsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLifecycleContractReviewsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "contractEnd",
        header: copy.colContractEnd,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "reviewPosture",
        header: copy.colReviewPosture,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "employmentType",
        header: copy.colEmploymentType,
        wrap: true,
        minWidth: 140,
      },
      {
        id: "scope",
        header: copy.colScope,
        wrap: true,
        minWidth: 180,
      },
      {
        id: "stage",
        header: copy.colStage,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: window.rows.map((row) => {
      const posture = deriveContractReviewPosture(row.contractEndDate, now);
      const scope = [
        row.legalEntityCode ? `Entity ${row.legalEntityCode}` : null,
        row.workLocationCode ? `Location ${row.workLocationCode}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        id: row.id,
        rowTone:
          posture === "expired"
            ? ("critical" as const)
            : posture === "due"
              ? ("attention" as const)
              : undefined,
        cells: {
          employee: `${row.employeeNumber} · ${row.displayName}`,
          employeeIdValue: row.id,
          contractEnd: row.contractEndDate.toISOString(),
          contractEndDateInput: row.contractEndDate.toISOString().slice(0, 10),
          reviewPosture:
            posture === "expired"
              ? "Expired"
              : posture === "due"
                ? "Due soon"
                : "Upcoming",
          employmentType: row.employmentType ?? "",
          scope,
          stage: formatLifecycleEmploymentStatusLabel(row.employmentStatus),
          managerEmployeeIdValue: row.managerEmployeeId ?? "",
          hrOwnerEmployeeIdValue: row.hrOwnerEmployeeId ?? "",
        },
        cellKinds: {
          reviewPosture: {
            kind: "badge",
            tone: posture === "expired" ? "critical" : "attention",
          },
        },
        trailingAction: canWrite
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
            })
          : undefined,
      };
    }),
  });
}
