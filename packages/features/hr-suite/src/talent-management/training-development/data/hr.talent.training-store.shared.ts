import type {
  HrTrainingBoardingCompletionRef,
  HrTrainingComplianceCompletionRef,
  HrTrainingReadinessRef,
} from "../contracts/hr.talent.training.contract";
import { hrTrainingAuditActions, type HrTrainingAuditAction } from "../events";
import type { HrTrainingReportGroupBy } from "../schemas/hr.talent.training-constants.shared";
import type {
  HrTrainingAssessmentInput,
  HrTrainingAssignmentInput,
  HrTrainingAttendanceInput,
  HrTrainingCertificationAlertInput,
  HrTrainingCertificationInput,
  HrTrainingCompetencyInput,
  HrTrainingCompletionInput,
  HrTrainingCostInput,
  HrTrainingCourseInput,
  HrTrainingDevelopmentPlanInput,
  HrTrainingEnrollmentInput,
  HrTrainingFeedbackInput,
  HrTrainingProviderInput,
  HrTrainingRequirementInput,
  HrTrainingSkillGapInput,
  HrTrainingSkillProfileInput,
} from "../schemas/hr.talent.training.schema";

export type HrTrainingAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrTrainingAuditAction;
  readonly actorId: string;
  readonly targetType:
    | "course"
    | "requirement"
    | "assignment"
    | "enrollment"
    | "attendance"
    | "completion"
    | "assessment"
    | "certification"
    | "feedback"
    | "cost"
    | "development_plan"
    | "integration";
  readonly targetId: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrTrainingReportRow = {
  readonly id: string;
  readonly groupLabel: string;
  readonly assignedCount: number;
  readonly completedCount: number;
  readonly overdueCount: number;
  readonly complianceRate: number;
  readonly costAmount: number;
};

export type HrTrainingStore = {
  readonly providers: HrTrainingProviderInput[];
  readonly courses: HrTrainingCourseInput[];
  readonly requirements: HrTrainingRequirementInput[];
  readonly assignments: HrTrainingAssignmentInput[];
  readonly enrollments: HrTrainingEnrollmentInput[];
  readonly attendance: HrTrainingAttendanceInput[];
  readonly completions: HrTrainingCompletionInput[];
  readonly assessments: HrTrainingAssessmentInput[];
  readonly skillProfiles: HrTrainingSkillProfileInput[];
  readonly competencies: HrTrainingCompetencyInput[];
  readonly skillGaps: HrTrainingSkillGapInput[];
  readonly developmentPlans: HrTrainingDevelopmentPlanInput[];
  readonly certifications: HrTrainingCertificationInput[];
  readonly alerts: HrTrainingCertificationAlertInput[];
  readonly feedback: HrTrainingFeedbackInput[];
  readonly costs: HrTrainingCostInput[];
  readonly auditEvents: HrTrainingAuditEvent[];
};

type EmployeeScoped = {
  readonly employeeId: string;
};

type StoreAccess = {
  readonly visibleEmployeeIds: readonly string[] | null;
};

const stores = new Map<string, HrTrainingStore>();

function withOrg<T extends { organizationId: string }>(
  organizationId: string,
  rows: readonly Omit<T, "organizationId">[],
): T[] {
  return rows.map((row) => ({ ...row, organizationId }) as T);
}

function hasEmployeeAccess(
  row: EmployeeScoped,
  visibleEmployeeIds: readonly string[] | null,
) {
  return (
    visibleEmployeeIds === null || visibleEmployeeIds.includes(row.employeeId)
  );
}

function scopedRows<T extends EmployeeScoped>(
  rows: readonly T[],
  access: StoreAccess,
) {
  return rows.filter((row) =>
    hasEmployeeAccess(row, access.visibleEmployeeIds),
  );
}

