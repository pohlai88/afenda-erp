import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildBenefitPlansListSurfaceConfiguration } from "../data/benefit-list-surface.server"
import type { BenefitPlanRow } from "../data/benefit-model.shared"

import { BenefitPlanCreateDialog } from "./benefit-plan-create-dialog"
import { BenefitPlansTrailingCell } from "./benefit-list-trailing-cells.client"
import type { BenefitProviderChoice } from "./benefit-plan-form"

type BenefitPlansSectionProps = {
  isAdmin: boolean
  plans: readonly BenefitPlanRow[]
  providers?: readonly BenefitProviderChoice[]
}

export async function BenefitPlansSection({
  isAdmin,
  plans,
  providers = [],
}: BenefitPlansSectionProps) {
  const [tSection, t] = await Promise.all([
    getTranslations("Erp.Hrm.benefits"),
    getTranslations("Erp.Hrm.benefits.plansTable"),
  ])

  const listConfiguration = buildBenefitPlansListSurfaceConfiguration(plans, {
    empty: isAdmin ? t("emptyAdmin") : t("emptyMember"),
    colCode: t("colCode"),
    colName: t("colName"),
    colKind: t("colKind"),
    colEffective: t("colEffective"),
    colStatus: t("colStatus"),
    statusActive: t("statusActive"),
    statusInactive: t("statusInactive"),
  })

  return (
    <GovernedPatternCListSection
      title={tSection("tabPlansTitle")}
      description={tSection("tabPlansDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:benefits:plans"
      cardClassName="mt-0 border-solid border-border"
      headerSlot={
        isAdmin ? (
          <div className="mb-3 flex justify-end">
            <BenefitPlanCreateDialog providers={providers} />
          </div>
        ) : null
      }
      trailingColumn={
        isAdmin
          ? {
              header: t("colActions"),
              Cell: BenefitPlansTrailingCell,
              context: { plans, providers },
            }
          : undefined
      }
    />
  )
}
