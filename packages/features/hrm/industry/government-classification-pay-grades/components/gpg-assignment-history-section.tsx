import { getTranslations } from "next-intl/server"

import { Card, CardDescription, CardHeader, CardTitle } from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { listGpgAssignmentHistoryForOrg } from "../data/gpg-assignment-history.server"
import { buildGpgAssignmentHistoryListSurfaceConfiguration } from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"

export async function GpgAssignmentHistorySection({
  organizationId,
  orgSlug,
}: {
  organizationId: string
  orgSlug: string
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const history = await listGpgAssignmentHistoryForOrg(organizationId)

  const listConfiguration = buildGpgAssignmentHistoryListSurfaceConfiguration(
    history,
    orgSlug,
    {
      empty: t("assignmentHistoryEmpty"),
      colEmployee: t("colEmployee"),
      colAsOf: t("colAsOfDate"),
      colClassification: t("colClassification"),
      colPayGrade: t("colPayGrade"),
      colStep: t("colStep"),
    }
  )

  return (
    <Card size="sm" data-testid="gpg-assignment-history-section">
      <CardHeader>
        <CardTitle>{t("assignmentHistoryTitle")}</CardTitle>
        <CardDescription>{t("assignmentHistoryDescription")}</CardDescription>
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={GPG_LIST_SURFACE_IDS.assignmentHistory}
        listConfiguration={listConfiguration}
      />
    </Card>
  )
}