function createSeedStore(organizationId: string): HrTrainingStore {
  const providers = withOrg<HrTrainingProviderInput>(organizationId, [
    {
      id: "provider-internal-academy",
      name: "Afenda Internal Academy",
      providerType: "internal",
      contactName: "People Enablement",
      accreditationRef: "INT-ACADEMY-2026",
      status: "active",
    },
    {
      id: "provider-safety-board",
      name: "National Safety Board",
      providerType: "regulator",
      contactName: "Safety Programs Desk",
      accreditationRef: "NSB-AUD-1442",
      status: "active",
    },
    {
      id: "provider-cloud-lms",
      name: "Afenda LMS",
      providerType: "lms",
      contactName: "Learning Operations",
      status: "active",
    },
  ]);

  const courses = withOrg<HrTrainingCourseInput>(organizationId, [
    {
      id: "course-safety-101",
      code: "SAFE-101",
      title: "Workplace Safety Fundamentals",
      trainingType: "safety_training",
      deliveryMode: "in_person",
      status: "active",
      providerId: "provider-safety-board",
      durationHours: 8,
      capacity: 2,
      costAmount: 450,
      currency: "MYR",
      location: "KL Training Room A",
      trainerName: "Aisha Rahman",
      prerequisites: [],
      selfEnrollmentEnabled: true,
      approvalRequired: true,
    },
    {
      id: "course-data-privacy",
      code: "COMP-DPA",
      title: "Data Privacy Annual Refresher",
      trainingType: "compliance_training",
      deliveryMode: "self_paced",
      status: "active",
      providerId: "provider-cloud-lms",
      durationHours: 2,
      capacity: 500,
      costAmount: 35,
      currency: "MYR",
      location: "LMS",
      trainerName: "Compliance Office",
      prerequisites: [],
      selfEnrollmentEnabled: true,
      approvalRequired: false,
      lmsCourseId: "lms-dpa-2026",
    },
    {
      id: "course-leadership",
      code: "LEAD-220",
      title: "First Line Leadership Workshop",
      trainingType: "workshop",
      deliveryMode: "hybrid",
      status: "active",
      providerId: "provider-internal-academy",
      durationHours: 12,
      capacity: 12,
      costAmount: 900,
      currency: "MYR",
      location: "Hybrid",
      trainerName: "Nadia Lim",
      prerequisites: ["course-data-privacy"],
      selfEnrollmentEnabled: false,
      approvalRequired: true,
    },
    {
      id: "course-forklift-cert",
      code: "CERT-FORK",
      title: "Forklift Operator Certification",
      trainingType: "certification",
      deliveryMode: "external",
      status: "active",
      providerId: "provider-safety-board",
      durationHours: 16,
      capacity: 8,
      costAmount: 1200,
      currency: "MYR",
      location: "External Safety Centre",
      trainerName: "Regulated Provider",
      prerequisites: ["course-safety-101"],
      selfEnrollmentEnabled: false,
      approvalRequired: true,
    },
  ]);

  const requirements = withOrg<HrTrainingRequirementInput>(organizationId, [
    {
      id: "req-safety-warehouse",
      courseId: "course-safety-101",
      scopeKind: "department",
      scopeValue: "Warehouse",
      mandatory: true,
      recurrenceMonths: 12,
      dueWithinDays: 30,
    },
    {
      id: "req-privacy-all",
      courseId: "course-data-privacy",
      scopeKind: "legal_entity",
      scopeValue: "MY01",
      mandatory: true,
      recurrenceMonths: 12,
      dueWithinDays: 14,
    },
    {
      id: "req-forklift-role",
      courseId: "course-forklift-cert",
      scopeKind: "role",
      scopeValue: "Forklift Operator",
      mandatory: true,
      recurrenceMonths: 24,
      dueWithinDays: 45,
    },
  ]);

  const assignments = withOrg<HrTrainingAssignmentInput>(organizationId, [
    {
      id: "assign-001",
      courseId: "course-safety-101",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      departmentName: "Warehouse",
      roleTitle: "Warehouse Supervisor",
      managerEmployeeId: "emp-900",
      assignedByUserId: "user-hr-training",
      assignmentSource: "requirement",
      status: "accepted",
      assignedAt: "2026-05-01",
      dueAt: "2026-06-01",
    },
    {
      id: "assign-002",
      courseId: "course-data-privacy",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      departmentName: "Sales",
      roleTitle: "Account Executive",
      managerEmployeeId: "emp-901",
      assignedByUserId: "user-hr-training",
      assignmentSource: "bulk",
      status: "assigned",
      assignedAt: "2026-05-05",
      dueAt: "2026-05-19",
    },
    {
      id: "assign-003",
      courseId: "course-leadership",
      employeeId: "emp-102",
      employeeDisplayName: "Priya Nair",
      departmentName: "Operations",
      roleTitle: "Team Lead",
      managerEmployeeId: "emp-900",
      assignedByUserId: "user-manager-900",
      assignmentSource: "performance",
      status: "overdue",
      assignedAt: "2026-03-20",
      dueAt: "2026-05-10",
    },
    {
      id: "assign-004",
      courseId: "course-forklift-cert",
      employeeId: "emp-103",
      employeeDisplayName: "Hafiz Rahman",
      departmentName: "Warehouse",
      roleTitle: "Forklift Operator",
      managerEmployeeId: "emp-900",
      assignedByUserId: "user-hr-training",
      assignmentSource: "requirement",
      status: "assigned",
      assignedAt: "2026-05-08",
      dueAt: "2026-06-22",
    },
  ]);

  const enrollments = withOrg<HrTrainingEnrollmentInput>(organizationId, [
    {
      id: "enroll-001",
      courseId: "course-safety-101",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      requestedAt: "2026-05-02",
      status: "approved",
      approvalRequired: true,
      approvedByUserId: "user-manager-900",
      approvedAt: "2026-05-03",
    },
    {
      id: "enroll-002",
      courseId: "course-safety-101",
      employeeId: "emp-103",
      employeeDisplayName: "Hafiz Rahman",
      requestedAt: "2026-05-11",
      status: "waitlisted",
      approvalRequired: true,
      waitlistPosition: 1,
    },
    {
      id: "enroll-003",
      courseId: "course-data-privacy",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      requestedAt: "2026-05-05",
      status: "enrolled",
      approvalRequired: false,
    },
  ]);

  const attendance = withOrg<HrTrainingAttendanceInput>(organizationId, [
    {
      id: "att-001",
      courseId: "course-safety-101",
      sessionDate: "2026-05-15",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      status: "present",
      recordedByUserId: "user-hr-training",
    },
    {
      id: "att-002",
      courseId: "course-leadership",
      sessionDate: "2026-04-20",
      employeeId: "emp-102",
      employeeDisplayName: "Priya Nair",
      status: "no_show",
      recordedByUserId: "user-hr-training",
    },
  ]);

  const completions = withOrg<HrTrainingCompletionInput>(organizationId, [
    {
      id: "complete-001",
      courseId: "course-safety-101",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      status: "completed",
      completedAt: "2026-05-15",
      expiresAt: "2027-05-15",
    },
    {
      id: "complete-002",
      courseId: "course-data-privacy",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      status: "completed",
      completedAt: "2026-05-06",
      expiresAt: "2027-05-06",
      lmsCompletionRef: "lms-complete-dpa-101",
    },
    {
      id: "complete-003",
      courseId: "course-leadership",
      employeeId: "emp-102",
      employeeDisplayName: "Priya Nair",
      status: "no_show",
    },
  ]);

  const assessments = withOrg<HrTrainingAssessmentInput>(organizationId, [
    {
      id: "assess-001",
      courseId: "course-safety-101",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      assessmentDate: "2026-05-15",
      score: 91,
      passingScore: 80,
      result: "passed",
      assessorUserId: "user-hr-training",
    },
    {
      id: "assess-002",
      courseId: "course-leadership",
      employeeId: "emp-102",
      employeeDisplayName: "Priya Nair",
      assessmentDate: "2026-04-20",
      score: 0,
      passingScore: 70,
      result: "failed",
      assessorUserId: "user-hr-training",
    },
  ]);

  const skillProfiles = withOrg<HrTrainingSkillProfileInput>(organizationId, [
    {
      id: "skill-001",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      skillName: "Warehouse Safety",
      skillCategory: "safety",
      proficiencyLevel: "advanced",
      evidenceRef: "complete-001",
      lastAssessedAt: "2026-05-15",
    },
    {
      id: "skill-002",
      employeeId: "emp-102",
      employeeDisplayName: "Priya Nair",
      skillName: "Coaching",
      skillCategory: "leadership",
      proficiencyLevel: "working",
      evidenceRef: "perf-review-2026-q1",
      lastAssessedAt: "2026-04-05",
    },
  ]);

  const competencies = withOrg<HrTrainingCompetencyInput>(organizationId, [
    {
      id: "competency-safety-advanced",
      name: "Warehouse Safety",
      category: "safety",
      requiredLevel: "advanced",
      roleTitle: "Warehouse Supervisor",
      departmentName: "Warehouse",
      grade: "G6",
    },
    {
      id: "competency-coaching-advanced",
      name: "Coaching",
      category: "leadership",
      requiredLevel: "advanced",
      roleTitle: "Team Lead",
      departmentName: "Operations",
      grade: "G7",
    },
  ]);

  const skillGaps = withOrg<HrTrainingSkillGapInput>(organizationId, [
    {
      id: "gap-001",
      employeeId: "emp-102",
      employeeDisplayName: "Priya Nair",
      competencyId: "competency-coaching-advanced",
      competencyName: "Coaching",
      requiredLevel: "advanced",
      currentLevel: "working",
      severity: "high",
      status: "in_development",
      sourceRef: "perf-review-2026-q1",
    },
    {
      id: "gap-002",
      employeeId: "emp-103",
      employeeDisplayName: "Hafiz Rahman",
      competencyId: "competency-safety-advanced",
      competencyName: "Warehouse Safety",
      requiredLevel: "advanced",
      currentLevel: "foundation",
      severity: "critical",
      status: "open",
      sourceRef: "req-forklift-role",
    },
  ]);

  const developmentPlans = withOrg<HrTrainingDevelopmentPlanInput>(
    organizationId,
    [
      {
        id: "plan-001",
        employeeId: "emp-102",
        employeeDisplayName: "Priya Nair",
        title: "Close coaching gap from Q1 review",
        source: "performance_review",
        courseId: "course-leadership",
        skillGapId: "gap-001",
        performanceReviewRef: "perf-review-2026-q1",
        targetDate: "2026-06-30",
        status: "in_progress",
        progressPercent: 35,
      },
      {
        id: "plan-002",
        employeeId: "emp-103",
        employeeDisplayName: "Hafiz Rahman",
        title: "Complete forklift certification path",
        source: "skill_gap",
        courseId: "course-forklift-cert",
        skillGapId: "gap-002",
        targetDate: "2026-06-22",
        status: "planned",
        progressPercent: 0,
      },
    ],
  );

  const certifications = withOrg<HrTrainingCertificationInput>(
    organizationId,
    [
      {
        id: "cert-001",
        employeeId: "emp-100",
        employeeDisplayName: "Maya Chen",
        certificationName: "Workplace Safety Supervisor",
        issuingBody: "National Safety Board",
        issueDate: "2026-05-15",
        expiryDate: "2027-05-15",
        renewalDate: "2027-04-15",
        certificateReference: "NSB-SAFE-100",
        documentEvidenceRef: "doc-vault-cert-001",
        required: true,
        status: "valid",
      },
      {
        id: "cert-002",
        employeeId: "emp-103",
        employeeDisplayName: "Hafiz Rahman",
        certificationName: "Forklift Operator",
        issuingBody: "National Safety Board",
        certificateReference: "MISSING",
        required: true,
        status: "missing",
      },
      {
        id: "cert-003",
        employeeId: "emp-101",
        employeeDisplayName: "Daniel Ong",
        certificationName: "Data Privacy Annual Refresher",
        issuingBody: "Afenda LMS",
        issueDate: "2025-06-12",
        expiryDate: "2026-06-12",
        renewalDate: "2026-05-30",
        certificateReference: "LMS-DPA-101",
        documentEvidenceRef: "doc-vault-cert-003",
        required: true,
        status: "expiring",
      },
    ],
  );

  const alerts = withOrg<HrTrainingCertificationAlertInput>(organizationId, [
    {
      id: "alert-001",
      certificationId: "cert-003",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      audience: "employee",
      status: "open",
      alertAt: "2026-05-30",
      severity: "high",
      message: "Data Privacy Annual Refresher expires on 2026-06-12.",
    },
    {
      id: "alert-002",
      certificationId: "cert-002",
      employeeId: "emp-103",
      employeeDisplayName: "Hafiz Rahman",
      audience: "hr",
      status: "open",
      alertAt: "2026-05-10",
      severity: "critical",
      message: "Required Forklift Operator certification is missing.",
    },
  ]);

  const feedback = withOrg<HrTrainingFeedbackInput>(organizationId, [
    {
      id: "feedback-001",
      courseId: "course-safety-101",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      submittedAt: "2026-05-16",
      rating: 5,
      comments: "Practical and immediately useful.",
    },
  ]);

  const costs = withOrg<HrTrainingCostInput>(organizationId, [
    {
      id: "cost-001",
      courseId: "course-safety-101",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      departmentName: "Warehouse",
      providerId: "provider-safety-board",
      period: "2026-05",
      amount: 450,
      currency: "MYR",
    },
    {
      id: "cost-002",
      courseId: "course-data-privacy",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      departmentName: "Sales",
      providerId: "provider-cloud-lms",
      period: "2026-05",
      amount: 35,
      currency: "MYR",
    },
    {
      id: "cost-003",
      courseId: "course-leadership",
      employeeId: "emp-102",
      employeeDisplayName: "Priya Nair",
      departmentName: "Operations",
      providerId: "provider-internal-academy",
      period: "2026-04",
      amount: 900,
      currency: "MYR",
    },
  ]);

  const auditEvents = withOrg<HrTrainingAuditEvent>(organizationId, [
    {
      id: "audit-001",
      action: hrTrainingAuditActions.courseCreated,
      actorId: "user-hr-training",
      targetType: "course",
      targetId: "course-safety-101",
      summary: "Created workplace safety course catalog item.",
      occurredAt: "2026-04-25T09:00:00.000Z",
    },
    {
      id: "audit-002",
      action: hrTrainingAuditActions.assignmentCreated,
      actorId: "user-hr-training",
      targetType: "assignment",
      targetId: "assign-001",
      summary: "Assigned SAFE-101 to Maya Chen from mandatory requirement.",
      occurredAt: "2026-05-01T02:00:00.000Z",
    },
    {
      id: "audit-003",
      action: hrTrainingAuditActions.enrollmentApproved,
      actorId: "user-manager-900",
      targetType: "enrollment",
      targetId: "enroll-001",
      summary: "Approved enrollment for SAFE-101.",
      occurredAt: "2026-05-03T07:30:00.000Z",
    },
    {
      id: "audit-004",
      action: hrTrainingAuditActions.completionRecorded,
      actorId: "user-hr-training",
      targetType: "completion",
      targetId: "complete-001",
      summary: "Recorded SAFE-101 completion and expiry.",
      occurredAt: "2026-05-15T10:30:00.000Z",
    },
    {
      id: "audit-005",
      action: hrTrainingAuditActions.certificationExpired,
      actorId: "system-training",
      targetType: "certification",
      targetId: "cert-003",
      summary: "Raised expiry alert for Data Privacy Annual Refresher.",
      occurredAt: "2026-05-30T00:00:00.000Z",
    },
  ]);

  return {
    providers,
    courses,
    requirements,
    assignments,
    enrollments,
    attendance,
    completions,
    assessments,
    skillProfiles,
    competencies,
    skillGaps,
    developmentPlans,
    certifications,
    alerts,
    feedback,
    costs,
    auditEvents,
  };
}

