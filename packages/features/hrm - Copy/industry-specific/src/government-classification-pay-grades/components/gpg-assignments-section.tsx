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
  listGpgEmployeeAssignmentsForOrg,
  listGpgEmployeeChoicesForOrg,
  listGpgPublishedSalaryTableVersionChoicesForOrg,
} from "../data/gpg-assignments.server"
import { listGpgClassificationChoicesForOrg } from "../data/gpg-classifications.server"
import {
  listGpgPayBandChoicesForOrg,
  listGpgPayGradeChoicesForOrg,
} from "../data/gpg-pay-structure.server"
import { buildGpgEmployeeAssignmentsListSurfaceConfiguration } from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"
import { GpgAssignmentCreateDialog } from "./gpg-assignment-create-dialog.client"

export async function GpgAssignmentsSection({
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
    rows,
    employees,
    classifications,
    payGrades,
    payBands,
    salaryVersions,
  ] = await Promise.all([
    listGpgEmployeeAssignmentsForOrg(organizationId),
    listGpgEmployeeChoicesForOrg(organizationId),
    listGpgClassificationChoicesForOrg(organizationId),
    listGpgPayGradeChoicesForOrg(organizationId),
    listGpgPayBandChoicesForOrg(organizationId),
    listGpgPublishedSalaryTableVersionChoicesForOrg(organizationId),
  ])

  const formatMoney = (amount: string | null, currency: string | null) => {
    if (!amount) return "—"
    return currency ? `${amount} ${currency}` : amount
  }

  const listConfiguration = buildGpgEmployeeAssignmentsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("assignmentsEmpty"),
      colEmployee: t("colEmployee"),
      colClassification: t("colClassification"),
      colPayGrade: t("colPayGrade"),
      colStep: t("colStep"),
      colBase: t("colBaseRate"),
      colAdjusted: t("colAdjustedPay"),
      colEffective: t("colEffective"),
      colState: t("colState"),
      stateLabel: (state) => t(`assignmentStateLabels.${state}`),
      formatMoney,
    }
  )

  return (
    <Card size="sm" data-testid="gpg-assignments-section">
      <CardHeader>
        <CardTitle>{t("assignmentsTitle")}</CardTitle>
        <CardDescription>{t("assignmentsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <GpgAssignmentCreateDialog
              employees={employees}
              classifications={classifications}
              payGrades={payGrades}
              payBands={payBands}
              salaryVersions={salaryVersions}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={GPG_LIST_SURFACE_IDS.assignments}
        listConfiguration={listConfiguration}
      />
    </Card>
  )
}
