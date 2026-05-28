import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { listGpgClassificationChoicesForOrg } from "../data/gpg-classifications.server"
import {
  listGpgPayBandsForOrg,
  listGpgPayGradeChoicesForOrg,
  listGpgPayGradesForOrg,
} from "../data/gpg-pay-structure.server"
import {
  buildGpgPayBandsListSurfaceConfiguration,
  buildGpgPayGradesListSurfaceConfiguration,
} from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"
import { GpgPayBandCreateDialog } from "./gpg-pay-band-create-dialog.client"
import { GpgPayGradeCreateDialog } from "./gpg-pay-grade-create-dialog.client"

export async function GpgPayStructureSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const [grades, bands, classifications, payGradeChoices] = await Promise.all([
    listGpgPayGradesForOrg(organizationId),
    listGpgPayBandsForOrg(organizationId),
    listGpgClassificationChoicesForOrg(organizationId),
    listGpgPayGradeChoicesForOrg(organizationId),
  ])

  const gradesConfiguration = buildGpgPayGradesListSurfaceConfiguration(
    grades,
    {
      empty: t("payGradesEmpty"),
      colCode: t("colCode"),
      colName: t("colName"),
      colClassification: t("colClassification"),
      colGsSes: t("colGsSes"),
      colState: t("colState"),
      colEffective: t("colEffective"),
      stateLabel: (state) => t(`masterStateLabels.${state}`),
    }
  )

  const bandsConfiguration = buildGpgPayBandsListSurfaceConfiguration(bands, {
    empty: t("payBandsEmpty"),
    colCode: t("colCode"),
    colName: t("colName"),
    colPayGrade: t("colPayGrade"),
    colMin: t("colMinRate"),
    colMax: t("colMaxRate"),
    colCurrency: t("colCurrency"),
    colState: t("colState"),
    stateLabel: (state) => t(`masterStateLabels.${state}`),
  })

  return (
    <>
      <Card size="sm" data-testid="gpg-pay-grades-section">
        <CardHeader>
          <CardTitle>{t("payGradesTitle")}</CardTitle>
          <CardDescription>{t("payGradesDescription")}</CardDescription>
          {canManage ? (
            <CardAction>
              <GpgPayGradeCreateDialog classifications={classifications} />
            </CardAction>
          ) : null}
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey={GPG_LIST_SURFACE_IDS.payGrades}
          listConfiguration={gradesConfiguration}
        />
      </Card>

      <Card size="sm" data-testid="gpg-pay-bands-section">
        <CardHeader>
          <CardTitle>{t("payBandsTitle")}</CardTitle>
          <CardDescription>{t("payBandsDescription")}</CardDescription>
          {canManage ? (
            <CardAction>
              <GpgPayBandCreateDialog payGrades={payGradeChoices} />
            </CardAction>
          ) : null}
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey={GPG_LIST_SURFACE_IDS.payBands}
          listConfiguration={bandsConfiguration}
        />
      </Card>
    </>
  )
}
