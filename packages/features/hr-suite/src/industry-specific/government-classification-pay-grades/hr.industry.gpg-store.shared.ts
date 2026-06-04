import type {
  HrGpgIntegrationExposureReference,
  HrGpgLifecycleMovementReference,
  HrGpgPayrollReferenceExport,
  HrGpgStepIncreaseEligibilityReference,
} from "./hr.industry.gpg.contract";
import {
  hrIndustryGpgAuditActions,
  type HrIndustryGpgAuditAction,
} from "./hr.industry.gpg.event";
import type { HrGpgReportGroupBy } from "./hr.industry.gpg-constants.shared";
import type {
  HrGpgClassificationReviewInput,
  HrGpgClassificationStructureInput,
  HrGpgGradeMovementInput,
  HrGpgIntegrationExposureInput,
  HrGpgLocalityAdjustmentRuleInput,
  HrGpgPayGradeInput,
  HrGpgPositionAssignmentInput,
  HrGpgSalaryTableVersionInput,
  HrGpgStepEligibilityRuleInput,
  HrGpgStepIncreaseCandidateInput,
} from "./hr.industry.gpg.schema";

export const HR_INDUSTRY_GPG_REFERENCE_DATE = "2026-05-31";

export type HrIndustryGpgAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrIndustryGpgAuditAction;
  readonly actorId: string;
  readonly targetType:
    | "classification"
    | "pay_grade"
    | "salary_table"
    | "position_assignment"
    | "locality_adjustment"
    | "step_eligibility"
    | "step_movement"
    | "grade_movement"
    | "reclassification"
    | "retention"
    | "acting_grade"
    | "classification_review"
    | "integration";
  readonly targetId: string;
  readonly employeeId?: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrIndustryGpgReportRow = {
  readonly id: string;
  readonly groupLabel: string;
  readonly assignmentCount: number;
  readonly publishedSalaryTableCount: number;
  readonly eligibleStepCandidateCount: number;
  readonly pendingMovementCount: number;
  readonly blockedAssignmentCount: number;
  readonly averageLocalityAdjustedPay: number;
};

export type HrIndustryGpgStore = {
  classifications: HrGpgClassificationStructureInput[];
  payGrades: HrGpgPayGradeInput[];
  salaryTableVersions: HrGpgSalaryTableVersionInput[];
  localityAdjustmentRules: HrGpgLocalityAdjustmentRuleInput[];
  positionAssignments: HrGpgPositionAssignmentInput[];
  stepEligibilityRules: HrGpgStepEligibilityRuleInput[];
  stepIncreaseCandidates: HrGpgStepIncreaseCandidateInput[];
  gradeMovements: HrGpgGradeMovementInput[];
  classificationReviews: HrGpgClassificationReviewInput[];
  integrationExposures: HrGpgIntegrationExposureInput[];
  auditEvents: HrIndustryGpgAuditEvent[];
};

type EmployeeScoped = { readonly employeeId: string };

