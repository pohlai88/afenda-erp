import "server-only"

import { TimeClockPage } from "./time-clock-page"
import { resolveGeolocationSurfaceAccess } from "../../geolocation-remote-checkin/data/geolocation-access.server"
import { resolveTimeClockSurfaceAccess } from "../data/tci-access.server"
import { resolveTciBreakPunchCaptureEnabled } from "../data/tci-break-punch-enablement.server"
import { getOrgTenantContext } from "@afenda/platform/auth"
import { ensureAppLocale } from "@afenda/platform/i18n/locales.shared"
import { loadTciWorkbenchSearchParams } from "../schemas/tci.search-params"

type TimeClockPageGateProps = {
  locale: string
  orgSlug: string
  searchParams: Record<string, string | string[] | undefined>
}

export async function TimeClockPageGate({
  locale,
  orgSlug,
  searchParams,
}: TimeClockPageGateProps) {
  ensureAppLocale(locale)

  const session = await getOrgTenantContext()
  const workbench = await loadTciWorkbenchSearchParams(searchParams)
  const [access, geoAccess, breakPunchCaptureEnabled] = await Promise.all([
    resolveTimeClockSurfaceAccess({
      organizationId: session.organizationId,
      userId: session.userId,
    }),
    resolveGeolocationSurfaceAccess({
      organizationId: session.organizationId,
      userId: session.userId,
    }),
    resolveTciBreakPunchCaptureEnabled(session.organizationId),
  ])

  return (
    <TimeClockPage
      locale={locale}
      orgSlug={orgSlug}
      access={access}
      organizationId={session.organizationId}
      mobileClockEnabled={geoAccess.canEnter}
      breakPunchCaptureEnabled={breakPunchCaptureEnabled}
      workbenchFocus={workbench.focus ?? null}
    />
  )
}
