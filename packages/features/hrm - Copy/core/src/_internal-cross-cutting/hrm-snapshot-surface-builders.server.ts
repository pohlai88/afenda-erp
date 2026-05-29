import "server-only"

import {
  buildGovernedStatGrid,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"

import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import type { HrmSnapshotBoard } from "./hrm-snapshot.queries.server"

export const HRM_SNAPSHOT_STAT_SURFACE_KEY = "hrm:snapshot-stats"

type HrmSnapshotStatCopy = {
  statActiveEmployees: string
  statPendingLeave: string
  statPendingClaims: string
  statApprovedUnpaidClaims: string
  statPayrollLockQueue: string
  statComplianceAwaiting: string
  statComplianceFailed: string
}

export function buildHrmSnapshotStatConfiguration(
  board: HrmSnapshotBoard,
  orgSlug: string,
  copy: HrmSnapshotStatCopy
): StatCardConfigurationInput {
  return buildGovernedStatGrid({
    presentationProfile: "erp-kpi-grid",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: copy.statActiveEmployees,
        value: String(board.activeEmployeeCount),
        href: organizationHrmPath(orgSlug, "employees"),
        tone: "default",
      },
      {
        label: copy.statPendingLeave,
        value: String(board.pendingLeaveApprovals),
        href: organizationHrmPath(orgSlug, "leave"),
        tone: board.pendingLeaveApprovals > 0 ? "attention" : "default",
      },
      {
        label: copy.statPendingClaims,
        value: String(board.pendingClaimSubmissions),
        href: organizationHrmPath(orgSlug, "claims"),
        tone: board.pendingClaimSubmissions > 0 ? "attention" : "default",
      },
      {
        label: copy.statApprovedUnpaidClaims,
        value: String(board.approvedUnpaidClaims),
        href: organizationHrmPath(orgSlug, "claims"),
        tone: board.approvedUnpaidClaims > 0 ? "attention" : "default",
      },
      {
        label: copy.statPayrollLockQueue,
        value: String(board.pendingPayrollLockApprovals),
        href: organizationHrmPath(orgSlug, "payroll"),
        tone: board.pendingPayrollLockApprovals > 0 ? "attention" : "default",
      },
      {
        label: copy.statComplianceAwaiting,
        value: String(board.complianceSubmittedAwaiting),
        href: organizationHrmPath(orgSlug, "compliance"),
        tone: board.complianceSubmittedAwaiting > 0 ? "attention" : "default",
      },
      {
        label: copy.statComplianceFailed,
        value: String(board.complianceFailed),
        href: organizationHrmPath(orgSlug, "compliance"),
        tone: board.complianceFailed > 0 ? "critical" : "default",
      },
    ],
  })
}