export function getHrTrainingStore(organizationId: string): HrTrainingStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrTrainingStore(organizationId: string): HrTrainingStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function filterHrTrainingRecordsForAccess(input: {
  store: HrTrainingStore;
  access: StoreAccess;
}): HrTrainingStore {
  const { store, access } = input;
  const visibleCourseIds = new Set([
    ...scopedRows(store.assignments, access).map((row) => row.courseId),
    ...scopedRows(store.enrollments, access).map((row) => row.courseId),
    ...store.courses.map((course) => course.id),
  ]);

  return {
    providers: store.providers,
    courses: store.courses.filter((course) => visibleCourseIds.has(course.id)),
    requirements: store.requirements,
    assignments: scopedRows(store.assignments, access),
    enrollments: scopedRows(store.enrollments, access),
    attendance: scopedRows(store.attendance, access),
    completions: scopedRows(store.completions, access),
    assessments: scopedRows(store.assessments, access),
    skillProfiles: scopedRows(store.skillProfiles, access),
    competencies: store.competencies,
    skillGaps: scopedRows(store.skillGaps, access),
    developmentPlans: scopedRows(store.developmentPlans, access),
    certifications: scopedRows(store.certifications, access),
    alerts: scopedRows(store.alerts, access),
    feedback: scopedRows(store.feedback, access),
    costs: scopedRows(store.costs, access),
    auditEvents: store.auditEvents,
  };
}

