import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildTrainingOrgRecordsListSurfaceConfiguration } from "../data/training-list-surface.server"
import type { HrmTrainingRecord } from "../data/training.types.shared"

import { TrainingRecordTrailingCell } from "./training-list-trailing-cells.client"

type TrainingOrgRecordsListSectionProps = {
  records: readonly HrmTrainingRecord[]
  orgSlug: string
  organizationId: string
  isHrmAdmin: boolean
  labels: {
    empty: string
    colEmployee: string
    colCourse: string
    colCompleted: string
    colVerification: string
    colExpires: string
    verifyRecord: string
  }
  formatDate: (value: Date) => string
}

export async function TrainingOrgRecordsListSection({
  records,
  orgSlug,
  organizationId,
  isHrmAdmin,
  labels,
  formatDate,
}: TrainingOrgRecordsListSectionProps) {
  const listConfiguration = buildTrainingOrgRecordsListSurfaceConfiguration(
    records,
    orgSlug,
    {
      ...labels,
      formatDate,
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:training:org-records"
      trailingColumn={
        isHrmAdmin
          ? {
              header: " ",
              Cell: TrainingRecordTrailingCell,
              context: {
                organizationId,
                orgSlug,
                verifyLabel: labels.verifyRecord,
                records: records.map((record) => ({
                  id: record.id,
                  verificationState: record.verificationState,
                })),
              },
            }
          : undefined
      }
    />
  )
}
