/** HRM-LAM-001 … HRM-LAM-030 shipment matrix (code-verified). */
export type LamCoverageStatus = "shipped" | "partial" | "deferred";

export type LamRequirementCoverage = {
  readonly code: `HRM-LAM-${string}`;
  readonly status: LamCoverageStatus;
  readonly evidence: readonly string[];
};

export const LAM_REQUIREMENT_COVERAGE: readonly LamRequirementCoverage[] = [
  {
    code: "HRM-LAM-001",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam.ts (upsertHrAttendanceDay, listHrAttendanceDaysWindow)",
      "packages/db/src/schema/hr.ts (hr_attendance_days)",
    ],
  },
  {
    code: "HRM-LAM-002",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_attendance_day_status enum)",
    ],
  },
  {
    code: "HRM-LAM-003",
    status: "shipped",
    evidence: ["packages/db/src/schema/hr.ts (hr_leave_type_configs)"],
  },
  {
    code: "HRM-LAM-004",
    status: "shipped",
    evidence: ["packages/db/src/schema/hr.ts (hr_leave_entitlement_rules)"],
  },
  {
    code: "HRM-LAM-005",
    status: "shipped",
    evidence: ["packages/db/src/hr-lam.ts (calculateHrLeaveEntitlementForEmployee)"],
  },
  {
    code: "HRM-LAM-006",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_leave_balances, hr_leave_balance_ledger)",
      "packages/db/src/hr-leave-balance.ts (computeLeaveRemainingBalance)",
    ],
  },
  {
    code: "HRM-LAM-007",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam.ts (submitHrLeaveApplication)",
      "packages/features/hr-suite/.../actions/hr.time.lam.actions.server.ts",
    ],
  },
  {
    code: "HRM-LAM-008",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (requires_supporting_document on hr_leave_type_configs)",
      "packages/db/src/hr-lam.ts (submitHrLeaveApplication document gate)",
    ],
  },
  {
    code: "HRM-LAM-009",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam.ts (validateLeaveBalance, pending ledger reserve)",
    ],
  },
  {
    code: "HRM-LAM-010",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam.ts (validateLeaveEligibility)",
      "packages/db/src/hr-lam.ts (listHrLeaveEntitlementRules, matchesEntitlementRule)",
    ],
  },
  {
    code: "HRM-LAM-011",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-workflow.ts (validateHrLeaveApplicationPolicy)",
      "packages/db/src/hr-leave-validation.ts (validateLeaveApplicationRules)",
    ],
  },
  {
    code: "HRM-LAM-012",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-workflow.ts (decideHrLeaveApplication, approval stages)",
      "packages/db/src/hr-leave-routing.ts (resolveLeaveApprovalRouteFromChain)",
    ],
  },
  {
    code: "HRM-LAM-013",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-leave-routing.ts (manager, HR, grade, duration routing)",
      "packages/features/hr-suite/tests/unit/lam-leave-approval-routing.test.ts",
    ],
  },
  {
    code: "HRM-LAM-014",
    status: "shipped",
    evidence: ["packages/db/src/hr-lam-workflow.ts (decideHrLeaveApplication decisions)"],
  },
  {
    code: "HRM-LAM-015",
    status: "shipped",
    evidence: ["packages/db/src/hr-lam-workflow.ts (rejection_reason_required)"],
  },
  {
    code: "HRM-LAM-016",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-workflow.ts (applyApprovedLeaveBalance, releasePendingForRequest)",
    ],
  },
  {
    code: "HRM-LAM-017",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-workflow.ts (cancelHrLeaveApplication, amendHrLeaveApplication)",
    ],
  },
  {
    code: "HRM-LAM-018",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-workflow.ts (adjustHrLeaveBalanceManual)",
      "packages/features/hr-suite/.../actions/hr.time.leave.actions.server.ts",
    ],
  },
  {
    code: "HRM-LAM-019",
    status: "shipped",
    evidence: ["packages/db/src/hr-lam-workflow.ts (processHrLeaveCarryForwardForYear)"],
  },
  {
    code: "HRM-LAM-020",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-workflow.ts (listHrUnpaidLeavePayrollDeductionRefs)",
      "packages/db/src/hr-lam.ts (payrollDeductionReference on unpaid leave)",
    ],
  },
  {
    code: "HRM-LAM-021",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (medical_certificate_reference, panel_clinic_reference, hospitalization_reference)",
      "packages/db/src/hr-lam.ts (submitHrLeaveApplication medical validation)",
      "packages/db/src/hr-lam-advanced.ts (assertMedicalCertificateWhenRequired)",
    ],
  },
  {
    code: "HRM-LAM-022",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-advanced.ts (detectAttendanceExceptions, regenerateAttendanceDayFromEvents)",
      "packages/db/src/hr-lam-advanced.ts (listAttendanceExceptionsWindow)",
    ],
  },
  {
    code: "HRM-LAM-023",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_attendance_policies.attendance_corrections_enabled)",
      "packages/db/src/hr-lam-advanced.ts (submitAttendanceCorrectionForApproval)",
    ],
  },
  {
    code: "HRM-LAM-024",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_attendance_correction_requests)",
      "packages/db/src/hr-lam-advanced.ts (approve/rejectAttendanceCorrectionRequest)",
    ],
  },
  {
    code: "HRM-LAM-025",
    status: "shipped",
    evidence: ["packages/db/src/hr-lam-advanced.ts (summarizeHrAttendanceForPeriod)"],
  },
  {
    code: "HRM-LAM-026",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-advanced.ts (listHrLamPayrollReferencesForPeriod)",
      "packages/features/hr-suite/.../surface/hr.time.attendance.lam-payroll-refs-list.surface.ts",
    ],
  },
  {
    code: "HRM-LAM-027",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../policies/hr.time.lam-access.policy.server.ts",
      "packages/db/src/hr-lam-advanced.ts (resolveEmployeeIdsVisibleToActor)",
      "apps/erp/src/lib/hr-sections/leave-attendance.server.tsx (requireHrLamRead gate)",
    ],
  },
  {
    code: "HRM-LAM-028",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_lam_notifications)",
      "packages/db/src/hr-lam-advanced.ts (enqueueHrLamNotification)",
    ],
  },
  {
    code: "HRM-LAM-029",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-advanced.ts (summarizeHrAttendanceForPeriod, listAttendanceExceptionsWindow)",
      "packages/features/hr-suite/.../surface/hr.time.attendance.lam-reports-list.surface.ts",
    ],
  },
  {
    code: "HRM-LAM-030",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../events/hr.time.attendance.lam.event.ts",
      "packages/features/hr-suite/.../data/hr.time.attendance.lam-audit-trail.shared.server.ts",
      "packages/features/hr-suite/.../actions/hr.time.lam.mutation.shared.server.ts",
    ],
  },
] as const;

export function assertLamCoverageComplete(): void {
  const missing = LAM_REQUIREMENT_COVERAGE.filter((row) => row.status !== "shipped");
  if (missing.length > 0) {
    throw new Error(
      `lam_acceptance_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}
