export type HrRecordsCoverageStatus = "shipped";

export type HrRecordsRequirementCode = `HRM-EMP-REC-${string}`;

export type HrRecordsCoverageEntry = {
  readonly code: string;
  readonly status: HrRecordsCoverageStatus;
  readonly evidence: readonly string[];
};

const recordsSliceRoot =
  "packages/features/hr-suite/src/employee-management/employee-records-management";

const requirementCoverageSeeds = [
  [
    "001",
    [
      "schemas/hr.workforce.records-form.shared.ts",
      "actions/hr.workforce.records.actions.server.ts (createHrEmployeeRecordAction)",
      "packages/db/src/hr-employee-records-commands.ts (createHrEmployeeRecord)",
    ],
  ],
  [
    "002",
    [
      "schemas/hr.workforce.records-form.shared.ts (employeeNumber)",
      "packages/db/src/hr-employee-records-commands.ts (duplicate employee number guard)",
      "data/hr.workforce.records-action-result.shared.ts",
    ],
  ],
  [
    "003",
    [
      "components/hr.workforce.records-create-form.component.client.tsx",
      "packages/db/src/hr-employee-records-commands.ts (HrEmployeeProfileInput)",
      "data/hr.workforce.records.detail.page-model.server.ts",
    ],
  ],
  [
    "004",
    [
      "data/hr.workforce.records.detail.page-model.server.ts",
      "components/hr.workforce.records-detail-section.component.server.tsx",
      "packages/db/src/schema/hr.ts (hr_employee_profiles)",
    ],
  ],
  [
    "005",
    [
      "schemas/hr.workforce.records-form.shared.ts",
      "components/hr.workforce.records-create-form.component.client.tsx",
      "data/hr.workforce.records-sensitive-access.shared.ts",
    ],
  ],
  [
    "006",
    [
      "packages/db/src/hr-employee-records-commands.ts (HrEmployeeEmergencyContactInput)",
      "data/hr.workforce.records.detail.page-model.server.ts",
      "components/hr.workforce.records-detail-section.component.server.tsx",
    ],
  ],
  [
    "007",
    [
      "schemas/hr.workforce.records-form.shared.ts",
      "packages/db/src/hr-employee-records-commands.ts (employment fields)",
      "data/hr.workforce.records.detail.page-model.server.ts",
    ],
  ],
  [
    "008",
    [
      "schemas/hr.workforce.records-form.shared.ts (hrRecordsAssignmentSchema)",
      "actions/hr.workforce.records.actions.server.ts (recordHrEmployeeAssignmentAction)",
      "surface/hr.workforce.records-assignments-list.surface.ts",
    ],
  ],
  [
    "009",
    [
      "packages/db/src/schema/hr.ts (current_department_id/current_position_id)",
      "surface/hr.workforce.records-directory-list.surface.ts",
      "data/hr.workforce.records.detail.page-model.server.ts",
    ],
  ],
  [
    "010",
    [
      "schemas/hr.workforce.records-form.shared.ts (managerEmployeeId)",
      "packages/db/src/hr-commands.ts (assertManagerInOrganization)",
      "surface/hr.workforce.records-assignments-list.surface.ts",
    ],
  ],
  [
    "011",
    [
      "packages/db/src/hr-employee-records.ts (listHrEmployeeRecordEventsWindow)",
      "surface/hr.workforce.records-audit-trail-list.surface.ts",
      "packages/db/src/hr-employee-records-commands.ts (previousValue/newValue)",
    ],
  ],
  [
    "012",
    [
      "schemas/hr.workforce.records-employment-status.schema.ts",
      "packages/db/src/hr-employee-records.ts (listHrEmployeeStatusHistoryWindow)",
      "surface/hr.workforce.records-status-history-list.surface.ts",
    ],
  ],
  [
    "013",
    [
      "packages/db/src/hr-employee-records.ts (listHrEmployeeDocumentReferencesWindow)",
      "surface/hr.workforce.records-document-references-list.surface.ts",
      "packages/db/src/schema/hr.ts (hr_employee_documents)",
    ],
  ],
  [
    "014",
    [
      "packages/db/src/hr-employee-records.ts (resolveMissingMandatoryFields)",
      "surface/hr.workforce.records-incomplete-list.surface.ts",
      "surface/hr.workforce.records-overview-stat.surface.ts",
    ],
  ],
  [
    "015",
    [
      "packages/db/src/hr-employee-records-commands.ts (assertNoDuplicateProfileIdentity)",
      "packages/db/src/hr-employee-records.ts (findHrEmployeeDuplicateCandidates)",
      "data/hr.workforce.records-action-result.shared.ts",
    ],
  ],
  [
    "016",
    [
      "actions/hr.workforce.records.actions.server.ts (rehireHrEmployeeRecordAction)",
      "packages/db/src/hr-employee-records-commands.ts (rehireHrEmployee)",
      "data/hr.workforce.records.detail.page-model.server.ts (rehiredFrom)",
    ],
  ],
  [
    "017",
    [
      "schemas/hr.workforce.records-form.shared.ts (assignmentEffectiveFrom)",
      "packages/db/src/hr-commands.ts (upsertHrEmployeeEffectiveAssignmentInTx)",
      "components/hr.workforce.records-list-trailing.component.client.tsx",
    ],
  ],
  [
    "018",
    [
      "policies/hr.workforce.records-access.policy.server.ts",
      "data/hr.workforce.records-sensitive-access.shared.ts",
      "data/hr.workforce.records.detail.page-model.server.ts",
    ],
  ],
  [
    "019",
    [
      "events/hr.workforce.records.event.ts",
      "packages/db/src/hr-employee-records-commands.ts (insertHrEmployeeRecordEventInTx)",
      "actions/hr.workforce.records.mutation.shared.server.ts",
    ],
  ],
  [
    "020",
    [
      "actions/hr.workforce.records.actions.server.ts (archiveHrEmployeeRecordAction)",
      "packages/db/src/hr-employee-records-commands.ts (archiveHrEmployeeRecord)",
      "surface/hr.workforce.records-separated-list.surface.ts",
    ],
  ],
] as const satisfies readonly [
  suffix: string,
  evidence: readonly string[],
][];

