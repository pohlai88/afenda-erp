import { getTranslations } from "next-intl/server"
import Link from "next/link"

import type { Route } from "next"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import { Card, CardDescription, CardHeader, CardTitle } from "@afenda/ui/card"
import { ui } from "@afenda/ui/design-system"
import { cn } from "@afenda/ui/utils"

import type { HrmAppsCapabilitySegment } from "@afenda/feature-hrm-core/shared"

import { buildHrmNav } from "@afenda/feature-hrm-core/shared"

type HrmPlaceholderMessageKey =
  | `${HrmAppsCapabilitySegment}.title`
  | `${HrmAppsCapabilitySegment}.body`

type HrmOverviewProps = {
  orgSlug: string
}

/** Landing grid linking each registered capability (Phase 0 shell). */
export async function HrmOverviewPage({ orgSlug }: HrmOverviewProps) {
  const tShell = await getTranslations("Erp.Hrm.shell")
  const tCards = await getTranslations("Erp.Hrm.cards")
  const navItems = buildHrmNav(orgSlug)

  return (
    <div className="p-6">
      <ModulePageHeader
        eyebrow={tShell("eyebrow")}
        title={tShell("title")}
        description={tShell("description")}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {navItems.map((item) => (
          <Link key={item.capabilityId} href={item.href as Route}>
            <Card
              size="sm"
              className={cn(
                "h-full border-solid border-border transition-colors hover:border-ring",
                ui.elevation.card
              )}
            >
              <CardHeader>
                <CardTitle className="text-base font-semibold tracking-tight">
                  {tCards(`${item.navKey}.title`)}
                </CardTitle>
                <CardDescription>
                  {tCards(`${item.navKey}.description`)}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        <Card
          size="sm"
          className={cn(
            "border-dashed border-border bg-muted/20",
            ui.elevation.flat
          )}
        >
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">
              {tShell("registryHintTitle")}
            </CardTitle>
            <CardDescription>{tShell("registryHintBody")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

/** Fallback for registered capability segments that do not yet own a route file. */
export async function HrmCapabilityPlaceholderPage({
  segment,
}: {
  segment: HrmAppsCapabilitySegment
}) {
  const tPlaceholders = await getTranslations("Erp.Hrm.placeholders")
  const titleKey = `${segment}.title` as HrmPlaceholderMessageKey
  const bodyKey = `${segment}.body` as HrmPlaceholderMessageKey

  return (
    <div className="p-6">
      <Card
        size="sm"
        className={cn("border-solid border-border", ui.elevation.card)}
      >
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight">
            {tPlaceholders(titleKey)}
          </CardTitle>
          <CardDescription>{tPlaceholders(bodyKey)}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
