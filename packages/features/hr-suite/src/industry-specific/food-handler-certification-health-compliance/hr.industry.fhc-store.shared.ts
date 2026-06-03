import type {
  HrFhcComplianceTrainingRef,
  HrFhcLearningRequirementRef,
  HrFhcShiftSchedulingEligibilityRef,
} from "./hr.industry.fhc.contract";
import {
  hrIndustryFhcAuditActions,
  type HrIndustryFhcAuditAction,
} from "../events";
import type {
  HrFhcComplianceStatus,
  HrFhcDutyRestrictionReason,
  HrFhcEligibilityStatus,
  HrFhcReportGroupBy,
  HrFhcTrainingType,
} from "./hr.industry.fhc-constants.shared";
import type {
  HrFhcAlertInput,
  HrFhcDutyRestrictionInput,
  HrFhcEligibilityRecordInput,
  HrFhcEmployeeRequirementInput,
  HrFhcEvidenceSubmissionInput,
  HrFhcHealthCertificationInput,
  HrFhcIntegrationExposureInput,
  HrFhcPermitInput,
  HrFhcRenewalCaseInput,
  HrFhcRequirementRuleInput,
  HrFhcTrainingCompletionInput,
} from "./hr.industry.fhc.schema";

export const HR_INDUSTRY_FHC_REFERENCE_DATE = "2026-05-31";

export type HrIndustryFhcAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrIndustryFhcAuditAction;
  readonly actorId: string;
  readonly targetType:
    | "requirement_rule"
    | "employee_requirement"
    | "permit"
    | "health_certification"
    | "training"
    | "evidence"
    | "renewal"
    | "alert"
    | "duty_restriction"
    | "integration"
    | "compliance_review";
  readonly targetId: string;
  readonly employeeId?: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrIndustryFhcReportRow = {
  readonly id: string;
  readonly groupLabel: string;
  readonly requiredEmployeeCount: number;
  readonly compliantCount: number;
  readonly expiredPermitCount: number;
  readonly expiringPermitCount: number;
  readonly missingCertificationCount: number;
  readonly overdueTrainingCount: number;
  readonly outletReadinessPercent: number;
};

export type HrIndustryFhcStore = {
  requirementRules: HrFhcRequirementRuleInput[];
  employeeRequirements: HrFhcEmployeeRequirementInput[];
  permits: HrFhcPermitInput[];
  healthCertifications: HrFhcHealthCertificationInput[];
  trainingCompletions: HrFhcTrainingCompletionInput[];
  evidenceSubmissions: HrFhcEvidenceSubmissionInput[];
  renewalCases: HrFhcRenewalCaseInput[];
  alerts: HrFhcAlertInput[];
  dutyRestrictions: HrFhcDutyRestrictionInput[];
  integrationExposures: HrFhcIntegrationExposureInput[];
  auditEvents: HrIndustryFhcAuditEvent[];
};

type EmployeeScoped = { readonly employeeId: string };

const stores = new Map<string, HrIndustryFhcStore>();

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
  return visibleEmployeeIds === null || visibleEmployeeIds.includes(row.employeeId);
}

function scopedRows<T extends EmployeeScoped>(
  rows: readonly T[],
  visibleEmployeeIds: readonly string[] | null,
) {
  return rows.filter((row) => hasEmployeeAccess(row, visibleEmployeeIds));
}