const stores = new Map<string, HrIndustryGpgStore>();

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
  visibleEmployeeIds: readonly string[] | null,
) {
  return rows.filter((row) => hasEmployeeAccess(row, visibleEmployeeIds));
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateHrIndustryGpgLocalityAdjustedPay(input: {
  readonly baseRate: number;
  readonly adjustmentRate: number;
}) {
  return roundMoney(input.baseRate * (1 + input.adjustmentRate / 100));
}

function createSeedStore(organizationId: string): HrIndustryGpgStore {
  const classifications = withOrg<HrGpgClassificationStructureInput>(
    organizationId,
    [
      {
        id: "gpg-class-gs-0343",
        classificationCode: "GS-0343",
        classificationName: "Program Management Analyst",
        occupationalGroup: "Administrative and Management",
        jobSeries: "0343",
        serviceScheme: "General Schedule",
        jobFamily: "Program Management",
        agency: "Digital Services Agency",
        department: "Transformation Office",
        positionTitle: "Program Analyst",
        referenceType: "gs",
        referenceCode: "GS-0343-11",
        status: "active",
        effectiveFrom: "2026-01-01",
      },
      {
        id: "gpg-class-ses-0301",
        classificationCode: "SES-0301",
        classificationName: "Executive Program Director",
        occupationalGroup: "Senior Executive",
        jobSeries: "0301",
        serviceScheme: "Senior Executive Service",
        jobFamily: "Executive Administration",
        agency: "Digital Services Agency",
        department: "Office of the Director",
        positionTitle: "Program Director",
        referenceType: "ses",
        referenceCode: "SES-II",
        status: "under_review",
        effectiveFrom: "2026-02-01",
      },
      {
        id: "gpg-class-cs-it-07",
        classificationCode: "CS-IT-07",
        classificationName: "Civil Service Technology Officer",
        occupationalGroup: "Information Technology",
        jobSeries: "2210",
        serviceScheme: "Civil Service IT",
        jobFamily: "Technology Operations",
        agency: "Public Infrastructure Agency",
        department: "Field Systems",
        positionTitle: "Systems Officer",
        referenceType: "civil_service",
        referenceCode: "CS-IT-07",
        status: "active",
        effectiveFrom: "2026-01-15",
      },
    ],
  );

  const payGrades = withOrg<HrGpgPayGradeInput>(organizationId, [
    {
      id: "gpg-grade-gs-11",
      gradeCode: "GS-11",
      gradeName: "General Schedule 11",
      payBandCode: "GS-11-BAND",
      rankReference: "GS",
      minSalary: 72500,
      maxSalary: 94250,
      stepCount: 10,
      status: "active",
      effectiveFrom: "2026-01-01",
    },
    {
      id: "gpg-grade-ses-02",
      gradeCode: "SES-II",
      gradeName: "Senior Executive Band II",
      payBandCode: "SES-B",
      rankReference: "SES",
      minSalary: 145000,
      maxSalary: 195000,
      stepCount: 5,
      status: "active",
      effectiveFrom: "2026-01-01",
    },
    {
      id: "gpg-grade-cs-it-07",
      gradeCode: "CS-IT-07",
      gradeName: "Civil Service IT Grade 07",
      payBandCode: "CS-IT-BAND-07",
      minSalary: 61000,
      maxSalary: 76000,
      stepCount: 8,
      status: "active",
      effectiveFrom: "2026-01-15",
    },
  ]);

  const salaryTableVersions = withOrg<HrGpgSalaryTableVersionInput>(
    organizationId,
    [
      {
        id: "gpg-salary-gs-11-s03-v2026",
        salaryTableCode: "GS-2026",
        version: "2026.1",
        gradeCode: "GS-11",
        stepCode: "S03",
        baseRate: 78500,
        minSalary: 72500,
        maxSalary: 94250,
        currency: "USD",
        effectiveFrom: "2026-01-01",
        status: "published",
        approvedBy: "user-comp-01",
      },
      {
        id: "gpg-salary-gs-11-s04-v2026",
        salaryTableCode: "GS-2026",
        version: "2026.1",
        gradeCode: "GS-11",
        stepCode: "S04",
        baseRate: 81250,
        minSalary: 72500,
        maxSalary: 94250,
        currency: "USD",
        effectiveFrom: "2026-01-01",
        status: "published",
        approvedBy: "user-comp-01",
      },
      {
        id: "gpg-salary-ses-ii-s02-v2026",
        salaryTableCode: "SES-2026",
        version: "2026.1",
        gradeCode: "SES-II",
        stepCode: "S02",
        baseRate: 158000,
        minSalary: 145000,
        maxSalary: 195000,
        currency: "USD",
        effectiveFrom: "2026-01-01",
        status: "published",
        approvedBy: "user-comp-01",
      },
      {
        id: "gpg-salary-cs-it-07-s05-v2026",
        salaryTableCode: "CS-IT-2026",
        version: "2026.1",
        gradeCode: "CS-IT-07",
        stepCode: "S05",
        baseRate: 69500,
        minSalary: 61000,
        maxSalary: 76000,
        currency: "USD",
        effectiveFrom: "2026-01-15",
        status: "published",
        approvedBy: "user-payroll-01",
      },
      {
        id: "gpg-salary-gs-11-s03-v2025",
        salaryTableCode: "GS-2025",
        version: "2025.2",
        gradeCode: "GS-11",
        stepCode: "S03",
        baseRate: 75400,
        minSalary: 69800,
        maxSalary: 91200,
        currency: "USD",
        effectiveFrom: "2025-01-01",
        effectiveTo: "2025-12-31",
        status: "superseded",
        approvedBy: "user-comp-01",
      },
    ],
  );

  const localityAdjustmentRules = withOrg<HrGpgLocalityAdjustmentRuleInput>(
    organizationId,
    [
      {
        id: "gpg-locality-dc-2026",
        localityArea: "DC Metro",
        region: "Northeast",
        country: "US",
        city: "Washington",
        dutyStation: "DCA-HQ",
        workLocation: "Headquarters",
        adjustmentType: "locality_pay",
        adjustmentRate: 18.25,
        allowanceRef: "allowance-dc-locality",
        status: "active",
        effectiveFrom: "2026-01-01",
      },
      {
        id: "gpg-locality-remote-alaska-2026",
        localityArea: "Remote Alaska",
        region: "Alaska",
        country: "US",
        city: "Nome",
        dutyStation: "AK-FIELD-02",
        workLocation: "Remote Field Station",
        adjustmentType: "hardship",
        adjustmentRate: 24,
        allowanceRef: "allowance-hardship-ak",
        status: "active",
        effectiveFrom: "2026-01-01",
      },
      {
        id: "gpg-locality-my-kl-2026",
        localityArea: "Kuala Lumpur",
        region: "MY Central",
        country: "MY",
        city: "Kuala Lumpur",
        dutyStation: "MY-KUL-01",
        workLocation: "Shared Services Hub",
        adjustmentType: "cost_of_living",
        adjustmentRate: 8.5,
        allowanceRef: "allowance-kl-cola",
        status: "active",
        effectiveFrom: "2026-01-01",
      },
    ],
  );

  const positionAssignments = withOrg<HrGpgPositionAssignmentInput>(
    organizationId,
    [
      {
        id: "gpg-assignment-100",
        employeeId: "emp-100",
        employeeDisplayName: "Maya Johnson",
        positionId: "pos-dsa-program-analyst",
        positionTitle: "Program Analyst",
        classificationCode: "GS-0343",
        gradeCode: "GS-11",
        payBandCode: "GS-11-BAND",
        stepCode: "S03",
        salaryTableCode: "GS-2026",
        localityArea: "DC Metro",
        appointmentType: "permanent",
        employeeCategory: "civil_service",
        policyGroup: "standard_gs",
        agency: "Digital Services Agency",
        department: "Transformation Office",
        effectiveFrom: "2026-01-01",
        validationStatus: "valid",
        validationMessage: "Classification, grade, step, and table align.",
        currentBasePay: 78500,
        localityAdjustedPay: calculateHrIndustryGpgLocalityAdjustedPay({
          baseRate: 78500,
          adjustmentRate: 18.25,
        }),
      },
      {
        id: "gpg-assignment-101",
        employeeId: "emp-101",
        employeeDisplayName: "Daniel Cho",
        positionId: "pos-dsa-exec-program-director",
        positionTitle: "Program Director",
        classificationCode: "SES-0301",
        gradeCode: "SES-II",
        payBandCode: "SES-B",
        stepCode: "S02",
        salaryTableCode: "SES-2026",
        localityArea: "DC Metro",
        appointmentType: "senior_executive",
        employeeCategory: "executive",
        policyGroup: "ses",
        agency: "Digital Services Agency",
        department: "Office of the Director",
        effectiveFrom: "2026-02-01",
        validationStatus: "warning",
        validationMessage: "Classification review remains open.",
        currentBasePay: 158000,
        localityAdjustedPay: calculateHrIndustryGpgLocalityAdjustedPay({
          baseRate: 158000,
          adjustmentRate: 18.25,
        }),
      },
      {
        id: "gpg-assignment-102",
        employeeId: "emp-102",
        employeeDisplayName: "Noor Rahman",
        positionId: "pos-pia-field-systems-officer",
        positionTitle: "Systems Officer",
        classificationCode: "CS-IT-07",
        gradeCode: "CS-IT-07",
        payBandCode: "CS-IT-BAND-07",
        stepCode: "S05",
        salaryTableCode: "CS-IT-2026",
        localityArea: "Kuala Lumpur",
        appointmentType: "permanent",
        employeeCategory: "civil_service",
        policyGroup: "civil_service_it",
        agency: "Public Infrastructure Agency",
        department: "Field Systems",
        effectiveFrom: "2026-01-15",
        validationStatus: "valid",
        validationMessage: "Civil service grade and salary table align.",
        currentBasePay: 69500,
        localityAdjustedPay: calculateHrIndustryGpgLocalityAdjustedPay({
          baseRate: 69500,
          adjustmentRate: 8.5,
        }),
      },
      {
        id: "gpg-assignment-103",
        employeeId: "emp-103",
        employeeDisplayName: "Ivy Carter",
        positionId: "pos-pia-remote-systems-officer",
        positionTitle: "Remote Systems Officer",
        classificationCode: "CS-IT-07",
        gradeCode: "GS-11",
        payBandCode: "CS-IT-BAND-07",
        stepCode: "S09",
        salaryTableCode: "CS-IT-2026",
        localityArea: "Remote Alaska",
        appointmentType: "temporary",
        employeeCategory: "civil_service",
        policyGroup: "civil_service_it",
        agency: "Public Infrastructure Agency",
        department: "Field Systems",
        effectiveFrom: "2026-05-01",
        validationStatus: "blocked",
        validationMessage:
          "Grade GS-11 is not valid for classification CS-IT-07 and table CS-IT-2026.",
        currentBasePay: 74200,
        localityAdjustedPay: calculateHrIndustryGpgLocalityAdjustedPay({
          baseRate: 74200,
          adjustmentRate: 24,
        }),
      },
    ],
  );

  const stepEligibilityRules = withOrg<HrGpgStepEligibilityRuleInput>(
    organizationId,
    [
      {
        id: "gpg-step-rule-gs-11-s03",
        gradeCode: "GS-11",
        stepCode: "S03",
        nextStepCode: "S04",
        appointmentType: "permanent",
        waitingPeriodMonths: 12,
        performanceReference: "meets_expectations",
        processingMode: "approval_based",
        status: "active",
        effectiveFrom: "2026-01-01",
      },
      {
        id: "gpg-step-rule-cs-it-07-s05",
        gradeCode: "CS-IT-07",
        stepCode: "S05",
        nextStepCode: "S06",
        appointmentType: "permanent",
        waitingPeriodMonths: 18,
        performanceReference: "successful",
        processingMode: "automatic",
        status: "active",
        effectiveFrom: "2026-01-15",
      },
    ],
  );

  const stepIncreaseCandidates = withOrg<HrGpgStepIncreaseCandidateInput>(
    organizationId,
    [
      {
        id: "gpg-step-candidate-100",
        employeeId: "emp-100",
        employeeDisplayName: "Maya Johnson",
        gradeCode: "GS-11",
        currentStepCode: "S03",
        nextStepCode: "S04",
        serviceMonths: 14,
        appointmentType: "permanent",
        performanceReference: "meets_expectations",
        eligibilityDate: "2026-06-15",
        eligibilityStatus: "eligible",
        processingMode: "approval_based",
        approvalRef: "approval-gpg-step-100",
      },
      {
        id: "gpg-step-candidate-102",
        employeeId: "emp-102",
        employeeDisplayName: "Noor Rahman",
        gradeCode: "CS-IT-07",
        currentStepCode: "S05",
        nextStepCode: "S06",
        serviceMonths: 10,
        appointmentType: "permanent",
        performanceReference: "successful",
        eligibilityDate: "2026-11-15",
        eligibilityStatus: "not_yet_eligible",
        processingMode: "automatic",
      },
      {
        id: "gpg-step-candidate-103",
        employeeId: "emp-103",
        employeeDisplayName: "Ivy Carter",
        gradeCode: "GS-11",
        currentStepCode: "S09",
        nextStepCode: "S10",
        serviceMonths: 24,
        appointmentType: "temporary",
        performanceReference: "pending_review",
        eligibilityDate: "2026-05-01",
        eligibilityStatus: "blocked",
        processingMode: "approval_based",
      },
    ],
  );

  const gradeMovements = withOrg<HrGpgGradeMovementInput>(organizationId, [
    {
      id: "gpg-movement-100-promotion",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Johnson",
      movementType: "promotion",
      fromClassificationCode: "GS-0343",
      fromGradeCode: "GS-11",
      fromStepCode: "S03",
      toClassificationCode: "GS-0343",
      toGradeCode: "GS-12",
      toStepCode: "S01",
      effectiveDate: "2026-07-01",
      reason: "Promotion to senior analyst role.",
      status: "pending_approval",
      lifecycleRef: "lifecycle-promotion-100",
    },
    {
      id: "gpg-movement-101-reclass",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Cho",
      movementType: "reclassification",
      fromClassificationCode: "SES-0301",
      fromGradeCode: "SES-II",
      fromStepCode: "S02",
      toClassificationCode: "SES-0301",
      toGradeCode: "SES-III",
      toStepCode: "S01",
      effectiveDate: "2026-08-01",
      reason: "Executive classification correction after review.",
      status: "approved",
      lifecycleRef: "lifecycle-reclass-101",
    },
    {
      id: "gpg-movement-103-retention",
      employeeId: "emp-103",
      employeeDisplayName: "Ivy Carter",
      movementType: "pay_retention",
      fromClassificationCode: "CS-IT-07",
      fromGradeCode: "GS-11",
      fromStepCode: "S09",
      toClassificationCode: "CS-IT-07",
      toGradeCode: "CS-IT-07",
      toStepCode: "S05",
      effectiveDate: "2026-05-01",
      reason:
        "Saved pay while correcting invalid temporary higher-duty assignment.",
      status: "approved",
      retentionRef: "retention-saved-pay-103",
    },
  ]);

  const classificationReviews = withOrg<HrGpgClassificationReviewInput>(
    organizationId,
    [
      {
        id: "gpg-review-101",
        classificationCode: "SES-0301",
        positionId: "pos-dsa-exec-program-director",
        requestedBy: "user-comp-02",
        reviewType: "classification_review",
        status: "under_review",
        effectiveDate: "2026-02-01",
        outcomeRef: "review-board-101",
      },
      {
        id: "gpg-review-103",
        classificationCode: "CS-IT-07",
        positionId: "pos-pia-remote-systems-officer",
        requestedBy: "user-payroll-02",
        reviewType: "classification_correction",
        status: "approved",
        effectiveDate: "2026-05-01",
        outcomeRef: "classification-correction-103",
      },
    ],
  );

  const integrationExposures = withOrg<HrGpgIntegrationExposureInput>(
    organizationId,
    [
      {
        id: "gpg-integration-payroll-100",
        integrationTarget: "payroll_processing",
        sourceRef: "gpg-assignment-100",
        approvedReference: "payroll-grade-ref-100",
        status: "exposed",
        exposedAt: "2026-05-31T08:00:00.000Z",
      },
      {
        id: "gpg-integration-lifecycle-101",
        integrationTarget: "employee_lifecycle_management",
        sourceRef: "gpg-movement-101-reclass",
        approvedReference: "lifecycle-grade-movement-101",
        status: "ready",
        exposedAt: "2026-05-31T09:00:00.000Z",
      },
      {
        id: "gpg-integration-payroll-103",
        integrationTarget: "payroll_processing",
        sourceRef: "gpg-assignment-103",
        approvedReference: "blocked-invalid-assignment",
        status: "blocked",
        exposedAt: "2026-05-31T10:00:00.000Z",
      },
    ],
  );

  const auditEvents = withOrg<HrIndustryGpgAuditEvent>(organizationId, [
    {
      id: "gpg-audit-classification-001",
      action: hrIndustryGpgAuditActions.classificationConfigured,
      actorId: "user-comp-01",
      targetType: "classification",
      targetId: "gpg-class-gs-0343",
      summary: "Configured GS-0343 classification structure.",
      occurredAt: "2026-01-01T08:00:00.000Z",
    },
    {
      id: "gpg-audit-salary-001",
      action: hrIndustryGpgAuditActions.salaryTablePublished,
      actorId: "user-payroll-01",
      targetType: "salary_table",
      targetId: "gpg-salary-gs-11-s03-v2026",
      summary: "Published GS-2026 salary table version 2026.1.",
      occurredAt: "2026-01-01T09:00:00.000Z",
    },
    {
      id: "gpg-audit-assignment-100",
      action: hrIndustryGpgAuditActions.positionAssigned,
      actorId: "user-hr-01",
      targetType: "position_assignment",
      targetId: "gpg-assignment-100",
      employeeId: "emp-100",
      summary: "Assigned Maya Johnson to GS-0343, GS-11, step S03.",
      occurredAt: "2026-01-02T09:00:00.000Z",
    },
    {
      id: "gpg-audit-blocked-103",
      action: hrIndustryGpgAuditActions.assignmentBlocked,
      actorId: "user-payroll-02",
      targetType: "position_assignment",
      targetId: "gpg-assignment-103",
      employeeId: "emp-103",
      summary: "Blocked invalid grade and step assignment for Ivy Carter.",
      occurredAt: "2026-05-01T09:00:00.000Z",
    },
    {
      id: "gpg-audit-integration-001",
      action: hrIndustryGpgAuditActions.payrollReferenceExposed,
      actorId: "system",
      targetType: "integration",
      targetId: "gpg-integration-payroll-100",
      employeeId: "emp-100",
      summary:
        "Exposed approved grade, step, salary table, and locality reference to Payroll Processing.",
      occurredAt: "2026-05-31T08:00:00.000Z",
    },
  ]);

  return {
    classifications,
    payGrades,
    salaryTableVersions,
    localityAdjustmentRules,
    positionAssignments,
    stepEligibilityRules,
    stepIncreaseCandidates,
    gradeMovements,
    classificationReviews,
    integrationExposures,
    auditEvents,
  };
}

export function getHrIndustryGpgStore(
  organizationId: string,
): HrIndustryGpgStore {
  let store = stores.get(organizationId);
  if (!store) {
    store = createSeedStore(organizationId);
    stores.set(organizationId, store);
  }
  return store;
}

export function resetHrIndustryGpgStore(organizationId: string): void {
  stores.set(organizationId, createSeedStore(organizationId));
}

export function filterHrIndustryGpgRecordsForAccess(input: {
  readonly store: HrIndustryGpgStore;
  readonly visibleEmployeeIds: readonly string[] | null;
}): HrIndustryGpgStore {
  return {
    ...input.store,
    positionAssignments: scopedRows(
      input.store.positionAssignments,
      input.visibleEmployeeIds,
    ),
    stepIncreaseCandidates: scopedRows(
      input.store.stepIncreaseCandidates,
      input.visibleEmployeeIds,
    ),
    gradeMovements: scopedRows(
      input.store.gradeMovements,
      input.visibleEmployeeIds,
    ),
    auditEvents: input.store.auditEvents.filter((event) =>
      event.employeeId
        ? input.visibleEmployeeIds === null ||
          input.visibleEmployeeIds.includes(event.employeeId)
        : true,
    ),
  };
}

export function validateHrIndustryGpgAssignment(input: {
  readonly store: HrIndustryGpgStore;
  readonly classificationCode: string;
  readonly gradeCode: string;
  readonly stepCode: string;
  readonly salaryTableCode: string;
}) {
  const classification = input.store.classifications.find(
    (row) => row.classificationCode === input.classificationCode,
  );
  const grade = input.store.payGrades.find(
    (row) => row.gradeCode === input.gradeCode,
  );
  const salaryTable = input.store.salaryTableVersions.find(
    (row) =>
      row.salaryTableCode === input.salaryTableCode &&
      row.gradeCode === input.gradeCode &&
      row.stepCode === input.stepCode &&
      row.status === "published",
  );

  if (!classification) {
    return {
      status: "blocked" as const,
      message: "Classification does not exist.",
    };
  }
  if (!grade) {
    return {
      status: "blocked" as const,
      message: "Pay grade does not exist.",
    };
  }
  if (!salaryTable) {
    return {
      status: "blocked" as const,
      message: "Published salary table does not support the grade and step.",
    };
  }
  return {
    status: "valid" as const,
    message: "Classification, grade, step, and salary table align.",
  };
}

export function listHrIndustryGpgPayrollReferenceExports(
  store: HrIndustryGpgStore,
): HrGpgPayrollReferenceExport[] {
  return store.positionAssignments
    .filter((row) => row.validationStatus === "valid")
    .map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeDisplayName: row.employeeDisplayName,
      positionId: row.positionId,
      classificationCode: row.classificationCode,
      gradeCode: row.gradeCode,
      stepCode: row.stepCode,
      salaryTableCode: row.salaryTableCode,
      localityArea: row.localityArea,
      localityAdjustedPay: row.localityAdjustedPay,
      effectiveFrom: row.effectiveFrom,
      validationStatus: row.validationStatus,
    }));
}

