import type {
  HrLmsAssignmentKind,
  HrLmsCourseType,
  HrLmsPathKind,
  HrLmsProgressStatus,
} from "./hr.talent.lms-constants.shared";

export type HrLmsCourseRecord = {
  id: string;
  organizationId: string;
  code: string;
  title: string;
  category: string;
  description: string;
  provider: string;
  durationMinutes: number;
  level: string;
  language: string;
  deliveryMode: string;
  courseType: HrLmsCourseType;
  validityDays: number | null;
  passingScore: number | null;
  attemptLimit: number | null;
  selfEnrollmentEnabled: boolean;
  approvalRequired: boolean;
  scormEnabled: boolean;
  xapiEnabled: boolean;
  externalLmsEnabled: boolean;
  courseStatus: "draft" | "published" | "archived";
  contentRefs: Array<{
    id: string;
    refKind: "internal" | "external" | "scorm" | "xapi" | "external_lms";
    label: string;
    uri: string;
    providerName?: string;
  }>;
};

export type HrLmsPathRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  pathKind: HrLmsPathKind;
  courseIds: readonly string[];
  targetRoleCode?: string;
  targetDepartmentName?: string;
};

export type HrLmsAssignmentRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  courseId?: string;
  pathId?: string;
  assignmentKind: HrLmsAssignmentKind;
  isComplianceMandatory: boolean;
  dueAt?: string;
  assignedByUserId: string;
};

export type HrLmsEnrollmentRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  courseId: string;
  assignmentId?: string;
  enrollmentStatus: "pending_approval" | "enrolled" | "rejected" | "withdrawn";
  selfEnrolled: boolean;
  approvedByUserId?: string;
  enrolledByUserId: string;
};

export type HrLmsProgressRecord = {
  id: string;
  organizationId: string;
  enrollmentId: string;
  employeeId: string;
  courseId: string;
  progressStatus: HrLmsProgressStatus;
  completionPercent: number;
  timeSpentMinutes: number;
  lastAccessedAt?: string;
  lessonProgress: Record<string, number>;
  completedAt?: string;
};

export type HrLmsAssessmentAttemptRecord = {
  id: string;
  organizationId: string;
  enrollmentId: string;
  employeeId: string;
  courseId: string;
  attemptNumber: number;
  score: number;
  passingScore: number | null;
  result: "passed" | "failed" | "in_progress";
  completedAt?: string;
};

export type HrLmsCertificationRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  courseId: string;
  certificateCode: string;
  certificationStatus: "active" | "expired" | "renewed" | "revoked";
  issuedAt: string;
  expiresAt?: string;
  renewedAt?: string;
};

export type HrLmsReminderRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  courseId?: string;
  certificationId?: string;
  reminderKind:
    | "due_soon"
    | "overdue"
    | "incomplete"
    | "failed"
    | "certification_expiring";
  dueAt?: string;
  sentAt?: string;
};

export type HrLmsAuditRecord = {
  id: string;
  organizationId: string;
  action: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
  summary: string;
  occurredAt: string;
};

type HrLmsOrgStore = {
  courses: HrLmsCourseRecord[];
  paths: HrLmsPathRecord[];
  assignments: HrLmsAssignmentRecord[];
  enrollments: HrLmsEnrollmentRecord[];
  progress: HrLmsProgressRecord[];
  assessments: HrLmsAssessmentAttemptRecord[];
  certifications: HrLmsCertificationRecord[];
  reminders: HrLmsReminderRecord[];
  audit: HrLmsAuditRecord[];
};

const stores = new Map<string, HrLmsOrgStore>();

export function shouldUseHrLmsStoreFallback() {
  return process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
}

