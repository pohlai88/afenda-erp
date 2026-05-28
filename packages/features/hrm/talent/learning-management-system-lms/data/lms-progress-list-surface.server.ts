import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import {
  LMS_PROGRESS_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"
import type { HrmLmsProgressRow } from "./lms.types.shared"

const LMS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "read" as const,
}

export type LmsProgressListCopy = {
  empty: string
  colEmployee: string
  colTarget: string
  colStatus: string
  colPercent: string
  colTime: string
  colLastAccessed: string
  formatStatus: (status: string) => string
  formatPercent: (value: number) => string
  formatMinutes: (value: number) => string
  formatLastAccessed: (value: Date | null) => string
}

export function buildLmsProgressListSurfaceConfiguration(
  rows: readonly HrmLmsProgressRow[],
  orgSlug: string,
  copy: LmsProgressListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_READ_PERMISSION,
    presentation: {
      primaryColumnId: "employee",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "lmsProgressSearch",
          label: "Search progress",
          placeholder: "Search employee, target, or status",
        },
        filters: [
          {
            id: "lms-progress-status",
            label: copy.colStatus,
            param: "lmsProgressStatus",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.displayStatus)))
                    .sort()
                    .map((value) => ({
                      label: copy.formatStatus(value),
                      value,
                    }))
                : [{ label: "All statuses", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "lmsProgressSort",
          options: [
            {
              label: copy.colPercent,
              value: "percent-desc",
              columnId: "percent",
              direction: "desc",
            },
            {
              label: copy.colLastAccessed,
              value: "last-accessed-desc",
              columnId: "lastAccessed",
              direction: "desc",
            },
          ],
        },
        savedView: {
          label: "Progress view",
          activeLabel: "Learning progress",
          href: "?lmsProgressSort=percent-desc",
        },
      },
      decisionLedger: { enabled: true, label: "Learning evidence" },
    },
    surface: {
      header: lmsListHeader(LMS_PROGRESS_LIST_COLUMNS_ID),
      columnsId: LMS_PROGRESS_LIST_COLUMNS_ID,
      rowKey: "progressId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      { id: "target", header: copy.colTarget },
      { id: "status", header: copy.colStatus },
      { id: "percent", header: copy.colPercent },
      { id: "time", header: copy.colTime },
      { id: "lastAccessed", header: copy.colLastAccessed },
    ],
    rows: rows.map((row) => ({
      id: row.progressId,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: `${row.employeeNumber} — ${row.employeeName}`,
        target: row.targetLabel,
        status: copy.formatStatus(row.displayStatus),
        percent: copy.formatPercent(row.percentComplete),
        time: copy.formatMinutes(row.timeSpentMinutes),
        lastAccessed: copy.formatLastAccessed(row.lastAccessedAt),
      },
      decisionLedger: {
        reason: row.targetLabel,
        policyLabel: "Learning assignment progress",
        actorLabel: row.employeeName,
        occurredAt: row.lastAccessedAt?.toISOString() ?? row.progressId,
        riskTone: row.percentComplete >= 100 ? "positive" : "attention",
        nextActionLabel: copy.formatStatus(row.displayStatus),
      },
      trailingAction: { state: "hidden" as const },
    })),
  })
}
