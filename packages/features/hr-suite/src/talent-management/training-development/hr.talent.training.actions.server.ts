"use server";

import { hrSuiteActionFailure } from "../../employee-management/compliance-regulatory-tracking/server";
import {
  requireHrTrainingApprove,
  requireHrTrainingRead,
  requireHrTrainingWrite,
} from "./hr.talent.training-access.policy.server";
import type {
  HrTrainingAssessmentInput,
  HrTrainingAssignmentInput,
  HrTrainingAttendanceInput,
  HrTrainingCertificationInput,
  HrTrainingCompletionInput,
  HrTrainingCourseInput,
  HrTrainingEnrollmentInput,
} from "../schemas";
import {
  assignHrTraining,
  createHrTrainingCourse,
  emitHrTrainingAuditEvent,
  enrollHrTraining,
  getHrTrainingStore,
  listHrTrainingComplianceCompletionRefs,
  listHrTrainingReadinessRefs,
  recordHrTrainingAssessment,
  recordHrTrainingAttendance,
  recordHrTrainingCertification,
  recordHrTrainingCompletion,
} from "./hr.talent.training-store.shared";
import { hrTrainingAuditActions } from "../events";

type CourseActionInput = Omit<HrTrainingCourseInput, "id" | "organizationId">;
type AssignmentActionInput = Omit<
  HrTrainingAssignmentInput,
  "id" | "organizationId"
>;
type EnrollmentActionInput = Omit<
  HrTrainingEnrollmentInput,
  "id" | "organizationId"
>;
type AttendanceActionInput = Omit<
  HrTrainingAttendanceInput,
  "id" | "organizationId"
>;
type CompletionActionInput = Omit<
  HrTrainingCompletionInput,
  "id" | "organizationId"
>;
type AssessmentActionInput = Omit<
  HrTrainingAssessmentInput,
  "id" | "organizationId" | "result"
>;
type CertificationActionInput = Omit<
  HrTrainingCertificationInput,
  "id" | "organizationId"
>;

function actionFailure(message: string, code: string) {
  return hrSuiteActionFailure(message, { code });
}

export async function refreshHrTrainingWorkbenchAction() {
  try {
    const guard = await requireHrTrainingRead();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return actionFailure(
      "Unable to refresh Training & Development.",
      "hr.training.refresh_failed",
    );
  }
}

export async function refreshHrTalentTrainingWorkbenchAction() {
  return refreshHrTrainingWorkbenchAction();
}

export async function createHrTrainingCourseAction(input: CourseActionInput) {
  try {
    const guard = await requireHrTrainingWrite();
    const store = getHrTrainingStore(guard.organization.id);
    const course = createHrTrainingCourse(store, {
      ...input,
      organizationId: guard.organization.id,
    });
    emitHrTrainingAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTrainingAuditActions.courseCreated,
      actorId: guard.session.id,
      targetType: "course",
      targetId: course.id,
      summary: `Created training course ${course.code}.`,
    });
    return { ok: true as const, data: course };
  } catch {
    return actionFailure(
      "Unable to create training course.",
      "hr.training.course_create_failed",
    );
  }
}

export async function assignHrTrainingAction(input: AssignmentActionInput) {
  try {
    const guard = await requireHrTrainingWrite();
    const store = getHrTrainingStore(guard.organization.id);
    const assignment = assignHrTraining(store, {
      ...input,
      organizationId: guard.organization.id,
    });
    emitHrTrainingAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTrainingAuditActions.assignmentCreated,
      actorId: guard.session.id,
      targetType: "assignment",
      targetId: assignment.id,
      summary: `Assigned training to ${assignment.employeeDisplayName}.`,
    });
    return { ok: true as const, data: assignment };
  } catch {
    return actionFailure(
      "Unable to assign training.",
      "hr.training.assignment_failed",
    );
  }
}

export async function enrollHrTrainingAction(input: EnrollmentActionInput) {
  try {
    const guard = await requireHrTrainingRead();
    const store = getHrTrainingStore(guard.organization.id);
    const enrollment = enrollHrTraining(store, {
      ...input,
      organizationId: guard.organization.id,
    });
    emitHrTrainingAuditEvent(store, {
      organizationId: guard.organization.id,
      action:
        enrollment.status === "waitlisted"
          ? hrTrainingAuditActions.waitlistChanged
          : hrTrainingAuditActions.enrollmentRequested,
      actorId: guard.session.id,
      targetType: "enrollment",
      targetId: enrollment.id,
      summary: `Recorded enrollment request for ${enrollment.employeeDisplayName}.`,
    });
    return { ok: true as const, data: enrollment };
  } catch {
    return actionFailure(
      "Unable to enroll in training.",
      "hr.training.enrollment_failed",
    );
  }
}