function createSeedStore(organizationId: string): HrIndustryFhcStore {
  const requirementRules = withOrg<HrFhcRequirementRuleInput>(organizationId, [
    {
      id: "fhc-rule-my-kitchen-cook",
      country: "MY",
      legalEntity: "MY01",
      outletId: "outlet-central-kitchen",
      outletName: "Central Kitchen",
      roleName: "Cook",
      departmentName: "Kitchen",
      employeeCategory: "full_time",
      employmentType: "permanent",
      requiresFoodHandlerPermit: true,
      requiresHealthCertificate: true,
      requiresFoodHygieneTraining: true,
      requiresAllergenTraining: true,
      renewalLeadDays: 30,
      status: "active",
      effectiveFrom: "2026-01-01",
    },
    {
      id: "fhc-rule-my-restaurant-server",
      country: "MY",
      legalEntity: "MY01",
      outletId: "outlet-restaurant-ampang",
      outletName: "Ampang Restaurant",
      roleName: "Server",
      departmentName: "Service",
      employeeCategory: "part_time",
      employmentType: "hourly",
      requiresFoodHandlerPermit: true,
      requiresHealthCertificate: true,
      requiresFoodHygieneTraining: true,
      requiresAllergenTraining: true,
      renewalLeadDays: 45,
      status: "active",
      effectiveFrom: "2026-01-01",
    },
    {
      id: "fhc-rule-my-delivery-food-handler",
      country: "MY",
      legalEntity: "MY01",
      outletId: "outlet-food-truck-01",
      outletName: "Food Truck 01",
      roleName: "Delivery Food Handler",
      departmentName: "Delivery",
      employeeCategory: "contract",
      employmentType: "contractor",
      requiresFoodHandlerPermit: false,
      requiresHealthCertificate: false,
      requiresFoodHygieneTraining: true,
      requiresAllergenTraining: false,
      renewalLeadDays: 30,
      status: "waived",
      effectiveFrom: "2026-03-01",
    },
  ]);

  const employeeRequirements = withOrg<HrFhcEmployeeRequirementInput>(
    organizationId,
    [
      {
        id: "fhc-employee-200",
        employeeId: "emp-200",
        employeeDisplayName: "Aisha Lim",
        outletId: "outlet-central-kitchen",
        outletName: "Central Kitchen",
        roleName: "Cook",
        departmentName: "Kitchen",
        managerEmployeeId: "emp-910",
        managerDisplayName: "Noor Aziz",
        legalEntity: "MY01",
        employeeCategory: "full_time",
        employmentType: "permanent",
        matchedRuleId: "fhc-rule-my-kitchen-cook",
        assignedFoodHandlingRole: true,
        requiresCertification: true,
        requiresHealthCertificate: true,
        requiresFoodHygieneTraining: true,
        requiresAllergenTraining: true,
      },
      {
        id: "fhc-employee-201",
        employeeId: "emp-201",
        employeeDisplayName: "Ben Tan",
        outletId: "outlet-restaurant-ampang",
        outletName: "Ampang Restaurant",
        roleName: "Server",
        departmentName: "Service",
        managerEmployeeId: "emp-911",
        managerDisplayName: "Farah Ismail",
        legalEntity: "MY01",
        employeeCategory: "part_time",
        employmentType: "hourly",
        matchedRuleId: "fhc-rule-my-restaurant-server",
        assignedFoodHandlingRole: true,
        requiresCertification: true,
        requiresHealthCertificate: true,
        requiresFoodHygieneTraining: true,
        requiresAllergenTraining: true,
      },
      {
        id: "fhc-employee-202",
        employeeId: "emp-202",
        employeeDisplayName: "Clara Wong",
        outletId: "outlet-central-kitchen",
        outletName: "Central Kitchen",
        roleName: "Food Packer",
        departmentName: "Packing",
        managerEmployeeId: "emp-910",
        managerDisplayName: "Noor Aziz",
        legalEntity: "MY01",
        employeeCategory: "full_time",
        employmentType: "permanent",
        assignedFoodHandlingRole: true,
        requiresCertification: true,
        requiresHealthCertificate: true,
        requiresFoodHygieneTraining: true,
        requiresAllergenTraining: false,
      },
      {
        id: "fhc-employee-203",
        employeeId: "emp-203",
        employeeDisplayName: "Liam Kumar",
        outletId: "outlet-food-truck-01",
        outletName: "Food Truck 01",
        roleName: "Delivery Food Handler",
        departmentName: "Delivery",
        managerEmployeeId: "emp-912",
        managerDisplayName: "Victor Yap",
        legalEntity: "MY01",
        employeeCategory: "contract",
        employmentType: "contractor",
        matchedRuleId: "fhc-rule-my-delivery-food-handler",
        assignedFoodHandlingRole: true,
        requiresCertification: false,
        requiresHealthCertificate: false,
        requiresFoodHygieneTraining: true,
        requiresAllergenTraining: false,
      },
    ],
  );

  const permits = withOrg<HrFhcPermitInput>(organizationId, [
    {
      id: "fhc-permit-200",
      employeeId: "emp-200",
      employeeDisplayName: "Aisha Lim",
      permitNumber: "MY-FH-2026-200",
      issuingAuthority: "Kuala Lumpur City Hall",
      issueDate: "2025-06-15",
      expiryDate: "2026-06-15",
      status: "compliant",
      documentRef: "doc-fhc-permit-200",
      renewalCaseId: "fhc-renewal-200",
    },
    {
      id: "fhc-permit-201",
      employeeId: "emp-201",
      employeeDisplayName: "Ben Tan",
      permitNumber: "MY-FH-2025-201",
      issuingAuthority: "Selangor Local Authority",
      issueDate: "2024-04-30",
      expiryDate: "2026-04-30",
      status: "compliant",
      documentRef: "doc-fhc-permit-201",
      renewalCaseId: "fhc-renewal-201",
    },
  ]);

  const healthCertifications = withOrg<HrFhcHealthCertificationInput>(
    organizationId,
    [
      {
        id: "fhc-health-200",
        employeeId: "emp-200",
        employeeDisplayName: "Aisha Lim",
        providerName: "SafeFood Clinic KL",
        screeningRef: "screening-fit-200",
        medicalFitnessStatus: "fit",
        issueDate: "2026-01-10",
        expiryDate: "2026-12-31",
        status: "compliant",
        documentRef: "doc-fhc-health-200",
      },
      {
        id: "fhc-health-202",
        employeeId: "emp-202",
        employeeDisplayName: "Clara Wong",
        providerName: "Occupational Health Centre",
        screeningRef: "screening-review-202",
        medicalFitnessStatus: "pending_review",
        issueDate: "2026-05-01",
        expiryDate: "2026-11-01",
        status: "rejected",
        documentRef: "doc-fhc-health-202",
      },
    ],
  );

  const trainingCompletions = withOrg<HrFhcTrainingCompletionInput>(
    organizationId,
    [
      {
        id: "fhc-training-200-food",
        employeeId: "emp-200",
        employeeDisplayName: "Aisha Lim",
        trainingType: "food_hygiene",
        requirementRef: "fhc-rule-my-kitchen-cook",
        assignedAt: "2026-01-01",
        dueDate: "2026-02-01",
        completedAt: "2026-01-18",
        status: "completed",
        evidenceDocumentRef: "doc-fhc-training-200-food",
      },
      {
        id: "fhc-training-200-allergen",
        employeeId: "emp-200",
        employeeDisplayName: "Aisha Lim",
        trainingType: "allergen_awareness",
        requirementRef: "fhc-rule-my-kitchen-cook",
        assignedAt: "2026-01-01",
        dueDate: "2026-02-01",
        completedAt: "2026-01-22",
        status: "completed",
        evidenceDocumentRef: "doc-fhc-training-200-allergen",
      },
      {
        id: "fhc-training-201-food",
        employeeId: "emp-201",
        employeeDisplayName: "Ben Tan",
        trainingType: "food_hygiene",
        requirementRef: "fhc-rule-my-restaurant-server",
        assignedAt: "2026-03-01",
        dueDate: "2026-04-01",
        status: "overdue",
      },
      {
        id: "fhc-training-201-allergen",
        employeeId: "emp-201",
        employeeDisplayName: "Ben Tan",
        trainingType: "allergen_awareness",
        requirementRef: "fhc-rule-my-restaurant-server",
        assignedAt: "2026-03-01",
        dueDate: "2026-04-01",
        status: "overdue",
      },
      {
        id: "fhc-training-203-food",
        employeeId: "emp-203",
        employeeDisplayName: "Liam Kumar",
        trainingType: "safe_food_handling",
        requirementRef: "fhc-rule-my-delivery-food-handler",
        assignedAt: "2026-03-10",
        dueDate: "2026-04-10",
        completedAt: "2026-04-02",
        status: "completed",
        evidenceDocumentRef: "doc-fhc-training-203-food",
      },
    ],
  );

  const evidenceSubmissions = withOrg<HrFhcEvidenceSubmissionInput>(
    organizationId,
    [
      {
        id: "fhc-evidence-200-permit",
        employeeId: "emp-200",
        employeeDisplayName: "Aisha Lim",
        evidenceType: "food_handler_permit",
        targetRef: "fhc-permit-200",
        documentRef: "doc-fhc-permit-200",
        submittedAt: "2026-05-10T03:00:00.000Z",
        submittedBy: "emp-200",
        status: "verified",
        verifiedBy: "user-compliance",
        verifiedAt: "2026-05-10T06:00:00.000Z",
      },
      {
        id: "fhc-evidence-202-health",
        employeeId: "emp-202",
        employeeDisplayName: "Clara Wong",
        evidenceType: "health_certificate",
        targetRef: "fhc-health-202",
        documentRef: "doc-fhc-health-202",
        submittedAt: "2026-05-03T04:00:00.000Z",
        submittedBy: "emp-202",
        status: "rejected",
        verifiedBy: "user-compliance",
        verifiedAt: "2026-05-04T02:00:00.000Z",
        rejectionReason: "Clinic document is incomplete.",
      },
    ],
  );

  const renewalCases = withOrg<HrFhcRenewalCaseInput>(organizationId, [
    {
      id: "fhc-renewal-200",
      employeeId: "emp-200",
      employeeDisplayName: "Aisha Lim",
      certificateType: "food_handler_permit",
      targetRef: "fhc-permit-200",
      status: "pending_submission",
      dueDate: "2026-06-15",
    },
    {
      id: "fhc-renewal-201",
      employeeId: "emp-201",
      employeeDisplayName: "Ben Tan",
      certificateType: "food_handler_permit",
      targetRef: "fhc-permit-201",
      status: "submitted",
      dueDate: "2026-04-30",
      submittedAt: "2026-05-02T03:20:00.000Z",
    },
  ]);

  const alerts = withOrg<HrFhcAlertInput>(organizationId, [
    {
      id: "fhc-alert-200-expiring",
      employeeId: "emp-200",
      employeeDisplayName: "Aisha Lim",
      alertType: "permit_expiring",
      severity: "warning",
      status: "sent",
      targetRef: "fhc-permit-200",
      dueDate: "2026-06-15",
      generatedAt: "2026-05-31T00:00:00.000Z",
    },
    {
      id: "fhc-alert-201-expired",
      employeeId: "emp-201",
      employeeDisplayName: "Ben Tan",
      alertType: "permit_expired",
      severity: "critical",
      status: "sent",
      targetRef: "fhc-permit-201",
      dueDate: "2026-04-30",
      generatedAt: "2026-05-31T00:00:00.000Z",
    },
    {
      id: "fhc-alert-201-training",
      employeeId: "emp-201",
      employeeDisplayName: "Ben Tan",
      alertType: "training_overdue",
      severity: "critical",
      status: "open",
      targetRef: "fhc-training-201-food",
      dueDate: "2026-04-01",
      generatedAt: "2026-05-31T00:00:00.000Z",
    },
    {
      id: "fhc-alert-202-health",
      employeeId: "emp-202",
      employeeDisplayName: "Clara Wong",
      alertType: "health_certificate_missing",
      severity: "critical",
      status: "open",
      targetRef: "fhc-health-202",
      dueDate: "2026-05-04",
      generatedAt: "2026-05-31T00:00:00.000Z",
    },
  ]);

  const dutyRestrictions = withOrg<HrFhcDutyRestrictionInput>(organizationId, [
    {
      id: "fhc-restriction-201",
      employeeId: "emp-201",
      employeeDisplayName: "Ben Tan",
      reason: "expired_permit",
      effectiveFrom: "2026-05-01",
      status: "active",
      reviewerEmployeeId: "emp-911",
      shiftSchedulingRef: "shift-block-201",
    },
    {
      id: "fhc-restriction-202",
      employeeId: "emp-202",
      employeeDisplayName: "Clara Wong",
      reason: "rejected_evidence",
      effectiveFrom: "2026-05-04",
      status: "active",
      reviewerEmployeeId: "emp-910",
      shiftSchedulingRef: "shift-block-202",
    },
  ]);

  const integrationExposures = withOrg<HrFhcIntegrationExposureInput>(
    organizationId,
    [
      {
        id: "fhc-integration-shift-201",
        integrationTarget: "shift_scheduling",
        employeeId: "emp-201",
        employeeDisplayName: "Ben Tan",
        sourceRef: "fhc-restriction-201",
        status: "restricted",
        exposedAt: "2026-05-31T00:05:00.000Z",
      },
      {
        id: "fhc-integration-compliance-201",
        integrationTarget: "compliance_regulatory_tracking",
        employeeId: "emp-201",
        employeeDisplayName: "Ben Tan",
        sourceRef: "fhc-training-201-food",
        status: "overdue",
        exposedAt: "2026-05-31T00:05:00.000Z",
      },
      {
        id: "fhc-integration-lms-201",
        integrationTarget: "learning_management_system",
        employeeId: "emp-201",
        employeeDisplayName: "Ben Tan",
        sourceRef: "fhc-rule-my-restaurant-server",
        status: "learning_required",
        exposedAt: "2026-05-31T00:05:00.000Z",
      },
    ],
  );

  const auditEvents = withOrg<HrIndustryFhcAuditEvent>(organizationId, [
    {
      id: "audit-fhc-001",
      action: hrIndustryFhcAuditActions.requirementRuleUpdated,
      actorId: "user-compliance",
      targetType: "requirement_rule",
      targetId: "fhc-rule-my-kitchen-cook",
      summary: "Configured food handler certification rule for Central Kitchen cooks.",
      occurredAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "audit-fhc-002",
      action: hrIndustryFhcAuditActions.employeeRequirementIdentified,
      actorId: "system-fhc",
      targetType: "employee_requirement",
      targetId: "fhc-employee-200",
      employeeId: "emp-200",
      summary: "Identified Aisha Lim as requiring food handler certification.",
      occurredAt: "2026-01-02T00:00:00.000Z",
    },
    {
      id: "audit-fhc-003",
      action: hrIndustryFhcAuditActions.permitSubmitted,
      actorId: "emp-200",
      targetType: "permit",
      targetId: "fhc-permit-200",
      employeeId: "emp-200",
      summary: "Submitted food handler permit evidence.",
      occurredAt: "2026-05-10T03:00:00.000Z",
    },
    {
      id: "audit-fhc-004",
      action: hrIndustryFhcAuditActions.evidenceVerified,
      actorId: "user-compliance",
      targetType: "evidence",
      targetId: "fhc-evidence-200-permit",
      employeeId: "emp-200",
      summary: "Verified food handler permit evidence.",
      occurredAt: "2026-05-10T06:00:00.000Z",
    },
    {
      id: "audit-fhc-005",
      action: hrIndustryFhcAuditActions.evidenceRejected,
      actorId: "user-compliance",
      targetType: "evidence",
      targetId: "fhc-evidence-202-health",
      employeeId: "emp-202",
      summary: "Rejected health certification evidence.",
      occurredAt: "2026-05-04T02:00:00.000Z",
    },
    {
      id: "audit-fhc-006",
      action: hrIndustryFhcAuditActions.expiryAlertGenerated,
      actorId: "system-fhc",
      targetType: "alert",
      targetId: "fhc-alert-200-expiring",
      employeeId: "emp-200",
      summary: "Generated expiring permit alert.",
      occurredAt: "2026-05-31T00:00:00.000Z",
    },
    {
      id: "audit-fhc-007",
      action: hrIndustryFhcAuditActions.dutyRestrictionApplied,
      actorId: "user-compliance",
      targetType: "duty_restriction",
      targetId: "fhc-restriction-201",
      employeeId: "emp-201",
      summary: "Applied food handling duty restriction for expired permit.",
      occurredAt: "2026-05-01T01:00:00.000Z",
    },
    {
      id: "audit-fhc-008",
      action: hrIndustryFhcAuditActions.integrationExposed,
      actorId: "system-fhc",
      targetType: "integration",
      targetId: "fhc-integration-shift-201",
      employeeId: "emp-201",
      summary: "Exposed food handling eligibility status to Shift Scheduling.",
      occurredAt: "2026-05-31T00:05:00.000Z",
    },
    {
      id: "audit-fhc-009",
      action: hrIndustryFhcAuditActions.complianceReviewed,
      actorId: "user-compliance",
      targetType: "compliance_review",
      targetId: "fhc-employee-201",
      employeeId: "emp-201",
      summary: "Reviewed outlet compliance readiness for Ben Tan.",
      occurredAt: "2026-05-31T01:00:00.000Z",
    },
    {
      id: "audit-fhc-010",
      action: hrIndustryFhcAuditActions.permitRenewed,
      actorId: "user-compliance",
      targetType: "renewal",
      targetId: "fhc-renewal-200",
      employeeId: "emp-200",
      summary: "Opened permit renewal case for expiring food handler permit.",
      occurredAt: "2026-05-31T01:30:00.000Z",
    },
    {
      id: "audit-fhc-011",
      action: hrIndustryFhcAuditActions.trainingCompleted,
      actorId: "emp-200",
      targetType: "training",
      targetId: "fhc-training-200-food",
      employeeId: "emp-200",
      summary: "Completed food hygiene training.",
      occurredAt: "2026-01-18T03:00:00.000Z",
    },
    {
      id: "audit-fhc-012",
      action: hrIndustryFhcAuditActions.healthCertificationSubmitted,
      actorId: "emp-202",
      targetType: "health_certification",
      targetId: "fhc-health-202",
      employeeId: "emp-202",
      summary: "Submitted health certification evidence.",
      occurredAt: "2026-05-03T04:00:00.000Z",
    },
  ]);

  return {
    requirementRules,
    employeeRequirements,
    permits,
    healthCertifications,
    trainingCompletions,
    evidenceSubmissions,
    renewalCases,
    alerts,
    dutyRestrictions,
    integrationExposures,
    auditEvents,
  };
}

