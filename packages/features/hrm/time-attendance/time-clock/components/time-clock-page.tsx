import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import { HrmAccessDeniedMessage } from "../../../_core/registry"

import type { TimeClockSurfaceAccess } from "../data/tci-access.server"

import { TimeClockStreamSlot } from "./time-clock-stream-slot"
import { TimeClockPageSectionGroup } from "./time-clock-page-section-group"
import {
  TimeClockDevicesStreamSection,
  TimeClockExceptionsStreamSection,
  TimeClockKpiStreamSection,
  TimeClockMappingsStreamSection,
  TimeClockBreakPunchRecordsStreamSection,
  TimeClockPunchRecordsStreamSection,
  TimeClockRawVsApprovedFindingsStreamSection,
  TimeClockAuditTrailStreamSection,
  TimeClockSyncBatchesStreamSection,
  TimeClockSyncMonitoringFindingsStreamSection,
  TimeClockMissingPunchFindingsStreamSection,
  TimeClockDuplicatePunchFindingsStreamSection,
  TimeClockAbnormalPunchFindingsStreamSection,
  TimeClockShiftMatchFindingsStreamSection,
  TimeClockAttendanceHandoffFindingsStreamSection,
  TimeClockOvertimeReferenceFindingsStreamSection,
  TimeClockPayrollReferenceFindingsStreamSection,
  TimeClockCorrectionWorkflowStreamSection,
} from "./time-clock-page-stream-sections"
import { TimeClockAdminDiscoverabilitySection } from "./tci-admin-discoverability-section"
import { TimeClockOfflineReplaySection } from "./tci-offline-replay-section"
import { TimeClockSetupAccessBanner } from "./tci-setup-access-banner"
import { TimeClockPageSubNav } from "./time-clock-page-sub-nav"
import { TimeClockReportExportSection } from "./tci-report-export-section"
import { TimeClockBandFocusClient } from "./time-clock-band-focus.client"

type TimeClockPageProps = {
  locale: string
  orgSlug: string
  access: TimeClockSurfaceAccess
  organizationId: string
  mobileClockEnabled?: boolean
  breakPunchCaptureEnabled?: boolean
  workbenchFocus?: string | null
}

