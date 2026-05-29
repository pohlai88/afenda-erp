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

import { buildFrmTravelListSurfaceConfiguration } from "../data/frm-surface-builders.server"
import { listFrmTravelStatusesForOrg } from "../data/frm-travel.server"
import { FRM_LIST_SURFACE_IDS } from "../data/frm-surface-metadata.shared"
import {
  buildFrmListHref,
  EMPTY_FRM_LIST_URL_STATE,
  FRM_TRAVEL_LIST_OWNED_PARAMS,
  type FrmListUrlState,
} from "../data/frm-list-url-state.shared"
import type { FrmTravelStatusRow } from "../data/frm.types.shared"
import { listFrmActiveAssignmentChoicesForOrg } from "../data/frm-assignments.server"
import type { HrmFrmTravelClass } from "../schemas/frm-workflow-state.shared"
import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import { FrmTravelCreateDialog } from "./frm-travel-create-dialog.client"

export async function FrmTravelSection({
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
  const [rows, assignments] = await Promise.all([
    listFrmTravelStatusesForOrg(organizationId),
    listFrmActiveAssignmentChoicesForOrg(organizationId),
  ])
  const effectiveListUrlState = listUrlState ?? EMPTY_FRM_LIST_URL_STATE
  const filteredRows = Array.from(rows)
    .filter((row) =>
      matchesGovernedWorkbenchFocus(
        effectiveListUrlState.travelSearch,
        row.employeeLabel,
        row.destinationCity,
        row.destinationCountry,
        row.state,
        row.nonCompliant ? "non compliant" : "compliant"
      )
    )
    .filter((row) => {
      const compliance = effectiveListUrlState.travelCompliance
      if (!compliance || compliance === "all") return true
      return compliance === "non_compliant"
        ? row.nonCompliant
        : !row.nonCompliant
    })
    .sort((a, b) => {
      if (effectiveListUrlState.travelSort === "employee-asc") {
        return a.employeeLabel.localeCompare(b.employeeLabel)
      }
      return b.startDate.localeCompare(a.startDate)
    })
  const sectionHash = governedListSectionAnchorHref(FRM_LIST_SURFACE_IDS.travel)
  const currentHref = buildGovernedListToolbarCanonicalHref({
    currentHref: buildFrmListHref(
      organizationHrmPath(orgSlug, "field-workforce"),
      effectiveListUrlState,
      FRM_TRAVEL_LIST_OWNED_PARAMS
    ),
    ownedParams: FRM_TRAVEL_LIST_OWNED_PARAMS,
    hash: sectionHash,
  })
  const savedViewItems = buildGovernedListToolbarSavedViewItems({
    views: savedViews,
    currentHref,
    ownedParams: FRM_TRAVEL_LIST_OWNED_PARAMS,
    sectionHash,
  })
  const listConfiguration = buildFrmTravelListSurfaceConfiguration(
    filteredRows,
    orgSlug,
    {
      empty: t("travelEmpty"),
      colEmployee: t("colEmployee"),
      colClass: t("colTravelClass"),
      colStart: t("colStart"),
      colDestination: t("colDestination"),
      colState: t("colState"),
      colCompliance: t("colCompliance"),
      formatClass: (value) =>
        t(`travelClassLabels.${value as HrmFrmTravelClass}`),
      formatDestination: (row: FrmTravelStatusRow) =>
        [row.destinationCity, row.destinationCountry]
          .filter(Boolean)
          .join(", ") || "—",
      complianceLabel: (nonCompliant) =>
        nonCompliant ? t("nonCompliant") : t("compliant"),
    },
    {
      travelSearch: effectiveListUrlState.travelSearch,
      travelCompliance: effectiveListUrlState.travelCompliance,
      travelSort: effectiveListUrlState.travelSort,
      savedViewItems,
    }
  )

  return (
    <section id="frm-travel-section" data-testid="frm-travel-section">
      <GovernedPatternBListSection
        title={t("travelTitle")}
        description={t("travelDescription")}
        surfaceKey={FRM_LIST_SURFACE_IDS.travel}
        listConfiguration={listConfiguration}
        headerAction={
          canManage ? (
            <div className="flex flex-wrap justify-end gap-2">
              <RailSavedViewControls
                surfaceId="hrm"
                currentHref={currentHref}
                views={savedViewItems}
              />
              <FrmTravelCreateDialog assignments={assignments} />
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
    </section>
  )
}
