import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  listGpgAdjustmentReferencesForOrg,
  listGpgLocalityRulesForOrg,
} from "../data/gpg-locality.server"
import { listGpgEmployeeChoicesForOrg } from "../data/gpg-assignments.server"
import {
  buildGpgAdjustmentReferencesListSurfaceConfiguration,
  buildGpgLocalityRulesListSurfaceConfiguration,
} from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"
import { GpgAdjustmentReferenceCreateDialog } from "./gpg-adjustment-reference-create-dialog.client"
import { GpgLocalityRuleCreateDialog } from "./gpg-locality-rule-create-dialog.client"

export async function GpgLocalitySection({
  organizationId,
  orgSlug,
  canManage,
}: {
  organizationId: string
  orgSlug: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const [rules, adjustments, employees] = await Promise.all([
    listGpgLocalityRulesForOrg(organizationId),
    listGpgAdjustmentReferencesForOrg(organizationId),
    listGpgEmployeeChoicesForOrg(organizationId),
  ])

  const rulesConfiguration = buildGpgLocalityRulesListSurfaceConfiguration(
    rules,
    {
      empty: t("localityRulesEmpty"),
      colCode: t("colCode"),
      colName: t("colName"),
      colType: t("colLocalityType"),
      colPercent: t("colAdjustmentPercent"),
      colEffective: t("colEffective"),
      colState: t("colState"),
      typeLabel: (type) => t(`localityTypeLabels.${type}`),
      stateLabel: (state) => t(`masterStateLabels.${state}`),
    }
  )

  const adjustmentsConfiguration =
    buildGpgAdjustmentReferencesListSurfaceConfiguration(adjustments, orgSlug, {
      empty: t("adjustmentRefsEmpty"),
      colEmployee: t("colEmployee"),
      colType: t("colAdjustmentType"),
      colLocality: t("colLocalityRule"),
      colAmount: t("colAmount"),
      colPercent: t("colAdjustmentPercent"),
      colEffective: t("colEffective"),
      typeLabel: (type) => t(`adjustmentTypeLabels.${type}`),
    })

  const localityChoices = rules
    .filter((row) => row.state === "active")
    .map((row) => ({ id: row.id, label: `${row.code} — ${row.name}` }))

  return (
    <>
      <Card size="sm" data-testid="gpg-locality-rules-section">
        <CardHeader>
          <CardTitle>{t("localityRulesTitle")}</CardTitle>
          <CardDescription>{t("localityRulesDescription")}</CardDescription>
          {canManage ? (
            <CardAction>
              <GpgLocalityRuleCreateDialog />
            </CardAction>
          ) : null}
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey={GPG_LIST_SURFACE_IDS.localityRules}
          listConfiguration={rulesConfiguration}
        />
      </Card>

      <Card size="sm" data-testid="gpg-adjustment-references-section">
        <CardHeader>
          <CardTitle>{t("adjustmentRefsTitle")}</CardTitle>
          <CardDescription>{t("adjustmentRefsDescription")}</CardDescription>
          {canManage ? (
            <CardAction>
              <GpgAdjustmentReferenceCreateDialog
                employees={employees}
                localityRules={localityChoices}
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey={GPG_LIST_SURFACE_IDS.adjustmentReferences}
          listConfiguration={adjustmentsConfiguration}
        />
      </Card>
    </>
  )
}
