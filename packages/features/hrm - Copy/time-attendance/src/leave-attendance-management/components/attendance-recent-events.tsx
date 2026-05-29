import { getTranslations } from "next-intl/server"

import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"
import { getOrganizationSlugById } from "@afenda/platform/auth/org-slug.server"

import {
  type OrgAttendanceEventRow,
  listRecentAttendanceEventsForOrg,
} from "../data/attendance.queries.server"
import {
  buildAttendanceRecentListSurfaceConfiguration,
  type AttendanceEventDisplayRow,
} from "../data/attendance-list-surface.server"
import { ATTENDANCE_LIST_SURFACE_IDS } from "../data/attendance-surface-metadata.shared"
import { buildEmbeddedListSurfaceErrorConfiguration } from "../data/lam-embedded-list-surface-error.server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { AttendanceRecentTrailingCell } from "./attendance-recent-trailing-cell.client"

const KNOWN_EVENT_TYPES = [
  "clock_in",
  "clock_out",
  "break_start",
  "break_end",
  "correction",
] as const

type KnownEventType = (typeof KNOWN_EVENT_TYPES)[number]

const KNOWN_SOURCES = ["manual", "csv_import", "mobile", "device"] as const

type KnownSource = (typeof KNOWN_SOURCES)[number]

function isKnownEventType(value: string): value is KnownEventType {
  return (KNOWN_EVENT_TYPES as readonly string[]).includes(value)
}

function isKnownSource(value: string): value is KnownSource {
  return (KNOWN_SOURCES as readonly string[]).includes(value)
}

function formatEmployeeCell(row: OrgAttendanceEventRow): string {
  const name = row.employeeFullName ?? row.employeeId
  return row.employeeNumber ? `${name} · ${row.employeeNumber}` : name
}

function toDisplayRow(
  row: OrgAttendanceEventRow,
  labels: {
    eventLabelFor: (eventType: string) => string
    sourceLabelFor: (source: string) => string
    correctionShort: string
    canCorrect: boolean
  }
): AttendanceEventDisplayRow {
  const isCorrection = row.correctionOfEventId !== null
  return {
    id: row.id,
    employeeId: row.employeeId,
    employee: formatEmployeeCell(row),
    eventType: labels.eventLabelFor(row.eventType),
    occurredAt: row.occurredAt.toISOString(),
    source: labels.sourceLabelFor(row.source),
    correction: isCorrection ? labels.correctionShort : "—",
    canCorrect:
      labels.canCorrect && !isCorrection && row.eventType !== "correction",
  }
}

/**
 * Recent attendance events across the org — newest first. Streamed
 * behind a Suspense boundary on the attendance page so a slow query
 * does not block the header / day summary.
 */
export async function AttendanceRecentEvents({
  isAdmin,
}: {
  isAdmin: boolean
}) {
  const [orgSession, t] = await Promise.all([
    requireOrgSession(),
    getTranslations("Erp.Hrm.attendance"),
  ])

  let rows: OrgAttendanceEventRow[]
  try {
    rows = await listRecentAttendanceEventsForOrg(orgSession.organizationId, {
      limit: 50,
    })
  } catch (err) {
    logUnexpectedServerError("attendance-recent-events: query failed", err, {
      organizationId: orgSession.organizationId,
    })
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={buildEmbeddedListSurfaceErrorConfiguration({
          columnsId: ATTENDANCE_LIST_SURFACE_IDS.recentEvents,
          emptyTitle: t("recentEmpty"),
          firstColumn: { id: "employee", header: t("colEmployee") },
        })}
        surfaceKey="hrm:attendance:recent:error"
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: t("recentLoadFailed"),
        }}
      />
    )
  }

  const eventLabelFor = (eventType: string) =>
    isKnownEventType(eventType) ? t(`eventType.${eventType}`) : eventType
  const sourceLabelFor = (source: string) =>
    isKnownSource(source) ? t(`eventSource.${source}`) : source

  const displayRows = rows.map((row) =>
    toDisplayRow(row, {
      eventLabelFor,
      sourceLabelFor,
      correctionShort: t("correctionShort"),
      canCorrect: isAdmin,
    })
  )

  const orgSlug =
    (await getOrganizationSlugById(orgSession.organizationId)) ?? ""

  const listConfiguration = buildAttendanceRecentListSurfaceConfiguration(
    displayRows,
    orgSlug,
    {
      empty: t("recentEmpty"),
      colEmployee: t("colEmployee"),
      colEvent: t("colEvent"),
      colOccurredAt: t("colOccurredAt"),
      colSource: t("colSource"),
      colCorrectionOf: t("colCorrectionOf"),
      exportReportLabel: isAdmin ? t("exportReport") : undefined,
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:attendance:recent-events"
      invalid={{
        variant: "error",
        title: t("recentLoadFailed"),
      }}
      trailingColumn={
        isAdmin
          ? {
              header: t("colActions"),
              Cell: AttendanceRecentTrailingCell,
              context: {
                events: rows.map((row) => ({
                  id: row.id,
                  occurredAtIso: row.occurredAt.toISOString(),
                  eventType: row.eventType,
                })),
              },
            }
          : undefined
      }
    />
  )
}
