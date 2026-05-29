import {
  buildCrudSapAuditAction,
  buildErpAuditAction,
} from "@afenda/platform/erp/crud-sap.shared"

/**
 * Canonical audit action strings for Learning Management System (LMS).
 *
 * Import `HRM_LMS_AUDIT` — do not hard-code `erp.hrm.lms.*` in actions or
 * integration doors.
 */
export const HRM_LMS_AUDIT = {
  courseCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_course",
    verb: "create",
  }),
  courseUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_course",
    verb: "update",
  }),
  courseDeprecate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_course",
    verb: "deprecate",
  }),
  contentRefCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_course_content_ref",
    verb: "create",
  }),
  learningPathCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_learning_path",
    verb: "create",
  }),
  learningPathUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_learning_path",
    verb: "update",
  }),
  learningPathDeprecate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_learning_path",
    verb: "deprecate",
  }),
  pathCourseCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_path_course",
    verb: "create",
  }),
  assignmentCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_assignment",
    verb: "create",
  }),
  enrollmentCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_enrollment",
    verb: "create",
  }),
  enrollmentApprove: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_enrollment",
    verb: "approve",
  }),
  enrollmentReject: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_enrollment",
    verb: "reject",
  }),
  progressUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_progress",
    verb: "update",
  }),
  assessmentAttemptCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_assessment_attempt",
    verb: "create",
  }),
  certificateIssue: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_certificate",
    verb: "resolve",
  }),
  certificateRenew: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_certificate",
    verb: "update",
  }),
  lessonCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_lesson",
    verb: "create",
  }),
  assessmentCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_assessment",
    verb: "create",
  }),
  reminderDispatch: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_reminder",
    verb: "audit",
  }),
  reportExport: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "lms_report",
    verb: "audit",
  }),
} as const

export type HrmLmsAuditAction =
  (typeof HRM_LMS_AUDIT)[keyof typeof HRM_LMS_AUDIT]
