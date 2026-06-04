import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../hr-suite-integration/metadata";

export const hrIndustryFhcOverviewKpiSurfaceKey =
  "hr.industry.fhc.overview.kpi" as const;
export const hrIndustryFhcRequirementRulesSurfaceKey =
  "hr.industry.fhc.requirement-rules.list" as const;
export const hrIndustryFhcEmployeeComplianceSurfaceKey =
  "hr.industry.fhc.employee-compliance.list" as const;
export const hrIndustryFhcPermitsSurfaceKey =
  "hr.industry.fhc.permits.list" as const;
export const hrIndustryFhcHealthCertificationsSurfaceKey =
  "hr.industry.fhc.health-certifications.list" as const;
export const hrIndustryFhcTrainingCompletionsSurfaceKey =
  "hr.industry.fhc.training-completions.list" as const;
export const hrIndustryFhcEvidenceSubmissionsSurfaceKey =
  "hr.industry.fhc.evidence-submissions.list" as const;
export const hrIndustryFhcRenewalCasesSurfaceKey =
  "hr.industry.fhc.renewal-cases.list" as const;
export const hrIndustryFhcAlertsSurfaceKey =
  "hr.industry.fhc.alerts.list" as const;
export const hrIndustryFhcDutyRestrictionsSurfaceKey =
  "hr.industry.fhc.duty-restrictions.list" as const;
export const hrIndustryFhcIntegrationExposuresSurfaceKey =
  "hr.industry.fhc.integration-exposures.list" as const;
export const hrIndustryFhcReportsSurfaceKey =
  "hr.industry.fhc.reports.list" as const;
export const hrIndustryFhcAuditTrailSurfaceKey =
  "hr.industry.fhc.audit-trail.list" as const;

