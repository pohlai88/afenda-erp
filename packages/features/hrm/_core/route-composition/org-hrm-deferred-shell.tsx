import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"

import { AppSubLayout } from "@afenda/shell"
import {
  AppShellCommandPalette,
  AppShellPrimaryLeftRailFooter,
} from "@afenda/shell/client"
import type { OrgSession } from "@afenda/platform/auth"
import type { RouteEnvelope } from "@afenda/platform/erp/route-envelope.shared"
import { listEffectiveErpPermissionsForUser } from "@afenda/platform/erp/rbac.server"
import type { AppLocale } from "@afenda/platform/i18n/locales.shared"
import {
  listPinnedForUser,
  listRecentsForUser,
  listSavedViewsForUser,
  pinDtoToSlot,
  recentDtoToSlot,
  viewDtoToSlot,
} from "@afenda/feature-rail-memory/server"
import {
  buildHrmRailSlots,
  HrmOperationalContextRegistration,
} from "../../_core/app"
import { getHrmRailPressureCounts } from "../../_core/cross-cutting/hrm-rail-pressure.queries.server"
import {
  HRM_CAPABILITIES,
  organizationHrmPath,
  organizationHrmRootPath,
  type HrmCapability,
} from "../../_core/shared"
import { resolveLeaveSurfaceAccess } from "../../time-attendance/server"

export type OrgHrmDeferredShellProps = {
  children: ReactNode
  locale: AppLocale
  orgSlug: string
  orgSession: OrgSession
}

/**
 * Tier B HRM chrome — translations, rail pressure, org display label.
 * Parent layout resolves session + params before Suspense.
 */
