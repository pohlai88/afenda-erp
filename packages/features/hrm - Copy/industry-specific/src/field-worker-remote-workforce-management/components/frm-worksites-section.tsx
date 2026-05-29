import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildFrmWorksitesListSurfaceConfiguration } from "../data/frm-surface-builders.server"
import { listFrmWorksitesForOrg } from "../data/frm-worksites.server"
import { FRM_LIST_SURFACE_IDS } from "../data/frm-surface-metadata.shared"
import type { HrmFrmWorksiteType } from "../schemas/frm-workflow-state.shared"
import { FrmWorksiteCreateDialog } from "./frm-worksite-create-dialog.client"

export async function FrmWorksitesSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.fieldWorkforce")
  const rows = await listFrmWorksitesForOrg(organizationId)
  const listConfiguration = buildFrmWorksitesListSurfaceConfiguration(rows, {
    empty: t("worksitesEmpty"),
    colCode: t("colCode"),
    colName: t("colName"),
    colType: t("colType"),
    colLocation: t("colLocation"),
    colRemote: t("colRemote"),
    colActive: t("colActive"),
    yesNo: (value) => (value ? t("yes") : t("no")),
    formatLocation: (row) =>
      [row.city, row.countryCode].filter(Boolean).join(", ") || "—",
    formatType: (type) => t(`worksiteTypeLabels.${type as HrmFrmWorksiteType}`),
  })

  return (
    <div data-testid="frm-worksites-section">
      <GovernedPatternBListSection
        title={t("worksitesTitle")}
        description={t("worksitesDescription")}
        surfaceKey={FRM_LIST_SURFACE_IDS.worksites}
        listConfiguration={listConfiguration}
        headerAction={canManage ? <FrmWorksiteCreateDialog /> : undefined}
      />
    </div>
  )
}
