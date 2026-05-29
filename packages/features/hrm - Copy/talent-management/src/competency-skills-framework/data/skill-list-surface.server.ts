import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceHeader,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { SkillListRow } from "./skill.queries.server"

type SkillListCopy = {
  empty: string
  colCode: string
  colLabel: string
  colCategory: string
  noCategory: string
}

type SkillListContext = {
  canMutate: boolean
  readOnlyReason: string
}

export function buildSkillListSurfaceConfiguration(
  rows: readonly SkillListRow[],
  copy: SkillListCopy,
  context: SkillListContext
): ListSurfaceRendererConfigurationInput {
  const columnsId = "hrm-skills"
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "hrm",
      object: "skill",
      function: "read",
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "label", header: copy.colLabel },
      { id: "category", header: copy.colCategory },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        label: row.label,
        category: row.categoryLabel ?? copy.noCategory,
      },
      trailingAction: context.canMutate
        ? resolveListSurfaceRowTrailingAction({
            visible: true,
            allowed: true,
            descriptor: {
              id: "erp.hrm.skill.edit",
              label: "Edit skill",
              intent: "default",
            },
          })
        : listSurfaceRowTrailingActionHidden(),
    })),
  })
}
