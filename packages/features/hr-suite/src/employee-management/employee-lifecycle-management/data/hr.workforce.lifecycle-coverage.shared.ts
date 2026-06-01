export type HrLifecycleCoverageStatus = "shipped";

export type HrLifecycleRequirementCode = `HRM-LCY-${string}`;

export type HrLifecycleCoverageEntry = {
  readonly code: string;
  readonly status: HrLifecycleCoverageStatus;
  readonly evidence: readonly string[];
};

const lifecycleSliceRoot =
  "packages/features/hr-suite/src/employee-management/employee-lifecycle-management";

const requirementCoverageSeeds = [
  [
    "001",
    [
      "schemas/hr.workforce.lifecycle-employment-status.schema.ts",
      "packages/db/src/schema/hr.ts (hr_employment_status)",
      "surface/hr.workforce.lifecycle-overview-list.surface.ts",
    ],
  ],
  [
    "002",
    [
      "packages/db/src/hr-lifecycle.ts (listHrLifecycleOverviewWindow)",
      "surface/hr.workforce.lifecycle-overview-list.surface.ts",
      "data/hr.workforce.lifecycle.page-model.server.ts",
    ],
  ],
  [
    "003",
    [
      "schemas/hr.workforce.lifecycle-employment-status.schema.ts",
      "packages/db/src/schema/hr.ts (hr_employment_status)",
    ],
  ],
  [
    "004",
    [
      "actions/hr.workforce.lifecycle.actions.server.ts (startHrOnboardingCaseAction)",
      "packages/db/src/hr-onboarding.ts (startHrOnboarding)",
      "surface/hr.workforce.lifecycle-onboarding-cases-list.surface.ts",
    ],
  ],
  [
    "005",
    [
      "packages/db/src/hr-onboarding.ts (seedOnboardingChecklist)",
      "packages/db/src/schema/hr.ts (hr_onboarding_checklist_items)",
      "surface/hr.workforce.lifecycle-onboarding-cases-list.surface.ts",
    ],
  ],
  [
    "006",
    [
      "packages/db/src/hr-onboarding.ts (listHrOnboardingChecklistItems)",
      "packages/db/src/schema/hr.ts (hr_workflow_checklist_status)",
      "surface/hr.workforce.lifecycle-onboarding-cases-list.surface.ts",
    ],
  ],
  [
    "007",
    [
      "packages/db/src/hr-lifecycle.ts (listHrLifecycleProbationDueWindow)",
      "data/hr.workforce.lifecycle-probation.shared.ts",
      "surface/hr.workforce.lifecycle-probation-due-list.surface.ts",
    ],
  ],
  [
    "008",
    [
      "schemas/hr.workforce.lifecycle-probation.schema.ts",
      "actions/hr.workforce.lifecycle.actions.server.ts (recordHrProbationOutcomeAction)",
      "packages/db/src/hr-lifecycle.ts (recordHrProbationOutcome)",
    ],
  ],
  [
    "009",
    [
      "actions/hr.workforce.lifecycle.actions.server.ts (confirmHrEmploymentAction)",
      "packages/db/src/hr-lifecycle.ts (confirmHrEmployment)",
      "events/hr.workforce.lifecycle.event.ts",
    ],
  ],
  [
    "010",
    [
      "actions/hr.workforce.lifecycle.actions.server.ts (changeHrEmploymentStatusAction)",
      "packages/db/src/hr-lifecycle.ts (applyEmploymentStatusChange)",
      "surface/hr.workforce.lifecycle-overview-list.surface.ts",
    ],
  ],
  [
    "011",
    [
      "schemas/hr.workforce.lifecycle-movement.schema.ts",
      "actions/hr.workforce.lifecycle.actions.server.ts (recordHrEmployeeMovementAction)",
      "packages/db/src/hr-lifecycle.ts (recordHrEmployeeMovement)",
    ],
  ],
  [
    "012",
    [
      "schemas/hr.workforce.lifecycle-movement.schema.ts",
      "components/hr.workforce.lifecycle-movement-panel.component.client.tsx",
      "packages/db/src/hr-commands.ts (upsertHrEmployeeEffectiveAssignmentInTx)",
    ],
  ],
  [
    "013",
    [
      "schemas/hr.workforce.lifecycle-movement.schema.ts",
      "packages/db/src/hr-lifecycle.ts (recordHrEmployeeMovement)",
      "events/hr.workforce.lifecycle.event.ts",
    ],
  ],
  [
    "014",
    [
      "schemas/hr.workforce.lifecycle-movement.schema.ts",
      "components/hr.workforce.lifecycle-movement-panel.component.client.tsx",
      "packages/db/src/hr-lifecycle.ts (grade/workLocationCode movement patch)",
    ],
  ],
  [
    "015",
    [
      "surface/hr.workforce.lifecycle-contract-reviews-list.surface.ts",
      "schemas/hr.workforce.lifecycle-contract.schema.ts",
      "packages/db/src/hr-lifecycle.ts (renewHrEmployeeContract)",
    ],
  ],
  [
    "016",
    [
      "packages/db/src/hr-lifecycle.ts (listHrLifecycleContractReviewWindow)",
      "surface/hr.workforce.lifecycle-contract-reviews-list.surface.ts",
      "data/hr.workforce.lifecycle-contract.shared.ts",
    ],
  ],
  [
    "017",
    [
      "schemas/hr.workforce.lifecycle-transition.schema.ts",
      "actions/hr.workforce.lifecycle.actions.server.ts (changeHrEmploymentStatusAction)",
      "packages/db/src/hr-lifecycle.ts (assertHrEmploymentStatusTransition)",
    ],
  ],
  [
    "018",
    [
      "schemas/hr.workforce.lifecycle-exit.schema.ts",
      "actions/hr.workforce.lifecycle.actions.server.ts (initiateHrNoticePeriodAction)",
      "surface/hr.workforce.lifecycle-notice-period-list.surface.ts",
    ],
  ],
  [
    "019",
    [
      "packages/db/src/hr-lifecycle.ts (listHrLifecycleNoticePeriodWindow)",
      "actions/hr.workforce.lifecycle.actions.server.ts (startHrOffboardingCaseAction)",
      "surface/hr.workforce.lifecycle-notice-period-list.surface.ts",
    ],
  ],
  [
    "020",
    [
      "actions/hr.workforce.lifecycle.actions.server.ts (startHrOffboardingCaseAction)",
      "packages/db/src/hr-offboarding.ts (startHrOffboarding)",
      "surface/hr.workforce.lifecycle-offboarding-cases-list.surface.ts",
    ],
  ],
  [
    "021",
    [
      "schemas/hr.workforce.lifecycle-transition.schema.ts",
      "packages/db/src/hr-lifecycle.ts (terminated transitions)",
      "events/hr.workforce.lifecycle.event.ts",
    ],
  ],
  [
    "022",
    [
      "schemas/hr.workforce.lifecycle-employment-status.schema.ts",
      "packages/db/src/hr-lifecycle.ts (retired transitions)",
      "surface/hr.workforce.lifecycle-audit-trail-list.surface.ts",
    ],
  ],
  [
    "023",
    [
      "packages/db/src/hr-lifecycle.ts (assertHrEmploymentStatusTransition)",
      "tests/unit/lifecycle-status-transitions.test.ts",
      "schemas/hr.workforce.lifecycle-transition.schema.ts",
    ],
  ],
  [
    "024",
    [
      "packages/db/src/hr-lifecycle.ts (hrLifecycleTransitions.effectiveDate)",
      "surface/hr.workforce.lifecycle-pending-transitions-list.surface.ts",
      "data/hr.workforce.lifecycle-transition.shared.ts",
    ],
  ],
  [
    "025",
    [
      "packages/db/src/hr-lifecycle.ts (listHrLifecycleEventsForEmployee)",
      "packages/db/src/schema/hr.ts (hr_lifecycle_events)",
      "surface/hr.workforce.lifecycle-audit-trail-list.surface.ts",
    ],
  ],
  [
    "026",
    [
      "surface/hr.workforce.lifecycle-pending-transitions-list.surface.ts",
      "surface/hr.workforce.lifecycle-probation-due-list.surface.ts",
      "surface/hr.workforce.lifecycle-contract-reviews-list.surface.ts",
    ],
  ],
  [
    "027",
    [
      "packages/db/src/hr-lifecycle.ts (getHrEmployeeLifecycleSnapshot)",
      "packages/db/src/hr-lifecycle.ts (applyEmploymentStatusChange)",
      "packages/db/src/hr-benefits-coverage.ts (status-linked coverage)",
    ],
  ],
  [
    "028",
    [
      "events/hr.workforce.lifecycle.event.ts",
      "actions/hr.workforce.lifecycle.mutation.shared.server.ts",
      "surface/hr.workforce.lifecycle-audit-trail-list.surface.ts",
    ],
  ],
] as const satisfies readonly [
  suffix: string,
  evidence: readonly string[],
][];