export async function approveHrTrainingEnrollmentAction(
  input: EnrollmentActionInput,
) {
  try {
    const guard = await requireHrTrainingApprove();
    const store = getHrTrainingStore(guard.organization.id);
    const enrollment = enrollHrTraining(store, {
      ...input,
      status: "approved",
      approvedByUserId: guard.session.id,
      approvedAt: new Date().toISOString(),
      organizationId: guard.organization.id,
    });
    emitHrTrainingAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTrainingAuditActions.enrollmentApproved,
      actorId: guard.session.id,
      targetType: "enrollment",
      targetId: enrollment.id,
      summary: `Approved enrollment for ${enrollment.employeeDisplayName}.`,
    });
    return { ok: true as const, data: enrollment };
  } catch {
    return actionFailure(
      "Unable to approve training enrollment.",
      "hr.training.enrollment_approval_failed",
    );
  }
}

export async function recordHrTrainingAttendanceAction(
  input: AttendanceActionInput,
) {
  try {
    const guard = await requireHrTrainingWrite();
    const store = getHrTrainingStore(guard.organization.id);
    const attendance = recordHrTrainingAttendance(store, {
      ...input,
      organizationId: guard.organization.id,
    });
    emitHrTrainingAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTrainingAuditActions.attendanceRecorded,
      actorId: guard.session.id,
      targetType: "attendance",
      targetId: attendance.id,
      summary: `Recorded attendance for ${attendance.employeeDisplayName}.`,
    });
    return { ok: true as const, data: attendance };
  } catch {
    return actionFailure(
      "Unable to record training attendance.",
      "hr.training.attendance_failed",
    );
  }
}

export async function recordHrTrainingCompletionAction(
  input: CompletionActionInput,
) {
  try {
    const guard = await requireHrTrainingWrite();
    const store = getHrTrainingStore(guard.organization.id);
    const completion = recordHrTrainingCompletion(store, {
      ...input,
      organizationId: guard.organization.id,
    });
    emitHrTrainingAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTrainingAuditActions.completionRecorded,
      actorId: guard.session.id,
      targetType: "completion",
      targetId: completion.id,
      summary: `Recorded completion for ${completion.employeeDisplayName}.`,
    });
    return { ok: true as const, data: completion };
  } catch {
    return actionFailure(
      "Unable to record training completion.",
      "hr.training.completion_failed",
    );
  }
}

export async function recordHrTrainingAssessmentAction(
  input: AssessmentActionInput,
) {
  try {
    const guard = await requireHrTrainingWrite();
    const store = getHrTrainingStore(guard.organization.id);
    const assessment = recordHrTrainingAssessment(store, {
      ...input,
      organizationId: guard.organization.id,
    });
    emitHrTrainingAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTrainingAuditActions.assessmentRecorded,
      actorId: guard.session.id,
      targetType: "assessment",
      targetId: assessment.id,
      summary: `Recorded assessment for ${assessment.employeeDisplayName}.`,
    });
    return { ok: true as const, data: assessment };
  } catch {
    return actionFailure(
      "Unable to record training assessment.",
      "hr.training.assessment_failed",
    );
  }
}

export async function recordHrTrainingCertificationAction(
  input: CertificationActionInput,
) {
  try {
    const guard = await requireHrTrainingWrite();
    const store = getHrTrainingStore(guard.organization.id);
    const certification = recordHrTrainingCertification(store, {
      ...input,
      organizationId: guard.organization.id,
    });
    emitHrTrainingAuditEvent(store, {
      organizationId: guard.organization.id,
      action: hrTrainingAuditActions.certificationRecorded,
      actorId: guard.session.id,
      targetType: "certification",
      targetId: certification.id,
      summary: `Recorded certification ${certification.certificationName}.`,
    });
    return { ok: true as const, data: certification };
  } catch {
    return actionFailure(
      "Unable to record training certification.",
      "hr.training.certification_failed",
    );
  }
}

export async function exportHrTrainingComplianceRefsAction() {
  try {
    const guard = await requireHrTrainingRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Training integration export access is required.",
        "hr.training.integration_forbidden",
      );
    }
    const store = getHrTrainingStore(guard.organization.id);
    return {
      ok: true as const,
      data: listHrTrainingComplianceCompletionRefs(store),
    };
  } catch {
    return actionFailure(
      "Unable to export training compliance refs.",
      "hr.training.compliance_export_failed",
    );
  }
}

export async function exportHrTrainingReadinessRefsAction() {
  try {
    const guard = await requireHrTrainingRead();
    if (!guard.canExposeIntegrations) {
      return actionFailure(
        "Training integration export access is required.",
        "hr.training.integration_forbidden",
      );
    }
    const store = getHrTrainingStore(guard.organization.id);
    return { ok: true as const, data: listHrTrainingReadinessRefs(store) };
  } catch {
    return actionFailure(
      "Unable to export training readiness refs.",
      "hr.training.readiness_export_failed",
    );
  }
}
