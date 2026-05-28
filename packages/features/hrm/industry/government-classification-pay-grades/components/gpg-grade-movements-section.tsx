import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listGpgClassificationsForOrg } from "../data/gpg-classifications.server"
import {
  listGpgEmployeesWithActiveAssignmentsForOrg,
  listGpgGradeMovementsForOrg,
} from "../data/gpg-grade-movements.server"
import {
  listGpgPayBandsForOrg,
  listGpgPayGradesForOrg,
} from "../data/gpg-pay-structure.server"
import { listGpgPublishedSalaryTableVersionChoicesForOrg } from "../data/gpg-assignments.server"
import { buildGpgGradeMovementsListSurfaceConfiguration } from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"
import {
  formatGpgClassificationLabel,
  formatGpgPayBandLabel,
  formatGpgPayGradeLabel,
} from "../data/gpg-display.shared"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { GpgGradeMovementCreateDialog } from "./gpg-grade-movement-create-dialog.client"
import { GpgGradeMovementTrailingCell } from "./gpg-list-trailing-cells.client"

export async function GpgGradeMovementsSection({
  organizationId,
  orgSlug,
  canManage,
}: {
  organizationId: string
  orgSlug: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const [
    movements,
    assignments,
    classifications,
    payGrades,
    payBands,
    salaryVersions,
  ] = await Promise.all([
    listGpgGradeMovementsForOrg(organizationId),
    listGpgEmployeesWithActiveAssignmentsForOrg(organizationId),
    listGpgClassificationsForOrg(organizationId),
    listGpgPayGradesForOrg(organizationId),
    listGpgPayBandsForOrg(organizationId),
    listGpgPublishedSalaryTableVersionChoicesForOrg(organizationId),
  ])

  const listConfiguration = buildGpgGradeMovementsListSurfaceConfiguration(
    movements,
    orgSlug,
    {
      empty: t("gradeMovementsEmpty"),
      colEmployee: t("colEmployee"),
      colType: t("colMovementType"),
      colFrom: t("colFromGradeStep"),
      colTo: t("colToGradeStep"),
      colEffective: t("fieldEffectiveDate"),
      colRetention: t("colRetention"),
      colState: t("colState"),
      typeLabel: (type) => t(`movementTypeLabels.${type}`),
      stateLabel: (state) => t(`movementStateLabels.${state}`),
      formatFromTo: (gradeLabel, step) =>
        gradeLabel && step != null ? `${gradeLabel} · ${step}` : "—",
    },
    canManage
      ? { canManage: true, applyLabel: t("applyGradeMovement") }
      : undefined
  )

  const classificationChoices = classifications.map((row) => ({
    id: row.id,
    label: formatGpgClassificationLabel(row),
  }))
  const payGradeChoices = payGrades.map((row) => ({
    id: row.id,
    label: formatGpgPayGradeLabel(row),
  }))
  const payBandChoices = payBands.map((row) => ({
    id: row.id,
    label: formatGpgPayBandLabel(row),
  }))

  return (
    <Card size="sm" data-testid="gpg-grade-movements-section">
      <CardHeader>
        <CardTitle>{t("gradeMovementsTitle")}</CardTitle>
        <CardDescription>{t("gradeMovementsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <GpgGradeMovementCreateDialog
              assignments={assignments}
              classifications={classificationChoices}
              payGrades={payGradeChoices}
              payBands={payBandChoices}
              salaryVersions={salaryVersions}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={GPG_LIST_SURFACE_IDS.gradeMovements}
        listConfiguration={listConfiguration}
        trailingColumn={
          canManage
            ? {
                header: t("colActions"),
                Cell: GpgGradeMovementTrailingCell,
                context: {
                  movements: movements.map((row) => ({
                    id: row.id,
                    state: row.state,
                  })),
                },
              }
            : undefined
        }
      />
    </Card>
  )
}
