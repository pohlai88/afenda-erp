import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { Button } from "@afenda/ui/button"
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select"

import { buildLmsAssignmentsListSurfaceConfiguration } from "../data/lms-assignments-list-surface.server"
import type { LmsAssignmentsListCopy } from "../data/lms-assignments-list-surface.server"
import type {
  HrmLmsAssignmentRow,
  HrmLmsCourseRow,
  HrmLmsLearningPathRow,
} from "../data/lms.types.shared"
import { LMS_ASSIGNMENTS_SURFACE_KEY } from "../lms-list-surface.shared"

type EmployeeChoice = {
  readonly id: string
  readonly employeeNumber: string
  readonly legalName: string
}

type LmsAssignmentSectionProps = {
  assignments: readonly HrmLmsAssignmentRow[]
  courses: readonly HrmLmsCourseRow[]
  paths: readonly HrmLmsLearningPathRow[]
  employees: readonly EmployeeChoice[]
  orgSlug: string
  organizationId: string
  canManage: boolean
  canRead: boolean
  assignAction: (formData: FormData) => void | Promise<void>
  labels: LmsAssignmentsListCopy & {
    assign: string
    assignTargetCourse: string
    assignTargetPath: string
  }
}

export async function LmsAssignmentSection({
  assignments,
  courses,
  paths,
  employees,
  orgSlug,
  organizationId,
  canManage,
  canRead,
  assignAction,
  labels,
}: LmsAssignmentSectionProps) {
  const listConfiguration = buildLmsAssignmentsListSurfaceConfiguration(
    assignments,
    orgSlug,
    labels
  )

  const activeCourses = courses.filter((c) => c.state !== "archived")
  const activePaths = paths.filter((p) => p.state !== "archived")

  return (
    <GovernedPatternCListSection
      title={labels.boardTitle}
      description={labels.boardDescription}
      listConfiguration={listConfiguration}
      surfaceKey={LMS_ASSIGNMENTS_SURFACE_KEY}
      cardClassName="mt-0"
      parentAccessAllowed={canRead}
      contentClassName="flex flex-col gap-4"
      contentBeforeList={
        canManage && employees.length > 0 ? (
          <form
            action={assignAction}
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <NativeSelect name="employeeId" required className="min-w-[12rem]">
              {employees.map((employee) => (
                <NativeSelectOption key={employee.id} value={employee.id}>
                  {employee.employeeNumber} — {employee.legalName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect name="courseId" className="min-w-[12rem]">
              <NativeSelectOption value="">
                {labels.assignTargetCourse}
              </NativeSelectOption>
              {activeCourses.map((course) => (
                <NativeSelectOption key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect name="learningPathId" className="min-w-[12rem]">
              <NativeSelectOption value="">
                {labels.assignTargetPath}
              </NativeSelectOption>
              {activePaths.map((path) => (
                <NativeSelectOption key={path.id} value={path.id}>
                  {path.code} — {path.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="mandatory" />
              <span className="text-muted-foreground">
                {labels.colMandatory}
              </span>
            </label>
            <Button type="submit" size="sm">
              {labels.assign}
            </Button>
          </form>
        ) : null
      }
    />
  )
}