export const HR_WORKFORCE_LIFECYCLE_REQUIREMENT_COVERAGE =
  requirementCoverageSeeds.map(([suffix, evidence]) => ({
    code: `HRM-LCY-${suffix}`,
    status: "shipped" as const,
    evidence: evidence.map((entry) =>
      entry.startsWith("packages/") || entry.startsWith("tests/")
        ? entry
        : `${lifecycleSliceRoot}/${entry}`,
    ),
  })) satisfies readonly HrLifecycleCoverageEntry[];

const acceptanceCoverageSeeds = [
  [1, ["HRM-LCY-001", "HRM-LCY-002", "HRM-LCY-003"]],
  [2, ["HRM-LCY-025", "HRM-LCY-028"]],
  [3, ["HRM-LCY-004"]],
  [4, ["HRM-LCY-005", "HRM-LCY-006"]],
  [5, ["HRM-LCY-007"]],
  [6, ["HRM-LCY-008"]],
  [7, ["HRM-LCY-009", "HRM-LCY-010"]],
  [8, ["HRM-LCY-011", "HRM-LCY-012", "HRM-LCY-013", "HRM-LCY-014"]],
  [9, ["HRM-LCY-015", "HRM-LCY-016"]],
  [10, ["HRM-LCY-017"]],
  [11, ["HRM-LCY-018", "HRM-LCY-019"]],
  [12, ["HRM-LCY-021", "HRM-LCY-024"]],
  [13, ["HRM-LCY-022", "HRM-LCY-025"]],
  [14, ["HRM-LCY-020"]],
  [15, ["HRM-LCY-023"]],
  [16, ["HRM-LCY-024"]],
  [17, ["HRM-LCY-027"]],
  [18, ["HRM-LCY-016", "HRM-LCY-026"]],
  [19, ["HRM-LCY-028"]],
  [20, ["HRM-LCY-025"]],
] as const satisfies readonly [
  criterion: number,
  requirements: readonly HrLifecycleRequirementCode[],
][];

