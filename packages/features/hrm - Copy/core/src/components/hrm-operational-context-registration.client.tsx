"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"

import {
  APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY,
  AppShellOperationalContextRegistration,
  type AppShellOperationalContextStackPatch,
} from "@afenda/shell/client"

export type HrmOperationalContextRoute = {
  id: string
  label: string
  href: string
  description?: string
}

export type HrmOperationalFocusLabels = {
  employee: string
  claim: string
  complianceEvidence: string
  operationalRecord: string
}

export type HrmOperationalContextRegistrationProps = {
  routes: readonly HrmOperationalContextRoute[]
  focusLabels: HrmOperationalFocusLabels
}

function normalizeLocaleInternalPath(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/)/, "")
  const normalized = withoutLocale.replace(/\/+$/, "")
  return normalized || "/"
}

function pathMatchesRoute(pathname: string, href: string): boolean {
  const normalizedHref = normalizeLocaleInternalPath(href)
  return (
    pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`)
  )
}

function routeTail(pathname: string, href: string): string[] {
  const normalizedHref = normalizeLocaleInternalPath(href)
  if (!pathMatchesRoute(pathname, normalizedHref)) return []
  return pathname.slice(normalizedHref.length).split("/").filter(Boolean)
}

function resolveFocusPatch({
  pathname,
  route,
  focusLabels,
}: {
  pathname: string
  route: HrmOperationalContextRoute | null
  focusLabels: HrmOperationalFocusLabels
}): AppShellOperationalContextStackPatch {
  if (!route) return { focus: null }

  const [firstTailSegment] = routeTail(pathname, route.href)
  if (!firstTailSegment) return { focus: null }

  const normalizedRouteHref = normalizeLocaleInternalPath(route.href)
  const label =
    route.id === "workforce"
      ? focusLabels.employee
      : route.id === "claims"
        ? focusLabels.claim
        : route.id === "compliance"
          ? focusLabels.complianceEvidence
          : focusLabels.operationalRecord

  return {
    focus: {
      id: `hrm:${route.id}:focus`,
      label,
      href: `${normalizedRouteHref}/${firstTailSegment}`,
      description: route.label,
    },
  }
}

export function HrmOperationalContextRegistration({
  routes,
  focusLabels,
}: HrmOperationalContextRegistrationProps) {
  const pathname = normalizeLocaleInternalPath(usePathname())

  const activeRoute = useMemo(
    () =>
      routes.find((route) => pathMatchesRoute(pathname, route.href)) ?? null,
    [pathname, routes]
  )

  const workflowPatch = useMemo<AppShellOperationalContextStackPatch>(
    () =>
      activeRoute
        ? {
            workflow: {
              id: `hrm:${activeRoute.id}:workflow`,
              label: activeRoute.label,
              href: normalizeLocaleInternalPath(activeRoute.href),
              description: activeRoute.description,
            },
          }
        : { workflow: null },
    [activeRoute]
  )

  const focusPatch = useMemo(
    () => resolveFocusPatch({ pathname, route: activeRoute, focusLabels }),
    [activeRoute, focusLabels, pathname]
  )

  return (
    <>
      <AppShellOperationalContextRegistration
        id="hrm-route-workflow"
        priority={APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY.workflow}
        patch={workflowPatch}
      />
      <AppShellOperationalContextRegistration
        id="hrm-route-focus"
        priority={APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY.focus}
        patch={focusPatch}
      />
    </>
  )
}