export function getHrIndustryFhcStore(
  organizationId: string,
): HrIndustryFhcStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrIndustryFhcStore(
  organizationId: string,
): HrIndustryFhcStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function filterHrIndustryFhcRecordsForAccess(input: {
  readonly store: HrIndustryFhcStore;
  readonly visibleEmployeeIds: readonly string[] | null;
}): HrIndustryFhcStore {
  const { store, visibleEmployeeIds } = input;
  const visibleEmployeeRequirements = scopedRows(
    store.employeeRequirements,
    visibleEmployeeIds,
  );
  const visibleOutletIds = new Set(
    visibleEmployeeRequirements.map((row) => row.outletId),
  );

  return {
    requirementRules:
      visibleEmployeeIds === null
        ? store.requirementRules
        : store.requirementRules.filter((row) => visibleOutletIds.has(row.outletId)),
    employeeRequirements: visibleEmployeeRequirements,
    permits: scopedRows(store.permits, visibleEmployeeIds),
    healthCertifications: scopedRows(
      store.healthCertifications,
      visibleEmployeeIds,
    ),
    trainingCompletions: scopedRows(
      store.trainingCompletions,
      visibleEmployeeIds,
    ),
    evidenceSubmissions: scopedRows(
      store.evidenceSubmissions,
      visibleEmployeeIds,
    ),
    renewalCases: scopedRows(store.renewalCases, visibleEmployeeIds),
    alerts: scopedRows(store.alerts, visibleEmployeeIds),
    dutyRestrictions: scopedRows(store.dutyRestrictions, visibleEmployeeIds),
    integrationExposures: scopedRows(
      store.integrationExposures,
      visibleEmployeeIds,
    ),
    auditEvents: store.auditEvents.filter(
      (event) =>
        !event.employeeId ||
        visibleEmployeeIds === null ||
        visibleEmployeeIds.includes(event.employeeId),
    ),
  };
}

