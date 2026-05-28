import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildMscRequirementRulesListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type {
  MscRequirementRuleRow,
  MscSiteChoiceRow,
} from "../data/msc.types.shared"
import { MscRecomputeObligationsButton } from "./msc-recompute-obligations-button.client"
import { MscRequirementRuleCreateDialog } from "./msc-requirement-rule-create-dialog.client"

export async function MscRequirementsSection({
  rows,
  sites,
  canManage,
  parentAccessAllowed = true,
}: {
  rows: readonly MscRequirementRuleRow[]
  sites: readonly MscSiteChoiceRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration = buildMscRequirementRulesListSurfaceConfiguration(
    rows,
    {
      empty: t("rulesEmpty"),
      colSite: t("colSite"),
      colCountry: t("colCountry"),
      colRole: t("colRole"),
      colDepartment: t("colDepartment"),
      colRisk: t("colRisk"),
      colRequirements: t("colRequirements"),
      colActive: t("colActive"),
      anyLabel: t("anyCriteria"),
      yesNo: (value) => (value ? t("yes") : t("no")),
      formatRequirements: (row) => {
        const parts: string[] = []
        if (row.requiresMachineSafety) parts.push(t("requiresMachineShort"))
        if (row.requiresPpeTraining) parts.push(t("requiresPpeShort"))
        if (row.requiresSafetyCertification) parts.push(t("requiresCertShort"))
        return parts.length > 0 ? parts.join(", ") : "—"
      },
    }
  )

  return (
    <Card size="sm" id="msc-requirements-section">
      <CardHeader>
        <CardTitle>{t("rulesTitle")}</CardTitle>
        <CardDescription>{t("rulesDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <MscRequirementRuleCreateDialog sites={sites} />
              <MscRecomputeObligationsButton />
            </div>
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        surfaceKey={MSC_LIST_SURFACE_IDS.requirements}
        title={t("rulesTitle")}
        description={t("rulesDescription")}
        listConfiguration={listConfiguration}
        layout="embedded"
        parentAccessAllowed={parentAccessAllowed}
      />
    </Card>
  )
}
