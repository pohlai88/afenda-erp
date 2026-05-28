import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { listGpgPayGradeChoicesForOrg } from "../data/gpg-pay-structure.server"
import {
  buildGpgSalaryTableRowsListSurfaceConfiguration,
  buildGpgSalaryTableVersionsListSurfaceConfiguration,
} from "../data/gpg-surface-builders.server"
import { GPG_LIST_SURFACE_IDS } from "../data/gpg-surface-metadata.shared"
import {
  findGpgDraftSalaryTableVersionForOrg,
  listGpgSalaryTableRowsForVersion,
  listGpgSalaryTableVersionsForOrg,
} from "../data/gpg-salary-tables.server"
import { GpgSalaryRowCreateDialog } from "./gpg-salary-row-create-dialog.client"
import { GpgSalaryTableCreateDialog } from "./gpg-salary-table-create-dialog.client"
import { GpgSalaryTablePublishButton } from "./gpg-salary-table-publish-button.client"

export async function GpgSalaryTablesSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const [versions, draft, payGrades] = await Promise.all([
    listGpgSalaryTableVersionsForOrg(organizationId),
    findGpgDraftSalaryTableVersionForOrg(organizationId),
    listGpgPayGradeChoicesForOrg(organizationId),
  ])

  const draftRows = draft
    ? await listGpgSalaryTableRowsForVersion(organizationId, draft.id)
    : []

  const versionsConfiguration =
    buildGpgSalaryTableVersionsListSurfaceConfiguration(versions, {
      empty: t("salaryTablesEmpty"),
      colCode: t("colCode"),
      colVersion: t("colVersion"),
      colEffective: t("colEffective"),
      colState: t("colState"),
      colRows: t("colRowCount"),
      stateLabel: (state) => t(`salaryVersionStateLabels.${state}`),
    })

  const rowsConfiguration = buildGpgSalaryTableRowsListSurfaceConfiguration(
    draftRows,
    {
      empty: t("salaryTableRowsEmpty"),
      colPayGrade: t("colPayGrade"),
      colStep: t("colStep"),
      colBase: t("colBaseRate"),
      colMin: t("colMinRate"),
      colMax: t("colMaxRate"),
      colCurrency: t("colCurrency"),
    }
  )

  return (
    <>
      <Card size="sm" data-testid="gpg-salary-tables-section">
        <CardHeader>
          <CardTitle>{t("salaryTablesTitle")}</CardTitle>
          <CardDescription>{t("salaryTablesDescription")}</CardDescription>
          {canManage ? (
            <CardAction className="flex flex-wrap items-center justify-end gap-2">
              <GpgSalaryTableCreateDialog />
              {draft ? (
                <GpgSalaryTablePublishButton tableVersionId={draft.id} />
              ) : null}
            </CardAction>
          ) : null}
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey={GPG_LIST_SURFACE_IDS.salaryTables}
          listConfiguration={versionsConfiguration}
        />
      </Card>

      {draft ? (
        <Card size="sm" data-testid="gpg-salary-table-draft-rows-section">
          <CardHeader>
            <CardTitle>{t("salaryTableDraftTitle")}</CardTitle>
            <CardDescription>
              {t("salaryTableDraftDescription", {
                code: draft.code,
                version: draft.versionNumber,
              })}
            </CardDescription>
            {canManage ? (
              <CardAction>
                <GpgSalaryRowCreateDialog
                  tableVersionId={draft.id}
                  payGrades={payGrades}
                />
              </CardAction>
            ) : null}
          </CardHeader>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            description=""
            surfaceKey={GPG_LIST_SURFACE_IDS.salaryTableRows}
            listConfiguration={rowsConfiguration}
          />
        </Card>
      ) : null}
    </>
  )
}
