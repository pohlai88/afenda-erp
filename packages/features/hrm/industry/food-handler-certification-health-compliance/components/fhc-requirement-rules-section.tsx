import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildFhcRequirementRulesListSurfaceConfiguration } from "../data/fhc-surface-builders.server"
import { listFhcRequirementRulesForOrg } from "../data/fhc.queries.server"
import type { FhcOutletChoiceRow } from "../data/fhc.types.shared"
import { FHC_LIST_SURFACE_IDS } from "../data/fhc-surface-metadata.shared"
import { FhcOutletCreateDialog } from "./fhc-outlet-create-dialog.client"
import { FhcRequirementRuleCreateDialog } from "./fhc-requirement-rule-create-dialog.client"

export async function FhcRequirementRulesSection({
  organizationId,
  outlets,
  canManage,
}: {
  organizationId: string
  outlets: readonly FhcOutletChoiceRow[]
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")
  const rows = await listFhcRequirementRulesForOrg(organizationId)

  const listConfiguration = buildFhcRequirementRulesListSurfaceConfiguration(
    rows,
    {
      empty: t("rulesEmpty"),
      colOutlet: t("colOutlet"),
      colCountry: t("colCountry"),
      colEntity: t("colEntity"),
      colRole: t("colRole"),
      colDepartment: t("colDepartment"),
      colCategory: t("colCategory"),
      colRequirements: t("colRequirements"),
      colActive: t("colActive"),
      anyLabel: t("anyCriteria"),
      yesNo: (value) => (value ? t("yes") : t("no")),
      formatRequirements: (row) => {
        const parts: string[] = []
        if (row.requiresPermit) parts.push(t("requiresPermitShort"))
        if (row.requiresHygieneTraining) parts.push(t("requiresHygieneShort"))
        if (row.requiresAllergenTraining) parts.push(t("requiresAllergenShort"))
        if (row.requiresHealthCertificate) parts.push(t("requiresHealthShort"))
        return parts.length > 0 ? parts.join(" · ") : t("anyCriteria")
      },
    }
  )

  return (
    <Card size="sm" data-testid="fhc-requirement-rules-section">
      <CardHeader>
        <CardTitle>{t("rulesTitle")}</CardTitle>
        <CardDescription>{t("rulesDescription")}</CardDescription>
        {canManage ? (
          <CardAction className="flex flex-wrap items-center justify-end gap-2">
            <FhcOutletCreateDialog />
            <FhcRequirementRuleCreateDialog outlets={outlets} />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={FHC_LIST_SURFACE_IDS.requirementRules}
        listConfiguration={listConfiguration}
      />
    </Card>
  )
}