function dateTime(value: string) {
  return new Date(value).getTime();
}

function isExpired(date: string, referenceDate: string) {
  return dateTime(date) < dateTime(referenceDate);
}

function isExpiring(date: string, leadDays: number, referenceDate: string) {
  const msUntilExpiry = dateTime(date) - dateTime(referenceDate);
  return msUntilExpiry >= 0 && msUntilExpiry <= leadDays * 86_400_000;
}

function requiredTrainingTypes(
  requirement: HrFhcEmployeeRequirementInput,
): HrFhcTrainingType[] {
  const required: HrFhcTrainingType[] = [];
  if (requirement.requiresFoodHygieneTraining) required.push("food_hygiene");
  if (requirement.requiresAllergenTraining) required.push("allergen_awareness");
  return required;
}

function getRenewalLeadDays(
  requirement: HrFhcEmployeeRequirementInput,
  rules: readonly HrFhcRequirementRuleInput[],
) {
  return (
    rules.find((rule) => rule.id === requirement.matchedRuleId)?.renewalLeadDays ??
    30
  );
}

function activeRestrictionFor(
  employeeId: string,
  restrictions: readonly HrFhcDutyRestrictionInput[],
) {
  return restrictions.find(
    (restriction) =>
      restriction.employeeId === employeeId && restriction.status === "active",
  );
}

