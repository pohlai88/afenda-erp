"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { SkillListRow } from "../data/skill.queries.server"
import { SkillEditDialog } from "./skill-edit-dialog"

type HrmSkillsCatalogTrailingContext = {
  orgSlug: string
  skills: readonly Pick<SkillListRow, "id" | "code" | "label" | "description">[]
}

export function HrmSkillsCatalogTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as HrmSkillsCatalogTrailingContext | undefined
  const skill = ctx?.skills.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !skill ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <SkillEditDialog
        orgSlug={ctx.orgSlug}
        skillId={skill.id}
        code={skill.code}
        label={skill.label}
        description={skill.description}
      />
    </GovernedTrailingActionSlot>
  )
}
