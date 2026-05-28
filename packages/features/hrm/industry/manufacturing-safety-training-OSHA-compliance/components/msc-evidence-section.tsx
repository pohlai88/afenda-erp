import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import type { MscEvidenceLinkRow } from "../data/msc-evidence.server"
import { buildMscEvidenceListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type { MscEmployeeObligationRow } from "../data/msc.types.shared"
import { MscEvidenceLinkDialog } from "./msc-evidence-link-dialog.client"

export async function MscEvidenceSection({
  evidenceLinks,
  obligations,
  canManage,
  parentAccessAllowed = true,
}: {
  evidenceLinks: readonly MscEvidenceLinkRow[]
  obligations: readonly MscEmployeeObligationRow[]
  canManage: boolean
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration = buildMscEvidenceListSurfaceConfiguration(
    evidenceLinks,
    {
      empty: t("evidenceEmpty"),
      colSubjectKind: t("colSubjectKind"),
      colSubjectId: t("colSubjectId"),
      colDocument: t("colDocument"),
      colEmployee: t("colEmployee"),
      colCreated: t("colCreated"),
      notRecorded: t("notRecorded"),
      formatCreatedAt: (date) =>
        new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date),
    }
  )

  return (
    <Card size="sm" data-testid="msc-evidence-section">
      <CardHeader>
        <CardTitle>{t("evidenceTitle")}</CardTitle>
        <CardDescription>{t("evidenceDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <MscEvidenceLinkDialog obligations={obligations} />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={MSC_LIST_SURFACE_IDS.evidence}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
      />
    </Card>
  )
}
