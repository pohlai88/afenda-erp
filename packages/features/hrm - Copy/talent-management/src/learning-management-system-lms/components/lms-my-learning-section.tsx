import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { Button } from "@afenda/ui/button"
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select"

import { buildLmsMyLearningListSurfaceConfiguration } from "../data/lms-my-learning-list-surface.server"
import type { LmsMyLearningListCopy } from "../data/lms-my-learning-list-surface.server"
import type {
  HrmLmsCourseRow,
  HrmLmsEnrollmentRow,
} from "../data/lms.types.shared"
import { LMS_MY_LEARNING_SURFACE_KEY } from "../lms-list-surface.shared"

type LmsMyLearningSectionProps = {
  enrollments: readonly HrmLmsEnrollmentRow[]
  selfEnrollCourses: readonly HrmLmsCourseRow[]
  orgSlug: string
  organizationId: string
  canRead: boolean
  showSelfEnroll: boolean
  selfEnrollAction: (formData: FormData) => void | Promise<void>
  labels: LmsMyLearningListCopy & {
    selfEnroll: string
    fieldCoursePlaceholder: string
  }
}

export async function LmsMyLearningSection({
  enrollments,
  selfEnrollCourses,
  orgSlug,
  organizationId,
  canRead,
  showSelfEnroll,
  selfEnrollAction,
  labels,
}: LmsMyLearningSectionProps) {
  const listConfiguration = buildLmsMyLearningListSurfaceConfiguration(
    enrollments,
    labels
  )

  return (
    <GovernedPatternCListSection
      title={labels.myLearningTitle}
      description={labels.myLearningDescription}
      listConfiguration={listConfiguration}
      surfaceKey={LMS_MY_LEARNING_SURFACE_KEY}
      cardClassName="mt-0"
      parentAccessAllowed={canRead}
      contentClassName="flex flex-col gap-4"
      contentBeforeList={
        showSelfEnroll && selfEnrollCourses.length > 0 ? (
          <form
            action={selfEnrollAction}
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <NativeSelect name="courseId" required className="min-w-[14rem]">
              <NativeSelectOption value="">
                {labels.fieldCoursePlaceholder}
              </NativeSelectOption>
              {selfEnrollCourses.map((course) => (
                <NativeSelectOption key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button type="submit" size="sm">
              {labels.selfEnroll}
            </Button>
          </form>
        ) : null
      }
    />
  )
}