function statusFromFlags(input: {
  readonly notRequired: boolean;
  readonly rejected: boolean;
  readonly expired: boolean;
  readonly missing: boolean;
  readonly expiring: boolean;
  readonly pending: boolean;
  readonly waived: boolean;
}): HrFhcComplianceStatus {
  if (input.notRequired) return "not_required";
  if (input.rejected) return "rejected";
  if (input.expired) return "expired";
  if (input.missing) return "missing";
  if (input.expiring) return "expiring";
  if (input.pending) return "pending";
  if (input.waived) return "waived";
  return "compliant";
}

function restrictionReasonFromFlags(input: {
  readonly missingPermit: boolean;
  readonly missingHealth: boolean;
  readonly expiredPermit: boolean;
  readonly rejectedEvidence: boolean;
  readonly overdueTraining: boolean;
}): HrFhcDutyRestrictionReason | undefined {
  if (input.rejectedEvidence) return "rejected_evidence";
  if (input.expiredPermit) return "expired_permit";
  if (input.missingPermit) return "missing_certification";
  if (input.missingHealth) return "missing_health_certificate";
  if (input.overdueTraining) return "overdue_training";
  return undefined;
}

export function resolveHrIndustryFhcEmployeeCompliance(input: {
  readonly store: HrIndustryFhcStore;
  readonly requirement: HrFhcEmployeeRequirementInput;
  readonly referenceDate?: string;
}): HrFhcEligibilityRecordInput {
  const referenceDate = input.referenceDate ?? HR_INDUSTRY_FHC_REFERENCE_DATE;
  const { requirement, store } = input;
  const leadDays = getRenewalLeadDays(requirement, store.requirementRules);
  const permit = store.permits.find(
    (row) => row.employeeId === requirement.employeeId,
  );
  const health = store.healthCertifications.find(
    (row) => row.employeeId === requirement.employeeId,
  );
  const restriction = activeRestrictionFor(
    requirement.employeeId,
    store.dutyRestrictions,
  );
  const employeeTraining = store.trainingCompletions.filter(
    (row) => row.employeeId === requirement.employeeId,
  );
  const requiredTraining = requiredTrainingTypes(requirement);
  const missingPermit = requirement.requiresCertification && !permit;
  const missingHealth = requirement.requiresHealthCertificate && !health;
  const expiredPermit =
    !!permit &&
    requirement.requiresCertification &&
    (permit.status === "expired" || isExpired(permit.expiryDate, referenceDate));
  const expiredHealth =
    !!health &&
    requirement.requiresHealthCertificate &&
    (health.status === "expired" || isExpired(health.expiryDate, referenceDate));
  const expiringPermit =
    !!permit &&
    requirement.requiresCertification &&
    !expiredPermit &&
    isExpiring(permit.expiryDate, leadDays, referenceDate);
  const expiringHealth =
    !!health &&
    requirement.requiresHealthCertificate &&
    !expiredHealth &&
    isExpiring(health.expiryDate, leadDays, referenceDate);
  const rejectedEvidence =
    permit?.status === "rejected" ||
    health?.status === "rejected" ||
    store.evidenceSubmissions.some(
      (evidence) =>
        evidence.employeeId === requirement.employeeId &&
        evidence.status === "rejected",
    );
  const missingTraining = requiredTraining.some(
    (type) =>
      !employeeTraining.some(
        (training) =>
          training.trainingType === type &&
          (training.status === "completed" || training.status === "renewed"),
      ),
  );
  const overdueTraining = employeeTraining.some(
    (training) =>
      requiredTraining.includes(training.trainingType) &&
      (training.status === "overdue" ||
        (!training.completedAt && isExpired(training.dueDate, referenceDate))),
  );
  const waived = permit?.status === "waived" || health?.status === "waived";
  const notRequired =
    !requirement.requiresCertification &&
    !requirement.requiresHealthCertificate &&
    requiredTraining.length === 0;
  const complianceStatus = statusFromFlags({
    notRequired,
    rejected: rejectedEvidence,
    expired: expiredPermit || expiredHealth,
    missing: missingPermit || missingHealth || missingTraining,
    expiring: expiringPermit || expiringHealth,
    pending:
      overdueTraining ||
      permit?.status === "pending" ||
      health?.status === "pending",
    waived,
  });
  const restrictionReason =
    restriction?.reason ??
    restrictionReasonFromFlags({
      missingPermit,
      missingHealth,
      expiredPermit,
      rejectedEvidence,
      overdueTraining,
    });
  const eligibilityStatus: HrFhcEligibilityStatus = restriction
    ? "restricted"
    : complianceStatus === "not_required"
      ? "not_required"
      : ["missing", "expired", "rejected"].includes(complianceStatus)
        ? "restricted"
        : complianceStatus === "pending" || complianceStatus === "expiring"
          ? "pending_review"
          : "eligible";
  const flags = [
    missingPermit ? "missing_food_handler_permit" : null,
    expiredPermit ? "expired_food_handler_permit" : null,
    missingHealth ? "missing_health_certificate" : null,
    expiredHealth ? "expired_health_certificate" : null,
    overdueTraining ? "overdue_training" : null,
    expiringPermit ? "permit_expiring" : null,
    expiringHealth ? "health_certificate_expiring" : null,
    rejectedEvidence ? "rejected_evidence" : null,
  ].filter((flag): flag is string => !!flag);

  return {
    id: `fhc-eligibility-${requirement.employeeId}`,
    organizationId: requirement.organizationId,
    employeeId: requirement.employeeId,
    employeeDisplayName: requirement.employeeDisplayName,
    complianceStatus,
    eligibilityStatus,
    ...(restrictionReason ? { restrictionReason } : {}),
    ...(restriction ? { dutyRestrictionRef: restriction.id } : {}),
    flags,
  };
}

