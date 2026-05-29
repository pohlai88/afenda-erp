import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildMscRegulatoryReferencesListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type {
  MscRegulatoryReferenceRow,
  MscRequirementRuleRow,
  MscSiteChoiceRow,
} from "../data/msc.types.shared"
import { MscRegulatoryCreateDialog } from "./msc-regulatory-create-dialog.client"

export async function MscRegulatoryReferencesSection({
  rows,
  sites,
  requirementRules,
  canManage,
  parentAccessAllowed = true,
}: {
  rows: readonly MscRegulatoryReferenceRow[]
  sites: readonly MscSiteChoiceRow[]
  requirementRules: readonly MscRequirementRuleRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration =
    buildMscRegulatoryReferencesListSurfaceConfiguration(rows, {
      empty: t("regulatoryEmpty"),
      colFramework: t("colFramework"),
      colCode: t("colReferenceCode"),
      colLabel: t("colReferenceLabel"),
      colSite: t("colSite"),
      colNotes: t("colNotes"),
      notRecorded: t("notRecorded"),
    })

  return (
    <Card size="sm" id="msc-regulatory-section">
      <CardHeader>
        <CardTitle>{t("regulatoryTitle")}</CardTitle>
        <CardDescription>{t("regulatoryDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <MscRegulatoryCreateDialog
              sites={sites}
              requirementRules={requirementRules}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        surfaceKey={MSC_LIST_SURFACE_IDS.regulatoryReferences}
        title={t("regulatoryTitle")}
        description={t("regulatoryDescription")}
        listConfiguration={listConfiguration}
        layout="embedded"
        parentAccessAllowed={parentAccessAllowed}
      />
    </Card>
  )
}
