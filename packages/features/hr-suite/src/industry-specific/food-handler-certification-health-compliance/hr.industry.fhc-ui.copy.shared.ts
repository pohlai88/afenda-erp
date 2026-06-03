import {
  HR_INDUSTRY_FHC_LIST_SURFACE_KEYS,
  hrIndustryFhcAlertsSurfaceKey,
  hrIndustryFhcAuditTrailSurfaceKey,
  hrIndustryFhcDutyRestrictionsSurfaceKey,
  hrIndustryFhcEmployeeComplianceSurfaceKey,
  hrIndustryFhcEvidenceSubmissionsSurfaceKey,
  hrIndustryFhcHealthCertificationsSurfaceKey,
  hrIndustryFhcIntegrationExposuresSurfaceKey,
  hrIndustryFhcPermitsSurfaceKey,
  hrIndustryFhcRenewalCasesSurfaceKey,
  hrIndustryFhcReportsSurfaceKey,
  hrIndustryFhcRequirementRulesSurfaceKey,
  hrIndustryFhcTrainingCompletionsSurfaceKey,
  type HrIndustryFhcListSurfaceKey,
} from "./hr.industry.fhc-surface-metadata.shared";

type ListCopy = {
  readonly title: string;
  readonly description: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
};

export const hrIndustryFhcUiCopy = {
  title: "Food Handler Certification & Health Compliance",
  description:
    "Governed food handler permits, health certifications, hygiene and allergen training, renewal, work eligibility, integration, reporting, and audit workspace.",
  page: {
    title: "Food Handler Certification & Health Compliance",
    description:
      "Track food service certification readiness while protecting medical fitness evidence behind restricted HR authorization.",
  },
  overview: {
    sectionTitle: "Food Handler Compliance Overview",
    requiredEmployees: "Required employees",
    eligibleEmployees: "Eligible",
    restrictedEmployees: "Restricted",
    expiringCertificates: "Expiring",
    overdueTraining: "Training overdue",
    openAlerts: "Open alerts",
  },
  accessDenied: {
    title: "Food Handler Compliance access required",
    description: "You do not have permission to view this HR workspace.",
  },
  listSections: {
    [hrIndustryFhcRequirementRulesSurfaceKey]: {
      title: "Certification Requirement Rules",
      description:
        "Food handler requirements by country, legal entity, outlet, role, department, employee category, and employment type.",
      emptyTitle: "No requirement rules",
      emptyDescription: "No food handler requirement rules match the filters.",
    },
    [hrIndustryFhcEmployeeComplianceSurfaceKey]: {
      title: "Employee Compliance & Eligibility",
      description:
        "Employees automatically identified for food handler certification with derived eligibility and exception flags.",
      emptyTitle: "No employee compliance rows",
      emptyDescription: "No employee compliance rows match the filters.",
    },
    [hrIndustryFhcPermitsSurfaceKey]: {
      title: "Food Handler Permits",
      description:
        "Permit number, issuing authority, issue date, expiry date, status, document reference, and renewal status.",
      emptyTitle: "No permits",
      emptyDescription: "No food handler permits match the filters.",
    },
    [hrIndustryFhcHealthCertificationsSurfaceKey]: {
      title: "Health Certifications",
      description:
        "Health and medical fitness certification records with sensitive details redacted unless authorized.",
      emptyTitle: "No health certifications",
      emptyDescription: "No health certification records match the filters.",
    },
    [hrIndustryFhcTrainingCompletionsSurfaceKey]: {
      title: "Food Safety & Allergen Training",
      description:
        "Food hygiene, safe handling, allergen awareness, allergen handling, and cross-contact training completion.",
      emptyTitle: "No training completions",
      emptyDescription: "No food safety or allergen training rows match the filters.",
    },
    [hrIndustryFhcEvidenceSubmissionsSurfaceKey]: {
      title: "Document Evidence Review",
      description:
        "Submitted, verified, rejected, and renewal-pending evidence linked to Document Management.",
      emptyTitle: "No evidence submissions",
      emptyDescription: "No certification evidence submissions match the filters.",
    },
    [hrIndustryFhcRenewalCasesSurfaceKey]: {
      title: "Renewal Tracking",
      description:
        "Permit and health certificate renewals from pending submission to verified renewal.",
      emptyTitle: "No renewal cases",
      emptyDescription: "No renewal cases match the filters.",
    },
    [hrIndustryFhcAlertsSurfaceKey]: {
      title: "Compliance Alerts",
      description:
        "Expiring permits, expired permits, missing health certification, missing certification, and overdue training alerts.",
      emptyTitle: "No alerts",
      emptyDescription: "No food handler compliance alerts match the filters.",
    },
    [hrIndustryFhcDutyRestrictionsSurfaceKey]: {
      title: "Duty Restrictions",
      description:
        "Temporary food handling duty restrictions for expired, missing, or rejected certification and health compliance.",
      emptyTitle: "No duty restrictions",
      emptyDescription: "No duty restrictions match the filters.",
    },
    [hrIndustryFhcIntegrationExposuresSurfaceKey]: {
      title: "Integration Exposures",
      description:
        "Eligibility, mandatory training completion, and learning requirement references exposed to authorized HR downstream modules.",
      emptyTitle: "No integration exposures",
      emptyDescription: "No integration exposure references are available.",
    },
    [hrIndustryFhcReportsSurfaceKey]: {
      title: "Compliance Reports",
      description:
        "Reports for expired permits, expiring permits, missing certifications, overdue training, and outlet readiness.",
      emptyTitle: "No report rows",
      emptyDescription: "No food handler compliance report rows match the filters.",
    },
    [hrIndustryFhcAuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Requirement setup, submission, verification, rejection, renewal, expiry alert, duty restriction, integration, and compliance review events.",
      emptyTitle: "No audit events",
      emptyDescription: "No food handler compliance audit events match the filters.",
    },
  } satisfies Record<HrIndustryFhcListSurfaceKey, ListCopy>,
} as const;

for (const key of HR_INDUSTRY_FHC_LIST_SURFACE_KEYS) {
  if (!(key in hrIndustryFhcUiCopy.listSections)) {
    throw new Error(`Missing FHC list copy for ${key}`);
  }
}
