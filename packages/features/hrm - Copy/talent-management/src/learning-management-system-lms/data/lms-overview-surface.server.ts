import "server-only"

import {
  buildGovernedStatGrid,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"

import type { LmsOverviewSnapshot } from "./lms-overview.queries.server"

export const LMS_OVERVIEW_EMPLOYEE_SURFACE_KEY = "hrm:lms:overview-employee"
export const LMS_OVERVIEW_MANAGER_SURFACE_KEY = "hrm:lms:overview-manager"
export const LMS_OVERVIEW_HR_SURFACE_KEY = "hrm:lms:overview-hr"

export type LmsOverviewKpiCopy = {
  readonly title: string
  readonly activeCourses: string
  readonly enrollments: string
  readonly inProgress: string
  readonly completed: string
  readonly overdue: string
  readonly certificates: string
  readonly pendingApprovals: string
}

export function buildLmsOverviewStatConfiguration(
  snapshot: LmsOverviewSnapshot,
  copy: LmsOverviewKpiCopy
): StatCardConfigurationInput {
  return buildGovernedStatGrid({
    presentationProfile: "erp-executive-summary",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: copy.activeCourses,
        value: String(snapshot.activeCourses),
        tone: "default",
        href: "#lms-catalog-section",
      },
      {
        label: copy.enrollments,
        value: String(snapshot.approvedEnrollments),
        delta: `${snapshot.pendingApprovals} ${copy.pendingApprovals}`,
        tone: snapshot.pendingApprovals > 0 ? "attention" : "default",
        href:
          snapshot.pendingApprovals > 0
            ? "#lms-enrollment-approvals-section"
            : "#lms-progress-section",
      },
      {
        label: copy.inProgress,
        value: String(snapshot.inProgress),
        tone: "default",
        href: "#lms-progress-section",
      },
      {
        label: copy.completed,
        value: String(snapshot.completed),
        delta:
          snapshot.overdue > 0
            ? `${snapshot.overdue} ${copy.overdue}`
            : undefined,
        tone: snapshot.overdue > 0 ? "attention" : "positive",
        href:
          snapshot.overdue > 0
            ? "#lms-reminders-section"
            : "#lms-progress-section",
      },
      {
        label: copy.certificates,
        value: String(snapshot.certificatesIssued),
        tone: "positive",
        href: "#lms-certificates-section",
      },
    ],
  })
}
