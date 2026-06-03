export type SftIntegrationCoverageStatus = "shipped" | "partial" | "deferred";

export type SftIntegrationRequirementCoverage = {
  readonly code: `HRM-SFT-${string}`;
  readonly status: SftIntegrationCoverageStatus;
  readonly evidence: readonly string[];
};

const SFT_ROOT =
  "packages/features/hr-suite/src/time-attendance/shift-scheduling" as const;
const SCHEMA_EVIDENCE = "packages/db/src/schema/hr-shift-scheduling.ts" as const;
const DB_SHIFTS_EVIDENCE = "packages/db/src/hr-shifts.ts" as const;
const DB_SCHEDULING_EVIDENCE = "packages/db/src/hr-shifts-scheduling.ts" as const;
const DB_WORKFLOW_EVIDENCE = "packages/db/src/hr-shift-workflow.ts" as const;
const DB_ADVANCED_EVIDENCE = "packages/db/src/hr-sft-advanced.ts" as const;

const TEMPLATE_DATA = `${SFT_ROOT}/data/hr.time.sft-template.server.ts` as const;
const ROSTER_DATA = `${SFT_ROOT}/data/hr.time.sft-roster.server.ts` as const;
const ASSIGNMENT_DATA = `${SFT_ROOT}/data/hr.time.sft-assignment.server.ts` as const;
const RECURRENCE_DATA = `${SFT_ROOT}/data/hr.time.sft-recurrence.server.ts` as const;
const ROTATION_DATA = `${SFT_ROOT}/data/hr.time.sft-rotation.server.ts` as const;
const POLICY = `${SFT_ROOT}/policies/hr.time.sft-access.policy.server.ts` as const;
const TEMPLATE_SCHEMA = `${SFT_ROOT}/schemas/hr.time.sft-template.schema.ts` as const;
const AVAILABILITY_DATA = `${SFT_ROOT}/data/hr.time.sft-availability.server.ts` as const;
const AVAILABILITY_SCHEMA = `${SFT_ROOT}/schemas/hr.time.sft-availability.schema.ts` as const;
const CONFLICT_DATA = `${SFT_ROOT}/data/hr.time.sft-conflict.server.ts` as const;
const CONFLICT_SHARED = `${SFT_ROOT}/data/hr.time.sft-conflict.shared.ts` as const;
const POLICY_DATA = `${SFT_ROOT}/data/hr.time.sft-policy.server.ts` as const;
const LAM_BOUNDARY = `${SFT_ROOT}/data/hr.time.sft-lam-boundary.server.ts` as const;
const COVERAGE_DATA = `${SFT_ROOT}/data/hr.time.sft-coverage.server.ts` as const;
const COVERAGE_SURFACE = `${SFT_ROOT}/surface/hr.time.sft-coverage-list.surface.ts` as const;
const SWAP_DATA = `${SFT_ROOT}/data/hr.time.sft-swap.server.ts` as const;
const SWAP_ELIGIBILITY = `${SFT_ROOT}/data/hr.time.sft-swap-eligibility.shared.ts` as const;
const SWAP_ACTIONS = `${SFT_ROOT}/actions/hr.time.sft-swap.actions.server.ts` as const;
const SCHEDULE_CHANGE_DATA = `${SFT_ROOT}/data/hr.time.sft-schedule-change.server.ts` as const;
const NOTIFICATION_DATA = `${SFT_ROOT}/data/hr.time.sft-notification.server.ts` as const;
const NOTIFICATION_TEMPLATES = `${SFT_ROOT}/surface/hr.time.sft-notification-templates.shared.ts` as const;
const ATTENDANCE_RECONCILE = `${SFT_ROOT}/data/hr.time.sft-attendance-reconcile.server.ts` as const;
const ATTENDANCE_SURFACE = `${SFT_ROOT}/surface/hr.time.sft-attendance-reconcile-list.surface.ts` as const;
const PAYROLL_REF = `${SFT_ROOT}/data/hr.time.sft-payroll-ref.server.ts` as const;
const PAYROLL_SURFACE = `${SFT_ROOT}/surface/hr.time.sft-payroll-refs-list.surface.ts` as const;
const REPORT_DATA = `${SFT_ROOT}/data/hr.time.sft-report.server.ts` as const;
const REPORT_ACTIONS = `${SFT_ROOT}/actions/hr.time.sft-report.actions.server.ts` as const;
const AUDIT_EVENTS = `${SFT_ROOT}/events/hr.time.sft.event.ts` as const;
const AUDIT_DATA = `${SFT_ROOT}/data/hr.time.sft-audit.server.ts` as const;
const AUDIT_SURFACE = `${SFT_ROOT}/surface/hr.time.sft-audit-trail-list.surface.ts` as const;
const PAGE_MODEL = `${SFT_ROOT}/data/hr.time.sft.page-model.server.ts` as const;
const WORKBENCH = `${SFT_ROOT}/components/hr.time.sft-section.component.server.tsx` as const;
const SURFACE_METADATA = `${SFT_ROOT}/surface/hr.time.sft-surface-metadata.shared.ts` as const;

