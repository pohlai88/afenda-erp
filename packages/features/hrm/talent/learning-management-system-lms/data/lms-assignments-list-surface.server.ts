import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import type { HrmLmsAssignmentRow } from "./lms.types.shared"
import {
  LMS_ASSIGNMENTS_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"

const LMS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "read" as const,
}

export type LmsAssignmentsListCopy = {
  boardTitle: string
  boardDescription: string
  empty: string
  colEmployee: string
  colTarget: string
  colMandatory: string
  colApproval: string
  colAssigned: string
  formatAssigned: (value: Date) => string
  formatMandatory: (mandatory: boolean) => string
  formatApproval: (state: string | null) => string
}

export function buildLmsAssignmentsListSurfaceConfiguration(
  assignments: readonly HrmLmsAssignmentRow[],
  orgSlug: string,
  copy: LmsAssignmentsListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_READ_PERMISSION,
    surface: {
      header: lmsListHeader(LMS_ASSIGNMENTS_LIST_COLUMNS_ID),
      columnsId: LMS_ASSIGNMENTS_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee, cellKind: { kind: "link" } },
      { id: "target", header: copy.colTarget },
      { id: "mandatory", header: copy.colMandatory },
      { id: "approval", header: copy.colApproval },
      { id: "assigned", header: copy.colAssigned },
    ],
    rows: assignments.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: `${row.employeeNumber} — ${row.employeeName}`,
        target: row.targetLabel,
        mandatory: copy.formatMandatory(row.mandatory),
        approval: copy.formatApproval(row.approvalState),
        assigned: copy.formatAssigned(row.assignedAt),
      },
      trailingAction: { state: "hidden" as const },
    })),
  })
}