export const HR_WORKFORCE_RECORDS_REQUIREMENT_COVERAGE =
  requirementCoverageSeeds.map(([suffix, evidence]) => ({
    code: `HRM-EMP-REC-${suffix}`,
    status: "shipped" as const,
    evidence: evidence.map((entry) =>
      entry.startsWith("packages/") ? entry : `${recordsSliceRoot}/${entry}`,
    ),
  })) satisfies readonly HrRecordsCoverageEntry[];

const acceptanceCoverageSeeds = [
  [1, ["HRM-EMP-REC-001", "HRM-EMP-REC-003", "HRM-EMP-REC-007"]],
  [2, ["HRM-EMP-REC-002"]],
  [3, ["HRM-EMP-REC-003", "HRM-EMP-REC-005", "HRM-EMP-REC-015"]],
  [4, ["HRM-EMP-REC-004", "HRM-EMP-REC-018"]],
  [5, ["HRM-EMP-REC-012", "HRM-EMP-REC-019"]],
  [
    6,
    [
      "HRM-EMP-REC-007",
      "HRM-EMP-REC-008",
      "HRM-EMP-REC-009",
      "HRM-EMP-REC-010",
    ],
  ],
  [7, ["HRM-EMP-REC-017"]],
  [8, ["HRM-EMP-REC-011", "HRM-EMP-REC-019"]],
  [9, ["HRM-EMP-REC-013"]],
  [10, ["HRM-EMP-REC-014"]],
  [11, ["HRM-EMP-REC-018"]],
  [12, ["HRM-EMP-REC-019"]],
  [13, ["HRM-EMP-REC-011", "HRM-EMP-REC-016"]],
  [14, ["HRM-EMP-REC-020"]],
] as const satisfies readonly [
  criterion: number,
  requirements: readonly HrRecordsRequirementCode[],
][];

export const HR_WORKFORCE_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE =
  acceptanceCoverageSeeds.map(([criterion, requirements]) => ({
    code: `AC-${String(criterion).padStart(2, "0")}`,
    status: "shipped" as const,
    evidence: requirements.map((requirement) => `${requirement} shipped`),
  })) satisfies readonly HrRecordsCoverageEntry[];

function buildExpectedRequirementCode(index: number): HrRecordsRequirementCode {
  return `HRM-EMP-REC-${String(index + 1).padStart(3, "0")}`;
}

function buildExpectedAcceptanceCode(index: number) {
  return `AC-${String(index + 1).padStart(2, "0")}`;
}

export function assertHrWorkforceRecordsEnterpriseCoverage(): void {
  const requirements = new Set(
    HR_WORKFORCE_RECORDS_REQUIREMENT_COVERAGE.map((entry) => entry.code),
  );
  const acceptanceCriteria = new Set(
    HR_WORKFORCE_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE.map(
      (entry) => entry.code,
    ),
  );
  const missingRequirements = Array.from(
    { length: 20 },
    (_, index) => buildExpectedRequirementCode(index),
  ).filter((code) => !requirements.has(code));
  const missingAcceptanceCriteria = Array.from(
    { length: 14 },
    (_, index) => buildExpectedAcceptanceCode(index),
  ).filter((code) => !acceptanceCriteria.has(code));
  const invalidAcceptanceRequirementRefs = acceptanceCoverageSeeds
    .flatMap(([, requirementCodes]) => requirementCodes)
    .filter((code) => !requirements.has(code));
  const invalidEntries = [
    ...HR_WORKFORCE_RECORDS_REQUIREMENT_COVERAGE,
    ...HR_WORKFORCE_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE,
  ].filter(
    (entry) => entry.status !== "shipped" || entry.evidence.length === 0,
  );

  if (
    missingRequirements.length > 0 ||
    missingAcceptanceCriteria.length > 0 ||
    invalidAcceptanceRequirementRefs.length > 0 ||
    invalidEntries.length > 0
  ) {
    throw new Error(
      [
        missingRequirements.length
          ? `missing requirements: ${missingRequirements.join(", ")}`
          : null,
        missingAcceptanceCriteria.length
          ? `missing architecture acceptance criteria: ${missingAcceptanceCriteria.join(", ")}`
          : null,
        invalidAcceptanceRequirementRefs.length
          ? `invalid acceptance requirement references: ${invalidAcceptanceRequirementRefs.join(", ")}`
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
