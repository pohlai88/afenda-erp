/** HRM-LAM-021 … HRM-LAM-030 shipment matrix (code-verified). */
export type LamCoverageStatus = "shipped" | "partial" | "deferred";

export type LamRequirementCoverage = {
  readonly code: `HRM-LAM-${string}`;
  readonly status: LamCoverageStatus;
  readonly evidence: readonly string[];
};

export const LAM_REQUIREMENT_COVERAGE: readonly LamRequirementCoverage[] = [
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
      "packages/db/src/hr-lam.ts (payrollDeductionReference on unpaid leave)",
    ],
  },
  {
    code: "HRM-LAM-027",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/src/time-attendance/leave-attendance-management/policies/hr.time.attendance.lam-access.policy.server.ts",
      "packages/db/src/hr-lam-advanced.ts (resolveEmployeeIdsVisibleToActor)",
    ],
  },
  {
    code: "HRM-LAM-028",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_lam_notifications)",
      "packages/db/src/hr-lam-advanced.ts (enqueueHrLamNotification)",
      "packages/features/hr-suite/src/time-attendance/leave-attendance-management/actions/hr.time.attendance.lam.actions.server.ts",
    ],
  },
  {
    code: "HRM-LAM-029",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-advanced.ts (summarizeHrAttendanceForPeriod, listAttendanceExceptionsWindow)",
      "packages/features/hr-suite/src/time-attendance/leave-attendance-management/surface/hr.time.attendance.lam-reports-list.surface.ts",
    ],
  },
  {
    code: "HRM-LAM-030",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/src/time-attendance/leave-attendance-management/events/hr.time.attendance.lam.event.ts",
      "packages/features/hr-suite/src/time-attendance/leave-attendance-management/data/hr.time.attendance.lam-audit-trail.shared.server.ts",
      "packages/features/hr-suite/src/time-attendance/leave-attendance-management/actions/hr.time.attendance.lam.mutation.shared.server.ts",
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