export async function OrgHrmDeferredShell({
  children,
  locale,
  orgSlug,
  orgSession,
}: OrgHrmDeferredShellProps) {
  const [
    tShell,
    tNav,
    railPressure,
    leaveAccess,
    effectivePermissions,
    pinnedDtos,
    viewDtos,
    recentDtos,
    tPrimaryRail,
    tCommand,
  ] = await Promise.all([
    getTranslations("Erp.Hrm.shell"),
    getTranslations("Erp.Hrm.nav"),
    getHrmRailPressureCounts(orgSession.organizationId),
    resolveLeaveSurfaceAccess({
      organizationId: orgSession.organizationId,
      userId: orgSession.userId,
    }),
    listEffectiveErpPermissionsForUser({
      organizationId: orgSession.organizationId,
      userId: orgSession.userId,
    }),
    listPinnedForUser({
      organizationId: orgSession.organizationId,
      userId: orgSession.userId,
      surfaceId: "hrm",
    }),
    listSavedViewsForUser({
      organizationId: orgSession.organizationId,
      userId: orgSession.userId,
      surfaceId: "hrm",
    }),
    listRecentsForUser({
      organizationId: orgSession.organizationId,
      userId: orgSession.userId,
      surfaceId: "hrm",
    }),
    getTranslations("Erp.shell.primaryRail"),
    getTranslations("Erp.commandPalette"),
  ])
  const visibleCapabilities: readonly HrmCapability[] = HRM_CAPABILITIES.filter(
    (capability) =>
      effectivePermissions.includes(capability.requiredPermission) ||
      (capability.id === "leave" && leaveAccess.canEnter)
  )

  const navLabels: Record<string, string> = {
    overview: tShell("overviewLink"),
    ...Object.fromEntries(
      visibleCapabilities.map((capability) => [
        capability.nav.navKey,
        tNav(capability.nav.navKey),
      ])
    ),
  }

  const railSlots = buildHrmRailSlots({
    orgSlug,
    capabilities: visibleCapabilities,
    navLabels,
    pressure: railPressure,
    pinned: pinnedDtos.map(pinDtoToSlot),
    views: viewDtos.map(viewDtoToSlot),
    recents: recentDtos.map(recentDtoToSlot),
  })

  const ariaLabel = tShell("capabilityNavAria")
  const operationalContextRoutes = visibleCapabilities.map((capability) => ({
    id: capability.id,
    label: tNav(capability.nav.navKey),
    href: organizationHrmPath(orgSlug, capability.nav.primarySegment),
    description: tShell("description"),
  }))
  const envelope: RouteEnvelope = {
    surface: "apps",
    locale,
    orgSlug,
    orgId: orgSession.organizationId,
  }

  return (
    <AppSubLayout
      envelope={envelope}
      contextRegistrationId="hrm-surface"
      contextPatch={{
        surface: {
          id: "hrm",
          label: tShell("title"),
          href: organizationHrmRootPath(orgSlug),
          description: tShell("description"),
        },
      }}
      rail={{
        slots: {
          ...railSlots,
          footer: (
            <AppShellPrimaryLeftRailFooter
              labels={{
                sidebarControl: tShell("rail.footer.sidebarMode"),
                expanded: tShell("rail.footer.expanded"),
                expandedHelp: tShell("rail.footer.expandedHelp"),
                collapsed: tShell("rail.footer.collapsed"),
                collapsedHelp: tShell("rail.footer.collapsedHelp"),
                hover: tShell("rail.footer.expandOnHover"),
                hoverHelp: tShell("rail.footer.expandOnHoverHelp"),
              }}
            />
          ),
        },
        labels: {
          ariaLabel,
          collapseLabel: tShell("rail.collapseLabel"),
          expandLabel: tShell("rail.expandLabel"),
          navSearchPlaceholder: tShell("rail.navSearchPlaceholder"),
          navSearchAriaLabel: tShell("rail.navSearchAriaLabel"),
          navSearchCollapsedTriggerAriaLabel: tShell(
            "rail.navSearchCollapsedTriggerAriaLabel"
          ),
          navSearchClearLabel: tShell("rail.navSearchClearLabel"),
          navSearchNavHeading: tShell("rail.navSearchNavHeading"),
          navSearchMemoryHeading: tShell("rail.navSearchMemoryHeading"),
          navSearchRecentHeading: tShell("rail.navSearchRecentHeading"),
          navSearchNoMatches: tShell("rail.navSearchNoMatches"),
          pinnedHeading: tShell("rail.pinnedHeading"),
          viewsHeading: tShell("rail.viewsHeading"),
          recentsHeading: tShell("rail.recentsHeading"),
          memoryHeading: tPrimaryRail("memoryHeading"),
          memoryAddReminderLabel: tPrimaryRail("memoryAddReminder"),
          memoryAddToLaneLabel: tPrimaryRail("memoryAddToLane"),
          memoryAddToLanePlaceholder: tPrimaryRail(
            "memoryAddToLanePlaceholder"
          ),
          memoryRemoveLabel: tPrimaryRail("memoryRemove"),
          memoryMoveToLabel: tPrimaryRail("memoryMoveTo"),
          memoryLinkPlaceholder: tPrimaryRail("memoryLinkPlaceholder"),
          memoryCancelLabel: tPrimaryRail("memoryCancel"),
          memoryAddLabel: tPrimaryRail("memoryAdd"),
          memoryEmptyLabel: tPrimaryRail("memoryEmpty"),
          memoryShowLessLabel: tPrimaryRail("memoryShowLess"),
          memoryShowMoreLabel: tPrimaryRail("memoryShowMore"),
          memoryLaneFullLabel: tPrimaryRail("memoryLaneFull"),
        },
        storageKey: "afenda.hrm.rail",
      }}
      command={
        <AppShellCommandPalette
          dialogTitle={tShell("title")}
          dialogDescription={tShell("description")}
          sections={[
            {
              heading: tCommand("groupNavigate"),
              groupHint: "navigate",
              items: [
                {
                  id: "hrm-overview",
                  label: tShell("overviewLink"),
                  href: organizationHrmRootPath(orgSlug),
                  kind: "navigation",
                  resultType: tCommand("kind.navigation"),
                  iconKey: "layout-dashboard",
                  scopeLabel: ariaLabel,
                  groupHint: "navigate",
                  priority: 20,
                  context: { surfaceId: "hrm", boost: 20 },
                },
                ...visibleCapabilities.map((capability) => ({
                  id: `hrm-${capability.id}`,
                  label: tNav(capability.nav.navKey),
                  href: organizationHrmPath(
                    orgSlug,
                    capability.nav.primarySegment
                  ),
                  kind: "navigation" as const,
                  resultType: tCommand("kind.navigation"),
                  scopeLabel: ariaLabel,
                  groupHint: "navigate" as const,
                  context: { surfaceId: "hrm" },
                })),
              ],
            },
          ]}
        />
      }
    >
      <HrmOperationalContextRegistration
        routes={operationalContextRoutes}
        focusLabels={{
          employee: tShell("context.employeeRecord"),
          claim: tShell("context.claimRecord"),
          complianceEvidence: tShell("context.complianceEvidence"),
          operationalRecord: tShell("context.operationalRecord"),
        }}
      />
      {children}
    </AppSubLayout>
  )
}