export function listHrIndustryFhcEligibilityRecords(
  store: HrIndustryFhcStore,
): HrFhcEligibilityRecordInput[] {
  return store.employeeRequirements.map((requirement) =>
    resolveHrIndustryFhcEmployeeCompliance({ store, requirement }),
  );
}

export function listHrIndustryFhcShiftSchedulingEligibilityRefs(
  store: HrIndustryFhcStore,
): HrFhcShiftSchedulingEligibilityRef[] {
  const eligibilityByEmployee = new Map(
    listHrIndustryFhcEligibilityRecords(store).map((row) => [
      row.employeeId,
      row,
    ]),
  );

  return store.employeeRequirements.map((requirement) => {
    const eligibility = eligibilityByEmployee.get(requirement.employeeId);
    return {
      id: `shift-${requirement.id}`,
      employeeId: requirement.employeeId,
      employeeDisplayName: requirement.employeeDisplayName,
      outletId: requirement.outletId,
      outletName: requirement.outletName,
      roleName: requirement.roleName,
      eligibilityStatus: eligibility?.eligibilityStatus ?? "pending_review",
      ...(eligibility?.dutyRestrictionRef
        ? { dutyRestrictionRef: eligibility.dutyRestrictionRef }
        : {}),
      ...(eligibility?.restrictionReason
        ? { restrictionReason: eligibility.restrictionReason }
        : {}),
    };
  });
}

