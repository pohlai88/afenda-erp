import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"

import { listLmsAssessmentsForCourse } from "../data/lms-assessments.queries.server"
import { listLmsLessonsForCourse } from "../data/lms-lessons.queries.server"
import type { HrmLmsPlayerEnrollmentRow } from "../data/lms.types.shared"

type LmsCoursePlayerSectionProps = {
  orgSlug: string
  organizationId: string
  playerEnrollments: readonly HrmLmsPlayerEnrollmentRow[]
  advanceLessonAction: (formData: FormData) => void | Promise<void>
  submitAssessmentAction: (formData: FormData) => void | Promise<void>
  labels: {
    playerTitle: string
    playerDescription: string
    playerEmpty: string
    lessonsHeading: string
    assessmentsHeading: string
    markLessonComplete: string
    submitAssessment: string
    fieldScore: string
    colPercent: string
    colStatus: string
    formatPercent: (value: number) => string
    formatStatus: (status: string) => string
  }
}

export async function LmsCoursePlayerSection({
  orgSlug,
  organizationId,
  playerEnrollments,
  advanceLessonAction,
  submitAssessmentAction,
  labels,
}: LmsCoursePlayerSectionProps) {
  if (playerEnrollments.length === 0) {
    return (
      <Card size="sm" data-testid="lms-course-player">
        <CardHeader>
          <CardTitle>{labels.playerTitle}</CardTitle>
          <CardDescription>{labels.playerEmpty}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const enrollmentBlocks = await Promise.all(
    playerEnrollments.map(async (enrollment) => {
      const [lessons, assessments] = await Promise.all([
        listLmsLessonsForCourse({
          organizationId,
          courseId: enrollment.courseId,
        }),
        listLmsAssessmentsForCourse({
          organizationId,
          courseId: enrollment.courseId,
        }),
      ])
      return { enrollment, lessons, assessments }
    })
  )

  return (
    <Card size="sm" data-testid="lms-course-player">
      <CardHeader>
        <CardTitle>{labels.playerTitle}</CardTitle>
        <CardDescription>{labels.playerDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {enrollmentBlocks.map(({ enrollment, lessons, assessments }) => (
          <div
            key={enrollment.enrollmentId}
            className="flex flex-col gap-3 rounded-lg border border-border p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">
                {enrollment.courseCode} — {enrollment.courseTitle}
              </span>
              <Badge variant="secondary">
                {labels.colPercent}:{" "}
                {labels.formatPercent(enrollment.percentComplete)}
              </Badge>
              <Badge variant="outline">
                {labels.colStatus}: {labels.formatStatus(enrollment.status)}
              </Badge>
            </div>

            {lessons.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {labels.lessonsHeading}
                </p>
                <ul className="flex flex-col gap-2">
                  {lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span>
                        {lesson.code} — {lesson.title}
                        {lesson.estimatedMinutes != null
                          ? ` (${lesson.estimatedMinutes} min)`
                          : ""}
                      </span>
                      <form action={advanceLessonAction}>
                        <input
                          type="hidden"
                          name="organizationId"
                          value={organizationId}
                        />
                        <input type="hidden" name="orgSlug" value={orgSlug} />
                        <input
                          type="hidden"
                          name="enrollmentId"
                          value={enrollment.enrollmentId}
                        />
                        <input
                          type="hidden"
                          name="lessonId"
                          value={lesson.id}
                        />
                        <button
                          type="submit"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {labels.markLessonComplete}
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {assessments.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {labels.assessmentsHeading}
                </p>
                {assessments.map((assessment) => (
                  <form
                    key={assessment.id}
                    action={submitAssessmentAction}
                    className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border p-3"
                  >
                    <input
                      type="hidden"
                      name="organizationId"
                      value={organizationId}
                    />
                    <input type="hidden" name="orgSlug" value={orgSlug} />
                    <input
                      type="hidden"
                      name="enrollmentId"
                      value={enrollment.enrollmentId}
                    />
                    <input
                      type="hidden"
                      name="assessmentId"
                      value={assessment.id}
                    />
                    <span className="text-sm">
                      {assessment.code} — {assessment.title} (≥{" "}
                      {assessment.passingScore}%, max {assessment.maxAttempts}{" "}
                      attempts)
                    </span>
                    <label className="grid gap-1 text-sm">
                      <span className="text-muted-foreground">
                        {labels.fieldScore}
                      </span>
                      <input
                        name="score"
                        type="number"
                        min={0}
                        max={100}
                        required
                        className="flex h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm text-primary-foreground"
                    >
                      {labels.submitAssessment}
                    </button>
                  </form>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
