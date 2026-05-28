import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildMscCertificationsListSurfaceConfiguration } from "../data/msc-surface-builders.server"
import { MSC_LIST_SURFACE_IDS } from "../data/msc-surface-metadata.shared"
import type { MscCertificationRow } from "../data/msc.types.shared"
import type { HrmMscCertStatus } from "../schemas/msc-workflow-state.shared"

export async function MscCertificationsSection({
  orgSlug,
  rows,
  parentAccessAllowed = true,
}: {
  orgSlug: string
  rows: readonly MscCertificationRow[]
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const listConfiguration = buildMscCertificationsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("certificationsEmpty"),
      colEmployee: t("colEmployee"),
      colType: t("colCertType"),
      colStatus: t("colStatus"),
      colIssue: t("colIssueDate"),
      colExpiry: t("colExpiryDate"),
      colRenewal: t("colRenewalDate"),
      statusLabelFor: (status) =>
        t(`certStatusLabels.${status as HrmMscCertStatus}`),
      notRecorded: t("notRecorded"),
    }
  )

  return (
    <div
      id="msc-certifications-section"
      data-testid="msc-certifications-section"
    >
      <GovernedPatternCListSection
        surfaceKey={MSC_LIST_SURFACE_IDS.certifications}
        title={t("certificationsTitle")}
        description={t("certificationsDescription")}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
      />
    </div>
  )
}