export const HR_INDUSTRY_FHC_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrIndustryFhcRequirementRulesSurfaceKey,
      param: "fhcRequirementRulesSearch",
      modelField: "requirementRulesSearch",
      label: "Search requirement rules",
      placeholder: "Search country, outlet, role, department, and employee category rules",
      columns: [
        { id: "outletName", header: "Outlet", priority: "primary" },
        { id: "country", header: "Country" },
        { id: "legalEntity", header: "Legal entity" },
        { id: "roleName", header: "Role" },
        { id: "departmentName", header: "Department" },
        { id: "requirements", header: "Requirements" },
        { id: "renewalLeadDays", header: "Alert lead" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryFhcEmployeeComplianceSurfaceKey,
      param: "fhcEmployeeComplianceSearch",
      modelField: "employeeComplianceSearch",
      label: "Search employee compliance",
      placeholder: "Search employees, outlets, roles, managers, status, and flags",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "outletName", header: "Outlet" },
        { id: "roleName", header: "Role" },
        { id: "managerDisplayName", header: "Manager" },
        { id: "complianceStatus", header: "Compliance" },
        { id: "eligibilityStatus", header: "Eligibility" },
        { id: "flags", header: "Flags" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFhcPermitsSurfaceKey,
      param: "fhcPermitsSearch",
      modelField: "permitsSearch",
      label: "Search permits",
      placeholder: "Search food handler permit numbers, issuing authorities, employees, and status",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "permitNumber", header: "Permit no." },
        { id: "issuingAuthority", header: "Authority" },
        { id: "issueDate", header: "Issue date" },
        { id: "expiryDate", header: "Expiry" },
        { id: "status", header: "Status" },
        { id: "documentRef", header: "Document" },
      ],
    },
    {
      surfaceKey: hrIndustryFhcHealthCertificationsSurfaceKey,
      param: "fhcHealthCertificationsSearch",
      modelField: "healthCertificationsSearch",
      label: "Search health certificates",
      placeholder: "Search health certificates, providers, screening refs, and fitness status",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "providerName", header: "Provider" },
        { id: "screeningRef", header: "Screening" },
        { id: "medicalFitnessStatus", header: "Fitness" },
        { id: "expiryDate", header: "Expiry" },
        { id: "status", header: "Status" },
        { id: "documentRef", header: "Document" },
      ],
    },
    {
      surfaceKey: hrIndustryFhcTrainingCompletionsSurfaceKey,
      param: "fhcTrainingSearch",
      modelField: "trainingCompletionsSearch",
      label: "Search training",
      placeholder: "Search food hygiene, safe handling, allergen, and cross-contact training",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "trainingType", header: "Training" },
        { id: "requirementRef", header: "Requirement" },
        { id: "dueDate", header: "Due" },
        { id: "completedAt", header: "Completed" },
        { id: "status", header: "Status" },
        { id: "evidenceDocumentRef", header: "Evidence" },
      ],
    },
    {
      surfaceKey: hrIndustryFhcEvidenceSubmissionsSurfaceKey,
      param: "fhcEvidenceSearch",
      modelField: "evidenceSubmissionsSearch",
      label: "Search evidence",
      placeholder: "Search submitted, verified, rejected, and renewal-pending evidence",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "evidenceType", header: "Evidence" },
        { id: "targetRef", header: "Target" },
        { id: "documentRef", header: "Document" },
        { id: "submittedAt", header: "Submitted" },
        { id: "status", header: "Status" },
        { id: "decision", header: "Decision" },
      ],
    },
    {
      surfaceKey: hrIndustryFhcRenewalCasesSurfaceKey,
      param: "fhcRenewalsSearch",
      modelField: "renewalCasesSearch",
      label: "Search renewals",
      placeholder: "Search permit and health certificate renewal cases",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "certificateType", header: "Certificate" },
        { id: "targetRef", header: "Target" },
        { id: "dueDate", header: "Due" },
        { id: "submittedAt", header: "Submitted" },
        { id: "verifiedAt", header: "Verified" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryFhcAlertsSurfaceKey,
      param: "fhcAlertsSearch",
      modelField: "alertsSearch",
      label: "Search alerts",
      placeholder: "Search expiring permits, missing health certification, and overdue training alerts",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "alertType", header: "Alert" },
        { id: "severity", header: "Severity" },
        { id: "status", header: "Status" },
        { id: "targetRef", header: "Target" },
        { id: "dueDate", header: "Due" },
        { id: "generatedAt", header: "Generated" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFhcDutyRestrictionsSurfaceKey,
      param: "fhcRestrictionsSearch",
      modelField: "dutyRestrictionsSearch",
      label: "Search duty restrictions",
      placeholder: "Search temporary food handling duty restrictions",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "reason", header: "Reason" },
        { id: "effectiveFrom", header: "From" },
        { id: "effectiveTo", header: "To" },
        { id: "status", header: "Status" },
        { id: "reviewerEmployeeId", header: "Reviewer" },
        { id: "shiftSchedulingRef", header: "Shift ref" },
      ],
    },
    {
      surfaceKey: hrIndustryFhcIntegrationExposuresSurfaceKey,
      param: "fhcIntegrationsSearch",
      modelField: "integrationExposuresSearch",
      label: "Search integrations",
      placeholder: "Search Shift Scheduling, Compliance, LMS, and Training exposure refs",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "integrationTarget", header: "Target" },
        { id: "sourceRef", header: "Source" },
        { id: "status", header: "Status" },
        { id: "exposedAt", header: "Exposed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFhcReportsSurfaceKey,
      param: "fhcReportsSearch",
      modelField: "reportsSearch",
      label: "Search reports",
      placeholder: "Search outlet, role, department, manager, legal entity, and status report rows",
      columns: [
        { id: "groupLabel", header: "Group", priority: "primary" },
        { id: "requiredEmployeeCount", header: "Required" },
        { id: "compliantCount", header: "Compliant" },
        { id: "expiredPermitCount", header: "Expired" },
        { id: "expiringPermitCount", header: "Expiring" },
        { id: "missingCertificationCount", header: "Missing" },
        { id: "overdueTrainingCount", header: "Training overdue" },
        { id: "outletReadinessPercent", header: "Readiness" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryFhcAuditTrailSurfaceKey,
      param: "fhcAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search audit trail",
      placeholder: "Search setup, submission, verification, rejection, renewal, alert, restriction, and review events",
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

export const HR_INDUSTRY_FHC_LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(HR_INDUSTRY_FHC_LIST_SURFACE_REGISTRY);

export type HrIndustryFhcListSurfaceKey =
  (typeof HR_INDUSTRY_FHC_LIST_SURFACE_KEYS)[number];

export const HR_INDUSTRY_FHC_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(HR_INDUSTRY_FHC_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_FHC_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(HR_INDUSTRY_FHC_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_FHC_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_INDUSTRY_FHC_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_FHC_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(HR_INDUSTRY_FHC_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_FHC_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrIndustryFhcRequirementRulesSurfaceKey]: "erp-operational-table",
  [hrIndustryFhcEmployeeComplianceSurfaceKey]: "erp-exception-table",
  [hrIndustryFhcPermitsSurfaceKey]: "erp-operational-table",
  [hrIndustryFhcHealthCertificationsSurfaceKey]: "erp-exception-table",
  [hrIndustryFhcTrainingCompletionsSurfaceKey]: "erp-exception-table",
  [hrIndustryFhcEvidenceSubmissionsSurfaceKey]: "erp-analytical-table",
  [hrIndustryFhcRenewalCasesSurfaceKey]: "erp-exception-table",
  [hrIndustryFhcAlertsSurfaceKey]: "erp-exception-table",
  [hrIndustryFhcDutyRestrictionsSurfaceKey]: "erp-exception-table",
  [hrIndustryFhcIntegrationExposuresSurfaceKey]: "erp-analytical-table",
  [hrIndustryFhcReportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryFhcAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrIndustryFhcListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrIndustryFhcListSurfaceKeys(): readonly HrIndustryFhcListSurfaceKey[] {
  return HR_INDUSTRY_FHC_LIST_SURFACE_KEYS;
}

export const hrIndustryFhcWorkbenchSurfaceKey =
  hrIndustryFhcEmployeeComplianceSurfaceKey;