export async function TimeClockPage({
  locale,
  orgSlug,
  access: tciAccess,
  organizationId,
  mobileClockEnabled = false,
  breakPunchCaptureEnabled = false,
  workbenchFocus = null,
}: TimeClockPageProps) {
  const t = await getTranslations("Erp.Hrm.timeClock")

  if (!tciAccess.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const readStream = {
    orgSlug,
    organizationId,
    canRead: tciAccess.canRead,
  } as const

  const workflowStream = {
    ...readStream,
    canDecideExceptions: tciAccess.canDecideExceptions,
    canCorrectAttendance: tciAccess.canCorrectAttendance,
  } as const

  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={null}>
        <TimeClockBandFocusClient />
      </Suspense>
      <ModulePageHeader
        eyebrow={t("eyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
      />

      <TimeClockStreamSlot variant="kpi">
        <TimeClockKpiStreamSection organizationId={organizationId} />
      </TimeClockStreamSlot>

      <TimeClockPageSubNav
        showCapture={tciAccess.canRead}
        showQuality={tciAccess.canRead}
        showDownstream={tciAccess.canRead}
        showOperations={tciAccess.canRead}
        showAdmin={tciAccess.canAudit}
      />

      <TimeClockPageSectionGroup
        sectionId="setup"
        title={t("pageSections.setup.title")}
        description={t("pageSections.setup.description")}
      >
        {tciAccess.canEnter && !tciAccess.canRead ? (
          <TimeClockSetupAccessBanner />
        ) : null}
        <TimeClockStreamSlot variant="list-with-action">
          <TimeClockDevicesStreamSection
            orgSlug={orgSlug}
            organizationId={organizationId}
            canRead={tciAccess.canRead}
            canManageDevices={tciAccess.canManageDevices}
            mobileClockEnabled={mobileClockEnabled}
          />
        </TimeClockStreamSlot>

        <TimeClockStreamSlot variant="list-with-action">
          <TimeClockMappingsStreamSection
            orgSlug={orgSlug}
            organizationId={organizationId}
            canRead={tciAccess.canRead}
            canManageMappings={tciAccess.canManageMappings}
          />
        </TimeClockStreamSlot>
      </TimeClockPageSectionGroup>

      {tciAccess.canRead ? (
        <TimeClockPageSectionGroup
          sectionId="capture"
          title={t("pageSections.capture.title")}
          description={t("pageSections.capture.description")}
        >
          <TimeClockStreamSlot>
            <TimeClockPunchRecordsStreamSection {...readStream} />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockRawVsApprovedFindingsStreamSection {...readStream} />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockShiftMatchFindingsStreamSection {...readStream} />
          </TimeClockStreamSlot>
          {breakPunchCaptureEnabled ? (
            <TimeClockStreamSlot>
              <TimeClockBreakPunchRecordsStreamSection {...readStream} />
            </TimeClockStreamSlot>
          ) : null}
        </TimeClockPageSectionGroup>
      ) : null}

      {tciAccess.canRead ? (
        <TimeClockPageSectionGroup
          sectionId="quality"
          title={t("pageSections.quality.title")}
          description={t("pageSections.quality.description")}
        >
          <TimeClockStreamSlot>
            <TimeClockMissingPunchFindingsStreamSection {...readStream} />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockDuplicatePunchFindingsStreamSection {...readStream} />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockAbnormalPunchFindingsStreamSection {...readStream} />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockCorrectionWorkflowStreamSection {...workflowStream} />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockExceptionsStreamSection
              {...workflowStream}
              workbenchFocus={workbenchFocus}
            />
          </TimeClockStreamSlot>
        </TimeClockPageSectionGroup>
      ) : null}

      {tciAccess.canRead ? (
        <TimeClockPageSectionGroup
          sectionId="downstream"
          title={t("pageSections.downstream.title")}
          description={t("pageSections.downstream.description")}
        >
          <TimeClockStreamSlot>
            <TimeClockAttendanceHandoffFindingsStreamSection {...readStream} />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockOvertimeReferenceFindingsStreamSection {...readStream} />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockPayrollReferenceFindingsStreamSection {...readStream} />
          </TimeClockStreamSlot>
        </TimeClockPageSectionGroup>
      ) : null}

      {tciAccess.canRead ? (
        <TimeClockPageSectionGroup
          sectionId="operations"
          title={t("pageSections.operations.title")}
          description={t("pageSections.operations.description")}
        >
          <TimeClockStreamSlot>
            <TimeClockSyncBatchesStreamSection
              organizationId={organizationId}
            />
          </TimeClockStreamSlot>
          <TimeClockStreamSlot>
            <TimeClockSyncMonitoringFindingsStreamSection
              organizationId={organizationId}
              canRead={tciAccess.canRead}
              workbenchFocus={workbenchFocus}
            />
          </TimeClockStreamSlot>
          {tciAccess.canIngest ? <TimeClockOfflineReplaySection /> : null}
        </TimeClockPageSectionGroup>
      ) : null}

      {tciAccess.canAudit ? (
        <TimeClockPageSectionGroup
          sectionId="admin"
          title={t("pageSections.admin.title")}
          description={t("pageSections.admin.description")}
        >
          <TimeClockAdminDiscoverabilitySection
            locale={locale}
            orgSlug={orgSlug}
          />
          <TimeClockStreamSlot>
            <TimeClockAuditTrailStreamSection
              organizationId={organizationId}
              canAudit={tciAccess.canAudit}
            />
          </TimeClockStreamSlot>
          <TimeClockReportExportSection
            orgSlug={orgSlug}
            organizationId={organizationId}
          />
        </TimeClockPageSectionGroup>
      ) : null}
    </div>
  )
}
