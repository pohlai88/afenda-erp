import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { HrmLmsEnrollmentRow } from "./lms.types.shared"
import {
  LMS_MY_LEARNING_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"

const LMS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "read" as const,
}

export type LmsMyLearningListCopy = {
  myLearningTitle: string
  myLearningDescription: string
  empty: string
  colTarget: string
  colApproval: string
  colMandatory: string
  colEnrolled: string
  formatEnrolled: (value: Date) => string
  formatApproval: (state: string) => string
  formatMandatory: (mandatory: boolean | null) => string
}

export function buildLmsMyLearningListSurfaceConfiguration(
  enrollments: readonly HrmLmsEnrollmentRow[],
  copy: LmsMyLearningListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_READ_PERMISSION,
    surface: {
      header: lmsListHeader(LMS_MY_LEARNING_LIST_COLUMNS_ID),
      columnsId: LMS_MY_LEARNING_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "target", header: copy.colTarget },
      { id: "approval", header: copy.colApproval },
      { id: "mandatory", header: copy.colMandatory },
      { id: "enrolled", header: copy.colEnrolled },
    ],
    rows: enrollments.map((row) => ({
      id: row.id,
      cells: {
        target: row.targetLabel,
        approval: copy.formatApproval(row.approvalState),
        mandatory: copy.formatMandatory(row.mandatory),
        enrolled: copy.formatEnrolled(row.enrolledAt),
      },
      trailingAction: { state: "hidden" as const },
    })),
  })
}
