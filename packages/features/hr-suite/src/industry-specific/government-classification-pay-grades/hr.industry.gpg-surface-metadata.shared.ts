import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../employee-management/compliance-regulatory-tracking/metadata";

export const hrIndustryGpgOverviewKpiSurfaceKey =
  "hr.industry.gpg.overview.kpi" as const;
export const hrIndustryGpgClassificationsSurfaceKey =
  "hr.industry.gpg.classifications.list" as const;
export const hrIndustryGpgPayGradesSurfaceKey =
  "hr.industry.gpg.pay-grades.list" as const;
export const hrIndustryGpgSalaryTablesSurfaceKey =
  "hr.industry.gpg.salary-tables.list" as const;
export const hrIndustryGpgLocalityAdjustmentsSurfaceKey =
  "hr.industry.gpg.locality-adjustments.list" as const;
export const hrIndustryGpgClassificationAssignmentsSurfaceKey =
  "hr.industry.gpg.classification-assignments.list" as const;
export const hrIndustryGpgStepEligibilityRulesSurfaceKey =
  "hr.industry.gpg.step-eligibility-rules.list" as const;
export const hrIndustryGpgStepIncreaseCandidatesSurfaceKey =
  "hr.industry.gpg.step-increase-candidates.list" as const;
export const hrIndustryGpgGradeMovementsSurfaceKey =
  "hr.industry.gpg.grade-movements.list" as const;
export const hrIndustryGpgClassificationReviewsSurfaceKey =
  "hr.industry.gpg.classification-reviews.list" as const;
export const hrIndustryGpgReportsSurfaceKey =
  "hr.industry.gpg.reports.list" as const;
export const hrIndustryGpgIntegrationExposuresSurfaceKey =
  "hr.industry.gpg.integration-exposures.list" as const;
export const hrIndustryGpgAuditTrailSurfaceKey =
  "hr.industry.gpg.audit-trail.list" as const;

