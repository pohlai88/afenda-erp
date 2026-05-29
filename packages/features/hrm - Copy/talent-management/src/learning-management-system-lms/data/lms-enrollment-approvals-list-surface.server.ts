import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import type { HrmLmsEnrollmentRow } from "./lms.types.shared"
import {
  LMS_ENROLLMENT_APPROVALS_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"

const LMS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "read" as const,
}

export type LmsEnrollmentApprovalsListCopy = {
  queueTitle: string
  queueDescription: string
  empty: string
  colEmployee: string
  colTarget: string
  colMandatory: string
  colEnrolled: string
  formatEnrolled: (value: Date) => string
  formatMandatory: (mandatory: boolean | null) => string
}

export function buildLmsEnrollmentApprovalsListSurfaceConfiguration(
  enrollments: readonly HrmLmsEnrollmentRow[],
  orgSlug: string,
  copy: LmsEnrollmentApprovalsListCopy,
  options?: { readonly showTrailing?: boolean }
): ListSurfaceRendererConfigurationInput {
  const showTrailing = options?.showTrailing ?? false

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_READ_PERMISSION,
    surface: {
      header: lmsListHeader(LMS_ENROLLMENT_APPROVALS_LIST_COLUMNS_ID),
      columnsId: LMS_ENROLLMENT_APPROVALS_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee, cellKind: { kind: "link" } },
      { id: "target", header: copy.colTarget },
      { id: "mandatory", header: copy.colMandatory },
      { id: "enrolled", header: copy.colEnrolled },
    ],
    rows: enrollments.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: `${row.employeeNumber} — ${row.employeeName}`,
        target: row.targetLabel,
        mandatory: copy.formatMandatory(row.mandatory),
        enrolled: copy.formatEnrolled(row.enrolledAt),
      },
      trailingAction: showTrailing
        ? { state: "ready" as const }
        : { state: "hidden" as const },
    })),
  })
}
