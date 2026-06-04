import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../hr-suite-integration/metadata";

export const hrIndustryMscOverviewKpiSurfaceKey =
  "hr.industry.msc.overview.kpi" as const;
export const hrIndustryMscRequirementsSurfaceKey =
  "hr.industry.msc.requirements.list" as const;
export const hrIndustryMscEmployeeObligationsSurfaceKey =
  "hr.industry.msc.employee-obligations.list" as const;
export const hrIndustryMscTrainingAssignmentsSurfaceKey =
  "hr.industry.msc.training-assignments.list" as const;
export const hrIndustryMscCertificationsSurfaceKey =
  "hr.industry.msc.certifications.list" as const;
export const hrIndustryMscWorkRestrictionsSurfaceKey =
  "hr.industry.msc.work-restrictions.list" as const;
export const hrIndustryMscHazardAssessmentsSurfaceKey =
  "hr.industry.msc.hazard-assessments.list" as const;
export const hrIndustryMscIncidentsSurfaceKey =
  "hr.industry.msc.incidents.list" as const;
export const hrIndustryMscCorrectiveActionsSurfaceKey =
  "hr.industry.msc.corrective-actions.list" as const;
export const hrIndustryMscNotificationsSurfaceKey =
  "hr.industry.msc.notifications.list" as const;
export const hrIndustryMscEvidenceLinksSurfaceKey =
  "hr.industry.msc.evidence-links.list" as const;
export const hrIndustryMscReportsSurfaceKey =
  "hr.industry.msc.reports.list" as const;
export const hrIndustryMscIntegrationExposuresSurfaceKey =
  "hr.industry.msc.integration-exposures.list" as const;
export const hrIndustryMscAuditTrailSurfaceKey =
  "hr.industry.msc.audit-trail.list" as const;