function seedStore(organizationId: string): HrLmsOrgStore {
  const courseCompliance: HrLmsCourseRecord = {
    id: "lms-course-compliance-001",
    organizationId,
    code: "LMS-CODE-001",
    title: "Code of Conduct",
    category: "compliance",
    description: "Mandatory code of conduct training",
    provider: "Afenda Internal",
    durationMinutes: 45,
    level: "beginner",
    language: "en",
    deliveryMode: "self_paced",
    courseType: "compliance_training",
    validityDays: 365,
    passingScore: 80,
    attemptLimit: 3,
    selfEnrollmentEnabled: false,
    approvalRequired: false,
    scormEnabled: false,
    xapiEnabled: false,
    externalLmsEnabled: false,
    courseStatus: "published",
    contentRefs: [
      {
        id: "lms-ref-internal-001",
        refKind: "internal",
        label: "Policy reader",
        uri: "/content/code-of-conduct",
      },
    ],
  };

  const courseScorm: HrLmsCourseRecord = {
    id: "lms-course-scorm-001",
    organizationId,
    code: "LMS-SCORM-101",
    title: "Safety Induction",
    category: "safety",
    description: "SCORM safety module",
    provider: "Safety Vendor",
    durationMinutes: 30,
    level: "beginner",
    language: "en",
    deliveryMode: "external_reference",
    courseType: "online_course",
    validityDays: 180,
    passingScore: 70,
    attemptLimit: 2,
    selfEnrollmentEnabled: true,
    approvalRequired: true,
    scormEnabled: true,
    xapiEnabled: false,
    externalLmsEnabled: false,
    courseStatus: "published",
    contentRefs: [
      {
        id: "lms-ref-scorm-001",
        refKind: "scorm",
        label: "SCORM package",
        uri: "scorm://safety-induction/v1",
        providerName: "Safety Vendor",
      },
    ],
  };

  const onboardingPath: HrLmsPathRecord = {
    id: "lms-path-onboarding-001",
    organizationId,
    code: "LMS-ONBOARD-001",
    name: "New hire onboarding",
    pathKind: "onboarding",
    courseIds: [courseCompliance.id, courseScorm.id],
    targetRoleCode: "ALL",
  };

  return {
    courses: [courseCompliance, courseScorm],
    paths: [onboardingPath],
    assignments: [
      {
        id: "lms-assignment-001",
        organizationId,
        employeeId: "emp-001",
        courseId: courseCompliance.id,
        assignmentKind: "mandatory",
        isComplianceMandatory: true,
        dueAt: "2026-06-01T00:00:00.000Z",
        assignedByUserId: "user-hr-001",
      },
      {
        id: "lms-assignment-002",
        organizationId,
        employeeId: "emp-002",
        pathId: onboardingPath.id,
        assignmentKind: "mandatory",
        isComplianceMandatory: false,
        assignedByUserId: "user-hr-001",
      },
    ],
    enrollments: [
      {
        id: "lms-enrollment-001",
        organizationId,
        employeeId: "emp-001",
        courseId: courseCompliance.id,
        assignmentId: "lms-assignment-001",
        enrollmentStatus: "enrolled",
        selfEnrolled: false,
        enrolledByUserId: "user-hr-001",
      },
      {
        id: "lms-enrollment-002",
        organizationId,
        employeeId: "emp-002",
        courseId: courseScorm.id,
        enrollmentStatus: "pending_approval",
        selfEnrolled: true,
        enrolledByUserId: "emp-002-user",
      },
    ],
    progress: [
      {
        id: "lms-progress-001",
        organizationId,
        enrollmentId: "lms-enrollment-001",
        employeeId: "emp-001",
        courseId: courseCompliance.id,
        progressStatus: "in_progress",
        completionPercent: 55,
        timeSpentMinutes: 20,
        lastAccessedAt: "2026-05-20T10:00:00.000Z",
        lessonProgress: { module1: 100, module2: 40 },
      },
    ],
    assessments: [
      {
        id: "lms-assessment-001",
        organizationId,
        enrollmentId: "lms-enrollment-001",
        employeeId: "emp-001",
        courseId: courseCompliance.id,
        attemptNumber: 1,
        score: 65,
        passingScore: 80,
        result: "failed",
        completedAt: "2026-05-21T09:00:00.000Z",
      },
    ],
    certifications: [
      {
        id: "lms-cert-001",
        organizationId,
        employeeId: "emp-003",
        courseId: courseCompliance.id,
        certificateCode: "CERT-COC-2025-001",
        certificationStatus: "active",
        issuedAt: "2025-06-01T00:00:00.000Z",
        expiresAt: "2026-06-01T00:00:00.000Z",
      },
    ],
    reminders: [
      {
        id: "lms-reminder-001",
        organizationId,
        employeeId: "emp-001",
        courseId: courseCompliance.id,
        reminderKind: "due_soon",
        dueAt: "2026-06-01T00:00:00.000Z",
        sentAt: "2026-05-25T08:00:00.000Z",
      },
      {
        id: "lms-reminder-002",
        organizationId,
        employeeId: "emp-003",
        certificationId: "lms-cert-001",
        reminderKind: "certification_expiring",
        dueAt: "2026-06-01T00:00:00.000Z",
      },
    ],
    audit: [
      {
        id: "lms-audit-001",
        organizationId,
        action: "course_setup",
        actorUserId: "user-hr-001",
        entityType: "hr_lms_course",
        entityId: courseCompliance.id,
        summary: "Seeded compliance course",
        occurredAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  };
}

function getStore(organizationId: string): HrLmsOrgStore {
  const existing = stores.get(organizationId);
  if (existing) {
    return existing;
  }
  const seeded = seedStore(organizationId);
  stores.set(organizationId, seeded);
  return seeded;
}

export function listHrLmsCoursesFromStore(organizationId: string) {
  return getStore(organizationId).courses;
}

export function listHrLmsPathsFromStore(organizationId: string) {
  return getStore(organizationId).paths;
}

export function listHrLmsAssignmentsFromStore(organizationId: string) {
  return getStore(organizationId).assignments;
}

export function listHrLmsEnrollmentsFromStore(organizationId: string) {
  return getStore(organizationId).enrollments;
}

export function listHrLmsProgressFromStore(
  organizationId: string,
  employeeIds?: readonly string[] | null,
) {
  const rows = getStore(organizationId).progress;
  if (!employeeIds) {
    return rows;
  }
  return rows.filter((row) => employeeIds.includes(row.employeeId));
}

export function listHrLmsAssessmentsFromStore(organizationId: string) {
  return getStore(organizationId).assessments;
}

export function listHrLmsCertificationsFromStore(organizationId: string) {
  return getStore(organizationId).certifications;
}

export function listHrLmsRemindersFromStore(organizationId: string) {
  return getStore(organizationId).reminders;
}

export function listHrLmsAuditFromStore(organizationId: string) {
  return getStore(organizationId).audit;
}

export function appendHrLmsAuditToStore(input: {
  organizationId: string;
  action: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
  summary: string;
}) {
  const store = getStore(input.organizationId);
  const record: HrLmsAuditRecord = {
    id: `lms-audit-${store.audit.length + 1}`,
    organizationId: input.organizationId,
    action: input.action,
    actorUserId: input.actorUserId,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    occurredAt: new Date().toISOString(),
  };
  store.audit = [record, ...store.audit];
  return record;
}

export function createHrLmsCourseInStore(input: {
  organizationId: string;
  actorUserId: string;
  code: string;
  title: string;
  category: string;
  description?: string;
  provider: string;
  durationMinutes?: number;
  level?: string;
  language?: string;
  deliveryMode?: string;
  courseType?: HrLmsCourseType;
  validityDays?: number | null;
  passingScore?: number | null;
  attemptLimit?: number | null;
  selfEnrollmentEnabled?: boolean;
  approvalRequired?: boolean;
  scormEnabled?: boolean;
  xapiEnabled?: boolean;
  externalLmsEnabled?: boolean;
  contentRefs?: HrLmsCourseRecord["contentRefs"];
}) {
  const store = getStore(input.organizationId);
  const course: HrLmsCourseRecord = {
    id: `lms-course-${store.courses.length + 1}`,
    organizationId: input.organizationId,
    code: input.code,
    title: input.title,
    category: input.category,
    description: input.description ?? "",
    provider: input.provider,
    durationMinutes: input.durationMinutes ?? 0,
    level: input.level ?? "beginner",
    language: input.language ?? "en",
    deliveryMode: input.deliveryMode ?? "self_paced",
    courseType: input.courseType ?? "online_course",
    validityDays: input.validityDays ?? null,
    passingScore: input.passingScore ?? null,
    attemptLimit: input.attemptLimit ?? null,
    selfEnrollmentEnabled: input.selfEnrollmentEnabled ?? false,
    approvalRequired: input.approvalRequired ?? false,
    scormEnabled: input.scormEnabled ?? false,
    xapiEnabled: input.xapiEnabled ?? false,
    externalLmsEnabled: input.externalLmsEnabled ?? false,
    courseStatus: "published",
    contentRefs: input.contentRefs ?? [],
  };
  store.courses = [...store.courses, course];
  appendHrLmsAuditToStore({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "course_setup",
    entityType: "hr_lms_course",
    entityId: course.id,
    summary: `Created course ${course.code}`,
  });
  return course;
}

export function submitHrLmsAssessmentAttemptInStore(input: {
  organizationId: string;
  actorUserId: string;
  enrollmentId: string;
  score: number;
}) {
  const store = getStore(input.organizationId);
  const enrollment = store.enrollments.find(
    (row) => row.id === input.enrollmentId,
  );
  if (!enrollment) {
    throw new Error("enrollment_not_found");
  }
  const course = store.courses.find((row) => row.id === enrollment.courseId);
  if (!course) {
    throw new Error("course_not_found");
  }

  const priorAttempts = store.assessments.filter(
    (row) => row.enrollmentId === input.enrollmentId,
  );
  if (
    course.attemptLimit != null &&
    priorAttempts.length >= course.attemptLimit
  ) {
    throw new Error("attempt_limit_exceeded");
  }

  const attemptNumber = priorAttempts.length + 1;
  const passed =
    course.passingScore == null ? true : input.score >= course.passingScore;
  const attempt: HrLmsAssessmentAttemptRecord = {
    id: `lms-assessment-${store.assessments.length + 1}`,
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    employeeId: enrollment.employeeId,
    courseId: enrollment.courseId,
    attemptNumber,
    score: input.score,
    passingScore: course.passingScore,
    result: passed ? "passed" : "failed",
    completedAt: new Date().toISOString(),
  };
  store.assessments = [...store.assessments, attempt];

  appendHrLmsAuditToStore({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "assessment",
    entityType: "hr_lms_assessment_attempt",
    entityId: attempt.id,
    summary: `Assessment attempt ${attemptNumber} ${attempt.result}`,
  });

  return attempt;
}

export function resetHrLmsStoreForTests(organizationId: string) {
  stores.delete(organizationId);
}
