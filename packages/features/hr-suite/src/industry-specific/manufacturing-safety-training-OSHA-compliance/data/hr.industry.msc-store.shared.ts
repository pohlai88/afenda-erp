import type {
  HrMscComplianceTrainingCompletionRef,
  HrMscDocumentEvidenceRef,
  HrMscIntegrationExposureRef,
  HrMscLearningRequirementRef,
  HrMscShiftSchedulingEligibilityRef,
} from "../contracts/hr.industry.msc.contract";
import {
  hrIndustryMscAuditActions,
  type HrIndustryMscAuditAction,
} from "../events";
import type {
  HrMscEligibilityStatus,
  HrMscReportGroupBy,
  HrMscTrainingType,
  HrMscWorkRestrictionReason,
} from "../schemas/hr.industry.msc-constants.shared";
import type {
  HrMscCorrectiveActionInput,
  HrMscEmployeeSafetyProfileInput,
  HrMscEvidenceLinkInput,
  HrMscHazardAssessmentInput,
  HrMscIntegrationExposureInput,
  HrMscNotificationInput,
  HrMscSafetyCertificationInput,
  HrMscSafetyEligibilityRecordInput,
  HrMscSafetyTrainingRequirementInput,
  HrMscTrainingAssignmentInput,
  HrMscWorkplaceIncidentInput,
  HrMscWorkRestrictionInput,
} from "../schemas/hr.industry.msc.schema";

export const HR_INDUSTRY_MSC_REFERENCE_DATE = "2026-05-31";
const EXPIRING_CERTIFICATION_LEAD_DAYS = 45;

export type HrIndustryMscAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrIndustryMscAuditAction;
  readonly actorId: string;
  readonly targetType:
    | "requirement"
    | "employee_requirement"
    | "training"
    | "ppe_acknowledgment"
    | "certification"
    | "hazard_assessment"
    | "incident"
    | "osha_recordkeeping"
    | "corrective_action"
    | "work_restriction"
    | "notification"
    | "integration"
    | "report"
    | "compliance_review";
  readonly targetId: string;
  readonly employeeId?: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrIndustryMscReportRow = {
  readonly id: string;
  readonly groupLabel: string;
  readonly requiredEmployeeCount: number;
  readonly overdueTrainingCount: number;
  readonly expiringCertificationCount: number;
  readonly incidentCount: number;
  readonly openCorrectiveActionCount: number;
  readonly restrictionCount: number;
  readonly readinessPercent: number;
};

export type HrIndustryMscStore = {
  safetyTrainingRequirements: HrMscSafetyTrainingRequirementInput[];
  employeeSafetyProfiles: HrMscEmployeeSafetyProfileInput[];
  trainingAssignments: HrMscTrainingAssignmentInput[];
  safetyCertifications: HrMscSafetyCertificationInput[];
  hazardAssessments: HrMscHazardAssessmentInput[];
  workplaceIncidents: HrMscWorkplaceIncidentInput[];
  correctiveActions: HrMscCorrectiveActionInput[];
  workRestrictions: HrMscWorkRestrictionInput[];
  notifications: HrMscNotificationInput[];
  evidenceLinks: HrMscEvidenceLinkInput[];
  integrationExposures: HrMscIntegrationExposureInput[];
  auditEvents: HrIndustryMscAuditEvent[];
};

type EmployeeScoped = { readonly employeeId?: string };

const stores = new Map<string, HrIndustryMscStore>();

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
    !row.employeeId ||
    visibleEmployeeIds === null ||
    visibleEmployeeIds.includes(row.employeeId)
  );
}