export const HR_WORKFORCE_LIFECYCLE_ACCEPTANCE_CRITERIA_COVERAGE =
  acceptanceCoverageSeeds.map(([criterion, requirements]) => ({
    code: `AC-${String(criterion).padStart(2, "0")}`,
    status: "shipped" as const,
    evidence: requirements.map((requirement) => `${requirement} shipped`),
  })) satisfies readonly HrLifecycleCoverageEntry[];

function buildExpectedRequirementCode(index: number): HrLifecycleRequirementCode {
  return `HRM-LCY-${String(index + 1).padStart(3, "0")}`;
}

function buildExpectedAcceptanceCode(index: number) {
  return `AC-${String(index + 1).padStart(2, "0")}`;
}

export function assertHrWorkforceLifecycleEnterpriseCoverage(): void {
  const requirements = new Set(
    HR_WORKFORCE_LIFECYCLE_REQUIREMENT_COVERAGE.map((entry) => entry.code),
  );
  const acceptanceCriteria = new Set(
    HR_WORKFORCE_LIFECYCLE_ACCEPTANCE_CRITERIA_COVERAGE.map(
      (entry) => entry.code,
    ),
  );
  const missingRequirements = Array.from(
    { length: 28 },
    (_, index) => buildExpectedRequirementCode(index),
  ).filter((code) => !requirements.has(code));
  const missingAcceptanceCriteria = Array.from(
    { length: 20 },
    (_, index) => buildExpectedAcceptanceCode(index),
  ).filter((code) => !acceptanceCriteria.has(code));
  const invalidEntries = [
    ...HR_WORKFORCE_LIFECYCLE_REQUIREMENT_COVERAGE,
    ...HR_WORKFORCE_LIFECYCLE_ACCEPTANCE_CRITERIA_COVERAGE,
  ].filter(
    (entry) => entry.status !== "shipped" || entry.evidence.length === 0,
  );

  if (
    missingRequirements.length > 0 ||
    missingAcceptanceCriteria.length > 0 ||
    invalidEntries.length > 0
  ) {
    throw new Error(
      [
        missingRequirements.length
          ? `missing requirements: ${missingRequirements.join(", ")}`
          : null,
        missingAcceptanceCriteria.length
          ? `missing acceptance criteria: ${missingAcceptanceCriteria.join(", ")}`
          : null,
        invalidEntries.length
          ? `invalid coverage entries: ${invalidEntries
              .map((entry) => entry.code)
              .join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("; "),
    );
  }
}
