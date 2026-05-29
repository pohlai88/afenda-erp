import { getTranslations } from "next-intl/server"

import { Card, CardDescription, CardHeader, CardTitle } from "@afenda/ui/card"
import {
  buildGovernedListToolbarCanonicalHref,
  buildGovernedListToolbarSavedViewItems,
  governedListSectionAnchorHref,
  matchesGovernedWorkbenchFocus,
  type GovernedListSavedViewSource,
} from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { RailSavedViewControls } from "../../_integration/rail-memory.client"
import { buildFrmExceptionsListSurfaceConfiguration } from "../data/frm-surface-builders.server"
import { listFrmExceptionsForOrg } from "../data/frm-exceptions.server"
import { FRM_LIST_SURFACE_IDS } from "../data/frm-surface-metadata.shared"
import {
  buildFrmListHref,
  EMPTY_FRM_LIST_URL_STATE,
  FRM_EXCEPTION_LIST_OWNED_PARAMS,
  type FrmListUrlState,
} from "../data/frm-list-url-state.shared"
import type { HrmFrmExceptionCode } from "../schemas/frm-workflow-state.shared"
import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import { FrmExceptionTrailingCell } from "./frm-exception-trailing-cell.client"

export async function FrmExceptionsSection({
  orgSlug,
  organizationId,
  savedViews,
  canManage,
  parentAccessAllowed = true,
  listUrlState,
  workbenchFocus,
}: {
  orgSlug: string
  organizationId: string
  savedViews: readonly GovernedListSavedViewSource[]
  canManage: boolean
  parentAccessAllowed?: boolean
  listUrlState?: FrmListUrlState
  workbenchFocus?: string | null
}) {
  const t = await getTranslations("Erp.Hrm.fieldWorkforce")
  const rows = await listFrmExceptionsForOrg(organizationId)
  const effectiveListUrlState = listUrlState ?? {
    ...EMPTY_FRM_LIST_URL_STATE,
    focus: workbenchFocus ?? null,
  }

  const filteredRows = Array.from(rows)
    .filter((row) =>
      matchesGovernedWorkbenchFocus(
        effectiveListUrlState.focus,
        row.employeeLabel,
        row.exceptionCode,
        row.exceptionDate,
        row.state
      )
    )
    .filter((row) => {
      const state = effectiveListUrlState.exceptionState
      return !state || state === "all" ? true : row.state === state
    })
    .filter((row) => {
      const code = effectiveListUrlState.exceptionCode
      return !code || code === "all" ? true : row.exceptionCode === code
    })
    .sort((a, b) => {
      if (effectiveListUrlState.exceptionSort === "employee-asc") {
        return a.employeeLabel.localeCompare(b.employeeLabel)
      }
      return b.exceptionDate.localeCompare(a.exceptionDate)
    })
  const sectionHash = governedListSectionAnchorHref(
    FRM_LIST_SURFACE_IDS.exceptions
  )
  const currentHref = buildGovernedListToolbarCanonicalHref({
    currentHref: buildFrmListHref(
      organizationHrmPath(orgSlug, "field-workforce"),
      effectiveListUrlState,
      FRM_EXCEPTION_LIST_OWNED_PARAMS
    ),
    ownedParams: FRM_EXCEPTION_LIST_OWNED_PARAMS,
    hash: sectionHash,
  })
  const savedViewItems = buildGovernedListToolbarSavedViewItems({
    views: savedViews,
    currentHref,
    ownedParams: FRM_EXCEPTION_LIST_OWNED_PARAMS,
    sectionHash,
  })

  const listConfiguration = buildFrmExceptionsListSurfaceConfiguration(
    filteredRows,
    orgSlug,
    {
      empty: t("exceptionsEmpty"),
      colEmployee: t("colEmployee"),
      colCode: t("colCode"),
      colDate: t("colDate"),
      colState: t("colState"),
      formatCode: (code) =>
        t(`exceptionCodeLabels.${code as HrmFrmExceptionCode}`),
    },
    {
      canManage,
      workbenchFocusSearch: {
        label: t("toolbarSearchLabel"),
        placeholder: t("toolbarSearchPlaceholder"),
        value: effectiveListUrlState.focus,
      },
      exceptionState: effectiveListUrlState.exceptionState,
      exceptionCode: effectiveListUrlState.exceptionCode,
      exceptionSort: effectiveListUrlState.exceptionSort,
      savedViewItems,
    }
  )

  return (
    <Card
      size="sm"
      id="frm-exceptions-section"
      data-testid="frm-exceptions-section"
    >
      <CardHeader>
        <CardTitle>{t("exceptionsTitle")}</CardTitle>
        <CardDescription>{t("exceptionsDescription")}</CardDescription>
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={FRM_LIST_SURFACE_IDS.exceptions}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
        resolveConfiguredPermission={false}
        headerSlot={
          <div className="mb-2 flex justify-end">
            <RailSavedViewControls
              surfaceId="hrm"
              currentHref={currentHref}
              views={savedViewItems}
            />
          </div>
        }
        trailingColumn={
          canManage
            ? {
                header: t("colActions"),
                Cell: FrmExceptionTrailingCell,
              }
            : undefined
        }
      />
    </Card>
  )
}
