import {
  hrIndustryGpgAuditTrailSurfaceKey,
  hrIndustryGpgClassificationAssignmentsSurfaceKey,
  hrIndustryGpgClassificationReviewsSurfaceKey,
  hrIndustryGpgClassificationsSurfaceKey,
  hrIndustryGpgGradeMovementsSurfaceKey,
  hrIndustryGpgIntegrationExposuresSurfaceKey,
  hrIndustryGpgLocalityAdjustmentsSurfaceKey,
  hrIndustryGpgPayGradesSurfaceKey,
  hrIndustryGpgReportsSurfaceKey,
  hrIndustryGpgSalaryTablesSurfaceKey,
  hrIndustryGpgStepEligibilityRulesSurfaceKey,
  hrIndustryGpgStepIncreaseCandidatesSurfaceKey,
  type HrIndustryGpgListSurfaceKey,
} from "./hr.industry.gpg-surface-metadata.shared";

export const hrIndustryGpgUiCopy = {
  title: "Government Classification Pay Grades",
  description:
    "Manage public-sector classifications, pay grades, salary tables, step eligibility, locality adjustments, grade movement references, and payroll-ready compensation controls.",
  page: {
    title: "Government Classification Pay Grades",
    description:
      "Government workforce classification, salary table, locality adjustment, step progression, and downstream payroll reference control.",
  },
  overview: {
    sectionTitle: "Classification and Pay Grade Control",
    activeClassifications: "Active classifications",
    publishedSalaryTables: "Published tables",
    validAssignments: "Valid assignments",
    blockedAssignments: "Blocked assignments",
    stepEligible: "Step eligible",
    pendingMovements: "Pending movements",
  },
  listSections: {
    [hrIndustryGpgClassificationsSurfaceKey]: {
      title: "Classification Structures",
      description:
        "Occupational group, job series, service scheme, job family, agency, department, position, and GS/SES or equivalent references.",
      emptyTitle: "No classification structures",
      emptyDescription:
        "Create government classification structures before assigning positions to grade and step references.",
    },
    [hrIndustryGpgPayGradesSurfaceKey]: {
      title: "Pay Grades and Bands",
      description:
        "Effective-dated grade, pay band, rank, minimum, maximum, and step range controls.",
      emptyTitle: "No pay grades",
      emptyDescription:
        "Configure pay grades and bands before publishing salary table versions.",
    },
    [hrIndustryGpgSalaryTablesSurfaceKey]: {
      title: "Salary Table Versions",
      description:
        "Published and superseded salary table versions with grade, step, base rate, range, currency, and approval references.",
      emptyTitle: "No salary table versions",
      emptyDescription:
        "Salary table history remains preserved and versioned for payroll traceability.",
    },
    [hrIndustryGpgLocalityAdjustmentsSurfaceKey]: {
      title: "Locality and Allowance Rules",
      description:
        "Locality, regional, hardship, remote area, and cost-of-living adjustment references by duty station and work location.",
      emptyTitle: "No locality rules",
      emptyDescription:
        "Configure locality adjustment rules to calculate payroll-ready adjusted pay references.",
    },
    [hrIndustryGpgClassificationAssignmentsSurfaceKey]: {
      title: "Position Classification Assignments",
      description:
        "Employee position links to classification, grade, pay band, step, salary table, locality, and validation status.",
      emptyTitle: "No classification assignments",
      emptyDescription:
        "Valid assignments expose payroll-ready references; invalid assignments are blocked from downstream publication.",
    },
    [hrIndustryGpgStepEligibilityRulesSurfaceKey]: {
      title: "Step Eligibility Rules",
      description:
        "Waiting periods, appointment types, performance references, and automatic or approval-based step increase policy.",
      emptyTitle: "No step eligibility rules",
      emptyDescription:
        "Define eligibility rules before identifying employees eligible for within-grade increases.",
    },
    [hrIndustryGpgStepIncreaseCandidatesSurfaceKey]: {
      title: "Step Increase Candidates",
      description:
        "Employees eligible or blocked for next-step progression based on service, grade, step, appointment type, and performance reference.",
      emptyTitle: "No step candidates",
      emptyDescription:
        "Step increase candidates appear after eligibility rules are evaluated against assignments.",
    },
    [hrIndustryGpgGradeMovementsSurfaceKey]: {
      title: "Grade Movements and Retention",
      description:
        "Promotion, reclassification, downgrade, demotion, acting grade, pay retention, and grade retention references.",
      emptyTitle: "No grade movements",
      emptyDescription:
        "Record effective-dated grade movement references for lifecycle and payroll handoff.",
    },
    [hrIndustryGpgClassificationReviewsSurfaceKey]: {
      title: "Classification Reviews",
      description:
        "Classification reviews, corrections, appeals, and reclassification request references.",
      emptyTitle: "No classification reviews",
      emptyDescription:
        "Open reviews and corrections here before changing classification or grade references.",
    },
    [hrIndustryGpgReportsSurfaceKey]: {
      title: "Classification and Pay Grade Reports",
      description:
        "Server-windowed reports by classification, grade, step, pay band, agency, department, locality, position, and effective date.",
      emptyTitle: "No report rows",
      emptyDescription:
        "Reports are generated from tenant-scoped classification assignments and salary table references.",
    },
    [hrIndustryGpgIntegrationExposuresSurfaceKey]: {
      title: "Payroll and Lifecycle References",
      description:
        "Approved grade, step, salary table, locality adjustment, allowance, and grade movement references exposed to downstream modules.",
      emptyTitle: "No integration exposures",
      emptyDescription:
        "Approved references are exposed only when integration exposure access is granted.",
    },
    [hrIndustryGpgAuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Trace classification setup, salary table setup, grade assignment, step movement, locality adjustment, reclassification, retention, approval, and payroll integration actions.",
      emptyTitle: "No audit events",
      emptyDescription:
        "Every controlled setup, movement, approval, and integration action writes an audit event.",
    },
  } satisfies Record<
    HrIndustryGpgListSurfaceKey,
    {
      readonly title: string;
      readonly description: string;
      readonly emptyTitle: string;
      readonly emptyDescription: string;
    }
  >,
  accessDenied: {
    title: "Government Classification Pay Grades access required",
    description:
      "You do not have permission to view this classification and pay grade workspace.",
  },
} as const;
