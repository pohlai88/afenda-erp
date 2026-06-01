import {
  hrIndustryMscAuditTrailSurfaceKey,
  hrIndustryMscCertificationsSurfaceKey,
  hrIndustryMscCorrectiveActionsSurfaceKey,
  hrIndustryMscEmployeeObligationsSurfaceKey,
  hrIndustryMscEvidenceLinksSurfaceKey,
  hrIndustryMscHazardAssessmentsSurfaceKey,
  hrIndustryMscIncidentsSurfaceKey,
  hrIndustryMscIntegrationExposuresSurfaceKey,
  hrIndustryMscNotificationsSurfaceKey,
  hrIndustryMscReportsSurfaceKey,
  hrIndustryMscRequirementsSurfaceKey,
  hrIndustryMscTrainingAssignmentsSurfaceKey,
  hrIndustryMscWorkRestrictionsSurfaceKey,
  type HrIndustryMscListSurfaceKey,
} from "./hr.industry.msc-surface-metadata.shared";

export const hrIndustryMscUiCopy = {
  title: "Manufacturing Safety Training & OSHA Compliance",
  description:
    "Control manufacturing safety training, OSHA or local OSH references, PPE acknowledgments, hazard assessments, incidents, corrective actions, restrictions, reports, and audit readiness.",
  page: {
    title: "Manufacturing Safety Training & OSHA Compliance",
    description:
      "Manufacturing safety requirements, training completion, certifications, hazard assessments, incident references, restrictions, and compliance-ready evidence.",
  },
  overview: {
    sectionTitle: "Safety Compliance Control",
    requiredTraining: "Required training",
    overdueTraining: "Overdue training",
    expiringCertifications: "Expiring certs",
    activeRestrictions: "Restrictions",
    openIncidents: "Open incidents",
    overdueActions: "Overdue actions",
  },
  listSections: {
    [hrIndustryMscRequirementsSurfaceKey]: {
      title: "Safety Training Requirements",
      description:
        "Mandatory manufacturing safety training rules by legal entity, country, site, department, role, machine, work area, risk, and OSHA or local OSH reference.",
      emptyTitle: "No safety requirements",
      emptyDescription:
        "Configure safety training requirements before resolving employee obligations.",
    },
    [hrIndustryMscEmployeeObligationsSurfaceKey]: {
      title: "Employee Safety Obligations",
      description:
        "Employees automatically identified for mandatory training based on role, site, machine assignment, work area, and hazard exposure.",
      emptyTitle: "No employee safety obligations",
      emptyDescription:
        "Employee obligations appear after role, site, machine, and exposure inputs are evaluated.",
    },
    [hrIndustryMscTrainingAssignmentsSurfaceKey]: {
      title: "Training Completion Status",
      description:
        "Assigned, completed, overdue, expired, failed, renewed, waived, and PPE acknowledgment training records.",
      emptyTitle: "No training assignments",
      emptyDescription:
        "Training assignments are generated from safety requirements and employee exposure profiles.",
    },
    [hrIndustryMscCertificationsSurfaceKey]: {
      title: "Safety Certifications",
      description:
        "Safety certification issue, expiry, renewal, machine or area authorization, issuing authority, and evidence references.",
      emptyTitle: "No safety certifications",
      emptyDescription:
        "Record forklift, machine authorization, chemical handling, first-aid, and other safety certifications here.",
    },
    [hrIndustryMscWorkRestrictionsSurfaceKey]: {
      title: "Work Restrictions",
      description:
        "Restrictions preventing or flagging assignments to unsafe machines, work areas, or duties when training or certification is incomplete.",
      emptyTitle: "No work restrictions",
      emptyDescription:
        "Restrictions appear when required training, PPE acknowledgment, certification, or incident controls are missing.",
    },
    [hrIndustryMscHazardAssessmentsSurfaceKey]: {
      title: "Hazard Assessments and JHAs",
      description:
        "Workplace hazard assessments, PPE hazard assessments, and job hazard analysis by site, work area, machine, role, task, risk, and lifecycle status.",
      emptyTitle: "No hazard assessments",
      emptyDescription:
        "Maintain workplace hazard, PPE hazard, and job hazard analysis records for manufacturing safety controls.",
    },
    [hrIndustryMscIncidentsSurfaceKey]: {
      title: "Incident Reporting References",
      description:
        "Workplace injury, near miss, unsafe condition, property damage, exposure event, safety observation, OSHA 300/300A/301 references, and evidence.",
      emptyTitle: "No incident records",
      emptyDescription:
        "Incident references remain tenant scoped and sensitive fields are redacted without restricted read access.",
    },
    [hrIndustryMscCorrectiveActionsSurfaceKey]: {
      title: "Corrective Actions",
      description:
        "Corrective actions from incidents, hazards, training gaps, and audit findings with owner, due date, priority, status, and evidence.",
      emptyTitle: "No corrective actions",
      emptyDescription:
        "Create corrective actions from safety findings, incidents, training gaps, or audit observations.",
    },
    [hrIndustryMscNotificationsSurfaceKey]: {
      title: "Safety Notifications",
      description:
        "Overdue training, expiring certification, reported incident, and overdue corrective action notifications for HR, safety officers, managers, and compliance users.",
      emptyTitle: "No notifications",
      emptyDescription:
        "Notifications are generated when safety training, certifications, incidents, or corrective actions need attention.",
    },
    [hrIndustryMscEvidenceLinksSurfaceKey]: {
      title: "Document Evidence Links",
      description:
        "Training proof, attendance sheets, certificates, PPE acknowledgments, incident evidence, hazard assessment evidence, and corrective action evidence linked to Document Management.",
      emptyTitle: "No evidence links",
      emptyDescription:
        "Evidence links store document references only; Document Management owns storage and retrieval.",
    },
    [hrIndustryMscReportsSurfaceKey]: {
      title: "Safety Compliance Reports",
      description:
        "Server-windowed reports for training completion, overdue training, certification expiry, incidents, OSHA log references, hazard assessments, and corrective actions.",
      emptyTitle: "No report rows",
      emptyDescription:
        "Reports are generated from tenant-scoped safety requirements, employee obligations, incidents, and corrective actions.",
    },
    [hrIndustryMscIntegrationExposuresSurfaceKey]: {
      title: "Integration Exposures",
      description:
        "Safety completion, learning requirement, scheduling restriction, compliance, and document references exposed to authorized downstream modules.",
      emptyTitle: "No integration exposures",
      emptyDescription:
        "Downstream references are exposed only when integration exposure access is granted.",
    },
    [hrIndustryMscAuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Trace requirement setup, assignment, completion, certificate renewal, incident report, hazard assessment, corrective action, restriction, report, and compliance review actions.",
      emptyTitle: "No audit events",
      emptyDescription:
        "Every controlled setup, completion, incident, review, restriction, report, and integration action writes an audit event.",
    },
  } satisfies Record<
    HrIndustryMscListSurfaceKey,
    {
      readonly title: string;
      readonly description: string;
      readonly emptyTitle: string;
      readonly emptyDescription: string;
    }
  >,
  workbench: {
    title: "Employee Safety Obligations",
    description:
      "Employees automatically identified for mandatory training based on role, site, machine assignment, work area, and hazard exposure.",
  },
  accessDenied: {
    title: "Manufacturing safety access required",
    description:
      "You do not have permission to view this manufacturing safety compliance workspace.",
  },
} as const;