/** HRM-SFT-001 … HRM-SFT-008 foundation data layer (AC 1–6). */
export const SFT_FOUNDATION_REQUIREMENT_COVERAGE: readonly SftIntegrationRequirementCoverage[] =
  [
    {
      code: "HRM-SFT-001",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, DB_SHIFTS_EVIDENCE, TEMPLATE_DATA],
    },
    {
      code: "HRM-SFT-002",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, TEMPLATE_SCHEMA, DB_SHIFTS_EVIDENCE],
    },
    {
      code: "HRM-SFT-003",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, TEMPLATE_SCHEMA, DB_SHIFTS_EVIDENCE],
    },
    {
      code: "HRM-SFT-004",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, DB_SCHEDULING_EVIDENCE, ROSTER_DATA],
    },
    {
      code: "HRM-SFT-005",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, DB_SHIFTS_EVIDENCE, ASSIGNMENT_DATA],
    },
    {
      code: "HRM-SFT-006",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, DB_SCHEDULING_EVIDENCE, ASSIGNMENT_DATA],
    },
    {
      code: "HRM-SFT-007",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, DB_SCHEDULING_EVIDENCE, RECURRENCE_DATA],
    },
    {
      code: "HRM-SFT-008",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, DB_SCHEDULING_EVIDENCE, ROTATION_DATA],
    },
    {
      code: "HRM-SFT-029",
      status: "shipped",
      evidence: [POLICY],
    },
  ] as const;

