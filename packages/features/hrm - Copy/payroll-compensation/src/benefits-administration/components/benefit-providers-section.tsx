import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildBenefitProvidersListSurfaceConfiguration } from "../data/benefit-list-surface.server"
import type { BenefitProviderRow } from "../data/benefit-provider.queries.server"

import { BenefitProviderCreateDialog } from "./benefit-provider-create-dialog"
import { BenefitProvidersTrailingCell } from "./benefit-list-trailing-cells.client"

type BenefitProvidersSectionProps = {
  isAdmin: boolean
  providers: readonly BenefitProviderRow[]
}

export async function BenefitProvidersSection({
  isAdmin,
  providers,
}: BenefitProvidersSectionProps) {
  const [tSection, t] = await Promise.all([
    getTranslations("Erp.Hrm.benefits"),
    getTranslations("Erp.Hrm.benefits.providersTable"),
  ])

  const listConfiguration = buildBenefitProvidersListSurfaceConfiguration(
    providers,
    {
      empty: isAdmin ? t("emptyAdmin") : t("emptyMember"),
      colCode: t("colCode"),
      colName: t("colName"),
      colCountries: t("colCountries"),
      colExternalRef: t("colExternalRef"),
      colStatus: t("colStatus"),
      statusActive: t("statusActive"),
      statusInactive: t("statusInactive"),
    }
  )

  return (
    <GovernedPatternCListSection
      title={tSection("tabProvidersTitle")}
      description={tSection("tabProvidersDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:benefits:providers"
      cardClassName="mt-0 border-solid border-border"
      headerSlot={
        isAdmin ? (
          <div className="mb-3 flex justify-end">
            <BenefitProviderCreateDialog />
          </div>
        ) : null
      }
      trailingColumn={
        isAdmin
          ? {
              header: t("colActions"),
              Cell: BenefitProvidersTrailingCell,
              context: { providers },
            }
          : undefined
      }
    />
  )
}
