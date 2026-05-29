import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildMscWorkRestrictionsListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type {
  MscEmployeeObligationRow,
  MscMachineRow,
  MscWorkRestrictionRow,
} from "../data/msc.types.shared"
import type { HrmMscRestrictionScope } from "../schemas/msc-workflow-state.shared"
import { MscWorkRestrictionCreateDialog } from "./msc-work-restriction-create-dialog.client"

export async function MscWorkRestrictionsSection({
  orgSlug,
  rows,
  obligations,
  machines,
  canManage,
  parentAccessAllowed = true,
}: {
  orgSlug: string
  rows: readonly MscWorkRestrictionRow[]
  obligations: readonly MscEmployeeObligationRow[]
  machines: readonly MscMachineRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration = buildMscWorkRestrictionsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("restrictionsEmpty"),
      colEmployee: t("colEmployee"),
      colScope: t("colRestrictionScope"),
      colFrom: t("colEffectiveFrom"),
      colTo: t("colEffectiveTo"),
      colReason: t("colReason"),
      scopeLabelFor: (scope) =>
        t(`restrictionScopeLabels.${scope as HrmMscRestrictionScope}`),
    }
  )

  return (
    <Card size="sm" data-testid="msc-work-restrictions-section">
      <CardHeader>
        <CardTitle>{t("restrictionsTitle")}</CardTitle>
        <CardDescription>{t("restrictionsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <MscWorkRestrictionCreateDialog
              obligations={obligations}
              machines={machines}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        surfaceKey={MSC_LIST_SURFACE_IDS.workRestrictions}
        title={t("restrictionsTitle")}
        description={t("restrictionsDescription")}
        listConfiguration={listConfiguration}
        layout="embedded"
        parentAccessAllowed={parentAccessAllowed}
      />
    </Card>
  )
}
