import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildFhcDutyRestrictionsListSurfaceConfiguration } from "../data/fhc-surface-builders.server"
import { listFhcDutyRestrictionsForOrg } from "../data/fhc-duty-restrictions.server"
import { listFhcEmployeeObligationsForOrg } from "../data/fhc.queries.server"
import { FHC_LIST_SURFACE_IDS } from "../data/fhc-surface-metadata.shared"
import type { HrmFhcRestrictionScope } from "../schemas/fhc-workflow-state.shared"
import { FhcDutyRestrictionCreateDialog } from "./fhc-duty-restriction-create-dialog.client"

export async function FhcDutyRestrictionsSection({
  orgSlug,
  organizationId,
  canManage,
}: {
  orgSlug: string
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")
  const [rows, obligations] = await Promise.all([
    listFhcDutyRestrictionsForOrg(organizationId),
    listFhcEmployeeObligationsForOrg(organizationId),
  ])

  const listConfiguration = buildFhcDutyRestrictionsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("dutyRestrictionsEmpty"),
      colEmployee: t("colEmployee"),
      colScope: t("colRestrictionScope"),
      colFrom: t("colEffectiveFrom"),
      colTo: t("colEffectiveTo"),
      colReason: t("colReason"),
      scopeLabelFor: (scope) =>
        t(`restrictionScopeLabels.${scope as HrmFhcRestrictionScope}`),
    }
  )

  return (
    <Card size="sm" data-testid="fhc-duty-restrictions-section">
      <CardHeader>
        <CardTitle>{t("dutyRestrictionsTitle")}</CardTitle>
        <CardDescription>{t("dutyRestrictionsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <FhcDutyRestrictionCreateDialog obligations={obligations} />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternBListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={FHC_LIST_SURFACE_IDS.dutyRestrictions}
        listConfiguration={listConfiguration}
        parentAccessAllowed
        resolveConfiguredPermission={false}
      />
    </Card>
  )
}
