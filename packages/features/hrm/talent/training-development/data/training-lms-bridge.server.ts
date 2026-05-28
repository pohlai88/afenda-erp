import "server-only"

import { getLmsTrainingDevelopmentRefs } from "../../learning-management-system-lms/data/lms-integration.server"

/** HRM-LMS-023 consumer — LMS completion refs for blended TRN catalog rows. */
export async function listTrainingDevelopmentLmsCompletionRefs(input: {
  readonly organizationId: string
  readonly employeeId?: string
}) {
  return getLmsTrainingDevelopmentRefs(input)
}

export async function summarizeTrainingDevelopmentLmsCompletions(input: {
  readonly organizationId: string
}): Promise<{
  readonly linkedCourseCount: number
  readonly completedCount: number
  readonly withCertificateCount: number
}> {
  const rows = await listTrainingDevelopmentLmsCompletionRefs({
    organizationId: input.organizationId,
  })

  const linkedTrainingCourseIds = new Set<string>()
  let completedCount = 0
  let withCertificateCount = 0

  for (const row of rows) {
    if (row.trainingCourseId) {
      linkedTrainingCourseIds.add(row.trainingCourseId)
    }
    if (row.completedAt) {
      completedCount += 1
    }
    if (row.certificateRef) {
      withCertificateCount += 1
    }
  }

  return {
    linkedCourseCount: linkedTrainingCourseIds.size,
    completedCount,
    withCertificateCount,
  }
}
