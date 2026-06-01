import {
  hrTrainingAlertsSurfaceKey,
  hrTrainingAssessmentsSurfaceKey,
  hrTrainingAssignmentsSurfaceKey,
  hrTrainingAttendanceSurfaceKey,
  hrTrainingAuditTrailSurfaceKey,
  hrTrainingBoardingSurfaceKey,
  hrTrainingCertificationsSurfaceKey,
  hrTrainingCompetenciesSurfaceKey,
  hrTrainingComplianceSurfaceKey,
  hrTrainingCompletionsSurfaceKey,
  hrTrainingCostsSurfaceKey,
  hrTrainingCoursesSurfaceKey,
  hrTrainingDevelopmentPlansSurfaceKey,
  hrTrainingEnrollmentsSurfaceKey,
  hrTrainingFeedbackSurfaceKey,
  hrTrainingProvidersSurfaceKey,
  hrTrainingReadinessSurfaceKey,
  hrTrainingReportsSurfaceKey,
  hrTrainingRequirementsSurfaceKey,
  hrTrainingSkillGapsSurfaceKey,
  hrTrainingSkillsSurfaceKey,
} from "./hr.talent.training-surface-metadata.shared";

export const hrTalentTrainingUiCopy = {
  title: "Training & Development",
  description:
    "Governed training catalog, enrollment, completion, skill, certification, cost, and readiness workspace.",
  page: {
    title: "Training & Development",
    description:
      "Manage classroom training, blended LMS completion references, mandatory requirements, skills, certifications, and authorized downstream readiness exports.",
  },
  overview: {
    sectionTitle: "Training Overview",
    activeCourses: "Active courses",
    pendingApprovals: "Pending approvals",
    waitlisted: "Waitlisted",
    certificationRisk: "Certification risks",
    openSkillGaps: "Open skill gaps",
    spend: "Training spend",
  },
  accessDenied: {
    title: "Training & Development access required",
    description: "You do not have permission to view this HR workspace.",
  },
  listSections: {
    [hrTrainingCoursesSurfaceKey]: {
      title: "Course Catalog",
      description:
        "Course type, delivery, capacity, cost, location, trainer, prerequisites, and LMS blend references.",
      emptyTitle: "No courses",
      emptyDescription: "No training courses match the current filters.",
    },
    [hrTrainingProvidersSurfaceKey]: {
      title: "Training Providers",
      description:
        "Internal, external, LMS, regulator, and vendor provider records.",
      emptyTitle: "No providers",
      emptyDescription: "No training providers match the current filters.",
    },
    [hrTrainingRequirementsSurfaceKey]: {
      title: "Mandatory Requirements",
      description:
        "Required training by legal entity, department, role, grade, location, employment type, or employee category.",
      emptyTitle: "No requirements",
      emptyDescription: "No mandatory requirements match the current filters.",
    },
    [hrTrainingAssignmentsSurfaceKey]: {
      title: "Assignments",
      description:
        "Individual, bulk, requirement, and performance-driven training assignments.",
      emptyTitle: "No assignments",
      emptyDescription: "No training assignments match the current filters.",
    },
    [hrTrainingEnrollmentsSurfaceKey]: {
      title: "Enrollment, Approval & Waitlist",
      description:
        "Self-enrollment, approval state, and waitlist positions when capacity is full.",
      emptyTitle: "No enrollments",
      emptyDescription: "No enrollments or waitlist rows match the filters.",
    },
    [hrTrainingAttendanceSurfaceKey]: {
      title: "Attendance",
      description: "Session attendance recorded by HR or delegated trainers.",
      emptyTitle: "No attendance",
      emptyDescription: "No attendance records match the current filters.",
    },
    [hrTrainingCompletionsSurfaceKey]: {
      title: "Completion Status",
      description:
        "Not started, enrolled, in progress, completed, failed, no-show, withdrawn, expired, and renewed states.",
      emptyTitle: "No completions",
      emptyDescription: "No completion records match the current filters.",
    },
    [hrTrainingAssessmentsSurfaceKey]: {
      title: "Assessments",
      description:
        "Test score, passing score, assessment result, and assessment date.",
      emptyTitle: "No assessments",
      emptyDescription: "No assessment results match the current filters.",
    },
    [hrTrainingSkillsSurfaceKey]: {
      title: "Employee Skill Profiles",
      description:
        "Skill name, category, proficiency, evidence, and last assessment date.",
      emptyTitle: "No skills",
      emptyDescription: "No employee skills match the current filters.",
    },
    [hrTrainingCompetenciesSurfaceKey]: {
      title: "Role Competencies",
      description:
        "Competency requirements by role, job family, department, and grade.",
      emptyTitle: "No competencies",
      emptyDescription: "No competencies match the current filters.",
    },
    [hrTrainingSkillGapsSurfaceKey]: {
      title: "Skill Gaps",
      description:
        "Gap analysis against role and competency requirements with severity.",
      emptyTitle: "No skill gaps",
      emptyDescription: "No skill gaps match the current filters.",
    },
    [hrTrainingDevelopmentPlansSurfaceKey]: {
      title: "Development Plans",
      description:
        "Development items from skill gaps, manager recommendations, and performance outcomes.",
      emptyTitle: "No development plans",
      emptyDescription: "No development plans match the current filters.",
    },
    [hrTrainingCertificationsSurfaceKey]: {
      title: "Certifications",
      description:
        "Issue, expiry, renewal, issuing body, certificate reference, and document evidence links.",
      emptyTitle: "No certifications",
      emptyDescription: "No certification records match the current filters.",
    },
    [hrTrainingAlertsSurfaceKey]: {
      title: "Certification Alerts",
      description:
        "Employee, manager, HR, and compliance reminders before expiry plus missing required certifications.",
      emptyTitle: "No alerts",
      emptyDescription: "No certification alerts match the current filters.",
    },
    [hrTrainingFeedbackSurfaceKey]: {
      title: "Feedback & Evaluation",
      description: "Course feedback survey and evaluation responses.",
      emptyTitle: "No feedback",
      emptyDescription: "No training feedback matches the current filters.",
    },
    [hrTrainingCostsSurfaceKey]: {
      title: "Training Costs",
      description:
        "Cost by employee, department, provider, course, and accounting period.",
      emptyTitle: "No costs",
      emptyDescription: "No training costs match the current filters.",
    },
    [hrTrainingComplianceSurfaceKey]: {
      title: "Compliance Completion Export",
      description:
        "Mandatory completion status exposed to Compliance & Regulatory Tracking where authorized.",
      emptyTitle: "No compliance exports",
      emptyDescription: "No compliance completion refs are available.",
    },
    [hrTrainingReadinessSurfaceKey]: {
      title: "Performance & Lifecycle Readiness",
      description:
        "Authorized skill and certification readiness references for Performance and Lifecycle.",
      emptyTitle: "No readiness refs",
      emptyDescription: "No readiness refs are available.",
    },
    [hrTrainingBoardingSurfaceKey]: {
      title: "Onboarding Training Bridge",
      description:
        "Training completion refs for boarding tasks with metadata.trainingCourseCode.",
      emptyTitle: "No boarding refs",
      emptyDescription: "No onboarding task completion refs are available.",
    },
    [hrTrainingReportsSurfaceKey]: {
      title: "Training Reports",
      description:
        "Training reports by employee, department, manager, role, course, certification, status, provider, and period.",
      emptyTitle: "No report rows",
      emptyDescription: "No report rows match the current filters.",
    },
    [hrTrainingAuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Course setup, assignment, enrollment, approval, attendance, completion, assessment, certification, renewal, expiry, and development plan audit events.",
      emptyTitle: "No audit events",
      emptyDescription: "No audit events match the current filters.",
    },
  },
} as const;

export const hrTrainingUiCopy = hrTalentTrainingUiCopy;
