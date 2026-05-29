import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { HrmLmsCourseRow } from "./lms.types.shared"
import {
  LMS_COURSES_LIST_COLUMNS_ID,
  lmsListHeader,
} from "../lms-list-surface.shared"

const LMS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "read" as const,
}

export type LmsCoursesListCopy = {
  catalogTitle: string
  catalogDescription: string
  empty: string
  colCode: string
  colTitle: string
  colType: string
  colDelivery: string
  colRefs: string
  colState: string
  formatCourseType: (courseType: string) => string
}

export function buildLmsCoursesListSurfaceConfiguration(
  courses: readonly HrmLmsCourseRow[],
  copy: LmsCoursesListCopy,
  options?: { readonly showTrailing?: boolean }
): ListSurfaceRendererConfigurationInput {
  const showTrailing = options?.showTrailing ?? false

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LMS_READ_PERMISSION,
    surface: {
      header: lmsListHeader(LMS_COURSES_LIST_COLUMNS_ID),
      columnsId: LMS_COURSES_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "title", header: copy.colTitle },
      { id: "type", header: copy.colType },
      { id: "delivery", header: copy.colDelivery },
      { id: "refs", header: copy.colRefs },
      { id: "state", header: copy.colState },
    ],
    rows: courses.map((course) => ({
      id: course.id,
      cells: {
        code: course.code,
        title: course.title,
        type: copy.formatCourseType(course.courseType),
        delivery: course.deliveryMode,
        refs: String(course.contentRefCount),
        state: course.state,
      },
      trailingAction:
        showTrailing && course.state === "active"
          ? { state: "ready" as const }
          : { state: "hidden" as const },
    })),
  })
}
