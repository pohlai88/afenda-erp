/** HRM-FWA-001 … HRM-FWA-032 shipment matrix (code-verified). */
export type FwaCoverageStatus = "shipped" | "partial" | "deferred";

export type FwaRequirementCoverage = {
  readonly code: `HRM-FWA-${string}`;
  readonly status: FwaCoverageStatus;
  readonly evidence: readonly string[];
};

export const FWA_REQUIREMENT_COVERAGE: readonly FwaRequirementCoverage[] = [
  {
    code: "HRM-FWA-001",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_fwa_arrangement_type_configs)",
      "packages/db/src/hr-fwa.ts (listHrFwaArrangementTypeConfigs, upsertHrFwaArrangementTypeConfig)",
    ],
  },
  {
    code: "HRM-FWA-002",
    status: "shipped",
    evidence: ["packages/db/src/schema/hr.ts (hr_fwa_arrangement_kind enum)"],
  },
  {
    code: "HRM-FWA-003",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_fwa_eligibility_rules, hr_fwa_policy_groups)",
      "packages/db/src/hr-fwa.ts (evaluateHrFwaEmployeeEligibility)",
    ],
  },
  {
    code: "HRM-FWA-004",
    status: "shipped",
    evidence: ["packages/db/src/hr-fwa-workflow.ts (submitHrFwaRequest)"],
  },
  {
    code: "HRM-FWA-005",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_fwa_request_initiator enum)",
      "packages/db/src/hr-fwa-workflow.ts (submitHrFwaRequest initiatorKind)",
    ],
  },
  {
    code: "HRM-FWA-006",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_fwa_requests)",
      "packages/db/src/hr-fwa-workflow.ts (submitHrFwaRequest)",
    ],
  },
  {
    code: "HRM-FWA-007",
    status: "shipped",
    evidence: ["packages/db/src/hr-fwa.ts (validateHrFwaRequestPrerequisites)"],
  },
  {
    code: "HRM-FWA-008",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa.ts (not_eligible gate)",
      "packages/db/src/hr-fwa-workflow.ts (exception_approve decision)",
    ],
  },
  {
    code: "HRM-FWA-009",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa-workflow.ts (submitHrFwaRequest, seedApprovalStages)",
      "packages/features/hr-suite/.../data/hr.time.fwa-workflow.server.ts (submitHrFwaWorkflowRequest)",
    ],
  },
  {
    code: "HRM-FWA-010",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../policies/hr.time.fwa-routing.policy.server.ts (resolveHrFwaApprovalRoute)",
      "packages/db/src/hr-fwa-workflow.ts (resolveHrFwaApprovalRoute)",
      "packages/features/hr-suite/tests/unit/fwa-approval-routing.test.ts",
    ],
  },
  {
    code: "HRM-FWA-011",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa-workflow.ts (decideHrFwaRequest, renew/suspend/terminate)",
      "packages/features/hr-suite/.../data/hr.time.fwa-approval.server.ts",
      "packages/features/hr-suite/.../actions/hr.time.fwa.actions.server.ts",
    ],
  },
  {
    code: "HRM-FWA-012",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../schemas/hr.time.fwa-workflow.schema.ts",
      "packages/db/src/hr-fwa-workflow.ts (rejection/suspension/termination reason gates)",
      "packages/features/hr-suite/tests/unit/fwa-decision-schema.test.ts",
    ],
  },
  {
    code: "HRM-FWA-013",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa.ts (createHrFwaSchedulePattern, getHrFwaSchedulePattern)",
      "packages/features/hr-suite/.../data/hr.time.fwa-schedule.server.ts (createHrFwaArrangementSchedulePattern)",
    ],
  },
  {
    code: "HRM-FWA-014",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (HrFwaSchedulePatternDetails)",
      "packages/features/hr-suite/.../schemas/hr.time.fwa-schedule.schema.ts",
      "packages/features/hr-suite/.../data/hr.time.fwa-schedule.server.ts (summarizeHrFwaSchedulePattern)",
    ],
  },
  {
    code: "HRM-FWA-015",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../schemas/hr.time.fwa-schedule.schema.ts (extendedDailyHours, compressedWorkingDaysPerWeek)",
      "packages/features/hr-suite/.../data/hr.time.fwa-schedule.server.ts (isHrFwaCompressedSchedule)",
    ],
  },
  {
    code: "HRM-FWA-016",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa.ts (listHrFwaRemoteLocations, upsertHrFwaRemoteLocation)",
      "packages/features/hr-suite/.../data/hr.time.fwa-location.server.ts",
    ],
  },
  {
    code: "HRM-FWA-017",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../schemas/hr.time.fwa-location.schema.ts (hrFwaLocationRestrictionSchema)",
      "packages/features/hr-suite/.../data/hr.time.fwa-location.server.ts (assertHrFwaLocationRestrictions)",
      "packages/features/hr-suite/tests/unit/fwa-location-restrictions.test.ts",
    ],
  },
  {
    code: "HRM-FWA-018",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa-compliance.ts (checkHrFwaPolicyLimits min office)",
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-compliance.server.ts (evaluateHrFwaOfficeDayCompliance)",
    ],
  },
  {
    code: "HRM-FWA-019",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa-compliance.ts (max remote days)",
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-compliance.server.ts (evaluateHrFwaRemoteDayCompliance)",
    ],
  },
  {
    code: "HRM-FWA-020",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa-compliance.ts (expected weekly hours)",
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-compliance.server.ts (evaluateHrFwaWorkingHoursCompliance)",
    ],
  },
  {
    code: "HRM-FWA-021",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa-compliance.ts (recordHrFwaComplianceBreach, monitorHrFwaArrangementCompliance)",
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-compliance.server.ts (flagHrFwaPolicyBreaches, monitorHrFwaComplianceForPeriod)",
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/events/hr.time.fwa-compliance.events.ts",
    ],
  },
  {
    code: "HRM-FWA-022",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam.ts (listAttendanceDaysForEmployee)",
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-attendance-compare.server.ts (compareHrFwaScheduleWithAttendance)",
    ],
  },
  {
    code: "HRM-FWA-023",
    status: "partial",
    evidence: [
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-remote-checkin-compare.server.ts (compareHrFwaRemoteScheduleWithCheckins)",
      "packages/features/hr-suite/src/time-attendance/geolocation-remote-checkin/data/hr.time.geo-lam-integration.server (boundary — ships with HRM-GEO-024)",
    ],
  },
  {
    code: "HRM-FWA-024",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-leave-validate.server.ts (validateHrLeaveApplicationAgainstFwaSchedule)",
    ],
  },
  {
    code: "HRM-FWA-025",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa.ts (schedule pattern on arrangements)",
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-schedule-ref.server.ts (listHrFwaScheduleRefsForLam)",
    ],
  },
  {
    code: "HRM-FWA-026",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-overtime-ref.server.ts (listHrFwaWorkHourRefsForOvertime)",
    ],
  },
  {
    code: "HRM-FWA-027",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa-workflow.ts (payrollReference)",
      "packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking/data/hr.time.fwa-payroll-ref.server.ts (listHrFwaPayrollScheduleRefs)",
    ],
  },
  {
    code: "HRM-FWA-028",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (review_date, renewal_date, effective_to)",
      "packages/db/src/hr-fwa.ts (computeHrFwaLifecycleDates, recordHrFwaManagerPeriodicReview)",
      "packages/features/hr-suite/.../data/hr.time.fwa-review.server.ts",
    ],
  },
  {
    code: "HRM-FWA-029",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_fwa_notifications)",
      "packages/db/src/hr-fwa.ts (enqueueHrFwaNotification)",
      "packages/features/hr-suite/.../data/hr.time.fwa-notifications.server.ts",
    ],
  },
  {
    code: "HRM-FWA-030",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-fwa.ts (summarizeHrFwaReport)",
      "packages/features/hr-suite/.../data/hr.time.fwa-report.server.ts",
      "packages/features/hr-suite/.../surface/hr.time.fwa-arrangements-list.surface.ts",
    ],
  },
  {
    code: "HRM-FWA-031",
    status: "shipped",
    evidence: [
      "packages/auth/src/index.ts (hr.fwa.read, hr.fwa.write)",
      "packages/features/hr-suite/.../policies/hr.time.fwa-access.policy.server.ts",
      "apps/erp/src/lib/hr-sections/flexible-work-arrangement.server.tsx",
    ],
  },
  {
    code: "HRM-FWA-032",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_fwa_audit_events)",
      "packages/db/src/hr-fwa.ts (appendHrFwaAuditEvent, listHrFwaAuditEventsWindow)",
      "packages/features/hr-suite/.../data/hr.time.fwa-audit-trail.server.ts",
    ],
  },
] as const;

export function assertFwaCoverageComplete(): void {
  const missing = FWA_REQUIREMENT_COVERAGE.filter((row) => row.status !== "shipped");
  if (missing.length > 0) {
    throw new Error(
      `fwa_acceptance_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}
