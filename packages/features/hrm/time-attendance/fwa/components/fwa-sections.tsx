import { getFormatter, getTranslations } from "next-intl/server"

import type { EmptyState } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import {
  fwaArrangementKindMessageKey,
  formatFwaDateRange,
} from "../data/fwa-display.shared"
import {
  buildFwaActiveListSurfaceConfiguration,
  buildFwaActiveManageListSurfaceConfiguration,
  buildFwaArrangementTypesListSurfaceConfiguration,
} from "../data/fwa-surface-builders.server"
import { FWA_LIST_SURFACE_IDS } from "../data/fwa-surface-metadata.shared"
import type {
  FwaArrangementTypeChoiceRow,
  FwaListLoadError,
  OrgFwaRequestRow,
} from "../data/fwa.types.shared"
import type { HrmFwaArrangementKind } from "../schemas/fwa-workflow-state.shared"
import { FwaCreateTypeDialog } from "./fwa-create-type-dialog"
import { FwaSeedTypesButton } from "./fwa-seed-types-button"
import { FwaLifecycleTrailingCell } from "./fwa-lifecycle-trailing-cell.client"

function toFwaListLoadError(
  loadError: FwaListLoadError | undefined
): EmptyState | undefined {
  if (!loadError) return undefined
  return {
    variant: loadError.variant ?? "error",
    title: loadError.title,
    description: loadError.description,
  }
}

export async function FwaArrangementTypesSection({
  types,
  canManage,
  loadError,
}: {
  types: readonly FwaArrangementTypeChoiceRow[]
  canManage: boolean
  loadError?: FwaListLoadError
}) {
  const t = await getTranslations("Erp.Hrm.flexibleWork")

  if (loadError) {
    return (
      <GovernedPatternCListSection
        title={t("typesTitle")}
        description={t("typesDescription")}
        surfaceKey="hrm:flexible-work:types:error"
        resolveConfiguredPermission={false}
        listConfiguration={{
          dataNature: "table",
          surface: {
            header: { title: FWA_LIST_SURFACE_IDS.types },
            columnsId: FWA_LIST_SURFACE_IDS.types,
            rowKey: "id",
            empty: { variant: "muted", title: t("typesEmpty") },
          },
          columns: [{ id: "code", header: t("colCode") }],
          rows: [],
        }}
        loadError={toFwaListLoadError(loadError)}
      />
    )
  }

  if (types.length === 0) {
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("noTypesTitle")}</CardTitle>
          <CardDescription>{t("noTypesBody")}</CardDescription>
        </CardHeader>
        {canManage ? (
          <CardContent className="flex flex-wrap gap-2">
            <FwaSeedTypesButton />
            <FwaCreateTypeDialog />
          </CardContent>
        ) : null}
      </Card>
    )
  }

  return (
    <GovernedPatternCListSection
      title={t("typesTitle")}
      description={t("typesDescription")}
      surfaceKey="hrm:flexible-work:types"
      listConfiguration={buildFwaArrangementTypesListSurfaceConfiguration(
        types,
        {
          empty: t("typesEmpty"),
          colCode: t("colCode"),
          colLabel: t("colLabel"),
          colKind: t("colKind"),
          colRemoteRequired: t("colRemoteRequired"),
          kindLabelFor: (kind) =>
            t(fwaArrangementKindMessageKey(kind as HrmFwaArrangementKind)),
          yesNo: (value) => (value ? t("yes") : t("no")),
        }
      )}
      headerSlot={canManage ? <FwaCreateTypeDialog /> : undefined}
    />
  )
}

export async function FwaMyArrangementsSection({
  orgSlug,
  rows,
  loadError,
}: {
  orgSlug: string
  rows: readonly OrgFwaRequestRow[]
  loadError?: FwaListLoadError
}) {
  const t = await getTranslations("Erp.Hrm.flexibleWork")
  const format = await getFormatter()

  return (
    <GovernedPatternCListSection
      title={t("myActiveTitle")}
      description={t("myActiveDescription")}
      surfaceKey="hrm:flexible-work:my-active"
      listConfiguration={buildFwaActiveListSurfaceConfiguration(rows, {
        orgSlug,
        columnsId: FWA_LIST_SURFACE_IDS.myActive,
        empty: t("myActiveEmpty"),
        colEmployee: t("colEmployee"),
        colType: t("colType"),
        colDates: t("colDates"),
        colState: t("colState"),
        colRequested: t("colRequested"),
        formatRequestedAt: (date) =>
          format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
        stateLabelFor: (state) =>
          t(`stateLabels.${state}` as "stateLabels.active"),
      })}
      loadError={toFwaListLoadError(loadError)}
    />
  )
}

export async function FwaActiveArrangementsSection({
  orgSlug,
  rows,
  loadError,
  canManageLifecycle = false,
}: {
  orgSlug: string
  rows: readonly OrgFwaRequestRow[]
  loadError?: FwaListLoadError
  canManageLifecycle?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.flexibleWork")
  const format = await getFormatter()

  const copy = {
    orgSlug,
    columnsId: FWA_LIST_SURFACE_IDS.active,
    empty: t("activeEmpty"),
    colEmployee: t("colEmployee"),
    colType: t("colType"),
    colDates: t("colDates"),
    colState: t("colState"),
    colRequested: t("colRequested"),
    formatRequestedAt: (date: Date) =>
      format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
    stateLabelFor: (state: string) =>
      t(`stateLabels.${state}` as "stateLabels.active"),
  }

  const listConfiguration = canManageLifecycle
    ? buildFwaActiveManageListSurfaceConfiguration(rows, copy, {
        canManageLifecycle: true,
        manageLabel: t("manageLifecycleAction"),
      })
    : buildFwaActiveListSurfaceConfiguration(rows, copy)

  return (
    <div id="fwa-active-arrangements-section">
      <GovernedPatternCListSection
        title={t("activeTitle")}
        description={t("activeDescription")}
        surfaceKey="hrm:flexible-work:active"
        listConfiguration={listConfiguration}
        trailingColumn={
          canManageLifecycle
            ? {
                header: t("colActions"),
                Cell: FwaLifecycleTrailingCell,
                context: {
                  requests: rows.map((row) => ({
                    id: row.id,
                    dateRange: formatFwaDateRange({
                      startDate: row.startDate,
                      endDate: row.endDate,
                    }),
                  })),
                },
              }
            : undefined
        }
        loadError={toFwaListLoadError(loadError)}
      />
    </div>
  )
}
