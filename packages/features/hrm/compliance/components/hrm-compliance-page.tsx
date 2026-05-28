import { Suspense } from "react"

import { GovernedSurface } from "@afenda/governed-surface/server"
import {
  ComplianceOverviewExportActions,
  ComplianceStatutoryPackControls,
  STATUTORY_PACK_TO_EVENT_TYPE,
} from "../../employees/client"
import { buildGovernedHrmModulePageHeader } from "../../_core/governance"
import {
  listComplianceEvidenceForPeriod,
  resolveComplianceSurfaceCapabilities,
  type ComplianceEvidenceRow,
} from "../../employees/server"
import {
  listPayrollPeriodsForOrg,
  type PayrollPeriodRow,
} from "../../payroll/server"
import {
  listOrgEventDeliveriesByIds,
  listSubscribedEventTypesForOrg,
} from "@afenda/feature-system-admin/server"
import type { OrgEventDeliverySummary } from "@afenda/feature-system-admin"
import type { OrgSession } from "@afenda/platform/auth"
import { BureauReliabilityCard } from "./bureau-reliability-card"
import { BureauReliabilityCardSkeleton } from "./bureau-reliability-card-skeleton"
import { CompliancePanelSkeleton } from "./compliance-panel-skeleton"
import { ComplianceEmployeeStatusPanel } from "./compliance-employee-status-panel"
import { ComplianceExceptionsPanel } from "./compliance-exceptions-panel"
import { ComplianceEvidenceRegisterPanel } from "./compliance-evidence-register-list-section"
import { ComplianceFilingsPanel } from "./compliance-filings-panel"
import { ComplianceObligationsPanel } from "./compliance-obligations-panel"
import { ComplianceOperationalHealth } from "./compliance-operational-health"
import { ComplianceOperationalHealthSkeleton } from "./compliance-operational-health-skeleton"

export type HrmCompliancePageProps = {
  orgSlug: string
  orgSession: OrgSession
  periodId?: string
  workbenchFocus?: string | null
}

async function loadComplianceEvidenceRegister(input: {
  readonly organizationId: string
  readonly period: PayrollPeriodRow | null
}): Promise<{
  readonly evidenceRows: ComplianceEvidenceRow[]
  readonly deliveryById: Record<string, OrgEventDeliverySummary>
}> {
  if (!input.period) {
    return { evidenceRows: [], deliveryById: {} }
  }

  const evidenceRows = await listComplianceEvidenceForPeriod(
    input.organizationId,
    input.period.id
  )
  const deliveryIds = [
    ...new Set(
      evidenceRows
        .map((row) => row.submissionDeliveryId)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  if (deliveryIds.length === 0) {
    return { evidenceRows, deliveryById: {} }
  }

  const deliveryMap = await listOrgEventDeliveriesByIds(
    input.organizationId,
    deliveryIds
  )

  return {
    evidenceRows,
    deliveryById: Object.fromEntries(deliveryMap.entries()),
  }
}

export async function HrmCompliancePage({
  orgSlug,
  orgSession,
  periodId,
  workbenchFocus = null,
}: HrmCompliancePageProps) {
  const organizationId = orgSession.organizationId
  const [capabilities, allPeriods, subscribedEventTypes, header] =
    await Promise.all([
      resolveComplianceSurfaceCapabilities(),
      listPayrollPeriodsForOrg(organizationId),
      listSubscribedEventTypesForOrg(organizationId),
      buildGovernedHrmModulePageHeader(orgSlug, "Erp.Hrm.compliance", {
        title: "pageTitle",
        description: "pageDescription",
      }),
    ])

  const resolvedPeriodId = periodId ?? allPeriods[0]?.id
  const period = resolvedPeriodId
    ? (allPeriods.find((row) => row.id === resolvedPeriodId) ?? null)
    : null
  const { evidenceRows, deliveryById } = await loadComplianceEvidenceRegister({
    organizationId,
    period,
  })

  const packTypesWithSubscribedEndpoint = Object.entries(
    STATUTORY_PACK_TO_EVENT_TYPE
  )
    .filter(([, eventType]) => subscribedEventTypes.has(eventType))
    .map(([packType]) => packType)

  return (
    <GovernedSurface header={header} className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {capabilities.canSearch ? <ComplianceOverviewExportActions /> : null}
      </div>
      <Suspense fallback={<ComplianceOperationalHealthSkeleton />}>
        <ComplianceOperationalHealth
          organizationId={organizationId}
          orgSlug={orgSlug}
        />
      </Suspense>
      <Suspense fallback={<BureauReliabilityCardSkeleton />}>
        <BureauReliabilityCard organizationId={organizationId} />
      </Suspense>
      <ComplianceStatutoryPackControls
        period={period}
        allPeriods={allPeriods}
      />
      <ComplianceEvidenceRegisterPanel
        period={period}
        evidenceRows={evidenceRows}
        orgSlug={orgSlug}
        packTypesWithSubscribedEndpoint={packTypesWithSubscribedEndpoint}
        deliveryById={deliveryById}
      />
      <Suspense fallback={<CompliancePanelSkeleton rows={5} />}>
        <ComplianceObligationsPanel
          organizationId={organizationId}
          orgSlug={orgSlug}
          capabilities={capabilities}
        />
      </Suspense>
      <Suspense fallback={<CompliancePanelSkeleton rows={6} />}>
        <ComplianceEmployeeStatusPanel
          organizationId={organizationId}
          orgSlug={orgSlug}
        />
      </Suspense>
      <Suspense fallback={<CompliancePanelSkeleton rows={5} />}>
        <ComplianceFilingsPanel
          organizationId={organizationId}
          orgSlug={orgSlug}
          capabilities={capabilities}
        />
      </Suspense>
      <Suspense fallback={<CompliancePanelSkeleton rows={4} />}>
        <ComplianceExceptionsPanel
          organizationId={organizationId}
          orgSlug={orgSlug}
          capabilities={capabilities}
          workbenchFocus={workbenchFocus}
        />
      </Suspense>
    </GovernedSurface>
  )
}
