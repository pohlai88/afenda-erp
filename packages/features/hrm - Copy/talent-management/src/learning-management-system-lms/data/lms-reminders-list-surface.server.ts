import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import type { HrmLmsReminderRow } from "./lms.types.shared"
import {
  LMS_REMINDERS_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"

const LMS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "read" as const,
}

export type LmsRemindersListCopy = {
  empty: string
  colEmployee: string
  colKind: string
  colTarget: string
  colDetail: string
  formatKind: (kind: HrmLmsReminderRow["kind"]) => string
}

export function buildLmsRemindersListSurfaceConfiguration(
  reminders: readonly HrmLmsReminderRow[],
  orgSlug: string,
  copy: LmsRemindersListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_READ_PERMISSION,
    surface: {
      header: lmsListHeader(LMS_REMINDERS_LIST_COLUMNS_ID),
      columnsId: LMS_REMINDERS_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee, cellKind: { kind: "link" } },
      { id: "kind", header: copy.colKind },
      { id: "target", header: copy.colTarget },
      { id: "detail", header: copy.colDetail },
    ],
    rows: reminders.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: `${row.employeeNumber} — ${row.employeeName}`,
        kind: copy.formatKind(row.kind),
        target: row.targetLabel,
        detail: row.detail,
      },
      trailingAction: { state: "hidden" as const },
    })),
  })
}