export function assertSftFoundationCoverageComplete(): void {
  const missing = SFT_FOUNDATION_REQUIREMENT_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (missing.length > 0) {
    throw new Error(
      `sft_foundation_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}

/** HRM-SFT-009 … HRM-SFT-015 availability, conflict, and scheduling policy slice. */
export const SFT_CONFLICT_POLICY_REQUIREMENT_COVERAGE: readonly SftIntegrationRequirementCoverage[] =
  [
    {
      code: "HRM-SFT-009",
      status: "shipped",
      evidence: [AVAILABILITY_DATA, AVAILABILITY_SCHEMA, `${SFT_ROOT}/actions/hr.time.sft.actions.server.ts`],
    },
    {
      code: "HRM-SFT-010",
      status: "shipped",
      evidence: [AVAILABILITY_DATA, CONFLICT_DATA],
    },
    {
      code: "HRM-SFT-011",
      status: "shipped",
      evidence: [AVAILABILITY_DATA, CONFLICT_DATA, CONFLICT_SHARED],
    },
    {
      code: "HRM-SFT-012",
      status: "shipped",
      evidence: [LAM_BOUNDARY, CONFLICT_DATA],
    },
    {
      code: "HRM-SFT-013",
      status: "shipped",
      evidence: [CONFLICT_SHARED, CONFLICT_DATA],
    },
    {
      code: "HRM-SFT-014",
      status: "shipped",
      evidence: [POLICY_DATA, CONFLICT_SHARED],
    },
    {
      code: "HRM-SFT-015",
      status: "shipped",
      evidence: [POLICY_DATA, CONFLICT_SHARED],
    },
  ] as const;

export function assertSftConflictPolicyCoverageComplete(): void {
  const missing = SFT_CONFLICT_POLICY_REQUIREMENT_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (missing.length > 0) {
    throw new Error(
      `sft_conflict_policy_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}

/** HRM-SFT-016 … HRM-SFT-024 workflow slice (AC 13–20). */
export const SFT_WORKFLOW_REQUIREMENT_COVERAGE: readonly SftIntegrationRequirementCoverage[] =
  [
    {
      code: "HRM-SFT-016",
      status: "shipped",
      evidence: [SCHEMA_EVIDENCE, COVERAGE_DATA, COVERAGE_SURFACE],
    },
    {
      code: "HRM-SFT-017",
      status: "shipped",
      evidence: [COVERAGE_DATA, `${SFT_ROOT}/data/hr.time.sft-coverage.shared.ts`],
    },
    {
      code: "HRM-SFT-018",
      status: "shipped",
      evidence: [COVERAGE_DATA, ASSIGNMENT_DATA],
    },
    {
      code: "HRM-SFT-019",
      status: "shipped",
      evidence: [SWAP_DATA, `${SFT_ROOT}/surface/hr.time.sft-my-swaps-list.surface.ts`, WORKBENCH],
    },
    {
      code: "HRM-SFT-020",
      status: "shipped",
      evidence: [SWAP_DATA, SWAP_ELIGIBILITY],
    },
    {
      code: "HRM-SFT-021",
      status: "shipped",
      evidence: [DB_WORKFLOW_EVIDENCE, SWAP_DATA, SWAP_ACTIONS],
    },
    {
      code: "HRM-SFT-022",
      status: "shipped",
      evidence: [DB_WORKFLOW_EVIDENCE, SWAP_ACTIONS, `${SFT_ROOT}/surface/hr.time.sft-swap-pending-list.surface.ts`],
    },
    {
      code: "HRM-SFT-023",
      status: "shipped",
      evidence: [DB_WORKFLOW_EVIDENCE, SWAP_ACTIONS, SCHEDULE_CHANGE_DATA],
    },
    {
      code: "HRM-SFT-024",
      status: "shipped",
      evidence: [SCHEDULE_CHANGE_DATA, `${SFT_ROOT}/surface/hr.time.sft-schedule-change-pending-list.surface.ts`, `${SFT_ROOT}/surface/hr.time.sft-my-schedule-changes-list.surface.ts`],
    },
  ] as const;

export function assertSftWorkflowCoverageComplete(): void {
  const missing = SFT_WORKFLOW_REQUIREMENT_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (missing.length > 0) {
    throw new Error(
      `sft_workflow_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}

/** HRM-SFT-025 … HRM-SFT-030 integration slice coverage. */
export const SFT_INTEGRATION_REQUIREMENT_COVERAGE: readonly SftIntegrationRequirementCoverage[] =
  [
    {
      code: "HRM-SFT-025",
      status: "shipped",
      evidence: [
        `${SCHEMA_EVIDENCE} (hr_shift_notifications)`,
        `${DB_ADVANCED_EVIDENCE} (enqueueHrShiftNotification)`,
        NOTIFICATION_DATA,
        NOTIFICATION_TEMPLATES,
      ],
    },
    {
      code: "HRM-SFT-026",
      status: "shipped",
      evidence: [
        `${DB_ADVANCED_EVIDENCE} (listHrShiftAttendanceReconcileWindow)`,
        ATTENDANCE_RECONCILE,
        ATTENDANCE_SURFACE,
      ],
    },
    {
      code: "HRM-SFT-027",
      status: "shipped",
      evidence: [
        `${DB_ADVANCED_EVIDENCE} (listShiftPayrollReferencesForPeriod)`,
        PAYROLL_REF,
        PAYROLL_SURFACE,
      ],
    },
    {
      code: "HRM-SFT-028",
      status: "shipped",
      evidence: [
        `${SCHEMA_EVIDENCE} (hr_shift_roster_report_definitions)`,
        `${DB_ADVANCED_EVIDENCE} (queryHrShiftScheduleReportRows)`,
        REPORT_DATA,
        REPORT_ACTIONS,
      ],
    },
    {
      code: "HRM-SFT-029",
      status: "shipped",
      evidence: [POLICY, PAGE_MODEL],
    },
    {
      code: "HRM-SFT-030",
      status: "shipped",
      evidence: [
        `${SCHEMA_EVIDENCE} (hr_shift_audit_events)`,
        AUDIT_EVENTS,
        AUDIT_DATA,
        AUDIT_SURFACE,
      ],
    },
  ] as const;

export function assertSftIntegrationCoverageComplete(): void {
  const missing = SFT_INTEGRATION_REQUIREMENT_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (missing.length > 0) {
    throw new Error(
      `sft_integration_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}

export function assertSftRequirementCoverageComplete(): void {
  assertSftFoundationCoverageComplete();
  assertSftConflictPolicyCoverageComplete();
  assertSftWorkflowCoverageComplete();
  assertSftIntegrationCoverageComplete();
}

/** All HRM-SFT-001 … HRM-SFT-030 requirement rows. */
export const SFT_REQUIREMENT_COVERAGE: readonly SftIntegrationRequirementCoverage[] =
  [
    ...SFT_FOUNDATION_REQUIREMENT_COVERAGE,
    ...SFT_CONFLICT_POLICY_REQUIREMENT_COVERAGE,
    ...SFT_WORKFLOW_REQUIREMENT_COVERAGE,
    ...SFT_INTEGRATION_REQUIREMENT_COVERAGE.filter(
      (row) => row.code !== "HRM-SFT-029",
    ),
  ] as const;

export const SFT_ARCHITECTURE_SURFACE_EVIDENCE = [
  SURFACE_METADATA,
  PAGE_MODEL,
  WORKBENCH,
  `${SFT_ROOT}/contracts/hr.time.sft.contract.ts`,
] as const;
