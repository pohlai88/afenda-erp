import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildBenefitOpenEnrollmentListSurfaceConfiguration } from "../data/benefit-list-surface.server"
import type { BenefitOpenEnrollmentRow } from "../data/benefit-model.shared"

import { BenefitOpenEnrollmentTrailingCell } from "./benefit-open-enrollment-trailing-cell.client"

type BenefitOpenEnrollmentWindowsSectionProps = {
  isAdmin: boolean
  windows: readonly BenefitOpenEnrollmentRow[]
}

export async function BenefitOpenEnrollmentWindowsSection({
  isAdmin,
  windows,
}: BenefitOpenEnrollmentWindowsSectionProps) {
  const t = await getTranslations("Erp.Hrm.benefits")
  const listConfiguration = buildBenefitOpenEnrollmentListSurfaceConfiguration(
    windows,
    {
      empty: t("openEnrollment.empty"),
      colName: t("openEnrollment.colName"),
      colPeriod: t("openEnrollment.colPeriod"),
      colPlans: t("openEnrollment.colPlans"),
      colStatus: t("openEnrollment.colStatus"),
      activeLabel: t("openEnrollment.statusActive"),
      closedLabel: t("openEnrollment.statusClosed"),
      allPlansLabel: t("openEnrollment.allPlans"),
    },
    { showTrailing: isAdmin }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:benefits:open-enrollment"
      trailingColumn={
        isAdmin
          ? {
              header: t("openEnrollment.colActions"),
              Cell: BenefitOpenEnrollmentTrailingCell,
              context: {
                windows: windows.map((window) => ({
                  id: window.id,
                  isActive: window.isActive,
                })),
              },
            }
          : undefined
      }
    />
  )
}
