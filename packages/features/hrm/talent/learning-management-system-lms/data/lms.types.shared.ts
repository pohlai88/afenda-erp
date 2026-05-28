export type HrmLmsCourseRow = {
  readonly id: string
  readonly code: string
  readonly title: string
  readonly courseType: string
  readonly category: string | null
  readonly description: string | null
  readonly provider: string | null
  readonly durationMinutes: number | null
  readonly level: string | null
  readonly language: string | null
  readonly deliveryMode: string
  readonly validityDays: number | null
  readonly trainingCourseId: string | null
  readonly selfEnrollAllowed: boolean
  readonly approvalRequired: boolean
  readonly complianceMandatory: boolean
  readonly state: string
  readonly contentRefCount: number
}

export type HrmLmsLearningPathRow = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly pathType: string
  readonly description: string | null
  readonly state: string
  readonly courseCount: number
}

export type HrmLmsAssignmentRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeNumber: string
  readonly employeeName: string
  readonly courseId: string | null
  readonly learningPathId: string | null
  readonly targetLabel: string
  readonly mandatory: boolean
  readonly assignedAt: Date
  readonly enrollmentId: string | null
  readonly approvalState: string | null
}

export type HrmLmsEnrollmentRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeNumber: string
  readonly employeeName: string
  readonly courseId: string | null
  readonly learningPathId: string | null
  readonly targetLabel: string
  readonly approvalState: string
  readonly enrolledAt: Date
  readonly mandatory: boolean | null
}

export type HrmLmsPathCourseRow = {
  readonly id: string
  readonly learningPathId: string
  readonly courseId: string
  readonly sortOrder: number
  readonly courseCode: string
  readonly courseTitle: string
}

export type HrmLmsProgressRow = {
  readonly progressId: string
  readonly enrollmentId: string
  readonly employeeId: string
  readonly employeeNumber: string
  readonly employeeName: string
  readonly targetLabel: string
  readonly status: string
  readonly displayStatus: string
  readonly percentComplete: number
  readonly timeSpentMinutes: number
  readonly lastAccessedAt: Date | null
  readonly enrolledAt: Date
}

export type HrmLmsLessonRow = {
  readonly id: string
  readonly courseId: string
  readonly code: string
  readonly title: string
  readonly sortOrder: number
  readonly estimatedMinutes: number | null
}

export type HrmLmsAssessmentRow = {
  readonly id: string
  readonly courseId: string
  readonly code: string
  readonly title: string
  readonly passingScore: number
  readonly maxAttempts: number
}

export type HrmLmsCertificateRow = {
  readonly id: string
  readonly enrollmentId: string
  readonly employeeId: string
  readonly employeeNumber: string
  readonly employeeName: string
  readonly targetLabel: string
  readonly status: string
  readonly certificateRef: string | null
  readonly issuedAt: Date
  readonly expiresAt: Date | null
  readonly renewalDueAt: Date | null
}

export type HrmLmsReminderRow = {
  readonly id: string
  readonly kind: "progress_overdue" | "certificate_expiring"
  readonly employeeId: string
  readonly employeeNumber: string
  readonly employeeName: string
  readonly targetLabel: string
  readonly detail: string
}

export type HrmLmsPlayerEnrollmentRow = {
  readonly enrollmentId: string
  readonly courseId: string
  readonly courseCode: string
  readonly courseTitle: string
  readonly progressId: string | null
  readonly percentComplete: number
  readonly status: string
  readonly validityDays: number | null
}

export type LmsMutationFormState =
  | { ok: true; id?: string }
  | {
      ok: false
      errors: {
        form?: string
        courseId?: string
        learningPathId?: string
        pathCourseId?: string
        enrollmentId?: string
        employeeId?: string
        assessmentId?: string
        certificateId?: string
        lessonId?: string
        code?: string
      }
    }
