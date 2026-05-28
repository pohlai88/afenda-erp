import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { HrmLmsLearningPathRow } from "./lms.types.shared"
import {
  LMS_LEARNING_PATHS_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"

const LMS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "read" as const,
}

export type LmsLearningPathsListCopy = {
  pathsTitle: string
  pathsDescription: string
  empty: string
  colCode: string
  colName: string
  colType: string
  colCourses: string
  colState: string
  formatPathType: (pathType: string) => string
}

export function buildLmsLearningPathsListSurfaceConfiguration(
  paths: readonly HrmLmsLearningPathRow[],
  copy: LmsLearningPathsListCopy,
  options?: { readonly showTrailing?: boolean }
): ListSurfaceRendererConfigurationInput {
  const showTrailing = options?.showTrailing ?? false

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_READ_PERMISSION,
    surface: {
      header: lmsListHeader(LMS_LEARNING_PATHS_LIST_COLUMNS_ID),
      columnsId: LMS_LEARNING_PATHS_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "type", header: copy.colType },
      { id: "courses", header: copy.colCourses },
      { id: "state", header: copy.colState },
    ],
    rows: paths.map((path) => ({
      id: path.id,
      cells: {
        code: path.code,
        name: path.name,
        type: copy.formatPathType(path.pathType),
        courses: String(path.courseCount),
        state: path.state,
      },
      trailingAction:
        showTrailing && path.state === "active"
          ? { state: "ready" as const }
          : { state: "hidden" as const },
    })),
  })
}
