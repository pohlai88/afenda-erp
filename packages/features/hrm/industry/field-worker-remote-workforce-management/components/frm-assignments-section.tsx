import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildFrmAssignmentsListSurfaceConfiguration } from "../data/frm-surface-builders.server"
import { listFrmAssignmentsForOrg } from "../data/frm-assignments.server"
import { listFrmEmployeeChoicesForOrg } from "../data/frm.queries.server"
import { listFrmWorksiteChoicesForOrg } from "../data/frm-worksites.server"
import { FRM_LIST_SURFACE_IDS } from "../data/frm-surface-metadata.shared"
import type { HrmFrmAssignmentType } from "../schemas/frm-workflow-state.shared"
import { FrmAssignmentCreateDialog } from "./frm-assignment-create-dialog.client"

export async function FrmAssignmentsSection({
  orgSlug,
  organizationId,
  canManage,
}: {
  orgSlug: string
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.fieldWorkforce")
  const [rows, employees, worksites] = await Promise.all([
    listFrmAssignmentsForOrg(organizationId),
    listFrmEmployeeChoicesForOrg(organizationId),
    listFrmWorksiteChoicesForOrg(organizationId),
  ])

  const listConfiguration = buildFrmAssignmentsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("assignmentsEmpty"),
      colEmployee: t("colEmployee"),
      colWorksite: t("colWorksite"),
      colType: t("colType"),
      colStart: t("colStart"),
      colEnd: t("colEnd"),
      colState: t("colState"),
      formatType: (type) =>
        t(`assignmentTypeLabels.${type as HrmFrmAssignmentType}`),
    }
  )

  return (
    <section id="frm-assignments-section" data-testid="frm-assignments-section">
      <GovernedPatternBListSection
        title={t("assignmentsTitle")}
        description={t("assignmentsDescription")}
        surfaceKey={FRM_LIST_SURFACE_IDS.assignments}
        listConfiguration={listConfiguration}
        headerAction={
          canManage ? (
            <FrmAssignmentCreateDialog
              employees={employees}
              worksites={worksites}
            />
          ) : undefined
        }
      />
    </section>
  )
}
