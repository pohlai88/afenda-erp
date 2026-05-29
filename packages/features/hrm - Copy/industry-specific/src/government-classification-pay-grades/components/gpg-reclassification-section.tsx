import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listGpgEmployeeChoicesForOrg } from "../data/gpg-assignments.server"
import { listGpgClassificationsForOrg } from "../data/gpg-classifications.server"
import { formatGpgClassificationLabel } from "../data/gpg-display.shared"
import { listGpgReclassificationRequestsForOrg } from "../data/gpg-reclassification.server"
import { buildGpgReclassificationRequestsListSurfaceConfiguration } from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { GpgReclassificationCreateDialog } from "./gpg-reclassification-create-dialog.client"
import { GpgReclassificationTrailingCell } from "./gpg-list-trailing-cells.client"

export async function GpgReclassificationSection({
  organizationId,
  orgSlug,
  canManage,
}: {
  organizationId: string
  orgSlug: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const [requests, employees, classifications] = await Promise.all([
    listGpgReclassificationRequestsForOrg(organizationId),
    listGpgEmployeeChoicesForOrg(organizationId),
    listGpgClassificationsForOrg(organizationId),
  ])

  const listConfiguration =
    buildGpgReclassificationRequestsListSurfaceConfiguration(
      requests,
      orgSlug,
      {
        empty: t("reclassificationEmpty"),
        colEmployee: t("colEmployee"),
        colFrom: t("colFromClassification"),
        colTo: t("colToClassification"),
        colState: t("colState"),
        colReason: t("fieldReason"),
        stateLabel: (state) => t(`reclassificationStateLabels.${state}`),
      },
      canManage
        ? {
            canManage: true,
            approveLabel: t("approveReclassification"),
            rejectLabel: t("rejectReclassification"),
          }
        : undefined
    )

  const classificationChoices = classifications.map((row) => ({
    id: row.id,
    label: formatGpgClassificationLabel(row),
  }))

  return (
    <Card size="sm" data-testid="gpg-reclassification-section">
      <CardHeader>
        <CardTitle>{t("reclassificationTitle")}</CardTitle>
        <CardDescription>{t("reclassificationDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <GpgReclassificationCreateDialog
              employees={employees}
              classifications={classificationChoices}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={GPG_LIST_SURFACE_IDS.reclassificationRequests}
        listConfiguration={listConfiguration}
        trailingColumn={
          canManage
            ? {
                header: t("colActions"),
                Cell: GpgReclassificationTrailingCell,
                context: {
                  requests: requests.map((row) => ({
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
