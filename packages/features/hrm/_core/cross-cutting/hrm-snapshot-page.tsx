import { Suspense } from "react"
import { getFormatter, getTranslations } from "next-intl/server"
import Link from "next/link"

import type { Route } from "next"

import {
  GovernedPatternBStatSection,
  ModulePageHeader,
} from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { ui } from "@afenda/ui/design-system"
import { cn } from "@afenda/ui/utils"

import { requireOrgSession } from "@afenda/platform/auth"

import { organizationHrmPath } from "../../_core/shared"
import { getHrmSnapshotBoard } from "./hrm-snapshot.queries.server"
import {
  buildHrmSnapshotStatConfiguration,
  HRM_SNAPSHOT_STAT_SURFACE_KEY,
} from "./hrm-snapshot-surface-builders.server"

import {
  ComplianceOperationalHealth,
  ComplianceOperationalHealthSkeleton,
} from "../../compliance"

type HrmSnapshotPageProps = {
  orgSlug: string
}

/**
 * Dense read-only HR snapshot — projections from existing aggregates and
 * queries (no new mutation paths).
 */
export async function HrmSnapshotPage({ orgSlug }: HrmSnapshotPageProps) {
  const { organizationId } = await requireOrgSession()
  const [t, format, board] = await Promise.all([
    getTranslations("Erp.Hrm.snapshot"),
    getFormatter(),
    getHrmSnapshotBoard(organizationId),
  ])

  const latest = board.latestPayrollPeriod
  const periodLabel =
    latest != null
      ? `${format.dateTime(new Date(latest.periodStart), { dateStyle: "medium" })} – ${format.dateTime(new Date(latest.periodEnd), { dateStyle: "medium" })}`
      : t("noPayrollPeriod")

  const statConfiguration = buildHrmSnapshotStatConfiguration(board, orgSlug, {
    statActiveEmployees: t("statActiveEmployees"),
    statPendingLeave: t("statPendingLeave"),
    statPendingClaims: t("statPendingClaims"),
    statApprovedUnpaidClaims: t("statApprovedUnpaidClaims"),
    statPayrollLockQueue: t("statPayrollLockQueue"),
    statComplianceAwaiting: t("statComplianceAwaiting"),
    statComplianceFailed: t("statComplianceFailed"),
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <ModulePageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <GovernedPatternBStatSection
        title={t("statsHeading")}
        description={t("description")}
        surfaceKey={HRM_SNAPSHOT_STAT_SURFACE_KEY}
        statGroups={[
          {
            groupKey: "operations",
            configuration: statConfiguration,
          },
        ]}
      />

      <section aria-labelledby="hrm-snapshot-payroll-heading">
        <h2
          id="hrm-snapshot-payroll-heading"
          className="mb-3 text-sm font-semibold text-foreground"
        >
          {t("payrollHeading")}
        </h2>
        <Card
          size="sm"
          className={cn("border-solid border-border", ui.elevation.card)}
        >
          <CardHeader>
            <CardTitle className="text-base">
              {t("latestPeriodTitle")}
            </CardTitle>
            <CardDescription>{periodLabel}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {latest != null ? (
              <>
                <span>
                  <span className="font-medium text-foreground">
                    {t("fieldState")}
                  </span>{" "}
                  {latest.state}
                </span>
                <span>
                  <span className="font-medium text-foreground">
                    {t("fieldCurrency")}
                  </span>{" "}
                  {latest.currency}
                </span>
                {latest.rulePackVersion != null ? (
                  <span>
                    <span className="font-medium text-foreground">
                      {t("fieldRulePack")}
                    </span>{" "}
                    {latest.rulePackVersion}
                  </span>
                ) : null}
                <Link
                  href={organizationHrmPath(orgSlug, "payroll") as Route}
                  className="ml-auto font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("openPayroll")}
                </Link>
              </>
            ) : (
              <p>{t("noPayrollPeriodBody")}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="hrm-snapshot-compliance-health-heading">
        <h2
          id="hrm-snapshot-compliance-health-heading"
          className="mb-3 text-sm font-semibold text-foreground"
        >
          {t("complianceHealthHeading")}
        </h2>
        <Suspense fallback={<ComplianceOperationalHealthSkeleton />}>
          <ComplianceOperationalHealth
            organizationId={organizationId}
            orgSlug={orgSlug}
          />
        </Suspense>
      </section>

      <section aria-labelledby="hrm-snapshot-links-heading">
        <h2
          id="hrm-snapshot-links-heading"
          className="mb-3 text-sm font-semibold text-foreground"
        >
          {t("quickLinksHeading")}
        </h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <Link
              href={organizationHrmPath(orgSlug, "documents") as Route}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("linkDocuments")}
            </Link>
          </li>
          <li>
            <Link
              href={organizationHrmPath(orgSlug, "policies") as Route}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("linkPolicies")}
            </Link>
          </li>
          <li>
            <Link
              href={organizationHrmPath(orgSlug, "attendance") as Route}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("linkAttendance")}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
