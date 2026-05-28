import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildLmsEnrollmentApprovalsListSurfaceConfiguration } from "../data/lms-enrollment-approvals-list-surface.server"
import type { LmsEnrollmentApprovalsListCopy } from "../data/lms-enrollment-approvals-list-surface.server"
import type { HrmLmsEnrollmentRow } from "../data/lms.types.shared"
import { LMS_ENROLLMENT_APPROVALS_SURFACE_KEY } from "../lms-list-surface.shared"

import { LmsEnrollmentApprovalTrailingCell } from "./lms-enrollment-approval-trailing-cells.client"

type LmsEnrollmentApprovalSectionProps = {
  pendingEnrollments: readonly HrmLmsEnrollmentRow[]
  orgSlug: string
  organizationId: string
  canManage: boolean
  canRead: boolean
  approveAction: (formData: FormData) => void | Promise<void>
  rejectAction: (formData: FormData) => void | Promise<void>
  labels: LmsEnrollmentApprovalsListCopy & {
    approve: string
    reject: string
  }
}

export async function LmsEnrollmentApprovalSection({
  pendingEnrollments,
  orgSlug,
  organizationId,
  canManage,
  canRead,
  approveAction,
  rejectAction,
  labels,
}: LmsEnrollmentApprovalSectionProps) {
  const listConfiguration = buildLmsEnrollmentApprovalsListSurfaceConfiguration(
    pendingEnrollments,
    orgSlug,
    labels,
    { showTrailing: canManage }
  )

  return (
    <section
      id="lms-enrollment-approvals-section"
      data-testid="lms-enrollment-approvals-section"
    >
      <GovernedPatternCListSection
        title={labels.queueTitle}
        description={labels.queueDescription}
        listConfiguration={listConfiguration}
        surfaceKey={LMS_ENROLLMENT_APPROVALS_SURFACE_KEY}
        cardClassName="mt-0"
        parentAccessAllowed={canRead}
        trailingColumn={
          canManage
            ? {
                header: "",
                Cell: LmsEnrollmentApprovalTrailingCell,
                context: {
                  organizationId,
                  orgSlug,
                  approveAction,
                  rejectAction,
                  approveLabel: labels.approve,
                  rejectLabel: labels.reject,
                  enrollments: pendingEnrollments.map((row) => ({
                    id: row.id,
                  })),
                },
              }
            : undefined
        }
      />
    </section>
  )
}
