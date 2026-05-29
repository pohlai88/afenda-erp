import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Button } from "@afenda/ui/button"

import type { HrmLmsCourseRow } from "../data/lms.types.shared"

type LmsCurriculumAdminFormsProps = {
  orgSlug: string
  organizationId: string
  courses: readonly HrmLmsCourseRow[]
  createLessonAction: (formData: FormData) => void | Promise<void>
  createAssessmentAction: (formData: FormData) => void | Promise<void>
  issueCertificateAction: (formData: FormData) => void | Promise<void>
  labels: {
    lessonsTitle: string
    lessonsDescription: string
    lessonSubmit: string
    assessmentsTitle: string
    assessmentsDescription: string
    assessmentSubmit: string
    issueCertTitle: string
    issueCertDescription: string
    issueCertSubmit: string
    fieldCode: string
    fieldTitle: string
    fieldCourse: string
    fieldCoursePlaceholder: string
    fieldEstimatedMinutes: string
    fieldPassingScore: string
    fieldMaxAttempts: string
    fieldEnrollment: string
    fieldEnrollmentPlaceholder: string
    fieldCertificateRef: string
  }
  completedEnrollmentChoices: readonly { id: string; label: string }[]
}

export function LmsCurriculumAdminForms({
  orgSlug,
  organizationId,
  courses,
  createLessonAction,
  createAssessmentAction,
  issueCertificateAction,
  labels,
  completedEnrollmentChoices,
}: LmsCurriculumAdminFormsProps) {
  const activeCourses = courses.filter((c) => c.state === "active")

  return (
    <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle>{labels.lessonsTitle}</CardTitle>
          <CardDescription>{labels.lessonsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createLessonAction} className="flex flex-col gap-3">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {labels.fieldCourse}
              </span>
              <select
                id="lms-lesson-course"
                name="courseId"
                required
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{labels.fieldCoursePlaceholder}</option>
                {activeCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">{labels.fieldCode}</span>
              <input
                id="lms-lesson-code"
                name="code"
                required
                maxLength={32}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">{labels.fieldTitle}</span>
              <input
                id="lms-lesson-title"
                name="title"
                required
                maxLength={200}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {labels.fieldEstimatedMinutes}
              </span>
              <input
                id="lms-lesson-minutes"
                name="estimatedMinutes"
                type="number"
                min={0}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <Button type="submit" size="sm">
              {labels.lessonSubmit}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>{labels.assessmentsTitle}</CardTitle>
          <CardDescription>{labels.assessmentsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAssessmentAction} className="flex flex-col gap-3">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {labels.fieldCourse}
              </span>
              <select
                id="lms-assessment-course"
                name="courseId"
                required
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{labels.fieldCoursePlaceholder}</option>
                {activeCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">{labels.fieldCode}</span>
              <input
                id="lms-assessment-code"
                name="code"
                required
                maxLength={32}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">{labels.fieldTitle}</span>
              <input
                id="lms-assessment-title"
                name="title"
                required
                maxLength={200}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {labels.fieldPassingScore}
              </span>
              <input
                id="lms-assessment-pass"
                name="passingScore"
                type="number"
                min={0}
                max={100}
                defaultValue={70}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {labels.fieldMaxAttempts}
              </span>
              <input
                id="lms-assessment-attempts"
                name="maxAttempts"
                type="number"
                min={1}
                max={20}
                defaultValue={3}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <Button type="submit" size="sm">
              {labels.assessmentSubmit}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>{labels.issueCertTitle}</CardTitle>
          <CardDescription>{labels.issueCertDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={issueCertificateAction} className="flex flex-col gap-3">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {labels.fieldEnrollment}
              </span>
              <select
                id="lms-cert-enrollment"
                name="enrollmentId"
                required
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{labels.fieldEnrollmentPlaceholder}</option>
                {completedEnrollmentChoices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {labels.fieldCertificateRef}
              </span>
              <input
                id="lms-cert-ref"
                name="certificateRef"
                maxLength={200}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <Button type="submit" size="sm">
              {labels.issueCertSubmit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