export function listHrIndustryFhcComplianceTrainingRefs(
  store: HrIndustryFhcStore,
): HrFhcComplianceTrainingRef[] {
  return store.trainingCompletions.map((training) => ({
    id: `compliance-${training.id}`,
    employeeId: training.employeeId,
    employeeDisplayName: training.employeeDisplayName,
    trainingType: training.trainingType,
    status: training.status,
    dueDate: training.dueDate,
    ...(training.completedAt ? { completedAt: training.completedAt } : {}),
    requirementRef: training.requirementRef,
  }));
}

export function listHrIndustryFhcLearningRequirementRefs(
  store: HrIndustryFhcStore,
): HrFhcLearningRequirementRef[] {
  return store.trainingCompletions
    .filter((training) =>
      ["assigned", "overdue", "failed"].includes(training.status),
    )
    .map((training) => ({
      id: `learning-${training.id}`,
      employeeId: training.employeeId,
      employeeDisplayName: training.employeeDisplayName,
      trainingType: training.trainingType,
      dueDate: training.dueDate,
      requirementRef: training.requirementRef,
      renewalRequired: training.status === "failed" || training.status === "overdue",
    }));
}

export function buildHrIndustryFhcReportRows(input: {
  readonly store: HrIndustryFhcStore;
  readonly groupBy: HrFhcReportGroupBy;
}): HrIndustryFhcReportRow[] {
  const eligibilityByEmployee = new Map(
    listHrIndustryFhcEligibilityRecords(input.store).map((row) => [
      row.employeeId,
      row,
    ]),
  );
  const groups = new Map<string, HrFhcEmployeeRequirementInput[]>();

  for (const requirement of input.store.employeeRequirements) {
    const eligibility = eligibilityByEmployee.get(requirement.employeeId);
    const groupLabel = resolveReportGroupLabel(
      input.groupBy,
      requirement,
      eligibility?.complianceStatus,
    );
    groups.set(groupLabel, [...(groups.get(groupLabel) ?? []), requirement]);
  }

  return [...groups.entries()].map(([groupLabel, requirements]) => {
    const employeeIds = new Set(requirements.map((row) => row.employeeId));
    const eligibilityRows = [...employeeIds]
      .map((employeeId) => eligibilityByEmployee.get(employeeId))
      .filter((row): row is HrFhcEligibilityRecordInput => !!row);
    const expiredPermitCount = eligibilityRows.filter((row) =>
      row.flags.includes("expired_food_handler_permit"),
    ).length;
    const expiringPermitCount = eligibilityRows.filter((row) =>
      row.flags.includes("permit_expiring"),
    ).length;
    const missingCertificationCount = eligibilityRows.filter(
      (row) =>
        row.flags.includes("missing_food_handler_permit") ||
        row.flags.includes("missing_health_certificate"),
    ).length;
    const overdueTrainingCount = eligibilityRows.filter((row) =>
      row.flags.includes("overdue_training"),
    ).length;
    const compliantCount = eligibilityRows.filter(
      (row) =>
        row.complianceStatus === "compliant" || row.complianceStatus === "waived",
    ).length;
    const requiredEmployeeCount = requirements.filter(
      (row) => row.requiresCertification || row.requiresHealthCertificate,
    ).length;
    const readinessBase = requiredEmployeeCount === 0 ? 1 : requiredEmployeeCount;

    return {
      id: `fhc-report-${input.groupBy}-${groupLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      groupLabel,
      requiredEmployeeCount,
      compliantCount,
      expiredPermitCount,
      expiringPermitCount,
      missingCertificationCount,
      overdueTrainingCount,
      outletReadinessPercent: Math.round((compliantCount / readinessBase) * 100),
    };
  });
}

function resolveReportGroupLabel(
  groupBy: HrFhcReportGroupBy,
  requirement: HrFhcEmployeeRequirementInput,
  status: HrFhcComplianceStatus | undefined,
) {
  switch (groupBy) {
    case "outlet":
      return requirement.outletName;
    case "role":
      return requirement.roleName;
    case "department":
      return requirement.departmentName;
    case "manager":
      return requirement.managerDisplayName;
    case "legal_entity":
      return requirement.legalEntity;
    case "status":
      return status ?? "pending";
  }
}

export function emitHrIndustryFhcAuditEvent(
  store: HrIndustryFhcStore,
  event: Omit<HrIndustryFhcAuditEvent, "id" | "occurredAt"> & {
    readonly occurredAt?: string;
  },
) {
  const row: HrIndustryFhcAuditEvent = {
    ...event,
    id: `audit-fhc-${store.auditEvents.length + 1}`,
    occurredAt: event.occurredAt ?? new Date().toISOString(),
  };
  store.auditEvents.unshift(row);
  return row;
}
