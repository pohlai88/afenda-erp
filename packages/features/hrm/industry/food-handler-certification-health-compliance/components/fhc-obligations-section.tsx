import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { listFhcEvidenceDocumentChoicesForEmployee } from "../data/fhc-evidence-documents.server"
import { buildFhcObligationsListSurfaceConfiguration } from "../data/fhc-surface-builders.server"
import { listFhcEmployeeObligationsForOrg } from "../data/fhc.queries.server"
import type { FhcEvidenceDocumentChoiceRow } from "../data/fhc.types.shared"
import { FHC_LIST_SURFACE_IDS } from "../data/fhc-surface-metadata.shared"
import type { HrmFhcComplianceStatus } from "../schemas/fhc-workflow-state.shared"
import { FhcObligationsTrailingCell } from "./fhc-obligations-trailing-cell.client"
import { FhcPermitSubmitDialog } from "./fhc-permit-submit-dialog.client"
import { FhcRecomputeObligationsButton } from "./fhc-recompute-obligations-button.client"

export async function FhcObligationsSection({
  orgSlug,
  organizationId,
  canManage,
  canAudit,
  parentAccessAllowed = true,
}: {
  orgSlug: string
  organizationId: string
  canManage: boolean
  canAudit: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")
  const tWorkforce = await getTranslations("Erp.Hrm.workforce")
  const rows = await listFhcEmployeeObligationsForOrg(organizationId)

  const uniqueEmployeeIds = [...new Set(rows.map((row) => row.employeeId))]
  const documentChoicesMap = new Map<string, FhcEvidenceDocumentChoiceRow[]>()
  await Promise.all(
    uniqueEmployeeIds.map(async (employeeId) => {
      const documents = await listFhcEvidenceDocumentChoicesForEmployee({
        organizationId,
        employeeId,
      })
      documentChoicesMap.set(
        employeeId,
        documents.map((doc) => ({
          id: doc.id,
          label: `${tWorkforce(doc.documentTypeLabelKey)} · ${doc.title}`,
        }))
      )
    })
  )

  const listConfiguration = buildFhcObligationsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("obligationsEmpty"),
      colEmployee: t("colEmployee"),
      colOutlet: t("colOutlet"),
      colStatus: t("colStatus"),
      colComputed: t("colComputed"),
      anyLabel: t("anyCriteria"),
      statusLabelFor: (status) =>
        t(`complianceStatusLabels.${status as HrmFhcComplianceStatus}`),
      formatComputedAt: (date) =>
        date
          ? new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(date)
          : t("notComputed"),
    },
    { canManage }
  )

  const documentChoicesByEmployeeId = Object.fromEntries(
    documentChoicesMap
  ) as Record<string, FhcEvidenceDocumentChoiceRow[]>

  return (
    <Card
      size="sm"
      id="fhc-obligations-section"
      data-testid="fhc-obligations-section"
    >
      <CardHeader>
        <CardTitle>{t("obligationsTitle")}</CardTitle>
        <CardDescription>{t("obligationsDescription")}</CardDescription>
        {canManage ? (
          <CardAction className="flex flex-wrap items-center justify-end gap-2">
            <FhcPermitSubmitDialog obligations={rows} />
            <FhcRecomputeObligationsButton />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={FHC_LIST_SURFACE_IDS.obligations}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
        resolveConfiguredPermission={false}
        trailingColumn={
          canManage
            ? {
                header: t("colActions"),
                Cell: FhcObligationsTrailingCell,
                context: {
                  canAudit,
                  obligations: rows,
                  documentChoicesByEmployeeId,
                },
              }
            : undefined
        }
      />
    </Card>
  )
}
