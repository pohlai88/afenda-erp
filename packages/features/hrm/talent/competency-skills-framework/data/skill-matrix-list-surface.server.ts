import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import type { SkillMatrixData } from "./skill.queries.server"

const SKILLS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "skills" as const,
  function: "read" as const,
}

type SkillMatrixListCopy = {
  empty: string
  colEmployee: string
  formatProficiency: (value: number | undefined) => string
}

export function buildSkillMatrixListSurfaceConfiguration(
  matrix: SkillMatrixData,
  orgSlug: string,
  copy: SkillMatrixListCopy
): ListSurfaceRendererConfigurationInput {
  const skillColumns = matrix.skills.map((skill) => ({
    id: skill.id,
    header: skill.code,
  }))

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: SKILLS_READ_PERMISSION,
    surface: {
      header: { title: "hrm-skill-matrix" },
      columnsId: `hrm-skill-matrix:${skillColumns.map((c) => c.id).join(",")}`,
      rowKey: "employeeId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [{ id: "employee", header: copy.colEmployee }, ...skillColumns],
    rows: matrix.rows.map((row) => ({
      id: row.employeeId,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        ...Object.fromEntries(
          matrix.skills.map((skill) => [
            skill.id,
            copy.formatProficiency(row.proficiencyBySkillId[skill.id]),
          ])
        ),
      },
    })),
  })
}
