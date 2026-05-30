/** HRM-BEN-015 … HRM-BEN-021 shipment matrix (code-verified). */
export type BenefitsCoverageStatus = "shipped" | "partial" | "deferred";

export type BenefitsRequirementCoverage = {
  readonly code: `HRM-BEN-${string}`;
  readonly status: BenefitsCoverageStatus;
  readonly evidence: readonly string[];
};

export const BENEFITS_REQUIREMENT_COVERAGE: readonly BenefitsRequirementCoverage[] = [
  {
    code: "HRM-BEN-015",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-deductions.ts (createHrBenefitDeductionReferenceInTx)",
      "packages/db/src/schema/hr-benefits.ts (hr_benefit_deduction_references)",
    ],
  },
  {
    code: "HRM-BEN-016",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/src/payroll-compensation/_integration/payroll-deductions.server.ts",
      "packages/db/src/hr-benefits-deductions.ts (listHrBenefitPayrollDeductionRefs)",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/actions/hr.payroll.benefits.actions.server.ts (exportHrBenefitPayrollDeductionRefsAction)",
    ],
  },
  {
    code: "HRM-BEN-017",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-deductions.ts (frequency per_payroll default, updateHrBenefitDeductionReferenceInTx)",
      "packages/db/src/schema/hr-benefits.ts (hr_benefit_deduction_frequency enum)",
    ],
  },
  {
    code: "HRM-BEN-018",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-enrollments.ts (applyHrBenefitEnrollmentChangeInTx)",
      "packages/db/src/schema/hr-benefits.ts (hr_benefit_enrollment_changes)",
    ],
  },
  {
    code: "HRM-BEN-019",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-enrollments.ts (approveHrBenefitEnrollmentInTx pending → active)",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/actions/hr.payroll.benefits.actions.server.ts (approveHrBenefitEnrollmentAction)",
    ],
  },
  {
    code: "HRM-BEN-020",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-providers.ts",
      "packages/db/src/schema/hr-benefits.ts (hr_benefit_providers)",
    ],
  },
  {
    code: "HRM-BEN-021",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-documents.ts (linkHrBenefitDocumentInTx)",
      "packages/db/src/schema/hr-benefits.ts (hr_benefit_document_links)",
    ],
  },
  {
    code: "HRM-BEN-022",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-coverage.shared.ts",
      "packages/db/src/schema/hr-benefits.ts (hr_benefit_coverage_status enum)",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/surface/hr.payroll.benefits-enrollments-list.surface.ts",
    ],
  },
  {
    code: "HRM-BEN-023",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-coverage.ts (adjustHrBenefitCoverageForEmploymentStatusInTx)",
      "packages/db/src/hr-lifecycle.ts (applyEmploymentStatusChange hook)",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/data/hr.payroll.benefits-employment-sync.server.ts",
    ],
  },
  {
    code: "HRM-BEN-024",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-reports.ts (buildHrBenefitReportCsv cost)",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/actions/hr.payroll.benefits.actions.server.ts (exportHrBenefitReportAction)",
    ],
  },
  {
    code: "HRM-BEN-025",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-reports.ts (enrollment report kind)",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/components/hr.payroll.benefits-reports.component.client.tsx",
    ],
  },
  {
    code: "HRM-BEN-026",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-reports.ts (payroll_deduction report kind)",
      "packages/db/src/hr-benefits-deductions.ts (listHrBenefitPayrollDeductionRefs)",
    ],
  },
  {
    code: "HRM-BEN-027",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/data/hr.payroll.benefits-sensitive-access.shared.ts",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/policies/hr.payroll.benefits-access.policy.server.ts",
      "hr.benefits.sensitive.read capability",
    ],
  },
  {
    code: "HRM-BEN-028",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-benefits-audit.ts",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/surface/hr.payroll.benefits-audit-trail-list.surface.ts",
      "packages/features/hr-suite/src/payroll-compensation/benefits-administration/events/hr.payroll.benefits.event.ts",
    ],
  },
];

export const BENEFITS_ACCEPTANCE_COVERAGE = [
  {
    acceptanceNo: 15,
    criteria:
      "Employee-paid benefit contribution can be sent to Payroll Processing as a recurring deduction.",
    status: "shipped" as const,
    evidence: [
      "approveHrBenefitEnrollmentInTx → createHrBenefitDeductionReferenceInTx",
      "exportHrBenefitPayrollDeductionRefsAction",
    ],
  },
  {
    acceptanceNo: 18,
    criteria: "Supporting benefit documents can be linked to the benefit record.",
    status: "shipped" as const,
    evidence: ["linkHrBenefitDocumentInTx", "linkHrBenefitDocumentAction"],
  },
  {
    acceptanceNo: 16,
    criteria:
      "Benefit coverage status can be tracked as pending, active, waived, suspended, terminated, or expired.",
    status: "shipped" as const,
    evidence: ["HR_BENEFIT_COVERAGE_STATUSES", "hr_benefit_coverage_status enum"],
  },
  {
    acceptanceNo: 17,
    criteria: "Benefit coverage can be adjusted or terminated when employee status changes.",
    status: "shipped" as const,
    evidence: [
      "adjustHrBenefitCoverageForEmploymentStatusInTx",
      "hr-lifecycle applyEmploymentStatusChange",
    ],
  },
  {
    acceptanceNo: 19,
    criteria: "Benefit cost and enrollment reports can be generated.",
    status: "shipped" as const,
    evidence: ["buildHrBenefitReportCsv", "exportHrBenefitReportAction"],
  },
  {
    acceptanceNo: 20,
    criteria: "Sensitive benefit information is hidden from unauthorized users.",
    status: "shipped" as const,
    evidence: ["maskBenefitsSensitiveDisplayText", "hr.benefits.sensitive.read"],
  },
  {
    acceptanceNo: 21,
    criteria:
      "Every benefit enrollment, waiver, change, termination, approval, and deduction integration creates an audit event.",
    status: "shipped" as const,
    evidence: [
      "appendHrBenefitAuditEventInTx",
      "createHrBenefitEnrollmentAction",
      "hr_benefit_audit_events",
    ],
  },
] as const;
