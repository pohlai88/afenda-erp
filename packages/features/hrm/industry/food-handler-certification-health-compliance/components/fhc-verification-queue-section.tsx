import { getTranslations } from "next-intl/server"

import { Card, CardDescription, CardHeader, CardTitle } from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { buildFhcVerificationQueueListSurfaceConfiguration } from "../data/fhc-surface-builders.server"
import { listFhcVerificationQueueForOrg } from "../data/fhc-verification.server"
import { FHC_LIST_SURFACE_IDS } from "../data/fhc-surface-metadata.shared"
import { FhcVerificationTrailingCell } from "./fhc-verification-trailing-cell.client"

export async function FhcVerificationQueueSection({
  orgSlug,
  organizationId,
  canVerify,
}: {
  orgSlug: string
  organizationId: string
  canVerify: boolean
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")
  const rows = await listFhcVerificationQueueForOrg(organizationId)

  const listConfiguration = buildFhcVerificationQueueListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("verificationEmpty"),
      colEmployee: t("colEmployee"),
      colSubject: t("colSubject"),
      colState: t("colState"),
      colSubmitted: t("colSubmitted"),
      formatSubmitted: (date) =>
        new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date),
    },
    { canVerify }
  )

  return (
    <Card
      size="sm"
      id="fhc-verification-queue-section"
      data-testid="fhc-verification-queue-section"
    >
      <CardHeader>
        <CardTitle>{t("verificationTitle")}</CardTitle>
        <CardDescription>
          {canVerify ? t("verificationDescription") : t("verificationReadOnly")}
        </CardDescription>
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={FHC_LIST_SURFACE_IDS.verificationQueue}
        listConfiguration={listConfiguration}
        parentAccessAllowed
        resolveConfiguredPermission={false}
        trailingColumn={
          canVerify
            ? {
                header: t("colActions"),
                Cell: FhcVerificationTrailingCell,
                context: {
                  rows: rows.map((row) => ({
                    id: row.id,
                    employeeId: row.employeeId,
                    employeeLabel: row.employeeLabel,
                    subjectKind: row.subjectKind,
                    subjectId: row.subjectId,
                    obligationId: row.obligationId,
                    verificationState: row.verificationState,
                  })),
                },
              }
            : undefined
        }
      />
    </Card>
  )
}
