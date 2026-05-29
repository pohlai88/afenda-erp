"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import {
  OrganizationDepartmentArchiveForm,
  OrganizationJobGradeArchiveForm,
  OrganizationPositionArchiveForm,
} from "./organization-structure-forms"

export type OrgStructureArchiveTrailingKind = "grade" | "position" | "org-unit"

type OrgStructureArchiveTrailingContext = {
  orgSlug: string
  kind: OrgStructureArchiveTrailingKind
}

export function OrgStructureArchiveTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as OrgStructureArchiveTrailingContext | undefined
  const trailingAction = row.trailingAction

  if (!ctx || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return <span className="text-muted-foreground">—</span>
  }

  const child =
    ctx.kind === "grade" ? (
      <OrganizationJobGradeArchiveForm orgSlug={ctx.orgSlug} gradeId={row.id} />
    ) : ctx.kind === "position" ? (
      <OrganizationPositionArchiveForm
        orgSlug={ctx.orgSlug}
        positionId={row.id}
      />
    ) : (
      <OrganizationDepartmentArchiveForm
        orgSlug={ctx.orgSlug}
        departmentId={row.id}
      />
    )

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      {child}
    </GovernedTrailingActionSlot>
  )
}