export const HR_INDUSTRY_GPG_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrIndustryGpgClassificationsSurfaceKey,
      param: "gpgClassificationsSearch",
      modelField: "classificationsSearch",
      label: "Search classifications",
      placeholder:
        "Search occupational groups, job series, schemes, families, agencies, departments, and positions",
      columns: [
        {
          id: "classificationCode",
          header: "Classification",
          priority: "primary",
        },
        { id: "classificationName", header: "Name" },
        { id: "jobSeries", header: "Series" },
        { id: "serviceScheme", header: "Scheme" },
        { id: "agencyName", header: "Agency" },
        { id: "departmentName", header: "Department" },
        { id: "reference", header: "Reference" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryGpgPayGradesSurfaceKey,
      param: "gpgPayGradesSearch",
      modelField: "payGradesSearch",
      label: "Search pay grades",
      placeholder: "Search grades, bands, rank references, and salary ranges",
      columns: [
        { id: "gradeCode", header: "Grade", priority: "primary" },
        { id: "gradeName", header: "Name" },
        { id: "payBandCode", header: "Pay band" },
        { id: "rankReference", header: "Rank" },
        { id: "salaryRange", header: "Range" },
        { id: "stepCount", header: "Steps" },
        { id: "effectiveDate", header: "Effective" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryGpgSalaryTablesSurfaceKey,
      param: "gpgSalaryTablesSearch",
      modelField: "salaryTablesSearch",
      label: "Search salary tables",
      placeholder:
        "Search table code, version, grade, step, status, and effective dates",
      columns: [
        { id: "salaryTableCode", header: "Table", priority: "primary" },
        { id: "version", header: "Version" },
        { id: "gradeCode", header: "Grade" },
        { id: "stepCode", header: "Step" },
        { id: "baseRate", header: "Base rate" },
        { id: "salaryRange", header: "Range" },
        { id: "effectiveDate", header: "Effective" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryGpgLocalityAdjustmentsSurfaceKey,
      param: "gpgLocalitySearch",
      modelField: "localityAdjustmentsSearch",
      label: "Search locality adjustments",
      placeholder:
        "Search locality areas, regions, countries, cities, duty stations, and allowances",
      columns: [
        { id: "localityArea", header: "Locality", priority: "primary" },
        { id: "region", header: "Region" },
        { id: "country", header: "Country" },
        { id: "city", header: "City" },
        { id: "dutyStation", header: "Duty station" },
        { id: "adjustmentType", header: "Type" },
        { id: "adjustmentRate", header: "Rate" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryGpgClassificationAssignmentsSurfaceKey,
      param: "gpgClassificationAssignmentsSearch",
      modelField: "classificationAssignmentsSearch",
      label: "Search classification assignments",
      placeholder:
        "Search employees, positions, classifications, grades, steps, agencies, and departments",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "positionTitle", header: "Position" },
        { id: "classificationCode", header: "Classification" },
        { id: "gradeStep", header: "Grade / step" },
        { id: "agencyName", header: "Agency" },
        { id: "departmentName", header: "Department" },
        { id: "effectiveDate", header: "Effective" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryGpgStepEligibilityRulesSurfaceKey,
      param: "gpgStepRulesSearch",
      modelField: "stepEligibilityRulesSearch",
      label: "Search step eligibility rules",
      placeholder:
        "Search grade, step, appointment type, performance reference, and processing mode",
      columns: [
        { id: "gradeStep", header: "Grade / step", priority: "primary" },
        { id: "nextStepCode", header: "Next step" },
        { id: "appointmentType", header: "Appointment" },
        { id: "waitingPeriod", header: "Waiting period" },
        { id: "performanceReference", header: "Performance" },
        { id: "processingMode", header: "Mode" },
        { id: "effectiveDate", header: "Effective" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryGpgStepIncreaseCandidatesSurfaceKey,
      param: "gpgStepCandidatesSearch",
      modelField: "stepIncreaseCandidatesSearch",
      label: "Search step candidates",
      placeholder:
        "Search eligible employees, grade, step, eligibility date, and processing mode",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "gradeCode", header: "Grade" },
        { id: "currentStepCode", header: "Current" },
        { id: "nextStepCode", header: "Next" },
        { id: "serviceMonths", header: "Service" },
        { id: "eligibilityDate", header: "Eligible" },
        { id: "processingMode", header: "Mode" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryGpgGradeMovementsSurfaceKey,
      param: "gpgGradeMovementsSearch",
      modelField: "gradeMovementsSearch",
      label: "Search grade movements",
      placeholder:
        "Search promotions, reclassifications, downgrades, retention, and acting grades",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "movementType", header: "Movement" },
        { id: "fromGradeStep", header: "From" },
        { id: "toGradeStep", header: "To" },
        { id: "effectiveDate", header: "Effective" },
        { id: "reason", header: "Reason" },
        { id: "reference", header: "Reference" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryGpgClassificationReviewsSurfaceKey,
      param: "gpgReviewsSearch",
      modelField: "classificationReviewsSearch",
      label: "Search classification reviews",
      placeholder:
        "Search classification reviews, corrections, appeals, and reclassification requests",
      columns: [
        {
          id: "classificationCode",
          header: "Classification",
          priority: "primary",
        },
        { id: "positionId", header: "Position" },
        { id: "reviewType", header: "Type" },
        { id: "requestedBy", header: "Requested by" },
        { id: "effectiveDate", header: "Effective" },
        { id: "outcomeRef", header: "Outcome" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryGpgReportsSurfaceKey,
      param: "gpgReportsSearch",
      modelField: "reportsSearch",
      label: "Search reports",
      placeholder:
        "Search classification, grade, step, pay band, agency, department, locality, position, and effective date reports",
      columns: [
        { id: "groupLabel", header: "Group", priority: "primary" },
        { id: "assignmentCount", header: "Assignments" },
        { id: "publishedSalaryTableCount", header: "Tables" },
        { id: "eligibleStepCandidateCount", header: "Step eligible" },
        { id: "pendingMovementCount", header: "Pending" },
        { id: "blockedAssignmentCount", header: "Blocked" },
        { id: "averageLocalityAdjustedPay", header: "Avg adjusted pay" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryGpgIntegrationExposuresSurfaceKey,
      param: "gpgIntegrationsSearch",
      modelField: "integrationExposuresSearch",
      label: "Search integration exposures",
      placeholder: "Search payroll and employee lifecycle reference exposures",
      columns: [
        { id: "integrationTarget", header: "Target", priority: "primary" },
        { id: "sourceRef", header: "Source" },
        { id: "approvedReference", header: "Approved ref" },
        { id: "status", header: "Status" },
        { id: "exposedAt", header: "Exposed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryGpgAuditTrailSurfaceKey,
      param: "gpgAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search audit trail",
      placeholder:
        "Search classification setup, salary setup, assignments, movements, approvals, and integrations",
      columns: [
        { id: "summary", header: "Summary", priority: "primary" },
        { id: "action", header: "Action" },
        { id: "actorId", header: "Actor" },
        { id: "targetType", header: "Target" },
        { id: "employeeId", header: "Employee" },
        { id: "occurredAt", header: "Occurred" },
      ],
      readOnly: true,
    },
  ] as const);

export const HR_INDUSTRY_GPG_LIST_SURFACE_KEYS = buildHrSuiteListSurfaceKeys(
  HR_INDUSTRY_GPG_LIST_SURFACE_REGISTRY,
);

export type HrIndustryGpgListSurfaceKey =
  (typeof HR_INDUSTRY_GPG_LIST_SURFACE_KEYS)[number];

export const HR_INDUSTRY_GPG_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(HR_INDUSTRY_GPG_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_GPG_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(HR_INDUSTRY_GPG_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_GPG_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_INDUSTRY_GPG_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_GPG_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(HR_INDUSTRY_GPG_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_GPG_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrIndustryGpgClassificationsSurfaceKey]: "erp-operational-table",
  [hrIndustryGpgPayGradesSurfaceKey]: "erp-operational-table",
  [hrIndustryGpgSalaryTablesSurfaceKey]: "erp-analytical-table",
  [hrIndustryGpgLocalityAdjustmentsSurfaceKey]: "erp-operational-table",
  [hrIndustryGpgClassificationAssignmentsSurfaceKey]: "erp-exception-table",
  [hrIndustryGpgStepEligibilityRulesSurfaceKey]: "erp-operational-table",
  [hrIndustryGpgStepIncreaseCandidatesSurfaceKey]: "erp-exception-table",
  [hrIndustryGpgGradeMovementsSurfaceKey]: "erp-operational-table",
  [hrIndustryGpgClassificationReviewsSurfaceKey]: "erp-exception-table",
  [hrIndustryGpgReportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryGpgIntegrationExposuresSurfaceKey]: "erp-analytical-table",
  [hrIndustryGpgAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrIndustryGpgListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrIndustryGpgListSurfaceKeys(): readonly HrIndustryGpgListSurfaceKey[] {
  return HR_INDUSTRY_GPG_LIST_SURFACE_KEYS;
}

export const hrIndustryGpgWorkbenchSurfaceKey =
  hrIndustryGpgClassificationAssignmentsSurfaceKey;
