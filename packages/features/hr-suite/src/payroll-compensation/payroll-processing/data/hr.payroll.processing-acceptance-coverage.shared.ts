/** HRM-PAY-001 … HRM-PAY-030 requirement coverage (code-verified). */
export type PayrollCoverageStatus = "shipped" | "partial" | "deferred";

export type PayrollRequirementCoverage = {
  readonly code: `HRM-PAY-${string}`;
  readonly status: PayrollCoverageStatus;
  readonly evidence: readonly string[];
};

export const PAYROLL_REQUIREMENT_COVERAGE: readonly PayrollRequirementCoverage[] = [
  {
    code: "HRM-PAY-001",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-payroll-processing.ts (hr_payroll_cycles)",
      "packages/db/src/hr-payroll-processing-foundation.ts (createHrPayrollCycleInTx, listHrPayrollCyclesWindow)",
      "packages/features/hr-suite/.../actions/hr.payroll.processing.actions.server.ts (createPayrollCycleAction)",
    ],
  },
  {
    code: "HRM-PAY-002",
    status: "shipped",
    evidence: [
      "hr_payroll_pay_schedule enum (monthly, weekly, bi_weekly, semi_monthly, ad_hoc)",
      "schemas/hr.payroll.processing-constants.shared.ts",
    ],
  },
  {
    code: "HRM-PAY-003",
    status: "shipped",
    evidence: [
      "hr_payroll_employee_assignments",
      "assignHrPayrollGroupEmployeeInTx",
      "assignPayrollEmployeeAction",
    ],
  },
  {
    code: "HRM-PAY-004",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-payroll-processing-calculations.shared.ts (computeFixedComponentAmount, computeHourlyWageAmount, computeDailyWageAmount)",
      "data/hr.payroll.processing-calculation.shared.ts",
    ],
  },
  { code: "HRM-PAY-005", status: "shipped", evidence: ["computePayrollLineBreakdown allowance_fixed component"] },
  { code: "HRM-PAY-006", status: "shipped", evidence: ["computeOvertimeAmount in hr-payroll-processing-calculations.shared.ts"] },
  { code: "HRM-PAY-007", status: "shipped", evidence: ["deduction categories in hr_payroll_component_category enum"] },
  { code: "HRM-PAY-008", status: "shipped", evidence: ["tax_employee component in computePayrollLineBreakdown"] },
  { code: "HRM-PAY-009", status: "shipped", evidence: ["statutory_employee component in computePayrollLineBreakdown"] },
  { code: "HRM-PAY-010", status: "shipped", evidence: ["statutory_employer + employer_cost in computePayrollLineBreakdown"] },
  { code: "HRM-PAY-011", status: "shipped", evidence: ["hr_payroll_earning_deduction_definitions.isRecurring"] },
  { code: "HRM-PAY-012", status: "shipped", evidence: ["hr_payroll_adjustment_kind one_time_earning/one_time_deduction"] },
  { code: "HRM-PAY-013", status: "shipped", evidence: ["insertHrPayrollAdjustmentRecord with approval gate"] },
  { code: "HRM-PAY-014", status: "shipped", evidence: ["data/hr.payroll.processing-proration.shared.ts (calculateHrPayrollProration)"] },
  { code: "HRM-PAY-015", status: "shipped", evidence: ["adjustment kind retro in hr_payroll_adjustment_kind enum"] },
  {
    code: "HRM-PAY-016",
    status: "shipped",
    evidence: ["data/hr.payroll.processing-input-collection.server.ts (collectHrPayrollApprovedInputs)"],
  },
  {
    code: "HRM-PAY-017",
    status: "shipped",
    evidence: ["data/hr.payroll.processing-validation.shared.ts (runHrPayrollValidationChecks)"],
  },
  { code: "HRM-PAY-018", status: "shipped", evidence: ["missing_data validation codes in runHrPayrollValidationChecks"] },
  { code: "HRM-PAY-019", status: "shipped", evidence: ["abnormal_variance check in runHrPayrollValidationChecks"] },
  { code: "HRM-PAY-020", status: "shipped", evidence: ["assertHrPayrollCanFinalize + finalizeHrPayrollRunInTx blocking gate"] },
  { code: "HRM-PAY-021", status: "shipped", evidence: ["previewHrPayrollRunInTx + generatePayrollPreview"] },
  { code: "HRM-PAY-022", status: "shipped", evidence: ["submitHrPayrollRunForApprovalInTx, approveHrPayrollRunInTx"] },
  { code: "HRM-PAY-023", status: "shipped", evidence: ["lockHrPayrollRunInTx"] },
  { code: "HRM-PAY-024", status: "shipped", evidence: ["generateHrPayrollPayslipsInTx"] },
  { code: "HRM-PAY-025", status: "shipped", evidence: ["listHrPayrollPayslipsForEmployeeInTx with essAccessible"] },
  { code: "HRM-PAY-026", status: "shipped", evidence: ["createHrPayrollPaymentBatchInTx with bank CSV"] },
  { code: "HRM-PAY-027", status: "shipped", evidence: ["updateHrPayrollPaymentStatusInTx"] },
  { code: "HRM-PAY-028", status: "shipped", evidence: ["generateHrPayrollJournalRefInTx"] },
  { code: "HRM-PAY-029", status: "shipped", evidence: ["authorizeHrPayrollCorrectionInTx"] },
  {
    code: "HRM-PAY-030",
    status: "shipped",
    evidence: [
      "hr_payroll_audit_events",
      "appendHrPayrollAuditEventInTx",
      "listHrPayrollAuditTrailWindow",
    ],
  },
];