export function listHrIndustryGpgLifecycleMovementRefs(
  store: HrIndustryGpgStore,
): HrGpgLifecycleMovementReference[] {
  return store.gradeMovements
    .filter((row) => row.status === "approved" || row.status === "processed")
    .map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeDisplayName: row.employeeDisplayName,
      movementType: row.movementType,
      fromGradeCode: row.fromGradeCode,
      toGradeCode: row.toGradeCode,
      effectiveDate: row.effectiveDate,
      ...(row.lifecycleRef ? { lifecycleRef: row.lifecycleRef } : {}),
    }));
}

export function listHrIndustryGpgStepIncreaseEligibilityRefs(
  store: HrIndustryGpgStore,
): HrGpgStepIncreaseEligibilityReference[] {
  return store.stepIncreaseCandidates.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeDisplayName: row.employeeDisplayName,
    gradeCode: row.gradeCode,
    currentStepCode: row.currentStepCode,
    nextStepCode: row.nextStepCode,
    eligibilityDate: row.eligibilityDate,
    eligibilityStatus: row.eligibilityStatus,
  }));
}

export function listHrIndustryGpgIntegrationExposureRefs(
  store: HrIndustryGpgStore,
): HrGpgIntegrationExposureReference[] {
  return store.integrationExposures.map((row) => ({
    id: row.id,
    integrationTarget: row.integrationTarget,
    sourceRef: row.sourceRef,
    approvedReference: row.approvedReference,
    status: row.status,
    exposedAt: row.exposedAt,
  }));
}