export function buildHrTrainingReportRows(input: {
  store: HrTrainingStore;
  groupBy: HrTrainingReportGroupBy;
}): HrTrainingReportRow[] {
  const courseById = new Map(input.store.courses.map((course) => [course.id, course]));
  const providerById = new Map(
    input.store.providers.map((provider) => [provider.id, provider]),
  );
  const completionsByEmployeeCourse = new Map(
    input.store.completions.map((row) => [`${row.employeeId}:${row.courseId}`, row]),
  );
  const costByGroup = new Map<string, number>();
  const assignedByGroup = new Map<string, HrTrainingAssignmentInput[]>();

  for (const assignment of input.store.assignments) {
    const course = courseById.get(assignment.courseId);
    const groupLabel = resolveReportGroupLabel({
      groupBy: input.groupBy,
      assignment,
      course,
      provider: course ? providerById.get(course.providerId) : undefined,
    });
    assignedByGroup.set(groupLabel, [
      ...(assignedByGroup.get(groupLabel) ?? []),
      assignment,
    ]);
  }

  for (const cost of input.store.costs) {
    const course = courseById.get(cost.courseId);
    const groupLabel = resolveReportGroupLabel({
      groupBy: input.groupBy,
      assignment: input.store.assignments.find(
        (assignment) =>
          assignment.employeeId === cost.employeeId &&
          assignment.courseId === cost.courseId,
      ),
      course,
      provider: providerById.get(cost.providerId),
      period: cost.period,
      certification: input.store.certifications.find(
        (certification) => certification.employeeId === cost.employeeId,
      ),
    });
    costByGroup.set(groupLabel, (costByGroup.get(groupLabel) ?? 0) + cost.amount);
  }

  return [...assignedByGroup.entries()].map(([groupLabel, assignments]) => {
    const completedCount = assignments.filter((assignment) => {
      const completion = completionsByEmployeeCourse.get(
        `${assignment.employeeId}:${assignment.courseId}`,
      );
      return completion?.status === "completed" || completion?.status === "renewed";
    }).length;
    const overdueCount = assignments.filter(
      (assignment) => assignment.status === "overdue",
    ).length;
    return {
      id: `report-${input.groupBy}-${groupLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      groupLabel,
      assignedCount: assignments.length,
      completedCount,
      overdueCount,
      complianceRate:
        assignments.length === 0
          ? 0
          : Math.round((completedCount / assignments.length) * 100),
      costAmount: costByGroup.get(groupLabel) ?? 0,
    };
  });
}

function resolveReportGroupLabel(input: {
  groupBy: HrTrainingReportGroupBy;
  assignment?: HrTrainingAssignmentInput;
  course?: HrTrainingCourseInput;
  provider?: HrTrainingProviderInput;
  period?: string;
  certification?: HrTrainingCertificationInput;
}) {
  switch (input.groupBy) {
    case "employee":
      return input.assignment?.employeeDisplayName ?? "Unassigned";
    case "department":
      return input.assignment?.departmentName ?? "Unassigned";
    case "manager":
      return input.assignment?.managerEmployeeId ?? "Unassigned";
    case "role":
      return input.assignment?.roleTitle ?? "Unassigned";
    case "course":
      return input.course?.title ?? "Unknown course";
    case "certification":
      return input.certification?.certificationName ?? "No certification";
    case "status":
      return input.assignment?.status ?? "unassigned";
    case "provider":
      return input.provider?.name ?? "Unknown provider";
    case "period":
      return input.period ?? "Unscheduled";
  }
}

export function listHrTrainingComplianceCompletionRefs(
  store: HrTrainingStore,
): HrTrainingComplianceCompletionRef[] {
  const courseById = new Map(store.courses.map((course) => [course.id, course]));
  const requirementByCourse = new Map(
    store.requirements
      .filter((requirement) => requirement.mandatory)
      .map((requirement) => [requirement.courseId, requirement]),
  );

  return store.completions
    .filter((completion) => requirementByCourse.has(completion.courseId))
    .map((completion) => {
      const course = courseById.get(completion.courseId);
      const requirement = requirementByCourse.get(completion.courseId);
      return {
        id: `compliance-${completion.id}`,
        employeeId: completion.employeeId,
        employeeDisplayName: completion.employeeDisplayName,
        courseCode: course?.code ?? completion.courseId,
        requirementRef: requirement?.id ?? completion.courseId,
        completionStatus: completion.status,
        ...(completion.completedAt ? { completedAt: completion.completedAt } : {}),
        ...(completion.expiresAt ? { expiresAt: completion.expiresAt } : {}),
        sourceSystem:
          course?.lmsCourseId && completion.lmsCompletionRef
            ? "blended"
            : course?.lmsCourseId
              ? "lms"
              : "training",
      };
    });
}

export function listHrTrainingReadinessRefs(
  store: HrTrainingStore,
): HrTrainingReadinessRef[] {
  const gapsByEmployee = new Map<string, number>();
  for (const gap of store.skillGaps) {
    if (gap.status !== "closed") {
      gapsByEmployee.set(gap.employeeId, (gapsByEmployee.get(gap.employeeId) ?? 0) + 1);
    }
  }

  return store.certifications.map((certification) => ({
    id: `readiness-${certification.id}`,
    employeeId: certification.employeeId,
    employeeDisplayName: certification.employeeDisplayName,
    consumer:
      certification.status === "missing" || certification.status === "expired"
        ? "lifecycle"
        : "performance",
    readinessSignal:
      certification.status === "valid" ? "ready" : "development_required",
    certificationStatus: certification.status,
    openSkillGapCount: gapsByEmployee.get(certification.employeeId) ?? 0,
    authorizedAt: "2026-05-31T00:00:00.000Z",
  }));
}

export function listHrTrainingBoardingCompletionRefs(
  store: HrTrainingStore,
): HrTrainingBoardingCompletionRef[] {
  const courseById = new Map(store.courses.map((course) => [course.id, course]));
  return store.completions
    .filter((completion) => completion.status === "completed")
    .map((completion) => {
      const course = courseById.get(completion.courseId);
      return {
        id: `boarding-${completion.id}`,
        employeeId: completion.employeeId,
        employeeDisplayName: completion.employeeDisplayName,
        trainingCourseCode: course?.code ?? completion.courseId,
        onboardingTaskRef: `boarding-task-${course?.code ?? completion.courseId}`,
        completionStatus: completion.status,
        ...(completion.completedAt ? { completedAt: completion.completedAt } : {}),
      };
    });
}

export function emitHrTrainingAuditEvent(
  store: HrTrainingStore,
  event: Omit<HrTrainingAuditEvent, "organizationId" | "id" | "occurredAt"> & {
    readonly organizationId: string;
    readonly occurredAt?: string;
  },
) {
  const row: HrTrainingAuditEvent = {
    ...event,
    id: `audit-${store.auditEvents.length + 1}`,
    occurredAt: event.occurredAt ?? new Date().toISOString(),
  };
  store.auditEvents.unshift(row);
  return row;
}

export function createHrTrainingCourse(
  store: HrTrainingStore,
  input: Omit<HrTrainingCourseInput, "id">,
) {
  const row: HrTrainingCourseInput = {
    ...input,
    id: `course-${store.courses.length + 1}`,
  };
  store.courses.unshift(row);
  return row;
}

export function assignHrTraining(
  store: HrTrainingStore,
  input: Omit<HrTrainingAssignmentInput, "id">,
) {
  const row: HrTrainingAssignmentInput = {
    ...input,
    id: `assign-${store.assignments.length + 1}`,
  };
  store.assignments.unshift(row);
  return row;
}

export function enrollHrTraining(
  store: HrTrainingStore,
  input: Omit<HrTrainingEnrollmentInput, "id">,
) {
  const course = store.courses.find((candidate) => candidate.id === input.courseId);
  const enrolledCount = store.enrollments.filter(
    (enrollment) =>
      enrollment.courseId === input.courseId &&
      ["approved", "enrolled"].includes(enrollment.status),
  ).length;
  const status =
    course && enrolledCount >= course.capacity ? "waitlisted" : input.status;
  const waitlistPosition =
    status === "waitlisted"
      ? store.enrollments.filter(
          (enrollment) =>
            enrollment.courseId === input.courseId &&
            enrollment.status === "waitlisted",
        ).length + 1
      : undefined;
  const row: HrTrainingEnrollmentInput = {
    ...input,
    id: `enroll-${store.enrollments.length + 1}`,
    status,
    ...(waitlistPosition ? { waitlistPosition } : {}),
  };
  store.enrollments.unshift(row);
  return row;
}

export function recordHrTrainingAttendance(
  store: HrTrainingStore,
  input: Omit<HrTrainingAttendanceInput, "id">,
) {
  const row: HrTrainingAttendanceInput = {
    ...input,
    id: `att-${store.attendance.length + 1}`,
  };
  store.attendance.unshift(row);
  return row;
}

export function recordHrTrainingCompletion(
  store: HrTrainingStore,
  input: Omit<HrTrainingCompletionInput, "id">,
) {
  const row: HrTrainingCompletionInput = {
    ...input,
    id: `complete-${store.completions.length + 1}`,
  };
  store.completions.unshift(row);
  return row;
}

export function recordHrTrainingAssessment(
  store: HrTrainingStore,
  input: Omit<HrTrainingAssessmentInput, "id" | "result">,
) {
  const result =
    input.score === undefined
      ? "pending"
      : input.score >= input.passingScore
        ? "passed"
        : "failed";
  const row: HrTrainingAssessmentInput = {
    ...input,
    id: `assess-${store.assessments.length + 1}`,
    result,
  };
  store.assessments.unshift(row);
  return row;
}

export function recordHrTrainingCertification(
  store: HrTrainingStore,
  input: Omit<HrTrainingCertificationInput, "id">,
) {
  const row: HrTrainingCertificationInput = {
    ...input,
    id: `cert-${store.certifications.length + 1}`,
  };
  store.certifications.unshift(row);
  return row;
}
