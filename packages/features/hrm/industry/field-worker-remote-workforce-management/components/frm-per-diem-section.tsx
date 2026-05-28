import { getTranslations } from "next-intl/server"

import {
  buildGovernedListToolbarCanonicalHref,
  buildGovernedListToolbarSavedViewItems,
  governedListSectionAnchorHref,
  matchesGovernedWorkbenchFocus,
  type GovernedListSavedViewSource,
} from "@afenda/governed-surface"
import { GovernedPatternBListSection } from "@afenda/governed-surface/server"
import { RailSavedViewControls } from "../../_integration/rail-memory.client"

import { buildFrmPerDiemReferencesListSurfaceConfiguration } from "../data/frm-surface-builders.server"
import {
  listFrmPerDiemReferencesForOrg,
  listFrmTravelStatusesForOrg,
} from "../data/frm-travel.server"
import { FRM_LIST_SURFACE_IDS } from "../data/frm-surface-metadata.shared"
import {
  buildFrmListHref,
  EMPTY_FRM_LIST_URL_STATE,
  FRM_PER_DIEM_LIST_OWNED_PARAMS,
  type FrmListUrlState,
} from "../data/frm-list-url-state.shared"
import type { FrmPerDiemReferenceRow } from "../data/frm.types.shared"
import { organizationHrmPath } from "../../../_core/shared"
import { FrmPerDiemApproveDialog } from "./frm-per-diem-approve-dialog.client"
import { FrmPerDiemRateCreateDialog } from "./frm-per-diem-rate-create-dialog.client"

export async function FrmPerDiemSection({
  orgSlug,
  organizationId,
  savedViews,
  canManage,
  listUrlState,
}: {
  orgSlug: string
  organizationId: string
  savedViews: readonly GovernedListSavedViewSource[]
  canManage: boolean
  listUrlState?: FrmListUrlState
}) {
  const t = await getTranslations("Erp.Hrm.fieldWorkforce")
  const [references, travels] = await Promise.all([
    listFrmPerDiemReferencesForOrg(organizationId),
    listFrmTravelStatusesForOrg(organizationId),
  ])

  const travelChoices = travels
    .filter((row) => row.state === "planned" || row.state === "active")
    .map((row) => ({
      id: row.id,
      label: `${row.employeeLabel} · ${row.startDate}`,
      startDate: row.startDate,
    }))
  const effectiveListUrlState = listUrlState ?? EMPTY_FRM_LIST_URL_STATE
  const filteredReferences = Array.from(references)
    .filter((row) =>
      matchesGovernedWorkbenchFocus(
        effectiveListUrlState.perDiemSearch,
        row.employeeLabel,
        row.eligibilityDate,
        row.dayPortion,
        row.state
      )
    )
    .filter((row) => {
      const state = effectiveListUrlState.perDiemState
      return !state || state === "all" ? true : row.state === state
    })
    .sort((a, b) => {
      if (effectiveListUrlState.perDiemSort === "amount-desc") {
        return Number(b.approvedAmount) - Number(a.approvedAmount)
      }
      return b.eligibilityDate.localeCompare(a.eligibilityDate)
    })
  const sectionHash = governedListSectionAnchorHref(
    FRM_LIST_SURFACE_IDS.perDiemReferences
  )
  const currentHref = buildGovernedListToolbarCanonicalHref({
    currentHref: buildFrmListHref(
      organizationHrmPath(orgSlug, "field-workforce"),
      effectiveListUrlState,
      FRM_PER_DIEM_LIST_OWNED_PARAMS
    ),
    ownedParams: FRM_PER_DIEM_LIST_OWNED_PARAMS,
    hash: sectionHash,
  })
  const savedViewItems = buildGovernedListToolbarSavedViewItems({
    views: savedViews,
    currentHref,
    ownedParams: FRM_PER_DIEM_LIST_OWNED_PARAMS,
    sectionHash,
  })

  const listConfiguration = buildFrmPerDiemReferencesListSurfaceConfiguration(
    filteredReferences,
    orgSlug,
    {
      empty: t("perDiemEmpty"),
      colEmployee: t("colEmployee"),
      colDate: t("colEligibilityDate"),
      colPortion: t("colDayPortion"),
      colAmount: t("colAmount"),
      colState: t("colState"),
      formatAmount: (row: FrmPerDiemReferenceRow) =>
        `${row.approvedAmount} ${row.currencyCode}`,
    },
    {
      perDiemSearch: effectiveListUrlState.perDiemSearch,
      perDiemState: effectiveListUrlState.perDiemState,
      perDiemSort: effectiveListUrlState.perDiemSort,
      savedViewItems,
    }
  )

  return (
    <div data-testid="frm-per-diem-section">
      <GovernedPatternBListSection
        title={t("perDiemTitle")}
        description={t("perDiemDescription")}
        surfaceKey={FRM_LIST_SURFACE_IDS.perDiemReferences}
        listConfiguration={listConfiguration}
        headerAction={
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <RailSavedViewControls
                surfaceId="hrm"
                currentHref={currentHref}
                views={savedViewItems}
              />
              <FrmPerDiemRateCreateDialog />
              <FrmPerDiemApproveDialog travels={travelChoices} />
            </div>
          ) : (
            <RailSavedViewControls
              surfaceId="hrm"
              currentHref={currentHref}
              views={savedViewItems}
            />
          )
        }
      />
    </div>
  )
}