export function buildHrIndustryGpgReportRows(input: {
  readonly store: HrIndustryGpgStore;
  readonly groupBy: HrGpgReportGroupBy;
}): HrIndustryGpgReportRow[] {
  const rowsByGroup = new Map<string, HrGpgPositionAssignmentInput[]>();
  for (const assignment of input.store.positionAssignments) {
    const key = resolveReportGroupLabel(assignment, input.groupBy);
    rowsByGroup.set(key, [...(rowsByGroup.get(key) ?? []), assignment]);
  }

  return [...rowsByGroup.entries()].map(([groupLabel, assignments]) => {
    const gradeCodes = new Set(assignments.map((row) => row.gradeCode));
    const candidateEmployeeIds = new Set(
      assignments.map((row) => row.employeeId),
    );
    const publishedSalaryTableCount = input.store.salaryTableVersions.filter(
      (row) => gradeCodes.has(row.gradeCode) && row.status === "published",
    ).length;
    const eligibleStepCandidateCount =
      input.store.stepIncreaseCandidates.filter(
        (row) =>
          candidateEmployeeIds.has(row.employeeId) &&
          row.eligibilityStatus === "eligible",
      ).length;
    const pendingMovementCount = input.store.gradeMovements.filter(
      (row) =>
        candidateEmployeeIds.has(row.employeeId) &&
        row.status === "pending_approval",
    ).length;
    const blockedAssignmentCount = assignments.filter(
      (row) => row.validationStatus === "blocked",
    ).length;
    const totalAdjustedPay = assignments.reduce(
      (sum, row) => sum + row.localityAdjustedPay,
      0,
    );

    return {
      id: `gpg-report-${input.groupBy}-${groupLabel
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, "-")}`,
      groupLabel,
      assignmentCount: assignments.length,
      publishedSalaryTableCount,
      eligibleStepCandidateCount,
      pendingMovementCount,
      blockedAssignmentCount,
      averageLocalityAdjustedPay: roundMoney(
        totalAdjustedPay / assignments.length,
      ),
    };
  });
}

function resolveReportGroupLabel(
  assignment: HrGpgPositionAssignmentInput,
  groupBy: HrGpgReportGroupBy,
) {
  switch (groupBy) {
    case "classification":
      return assignment.classificationCode;
    case "grade":
      return assignment.gradeCode;
    case "step":
      return assignment.stepCode;
    case "pay_band":
      return assignment.payBandCode;
    case "agency":
      return assignment.agency;
    case "department":
      return assignment.department;
    case "locality":
      return assignment.localityArea;
    case "position":
      return assignment.positionTitle;
    case "effective_date":
      return assignment.effectiveFrom;
  }
}

export function emitHrIndustryGpgAuditEvent(
  store: HrIndustryGpgStore,
  input: Omit<HrIndustryGpgAuditEvent, "id" | "occurredAt">,
): HrIndustryGpgAuditEvent {
  const event: HrIndustryGpgAuditEvent = {
    ...input,
    id: `gpg-audit-${store.auditEvents.length + 1}`,
    occurredAt: new Date().toISOString(),
  };
  store.auditEvents.unshift(event);
  return event;
}
