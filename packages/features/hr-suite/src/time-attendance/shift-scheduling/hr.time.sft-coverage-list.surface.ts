import type { HrSftCoverageCompareWindow } from "./hrs-hr-time-sft-coverage-server";
import { formatCoverageStaffingStatusLabel } from "./hr.time.sft-coverage.shared";
import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
} from "./hr.time.sft-list.shared";
import {
  hrSftCoverageColumnsId,
  hrSftCoverageSearchParam,
  hrTimeSftCoverageSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftCoverageSurfaceKey };

function formatCoverageScopeLabel(row: HrSftCoverageCompareWindow["rows"][number]): string {
  const parts = [
    row.departmentName,
    row.positionCode,
    row.locationCode,
    row.roleCode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "All scopes";
}

/** HRM-SFT-016/017 — Pattern B coverage compare with understaffed flags. */
export function buildHrTimeSftCoverageListSurface(input: {
  window: HrSftCoverageCompareWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.coverage;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftCoverageSurfaceKey,
    primaryColumnId: "shift",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftCoverageSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftCoverageColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "date",
        header: copy.colDate,
        pin: "start",
        cellKind: { kind: "date" },
        minWidth: 120,
      },
      {
        id: "shift",
        header: copy.colShift,
        priority: "primary",
        wrap: true,
        minWidth: 160,
      },
      {
        id: "scope",
        header: copy.colScope,
        wrap: true,
        minWidth: 180,
      },
      {
        id: "required",
        header: copy.colRequired,
        minWidth: 80,
      },
      {
        id: "assigned",
        header: copy.colAssigned,
        minWidth: 80,
      },
      {
        id: "delta",
        header: copy.colDelta,
        minWidth: 80,
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.requirementId,
      rowTone: row.staffingStatus === "balanced" ? undefined : "attention",
      cells: {
        date: row.requirementDate.toISOString(),
        shift: row.templateName ?? row.templateCode ?? "Any shift",
        scope: formatCoverageScopeLabel(row),
        required: String(row.minHeadcount),
        assigned: String(row.assignedHeadcount),
        delta:
          row.deltaHeadcount > 0
            ? `+${row.deltaHeadcount}`
            : String(row.deltaHeadcount),
        status: formatCoverageStaffingStatusLabel(row.staffingStatus),
      },
      cellKinds: {
        status: {
          kind: "badge",
          tone:
            row.staffingStatus === "understaffed"
              ? "critical"
              : row.staffingStatus === "overstaffed"
                ? "attention"
                : "default",
        },
      },
    })),
  });
}
