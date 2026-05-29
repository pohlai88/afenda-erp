import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildWorkforceListSurfaceConfiguration } from "../data/workforce-list-surface.server"
import type { EmployeeRow } from "@afenda/feature-hrm-core/shared"

type WorkforceListSectionProps = {
  orgSlug: string
  rows: readonly EmployeeRow[]
}

export async function WorkforceListSection({
  orgSlug,
  rows,
}: WorkforceListSectionProps) {
  const t = await getTranslations("Erp.Hrm.workforce")

  const listConfiguration = buildWorkforceListSurfaceConfiguration(
    [...rows],
    orgSlug,
    {
      empty: t("empty"),
      colNumber: t("colNumber"),
      colName: t("colName"),
      colEmail: t("colEmail"),
      colStatus: t("colStatus"),
      statusActive: t("statusActive"),
      statusArchived: t("statusArchived"),
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:workforce:employees"
    />
  )
}
