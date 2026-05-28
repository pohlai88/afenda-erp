import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  buildEmployeeDetailSummaryListSurfaceConfiguration,
  type EmployeeDetailSummaryRow,
} from "../data/employee-detail-summary-list-surface.server"

type EmployeeDetailSummaryListSectionProps = {
  rows: readonly EmployeeDetailSummaryRow[]
}

export async function EmployeeDetailSummaryListSection({
  rows,
}: EmployeeDetailSummaryListSectionProps) {
  const t = await getTranslations("Erp.Hrm.workforce")

  const listConfiguration = buildEmployeeDetailSummaryListSurfaceConfiguration(
    rows,
    {
      empty: t("detailSummaryEmpty"),
      colField: t("detailSummaryColField"),
      colValue: t("detailSummaryColValue"),
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:employee:detail-summary"
      resolveConfiguredPermission={false}
    />
  )
}