export const PAYROLL_ACCEPTANCE_CRITERIA_COVERAGE = [
  { criterion: 1, requirements: ["HRM-PAY-001", "HRM-PAY-002"], status: "shipped" as const },
  { criterion: 2, requirements: ["HRM-PAY-003"], status: "shipped" as const },
  { criterion: 3, requirements: ["HRM-PAY-004", "HRM-PAY-005", "HRM-PAY-006", "HRM-PAY-007", "HRM-PAY-008", "HRM-PAY-009"], status: "shipped" as const },
  { criterion: 4, requirements: ["HRM-PAY-010"], status: "shipped" as const },
  { criterion: 5, requirements: ["HRM-PAY-002"], status: "shipped" as const },
  { criterion: 6, requirements: ["HRM-PAY-014"], status: "shipped" as const },
  { criterion: 7, requirements: ["HRM-PAY-016"], status: "shipped" as const },
  { criterion: 8, requirements: ["HRM-PAY-018"], status: "shipped" as const },
  { criterion: 9, requirements: ["HRM-PAY-019"], status: "shipped" as const },
  { criterion: 10, requirements: ["HRM-PAY-020"], status: "shipped" as const },
  { criterion: 11, requirements: ["HRM-PAY-021"], status: "shipped" as const },
  { criterion: 12, requirements: ["HRM-PAY-022"], status: "shipped" as const },
  { criterion: 13, requirements: ["HRM-PAY-023"], status: "shipped" as const },
  { criterion: 14, requirements: ["HRM-PAY-024"], status: "shipped" as const },
  { criterion: 15, requirements: ["HRM-PAY-025"], status: "shipped" as const },
  { criterion: 16, requirements: ["HRM-PAY-026"], status: "shipped" as const },
  { criterion: 17, requirements: ["HRM-PAY-027"], status: "shipped" as const },
  { criterion: 18, requirements: ["HRM-PAY-028"], status: "shipped" as const },
  { criterion: 19, requirements: ["HRM-PAY-029"], status: "shipped" as const },
  { criterion: 20, requirements: ["HRM-PAY-030"], status: "shipped" as const },
] as const;

export function assertPayrollCoverageComplete(): void {
  const codes = new Set(PAYROLL_REQUIREMENT_COVERAGE.map((row) => row.code));
  for (let i = 1; i <= 30; i += 1) {
    const code = `HRM-PAY-${String(i).padStart(3, "0")}` as const;
    if (!codes.has(code)) {
      throw new Error(`Missing payroll requirement coverage for ${code}`);
    }
  }
}
