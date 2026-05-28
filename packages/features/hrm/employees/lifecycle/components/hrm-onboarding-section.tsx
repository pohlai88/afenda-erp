import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { buildOnboardingListSurfaceConfiguration } from "../data/onboarding-list-surface.server"
import { ONBOARDING_LIST_SURFACE_IDS } from "../data/onboarding-surface-metadata.shared"
import {
  type OnboardingContractRow,
  listActiveContractsForOnboardingOverview,
} from "../data/onboarding.queries.server"

import { HrmOnboardingTrailingCell } from "./hrm-onboarding-trailing-cell.client"

type HrmOnboardingSectionProps = {
  orgSlug: string
  organizationId: string
  canRead: boolean
  canUpdate: boolean
}

export async function HrmOnboardingSection({
  orgSlug,
  organizationId,
  canRead,
  canUpdate,
}: HrmOnboardingSectionProps) {
  const [t, rowsResult] = await Promise.all([
    getTranslations("Erp.Hrm.onboarding"),
    canRead
      ? (async (): Promise<
          | { ok: true; rows: ReadonlyArray<OnboardingContractRow> }
          | { ok: false; error: unknown }
        > => {
          try {
            const rows =
              await listActiveContractsForOnboardingOverview(organizationId)
            return { ok: true, rows }
          } catch (error) {
            return { ok: false, error }
          }
        })()
      : Promise.resolve({ ok: true as const, rows: [] }),
  ])

  const copy = {
    empty: t("emptyBody"),
    colEmployee: t("colEmployee"),
    colCompleted: t("colCompleted"),
    readOnlyUpdateReason: t("readOnlyUpdateReason"),
  }

  let listConfiguration = buildOnboardingListSurfaceConfiguration(
    [],
    orgSlug,
    copy,
    {
      canUpdate,
    }
  )
  let surfaceKey: string = ONBOARDING_LIST_SURFACE_IDS.contracts
  let loadError:
    | {
        variant: "error"
        title: string
      }
    | undefined

  if (!rowsResult.ok) {
    logUnexpectedServerError(
      "hrm-onboarding-section: query failed",
      rowsResult.error,
      { organizationId }
    )
    surfaceKey = ONBOARDING_LIST_SURFACE_IDS.contractsError
    loadError = {
      variant: "error",
      title: t("tableLoadFailed"),
    }
  } else {
    listConfiguration = buildOnboardingListSurfaceConfiguration(
      rowsResult.rows,
      orgSlug,
      copy,
      { canUpdate }
    )
  }

  const rows = rowsResult.ok ? rowsResult.rows : []
  const allowed = canRead

  return (
    <GovernedPatternCListSection
      title={rows.length === 0 && allowed ? t("emptyTitle") : t("tableTitle")}
      description={
        rows.length === 0 && allowed ? t("emptyBody") : t("tableDescription")
      }
      listConfiguration={listConfiguration}
      surfaceKey={surfaceKey}
      parentAccessAllowed={allowed}
      loadError={loadError}
      forbidden={{
        variant: "forbidden",
        title: t("forbiddenTitle"),
        description: t("forbiddenDescription"),
      }}
      invalid={{
        variant: "error",
        title: t("invalidConfigTitle"),
        description: t("invalidConfigDescription"),
      }}
      trailingColumn={{
        header: t("colRecord"),
        Cell: HrmOnboardingTrailingCell,
        context: { orgSlug },
      }}
    />
  )
}