function scopedRows<T extends EmployeeScoped>(
  rows: readonly T[],
  visibleEmployeeIds: readonly string[] | null,
) {
  return rows.filter((row) => hasEmployeeAccess(row, visibleEmployeeIds));
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

function createSeedStore(organizationId: string): HrIndustryMscStore {
  const safetyTrainingRequirements =
    withOrg<HrMscSafetyTrainingRequirementInput>(organizationId, [
      {
        id: "msc-req-cnc-loto",
        legalEntity: "US01",
        country: "US",
        siteId: "site-detroit-plant",
        siteName: "Detroit Plant",
        departmentName: "Machining",
        roleName: "CNC Operator",
        machineId: "machine-cnc-17",
        machineName: "CNC Mill 17",
        workArea: "Machining Cell A",
        riskCategory: "high",
        trainingType: "lockout_tagout",
        complianceReferenceType: "osha",
        complianceReference: "29 CFR 1910.147",
        ppeRequired: ["eye_protection", "cut_resistant_gloves"],
        renewalIntervalMonths: 12,
        status: "active",
        effectiveFrom: "2026-01-01",
      },
      {
        id: "msc-req-forklift",
        legalEntity: "US01",
        country: "US",
        siteId: "site-detroit-plant",
        siteName: "Detroit Plant",
        departmentName: "Warehouse",
        roleName: "Forklift Operator",
        machineId: "machine-forklift-f08",
        machineName: "Forklift F-08",
        workArea: "Shipping Dock",
        riskCategory: "high",
        trainingType: "forklift",
        complianceReferenceType: "osha",
        complianceReference: "29 CFR 1910.178",
        ppeRequired: ["high_visibility_vest", "safety_shoes"],
        renewalIntervalMonths: 36,
        status: "active",
        effectiveFrom: "2026-01-01",
      },
      {
        id: "msc-req-chemical-handling",
        legalEntity: "MY01",
        country: "MY",
        siteId: "site-shah-alam",
        siteName: "Shah Alam Plant",
        departmentName: "Paint Shop",
        roleName: "Chemical Handler",
        workArea: "Mixing Room",
        riskCategory: "critical",
        trainingType: "chemical_handling",
        complianceReferenceType: "osh",
        complianceReference: "Occupational Safety and Health Act 1994",
        ppeRequired: ["respirator", "chemical_gloves", "face_shield"],
        renewalIntervalMonths: 12,
        status: "active",
        effectiveFrom: "2026-02-01",
      },
      {
        id: "msc-req-ergonomics",
        legalEntity: "MY01",
        country: "MY",
        siteId: "site-shah-alam",
        siteName: "Shah Alam Plant",
        departmentName: "Assembly",
        roleName: "Line Assembler",
        workArea: "Assembly Line 2",
        riskCategory: "medium",
        trainingType: "ergonomics",
        complianceReferenceType: "company_policy",
        complianceReference: "AF-MFG-SAFE-ERG-2026",
        ppeRequired: ["wrist_support"],
        renewalIntervalMonths: 24,
        status: "active",
        effectiveFrom: "2026-02-01",
      },
    ]);

  const employeeSafetyProfiles = withOrg<HrMscEmployeeSafetyProfileInput>(
    organizationId,
    [
      {
        id: "msc-profile-300",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        legalEntity: "US01",
        country: "US",
        siteId: "site-detroit-plant",
        siteName: "Detroit Plant",
        departmentName: "Machining",
        roleName: "CNC Operator",
        managerEmployeeId: "emp-900",
        managerDisplayName: "Victor Hale",
        machineId: "machine-cnc-17",
        machineName: "CNC Mill 17",
        workArea: "Machining Cell A",
        hazardExposure: ["rotating_equipment", "stored_energy"],
        riskLevel: "high",
        matchedRequirementIds: ["msc-req-cnc-loto"],
        requiredTrainingTypes: ["machine_safety", "lockout_tagout", "ppe"],
      },
      {
        id: "msc-profile-301",
        employeeId: "emp-301",
        employeeDisplayName: "Jamal Reed",
        legalEntity: "US01",
        country: "US",
        siteId: "site-detroit-plant",
        siteName: "Detroit Plant",
        departmentName: "Warehouse",
        roleName: "Forklift Operator",
        managerEmployeeId: "emp-901",
        managerDisplayName: "Nora Fischer",
        machineId: "machine-forklift-f08",
        machineName: "Forklift F-08",
        workArea: "Shipping Dock",
        hazardExposure: ["powered_industrial_truck", "pedestrian_traffic"],
        riskLevel: "high",
        matchedRequirementIds: ["msc-req-forklift"],
        requiredTrainingTypes: ["forklift", "ppe", "workplace_hazard"],
      },
      {
        id: "msc-profile-302",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        legalEntity: "MY01",
        country: "MY",
        siteId: "site-shah-alam",
        siteName: "Shah Alam Plant",
        departmentName: "Paint Shop",
        roleName: "Chemical Handler",
        managerEmployeeId: "emp-902",
        managerDisplayName: "Farid Aziz",
        workArea: "Mixing Room",
        hazardExposure: ["solvent_vapor", "flammable_liquid"],
        riskLevel: "critical",
        matchedRequirementIds: ["msc-req-chemical-handling"],
        requiredTrainingTypes: [
          "chemical_handling",
          "fire_safety",
          "emergency_response",
          "ppe",
        ],
      },
      {
        id: "msc-profile-303",
        employeeId: "emp-303",
        employeeDisplayName: "Ravi Nair",
        legalEntity: "MY01",
        country: "MY",
        siteId: "site-shah-alam",
        siteName: "Shah Alam Plant",
        departmentName: "Assembly",
        roleName: "Line Assembler",
        managerEmployeeId: "emp-903",
        managerDisplayName: "Siti Rahman",
        workArea: "Assembly Line 2",
        hazardExposure: ["repetitive_motion", "manual_handling"],
        riskLevel: "medium",
        matchedRequirementIds: ["msc-req-ergonomics"],
        requiredTrainingTypes: ["ergonomics", "workplace_hazard"],
      },
    ],
  );

  const trainingAssignments = withOrg<HrMscTrainingAssignmentInput>(
    organizationId,
    [
      {
        id: "msc-training-300-machine",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        requirementRef: "msc-req-cnc-loto",
        trainingType: "machine_safety",
        assignedAt: "2026-01-05",
        dueDate: "2026-02-05",
        completedAt: "2026-01-20",
        status: "completed",
        evidenceDocumentRef: "doc-msc-training-300-machine",
      },
      {
        id: "msc-training-300-loto",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        requirementRef: "msc-req-cnc-loto",
        trainingType: "lockout_tagout",
        assignedAt: "2026-03-01",
        dueDate: "2026-04-01",
        status: "overdue",
      },
      {
        id: "msc-training-300-ppe",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        requirementRef: "msc-req-cnc-loto",
        trainingType: "ppe",
        assignedAt: "2026-01-05",
        dueDate: "2026-02-05",
        completedAt: "2026-01-18",
        status: "completed",
        ppeAcknowledgmentRef: "doc-msc-ppe-300",
      },
      {
        id: "msc-training-301-forklift",
        employeeId: "emp-301",
        employeeDisplayName: "Jamal Reed",
        requirementRef: "msc-req-forklift",
        trainingType: "forklift",
        assignedAt: "2025-02-01",
        dueDate: "2026-04-15",
        status: "expired",
        evidenceDocumentRef: "doc-msc-training-301-forklift",
      },
      {
        id: "msc-training-302-chemical",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        requirementRef: "msc-req-chemical-handling",
        trainingType: "chemical_handling",
        assignedAt: "2026-02-01",
        dueDate: "2026-03-01",
        completedAt: "2026-02-18",
        status: "completed",
        evidenceDocumentRef: "doc-msc-training-302-chemical",
      },
      {
        id: "msc-training-302-fire",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        requirementRef: "msc-req-chemical-handling",
        trainingType: "fire_safety",
        assignedAt: "2026-05-01",
        dueDate: "2026-06-15",
        status: "assigned",
      },
      {
        id: "msc-training-303-ergonomics",
        employeeId: "emp-303",
        employeeDisplayName: "Ravi Nair",
        requirementRef: "msc-req-ergonomics",
        trainingType: "ergonomics",
        assignedAt: "2026-02-10",
        dueDate: "2026-03-10",
        status: "waived",
        evidenceDocumentRef: "doc-msc-waiver-303-ergonomics",
      },
    ],
  );

  const safetyCertifications = withOrg<HrMscSafetyCertificationInput>(
    organizationId,
    [
      {
        id: "msc-cert-300-cnc",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        certificationType: "CNC machine authorization",
        machineId: "machine-cnc-17",
        workArea: "Machining Cell A",
        issuingAuthority: "Plant Safety Office",
        issueDate: "2026-01-20",
        expiryDate: "2027-01-20",
        renewalDate: "2026-12-20",
        status: "active",
        documentRef: "doc-msc-cert-300-cnc",
      },
      {
        id: "msc-cert-301-forklift",
        employeeId: "emp-301",
        employeeDisplayName: "Jamal Reed",
        certificationType: "Powered industrial truck",
        machineId: "machine-forklift-f08",
        workArea: "Shipping Dock",
        issuingAuthority: "Plant Safety Office",
        issueDate: "2023-04-15",
        expiryDate: "2026-04-15",
        renewalDate: "2026-04-15",
        status: "expired",
        documentRef: "doc-msc-cert-301-forklift",
      },
      {
        id: "msc-cert-302-chemical",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        certificationType: "Chemical handling authorization",
        workArea: "Mixing Room",
        issuingAuthority: "EHS Team",
        issueDate: "2025-06-20",
        expiryDate: "2026-06-20",
        renewalDate: "2026-06-10",
        status: "expiring",
        documentRef: "doc-msc-cert-302-chemical",
      },
    ],
  );

  const hazardAssessments = withOrg<HrMscHazardAssessmentInput>(
    organizationId,
    [
      {
        id: "msc-hazard-cnc-cell-a",
        assessmentType: "workplace_hazard",
        siteId: "site-detroit-plant",
        siteName: "Detroit Plant",
        departmentName: "Machining",
        workArea: "Machining Cell A",
        machineId: "machine-cnc-17",
        machineName: "CNC Mill 17",
        roleName: "CNC Operator",
        taskName: "Tool change and lockout",
        riskLevel: "high",
        status: "active",
        reviewedBy: "user-safety-01",
        reviewedAt: "2026-03-15",
        documentRef: "doc-msc-hazard-cnc-cell-a",
        requiredControls: ["lockout_tagout", "machine_guarding", "ppe"],
      },
      {
        id: "msc-hazard-ppe-paint-shop",
        assessmentType: "ppe_hazard",
        siteId: "site-shah-alam",
        siteName: "Shah Alam Plant",
        departmentName: "Paint Shop",
        workArea: "Mixing Room",
        roleName: "Chemical Handler",
        taskName: "Solvent mixing",
        riskLevel: "critical",
        status: "reviewed",
        reviewedBy: "user-safety-02",
        reviewedAt: "2026-04-20",
        documentRef: "doc-msc-ppe-paint-shop",
        requiredControls: ["respirator", "chemical_gloves", "face_shield"],
      },
      {
        id: "msc-hazard-jha-forklift",
        assessmentType: "job_hazard_analysis",
        siteId: "site-detroit-plant",
        siteName: "Detroit Plant",
        departmentName: "Warehouse",
        workArea: "Shipping Dock",
        machineId: "machine-forklift-f08",
        machineName: "Forklift F-08",
        roleName: "Forklift Operator",
        taskName: "Trailer loading",
        riskLevel: "high",
        status: "active",
        reviewedBy: "user-safety-01",
        reviewedAt: "2026-05-01",
        documentRef: "doc-msc-jha-forklift",
        requiredControls: ["spotter_required", "pedestrian_lane", "horn_check"],
      },
    ],
  );

  const workplaceIncidents = withOrg<HrMscWorkplaceIncidentInput>(
    organizationId,
    [
      {
        id: "msc-incident-302-exposure",
        incidentDate: "2026-05-12",
        siteId: "site-shah-alam",
        siteName: "Shah Alam Plant",
        departmentName: "Paint Shop",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        incidentType: "exposure_event",
        severity: "high",
        description: "Solvent splash exposure during container transfer.",
        evidenceDocumentRef: "doc-msc-incident-302-exposure",
        status: "under_review",
        oshaRecordable: false,
        oshaFormRefs: [],
        correctiveActionRef: "msc-ca-302-exposure",
      },
      {
        id: "msc-incident-301-near-miss",
        incidentDate: "2026-05-18",
        siteId: "site-detroit-plant",
        siteName: "Detroit Plant",
        departmentName: "Warehouse",
        employeeId: "emp-301",
        employeeDisplayName: "Jamal Reed",
        incidentType: "near_miss",
        severity: "medium",
        description: "Forklift passed pedestrian crossing before full stop.",
        evidenceDocumentRef: "doc-msc-incident-301-near-miss",
        status: "corrective_action_pending",
        oshaRecordable: false,
        oshaFormRefs: [],
        correctiveActionRef: "msc-ca-301-near-miss",
      },
      {
        id: "msc-incident-300-injury",
        incidentDate: "2026-04-02",
        siteId: "site-detroit-plant",
        siteName: "Detroit Plant",
        departmentName: "Machining",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        incidentType: "injury",
        severity: "medium",
        description: "Minor laceration reported after deburring operation.",
        evidenceDocumentRef: "doc-msc-incident-300-injury",
        status: "recordable_reference",
        oshaRecordable: true,
        oshaFormRefs: ["osha_300", "osha_301"],
        correctiveActionRef: "msc-ca-300-guarding",
      },
    ],
  );

  const correctiveActions = withOrg<HrMscCorrectiveActionInput>(
    organizationId,
    [
      {
        id: "msc-ca-302-exposure",
        sourceType: "incident",
        sourceRef: "msc-incident-302-exposure",
        ownerEmployeeId: "emp-902",
        ownerDisplayName: "Farid Aziz",
        dueDate: "2026-06-01",
        priority: "high",
        status: "in_progress",
        evidenceDocumentRef: "doc-msc-ca-302-plan",
      },
      {
        id: "msc-ca-301-near-miss",
        sourceType: "incident",
        sourceRef: "msc-incident-301-near-miss",
        ownerEmployeeId: "emp-901",
        ownerDisplayName: "Nora Fischer",
        dueDate: "2026-05-25",
        priority: "high",
        status: "overdue",
      },
      {
        id: "msc-ca-300-loto-gap",
        sourceType: "training_gap",
        sourceRef: "msc-training-300-loto",
        ownerEmployeeId: "emp-900",
        ownerDisplayName: "Victor Hale",
        dueDate: "2026-06-05",
        priority: "medium",
        status: "assigned",
      },
    ],
  );

  const workRestrictions = withOrg<HrMscWorkRestrictionInput>(
    organizationId,
    [
      {
        id: "msc-restriction-301-forklift",
        employeeId: "emp-301",
        employeeDisplayName: "Jamal Reed",
        restrictionScope: "machine",
        restrictionTarget: "Forklift F-08",
        reason: "expired_certification",
        effectiveFrom: "2026-04-16",
        status: "active",
        reviewerEmployeeId: "emp-901",
        shiftSchedulingRef: "shift-block-msc-301",
      },
      {
        id: "msc-restriction-300-loto",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        restrictionScope: "duty",
        restrictionTarget: "Energy isolation task",
        reason: "missing_training",
        effectiveFrom: "2026-04-02",
        status: "pending_review",
        reviewerEmployeeId: "emp-900",
        shiftSchedulingRef: "shift-review-msc-300",
      },
    ],
  );

  const notifications = withOrg<HrMscNotificationInput>(organizationId, [
    {
      id: "msc-notify-300-loto",
      employeeId: "emp-300",
      employeeDisplayName: "Alicia Moreno",
      notificationType: "overdue_training",
      recipients: ["emp-300", "emp-900", "user-safety-01"],
      targetRef: "msc-training-300-loto",
      dueDate: "2026-04-01",
      generatedAt: "2026-05-31T00:00:00.000Z",
      status: "sent",
    },
    {
      id: "msc-notify-302-cert",
      employeeId: "emp-302",
      employeeDisplayName: "Mei Lin Tan",
      notificationType: "expiring_certification",
      recipients: ["emp-302", "emp-902", "user-safety-02"],
      targetRef: "msc-cert-302-chemical",
      dueDate: "2026-06-20",
      generatedAt: "2026-05-31T00:00:00.000Z",
      status: "queued",
    },
    {
      id: "msc-notify-301-ca",
      employeeId: "emp-301",
      employeeDisplayName: "Jamal Reed",
      notificationType: "overdue_corrective_action",
      recipients: ["emp-901", "user-safety-01"],
      targetRef: "msc-ca-301-near-miss",
      dueDate: "2026-05-25",
      generatedAt: "2026-05-31T00:00:00.000Z",
      status: "sent",
    },
  ]);

  const evidenceLinks = withOrg<HrMscEvidenceLinkInput>(organizationId, [
    {
      id: "msc-evidence-300-machine",
      employeeId: "emp-300",
      employeeDisplayName: "Alicia Moreno",
      evidenceType: "training_proof",
      targetRef: "msc-training-300-machine",
      documentRef: "doc-msc-training-300-machine",
      documentManagementRef: "dm-doc-msc-training-300-machine",
      linkedAt: "2026-01-20T10:00:00.000Z",
      linkedBy: "user-safety-01",
    },
    {
      id: "msc-evidence-300-ppe",
      employeeId: "emp-300",
      employeeDisplayName: "Alicia Moreno",
      evidenceType: "ppe_acknowledgment",
      targetRef: "msc-training-300-ppe",
      documentRef: "doc-msc-ppe-300",
      documentManagementRef: "dm-doc-msc-ppe-300",
      linkedAt: "2026-01-18T09:00:00.000Z",
      linkedBy: "emp-300",
    },
    {
      id: "msc-evidence-302-incident",
      employeeId: "emp-302",
      employeeDisplayName: "Mei Lin Tan",
      evidenceType: "incident_evidence",
      targetRef: "msc-incident-302-exposure",
      documentRef: "doc-msc-incident-302-exposure",
      documentManagementRef: "dm-doc-msc-incident-302-exposure",
      linkedAt: "2026-05-12T04:00:00.000Z",
      linkedBy: "user-safety-02",
    },
    {
      id: "msc-evidence-jha-forklift",
      evidenceType: "hazard_assessment",
      targetRef: "msc-hazard-jha-forklift",
      documentRef: "doc-msc-jha-forklift",
      documentManagementRef: "dm-doc-msc-jha-forklift",
      linkedAt: "2026-05-01T06:00:00.000Z",
      linkedBy: "user-safety-01",
    },
  ]);

  const integrationExposures = withOrg<HrMscIntegrationExposureInput>(
    organizationId,
    [
      {
        id: "msc-integration-compliance-300",
        integrationTarget: "compliance_regulatory_tracking",
        employeeId: "emp-300",
        employeeDisplayName: "Alicia Moreno",
        sourceRef: "msc-training-300-loto",
        status: "overdue",
        exposedAt: "2026-05-31T00:05:00.000Z",
        summary: "Overdue lockout/tagout training exposed to compliance tracking.",
      },
      {
        id: "msc-integration-lms-302",
        integrationTarget: "learning_management_system",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        sourceRef: "msc-training-302-fire",
        status: "learning_required",
        exposedAt: "2026-05-31T00:05:00.000Z",
        summary: "Fire safety learning requirement exposed to LMS.",
      },
      {
        id: "msc-integration-shift-301",
        integrationTarget: "shift_scheduling",
        employeeId: "emp-301",
        employeeDisplayName: "Jamal Reed",
        sourceRef: "msc-restriction-301-forklift",
        status: "restricted",
        exposedAt: "2026-05-31T00:05:00.000Z",
        summary: "Forklift restriction exposed to shift scheduling.",
      },
      {
        id: "msc-integration-document-302",
        integrationTarget: "document_management",
        employeeId: "emp-302",
        employeeDisplayName: "Mei Lin Tan",
        sourceRef: "msc-evidence-302-incident",
        status: "linked",
        exposedAt: "2026-05-31T00:10:00.000Z",
        summary: "Incident evidence link exposed to Document Management.",
      },
    ],
  );

  const auditEvents = withOrg<HrIndustryMscAuditEvent>(organizationId, [
    {
      id: "audit-msc-001",
      action: hrIndustryMscAuditActions.requirementConfigured,
      actorId: "user-safety-01",
      targetType: "requirement",
      targetId: "msc-req-cnc-loto",
      summary: "Configured CNC lockout/tagout safety training requirement.",
      occurredAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "audit-msc-002",
      action: hrIndustryMscAuditActions.employeeRequirementIdentified,
      actorId: "system-msc",
      targetType: "employee_requirement",
      targetId: "msc-profile-300",
      employeeId: "emp-300",
      summary: "Identified Alicia Moreno as requiring machine safety, LOTO, and PPE training.",
      occurredAt: "2026-01-05T00:00:00.000Z",
    },
    {
      id: "audit-msc-003",
      action: hrIndustryMscAuditActions.trainingCompleted,
      actorId: "emp-300",
      targetType: "training",
      targetId: "msc-training-300-machine",
      employeeId: "emp-300",
      summary: "Completed CNC machine safety training.",
      occurredAt: "2026-01-20T10:00:00.000Z",
    },
    {
      id: "audit-msc-004",
      action: hrIndustryMscAuditActions.ppeAcknowledged,
      actorId: "emp-300",
      targetType: "ppe_acknowledgment",
      targetId: "msc-training-300-ppe",
      employeeId: "emp-300",
      summary: "Acknowledged required PPE for CNC operations.",
      occurredAt: "2026-01-18T09:00:00.000Z",
    },
    {
      id: "audit-msc-005",
      action: hrIndustryMscAuditActions.hazardAssessmentReviewed,
      actorId: "user-safety-02",
      targetType: "hazard_assessment",
      targetId: "msc-hazard-ppe-paint-shop",
      summary: "Reviewed PPE hazard assessment for Paint Shop solvent handling.",
      occurredAt: "2026-04-20T02:00:00.000Z",
    },
    {
      id: "audit-msc-006",
      action: hrIndustryMscAuditActions.incidentReported,
      actorId: "emp-302",
      targetType: "incident",
      targetId: "msc-incident-302-exposure",
      employeeId: "emp-302",
      summary: "Reported solvent splash exposure incident.",
      occurredAt: "2026-05-12T04:00:00.000Z",
    },
    {
      id: "audit-msc-007",
      action: hrIndustryMscAuditActions.oshaRecordkeepingReferenced,
      actorId: "user-safety-01",
      targetType: "osha_recordkeeping",
      targetId: "msc-incident-300-injury",
      employeeId: "emp-300",
      summary: "Linked OSHA 300 and 301 references for recordable injury.",
      occurredAt: "2026-04-03T04:00:00.000Z",
    },
    {
      id: "audit-msc-008",
      action: hrIndustryMscAuditActions.correctiveActionAssigned,
      actorId: "user-safety-01",
      targetType: "corrective_action",
      targetId: "msc-ca-301-near-miss",
      employeeId: "emp-301",
      summary: "Assigned corrective action for forklift near miss.",
      occurredAt: "2026-05-18T06:00:00.000Z",
    },
    {
      id: "audit-msc-009",
      action: hrIndustryMscAuditActions.workRestrictionApplied,
      actorId: "user-safety-01",
      targetType: "work_restriction",
      targetId: "msc-restriction-301-forklift",
      employeeId: "emp-301",
      summary: "Applied forklift restriction for expired certification.",
      occurredAt: "2026-04-16T00:00:00.000Z",
    },
    {
      id: "audit-msc-010",
      action: hrIndustryMscAuditActions.integrationExposed,
      actorId: "system-msc",
      targetType: "integration",
      targetId: "msc-integration-shift-301",
      employeeId: "emp-301",
      summary: "Exposed forklift restriction to Shift Scheduling.",
      occurredAt: "2026-05-31T00:05:00.000Z",
    },
  ]);

  return {
    safetyTrainingRequirements,
    employeeSafetyProfiles,
    trainingAssignments,
    safetyCertifications,
    hazardAssessments,
    workplaceIncidents,
    correctiveActions,
    workRestrictions,
    notifications,
    evidenceLinks,
    integrationExposures,
    auditEvents,
  };
}

export function getHrIndustryMscStore(
  organizationId: string,
): HrIndustryMscStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrIndustryMscStore(
  organizationId: string,
): HrIndustryMscStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function filterHrIndustryMscRecordsForAccess(input: {
  readonly store: HrIndustryMscStore;
  readonly visibleEmployeeIds: readonly string[] | null;
}): HrIndustryMscStore {
  const { store, visibleEmployeeIds } = input;
  const visibleProfiles = scopedRows(store.employeeSafetyProfiles, visibleEmployeeIds);
  const visibleSiteIds = new Set(visibleProfiles.map((row) => row.siteId));

  return {
    safetyTrainingRequirements:
      visibleEmployeeIds === null
        ? store.safetyTrainingRequirements
        : store.safetyTrainingRequirements.filter((row) =>
            visibleSiteIds.has(row.siteId),
          ),
    employeeSafetyProfiles: visibleProfiles,
    trainingAssignments: scopedRows(store.trainingAssignments, visibleEmployeeIds),
    safetyCertifications: scopedRows(
      store.safetyCertifications,
      visibleEmployeeIds,
    ),
    hazardAssessments:
      visibleEmployeeIds === null
        ? store.hazardAssessments
        : store.hazardAssessments.filter((row) => visibleSiteIds.has(row.siteId)),
    workplaceIncidents: scopedRows(store.workplaceIncidents, visibleEmployeeIds),
    correctiveActions: store.correctiveActions.filter((action) => {
      const incident = store.workplaceIncidents.find(
        (row) => row.id === action.sourceRef,
      );
      return !incident || hasEmployeeAccess(incident, visibleEmployeeIds);
    }),
    workRestrictions: scopedRows(store.workRestrictions, visibleEmployeeIds),
    notifications: scopedRows(store.notifications, visibleEmployeeIds),
    evidenceLinks: scopedRows(store.evidenceLinks, visibleEmployeeIds),
    integrationExposures: scopedRows(
      store.integrationExposures,
      visibleEmployeeIds,
    ),
    auditEvents: store.auditEvents.filter((event) =>
      hasEmployeeAccess(event, visibleEmployeeIds),
    ),
  };
}

function completedTrainingTypes(
  rows: readonly HrMscTrainingAssignmentInput[],
): Set<HrMscTrainingType> {
  return new Set(
    rows
      .filter((row) =>
        ["completed", "renewed", "waived"].includes(row.status),
      )
      .map((row) => row.trainingType),
  );
}

function activeRestrictionReason(
  rows: readonly HrMscWorkRestrictionInput[],
): HrMscWorkRestrictionReason | undefined {
  return rows.find((row) => row.status === "active")?.reason;
}

export function resolveHrIndustryMscSafetyEligibility(input: {
  readonly store: HrIndustryMscStore;
  readonly profile: HrMscEmployeeSafetyProfileInput;
  readonly referenceDate?: string;
}): HrMscSafetyEligibilityRecordInput {
  const referenceDate = input.referenceDate ?? HR_INDUSTRY_MSC_REFERENCE_DATE;
  const { profile, store } = input;
  const trainingRows = store.trainingAssignments.filter(
    (row) => row.employeeId === profile.employeeId,
  );
  const completed = completedTrainingTypes(trainingRows);
  const missingTraining = profile.requiredTrainingTypes.filter(
    (type) => !completed.has(type),
  );
  const overdueTraining = trainingRows.filter(
    (row) =>
      row.status === "overdue" ||
      row.status === "failed" ||
      row.status === "expired" ||
      (!row.completedAt &&
        row.status !== "waived" &&
        isExpired(row.dueDate, referenceDate)),
  );
  const certifications = store.safetyCertifications.filter(
    (row) => row.employeeId === profile.employeeId,
  );
  const expiredCertifications = certifications.filter(
    (row) =>
      row.status === "expired" || isExpired(row.expiryDate, referenceDate),
  );
  const expiringCertifications = certifications.filter(
    (row) =>
      row.status === "expiring" ||
      (!expiredCertifications.includes(row) &&
        isExpiring(
          row.expiryDate,
          EXPIRING_CERTIFICATION_LEAD_DAYS,
          referenceDate,
        )),
  );
  const restrictions = store.workRestrictions.filter(
    (row) =>
      row.employeeId === profile.employeeId &&
      (row.status === "active" || row.status === "pending_review"),
  );
  const flags = [
    ...missingTraining.map((type) => `missing_${type}`),
    ...overdueTraining.map((row) => `${row.status}_${row.trainingType}`),
    ...expiredCertifications.map((row) => `expired_${row.certificationType}`),
    ...expiringCertifications.map((row) => `expiring_${row.certificationType}`),
  ];
  const activeReason = activeRestrictionReason(restrictions);
  const eligibilityStatus: HrMscEligibilityStatus = activeReason
    ? "restricted"
    : restrictions.length > 0 ||
        overdueTraining.length > 0 ||
        expiredCertifications.length > 0 ||
        missingTraining.length > 0
      ? "pending_review"
      : profile.requiredTrainingTypes.length === 0
        ? "not_required"
        : "eligible";

  return {
    id: `msc-eligibility-${profile.employeeId}`,
    organizationId: profile.organizationId,
    employeeId: profile.employeeId,
    employeeDisplayName: profile.employeeDisplayName,
    siteName: profile.siteName,
    departmentName: profile.departmentName,
    roleName: profile.roleName,
    managerDisplayName: profile.managerDisplayName,
    eligibilityStatus,
    flags,
    restrictionRefs: restrictions.map((row) => row.id),
  };
}

export function listHrIndustryMscSafetyEligibilityRecords(
  store: HrIndustryMscStore,
): HrMscSafetyEligibilityRecordInput[] {
  return store.employeeSafetyProfiles.map((profile) =>
    resolveHrIndustryMscSafetyEligibility({ store, profile }),
  );
}

export function listHrIndustryMscComplianceTrainingRefs(
  store: HrIndustryMscStore,
): HrMscComplianceTrainingCompletionRef[] {
  return store.trainingAssignments.map((training) => ({
    id: `compliance-${training.id}`,
    employeeId: training.employeeId,
    employeeDisplayName: training.employeeDisplayName,
    trainingType: training.trainingType,
    status: training.status,
    dueDate: training.dueDate,
    ...(training.completedAt ? { completedAt: training.completedAt } : {}),
    requirementRef: training.requirementRef,
    ...(training.evidenceDocumentRef
      ? { evidenceDocumentRef: training.evidenceDocumentRef }
      : {}),
  }));
}

export function listHrIndustryMscLearningRequirementRefs(
  store: HrIndustryMscStore,
): HrMscLearningRequirementRef[] {
  return store.trainingAssignments
    .filter((training) =>
      ["assigned", "overdue", "failed", "expired"].includes(training.status),
    )
    .map((training) => ({
      id: `learning-${training.id}`,
      employeeId: training.employeeId,
      employeeDisplayName: training.employeeDisplayName,
      trainingType: training.trainingType,
      dueDate: training.dueDate,
      requirementRef: training.requirementRef,
      renewalRequired:
        training.status === "failed" || training.status === "expired",
    }));
}

export function listHrIndustryMscShiftSchedulingEligibilityRefs(
  store: HrIndustryMscStore,
): HrMscShiftSchedulingEligibilityRef[] {
  const restrictionsByEmployee = new Map(
    store.workRestrictions
      .filter((restriction) => restriction.status !== "released")
      .map((restriction) => [restriction.employeeId, restriction]),
  );

  return listHrIndustryMscSafetyEligibilityRecords(store).map((record) => {
    const restriction = restrictionsByEmployee.get(record.employeeId);
    return {
      id: `shift-${record.id}`,
      employeeId: record.employeeId,
      employeeDisplayName: record.employeeDisplayName,
      siteName: record.siteName,
      roleName: record.roleName,
      eligibilityStatus: record.eligibilityStatus,
      restrictionRefs: record.restrictionRefs,
      ...(restriction ? { restrictionReason: restriction.reason } : {}),
    };
  });
}

export function listHrIndustryMscDocumentEvidenceRefs(
  store: HrIndustryMscStore,
): HrMscDocumentEvidenceRef[] {
  return store.evidenceLinks.map((row) => ({
    id: row.id,
    targetRef: row.targetRef,
    documentManagementRef: row.documentManagementRef,
    evidenceType: row.evidenceType,
    ...(row.employeeId ? { employeeId: row.employeeId } : {}),
  }));
}

export function listHrIndustryMscIntegrationExposureRefs(
  store: HrIndustryMscStore,
): HrMscIntegrationExposureRef[] {
  return store.integrationExposures.map((row) => ({
    id: row.id,
    integrationTarget: row.integrationTarget,
    sourceRef: row.sourceRef,
    status: row.status,
    exposedAt: row.exposedAt,
    summary: row.summary,
  }));
}

export function buildHrIndustryMscReportRows(input: {
  readonly store: HrIndustryMscStore;
  readonly groupBy: HrMscReportGroupBy;
}): HrIndustryMscReportRow[] {
  const groups = new Map<string, HrMscEmployeeSafetyProfileInput[]>();
  for (const profile of input.store.employeeSafetyProfiles) {
    const labels = resolveReportGroupLabels(input.store, profile, input.groupBy);
    for (const groupLabel of labels) {
      groups.set(groupLabel, [...(groups.get(groupLabel) ?? []), profile]);
    }
  }

  return [...groups.entries()].map(([groupLabel, profiles]) => {
    const employeeIds = new Set(profiles.map((row) => row.employeeId));
    const eligibilityRows = listHrIndustryMscSafetyEligibilityRecords(
      input.store,
    ).filter((row) => employeeIds.has(row.employeeId));
    const overdueTrainingCount = input.store.trainingAssignments.filter(
      (row) => employeeIds.has(row.employeeId) && row.status === "overdue",
    ).length;
    const expiringCertificationCount = input.store.safetyCertifications.filter(
      (row) =>
        employeeIds.has(row.employeeId) &&
        (row.status === "expiring" || row.status === "renewal_due"),
    ).length;
    const incidentCount = input.store.workplaceIncidents.filter(
      (row) => row.employeeId && employeeIds.has(row.employeeId),
    ).length;
    const openCorrectiveActionCount = input.store.correctiveActions.filter(
      (row) => !["completed", "verified", "cancelled"].includes(row.status),
    ).length;
    const restrictionCount = input.store.workRestrictions.filter(
      (row) => employeeIds.has(row.employeeId) && row.status !== "released",
    ).length;
    const eligibleCount = eligibilityRows.filter(
      (row) => row.eligibilityStatus === "eligible",
    ).length;
    const readinessBase = profiles.length === 0 ? 1 : profiles.length;

    return {
      id: `msc-report-${input.groupBy}-${groupLabel
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, "-")}`,
      groupLabel,
      requiredEmployeeCount: profiles.length,
      overdueTrainingCount,
      expiringCertificationCount,
      incidentCount,
      openCorrectiveActionCount,
      restrictionCount,
      readinessPercent: Math.round((eligibleCount / readinessBase) * 100),
    };
  });
}

function resolveReportGroupLabels(
  store: HrIndustryMscStore,
  profile: HrMscEmployeeSafetyProfileInput,
  groupBy: HrMscReportGroupBy,
) {
  switch (groupBy) {
    case "site":
      return [profile.siteName];
    case "department":
      return [profile.departmentName];
    case "role":
      return [profile.roleName];
    case "manager":
      return [profile.managerDisplayName];
    case "training_type":
      return profile.requiredTrainingTypes;
    case "incident_type":
      return store.workplaceIncidents
        .filter((incident) => incident.employeeId === profile.employeeId)
        .map((incident) => incident.incidentType);
    case "hazard_status":
      return store.hazardAssessments
        .filter((hazard) => hazard.siteId === profile.siteId)
        .map((hazard) => hazard.status);
    case "risk_level":
      return [profile.riskLevel];
  }
}

export function emitHrIndustryMscAuditEvent(
  store: HrIndustryMscStore,
  event: Omit<HrIndustryMscAuditEvent, "id" | "occurredAt"> & {
    readonly occurredAt?: string;
  },
) {
  const row: HrIndustryMscAuditEvent = {
    ...event,
    id: `audit-msc-${store.auditEvents.length + 1}`,
    occurredAt: event.occurredAt ?? new Date().toISOString(),
  };
  store.auditEvents.unshift(row);
  return row;
}