export const HR_INDUSTRY_MSC_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrIndustryMscRequirementsSurfaceKey,
      param: "mscRequirementsSearch",
      modelField: "requirementsSearch",
      label: "Search safety requirements",
      placeholder:
        "Search legal entity, site, department, role, machine, work area, risk, training type, and OSHA or OSH references",
      columns: [
        { id: "requirement", header: "Requirement", priority: "primary" },
        { id: "site", header: "Site" },
        { id: "departmentRole", header: "Department / role" },
        { id: "machineWorkArea", header: "Machine / area" },
        { id: "trainingType", header: "Training" },
        { id: "riskCategory", header: "Risk" },
        { id: "complianceReference", header: "Reference" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryMscEmployeeObligationsSurfaceKey,
      param: "mscEmployeeObligationsSearch",
      modelField: "employeeObligationsSearch",
      label: "Search employee safety obligations",
      placeholder:
        "Search employees, sites, roles, managers, machines, hazard exposure, eligibility, and safety flags",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "siteName", header: "Site" },
        { id: "departmentRole", header: "Department / role" },
        { id: "managerDisplayName", header: "Manager" },
        { id: "requiredTraining", header: "Required training" },
        { id: "riskLevel", header: "Risk" },
        { id: "eligibilityStatus", header: "Eligibility" },
        { id: "flags", header: "Flags" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryMscTrainingAssignmentsSurfaceKey,
      param: "mscTrainingAssignmentsSearch",
      modelField: "trainingAssignmentsSearch",
      label: "Search training assignments",
      placeholder:
        "Search mandatory training, PPE acknowledgments, due dates, completion, and evidence references",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "trainingType", header: "Training" },
        { id: "assignedAt", header: "Assigned" },
        { id: "dueDate", header: "Due" },
        { id: "completedAt", header: "Completed" },
        { id: "evidence", header: "Evidence" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryMscCertificationsSurfaceKey,
      param: "mscCertificationsSearch",
      modelField: "certificationsSearch",
      label: "Search safety certifications",
      placeholder:
        "Search forklift, machine authorization, chemical handling, first-aid, issue, expiry, renewal, and evidence",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "certificationType", header: "Certification" },
        { id: "machineWorkArea", header: "Machine / area" },
        { id: "issuingAuthority", header: "Authority" },
        { id: "issueDate", header: "Issued" },
        { id: "expiryDate", header: "Expires" },
        { id: "renewalDate", header: "Renewal" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryMscWorkRestrictionsSurfaceKey,
      param: "mscWorkRestrictionsSearch",
      modelField: "workRestrictionsSearch",
      label: "Search work restrictions",
      placeholder:
        "Search restricted employees, machine, work area, duty, reason, status, and scheduling reference",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "restrictionScope", header: "Scope" },
        { id: "restrictionTarget", header: "Target" },
        { id: "reason", header: "Reason" },
        { id: "effectiveFrom", header: "Effective" },
        { id: "shiftSchedulingRef", header: "Scheduling ref" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryMscHazardAssessmentsSurfaceKey,
      param: "mscHazardAssessmentsSearch",
      modelField: "hazardAssessmentsSearch",
      label: "Search hazard assessments",
      placeholder:
        "Search workplace hazards, PPE assessments, JHAs, sites, tasks, machines, controls, risk, and status",
      columns: [
        { id: "assessmentType", header: "Assessment", priority: "primary" },
        { id: "siteWorkArea", header: "Site / area" },
        { id: "departmentName", header: "Department" },
        { id: "roleTask", header: "Role / task" },
        { id: "machineName", header: "Machine" },
        { id: "riskLevel", header: "Risk" },
        { id: "controls", header: "Controls" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryMscIncidentsSurfaceKey,
      param: "mscIncidentsSearch",
      modelField: "incidentsSearch",
      label: "Search incidents",
      placeholder:
        "Search incident date, site, department, employee, type, severity, OSHA references, evidence, and status",
      columns: [
        { id: "incidentDate", header: "Incident date", priority: "primary" },
        { id: "siteDepartment", header: "Site / department" },
        { id: "employeeDisplayName", header: "Employee" },
        { id: "incidentType", header: "Type" },
        { id: "severity", header: "Severity" },
        { id: "description", header: "Description" },
        { id: "oshaRefs", header: "OSHA refs" },
        { id: "status", header: "Status", priority: "secondary" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryMscCorrectiveActionsSurfaceKey,
      param: "mscCorrectiveActionsSearch",
      modelField: "correctiveActionsSearch",
      label: "Search corrective actions",
      placeholder:
        "Search corrective action source, owner, due date, priority, evidence, and completion status",
      columns: [
        { id: "source", header: "Source", priority: "primary" },
        { id: "ownerDisplayName", header: "Owner" },
        { id: "dueDate", header: "Due" },
        { id: "priority", header: "Priority" },
        { id: "evidence", header: "Evidence" },
        { id: "completedAt", header: "Completed" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrIndustryMscNotificationsSurfaceKey,
      param: "mscNotificationsSearch",
      modelField: "notificationsSearch",
      label: "Search notifications",
      placeholder:
        "Search overdue training, expiring certification, incident, corrective action notifications, recipients, and status",
      columns: [
        { id: "notificationType", header: "Notification", priority: "primary" },
        { id: "employeeDisplayName", header: "Employee" },
        { id: "recipients", header: "Recipients" },
        { id: "targetRef", header: "Target" },
        { id: "dueDate", header: "Due" },
        { id: "generatedAt", header: "Generated" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryMscEvidenceLinksSurfaceKey,
      param: "mscEvidenceLinksSearch",
      modelField: "evidenceLinksSearch",
      label: "Search evidence links",
      placeholder:
        "Search training proof, attendance sheets, certificates, PPE acknowledgments, incident evidence, and document references",
      columns: [
        { id: "evidenceType", header: "Evidence", priority: "primary" },
        { id: "employeeDisplayName", header: "Employee" },
        { id: "targetRef", header: "Target" },
        { id: "documentRef", header: "Document" },
        { id: "documentManagementRef", header: "Document Mgmt" },
        { id: "linkedAt", header: "Linked" },
        { id: "linkedBy", header: "Linked by" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryMscReportsSurfaceKey,
      param: "mscReportsSearch",
      modelField: "reportsSearch",
      label: "Search safety reports",
      placeholder:
        "Search reports by site, department, role, manager, training type, incident type, hazard status, and risk level",
      columns: [
        { id: "groupLabel", header: "Group", priority: "primary" },
        { id: "requiredEmployeeCount", header: "Employees" },
        { id: "overdueTrainingCount", header: "Overdue training" },
        { id: "expiringCertificationCount", header: "Expiring certs" },
        { id: "incidentCount", header: "Incidents" },
        { id: "openCorrectiveActionCount", header: "Open actions" },
        { id: "restrictionCount", header: "Restrictions" },
        { id: "readinessPercent", header: "Readiness" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryMscIntegrationExposuresSurfaceKey,
      param: "mscIntegrationsSearch",
      modelField: "integrationExposuresSearch",
      label: "Search integration exposures",
      placeholder:
        "Search compliance, LMS, Training & Development, Shift Scheduling, and Document Management references",
      columns: [
        { id: "integrationTarget", header: "Target", priority: "primary" },
        { id: "employeeDisplayName", header: "Employee" },
        { id: "sourceRef", header: "Source" },
        { id: "summary", header: "Summary" },
        { id: "exposedAt", header: "Exposed" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrIndustryMscAuditTrailSurfaceKey,
      param: "mscAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search audit trail",
      placeholder:
        "Search requirement setup, assignment, completion, renewal, incident, hazard assessment, corrective action, restriction, report, and compliance review events",
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

export const HR_INDUSTRY_MSC_LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(HR_INDUSTRY_MSC_LIST_SURFACE_REGISTRY);

export type HrIndustryMscListSurfaceKey =
  (typeof HR_INDUSTRY_MSC_LIST_SURFACE_KEYS)[number];

export const HR_INDUSTRY_MSC_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(HR_INDUSTRY_MSC_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_MSC_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(HR_INDUSTRY_MSC_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_MSC_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(HR_INDUSTRY_MSC_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_MSC_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(HR_INDUSTRY_MSC_LIST_SURFACE_REGISTRY);

export const HR_INDUSTRY_MSC_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrIndustryMscRequirementsSurfaceKey]: "erp-operational-table",
  [hrIndustryMscEmployeeObligationsSurfaceKey]: "erp-exception-table",
  [hrIndustryMscTrainingAssignmentsSurfaceKey]: "erp-exception-table",
  [hrIndustryMscCertificationsSurfaceKey]: "erp-exception-table",
  [hrIndustryMscWorkRestrictionsSurfaceKey]: "erp-exception-table",
  [hrIndustryMscHazardAssessmentsSurfaceKey]: "erp-operational-table",
  [hrIndustryMscIncidentsSurfaceKey]: "erp-exception-table",
  [hrIndustryMscCorrectiveActionsSurfaceKey]: "erp-exception-table",
  [hrIndustryMscNotificationsSurfaceKey]: "erp-operational-table",
  [hrIndustryMscEvidenceLinksSurfaceKey]: "erp-audit-ledger",
  [hrIndustryMscReportsSurfaceKey]: "erp-analytical-table",
  [hrIndustryMscIntegrationExposuresSurfaceKey]: "erp-analytical-table",
  [hrIndustryMscAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  HrIndustryMscListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function getHrIndustryMscListSurfaceKeys(): readonly HrIndustryMscListSurfaceKey[] {
  return HR_INDUSTRY_MSC_LIST_SURFACE_KEYS;
}

export const hrIndustryMscWorkbenchSurfaceKey =
  hrIndustryMscEmployeeObligationsSurfaceKey;
