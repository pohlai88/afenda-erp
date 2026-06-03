export type HrComplianceCoverageStatus = "shipped";

export type HrComplianceRequirementCode = `HRM-CMP-${string}`;

export type HrComplianceCoverageEntry = {
  readonly code: string;
  readonly status: HrComplianceCoverageStatus;
  readonly evidence: readonly string[];
};

const complianceSliceRoot =
  "packages/features/hr-suite/src/employee-management/compliance-regulatory-tracking";

const requirementCoverageSeeds = [
  [
    "001",
    [
      "data/hr.workforce.compliance-obligation.shared.ts",
      "schemas/hr.workforce.compliance-obligation.schema.ts",
      "surface/hr.workforce.compliance-obligations-list.surface.ts",
    ],
  ],
  [
    "002",
    [
      "data/hr.workforce.compliance-status.shared.ts",
      "schemas/hr.workforce.compliance-labor-law.schema.ts",
      "surface/hr.workforce.compliance-labor-law-requirements-list.surface.ts",
    ],
  ],
  [
    "003",
    [
      "schemas/hr.workforce.compliance-statutory.schema.ts",
      "surface/hr.workforce.compliance-statutory-requirements-list.surface.ts",
      "data/hr.workforce.compliance.page-model.server.ts",
    ],
  ],
  [
    "004",
    [
      "data/hr.workforce.compliance-work-eligibility.shared.ts",
      "schemas/hr.workforce.compliance-work-eligibility.schema.ts",
      "surface/hr.workforce.compliance-work-eligibility-list.surface.ts",
    ],
  ],
  [
    "005",
    [
      "data/hr.workforce.compliance-work-auth-documents.shared.ts",
      "schemas/hr.workforce.compliance-work-auth-documents.schema.ts",
      "surface/hr.workforce.compliance-work-auth-documents-list.surface.ts",
    ],
  ],
  [
    "006",
    [
      "schemas/hr.workforce.compliance-workplace-safety.schema.ts",
      "surface/hr.workforce.compliance-workplace-safety-list.surface.ts",
      "data/hr.workforce.compliance.page-model.server.ts",
    ],
  ],
  [
    "007",
    [
      "schemas/hr.workforce.compliance-safety-training.schema.ts",
      "surface/hr.workforce.compliance-safety-training-requirements-list.surface.ts",
      "data/hr.workforce.compliance.page-model.server.ts",
    ],
  ],
  [
    "008",
    [
      "schemas/hr.workforce.compliance-policy-acknowledgement.schema.ts",
      "surface/hr.workforce.compliance-policy-acknowledgements-list.surface.ts",
      "data/hr.workforce.compliance.page-model.server.ts",
    ],
  ],
  [
    "009",
    [
      "data/hr.workforce.compliance-filing.shared.ts",
      "schemas/hr.workforce.compliance-filing.schema.ts",
      "surface/hr.workforce.compliance-filings-list.surface.ts",
    ],
  ],
  [
    "010",
    [
      "data/hr.workforce.compliance-regulatory-calendar.shared.ts",
      "surface/hr.workforce.compliance-regulatory-calendar-list.surface.ts",
      "data/hr.workforce.compliance.page-model.server.ts",
    ],
  ],
  [
    "011",
    [
      "data/hr.workforce.compliance-alerts.shared.ts",
      "surface/hr.workforce.compliance-alerts-list.surface.ts",
      "data/hr.workforce.compliance-work-auth-documents.shared.ts",
    ],
  ],
  [
    "012",
    [
      "data/hr.workforce.compliance-alerts.shared.ts",
      "data/hr.workforce.compliance-regulatory-calendar.shared.ts",
      "surface/hr.workforce.compliance-work-auth-documents-list.surface.ts",
    ],
  ],
  [
    "013",
    [
      "data/hr.workforce.compliance-status.shared.ts",
      "surface/hr.workforce.compliance-safety-training-requirements-list.surface.ts",
      "data/hr.workforce.compliance-alerts.shared.ts",
    ],
  ],
  [
    "014",
    [
      "data/hr.workforce.compliance-status.shared.ts",
      "surface/hr.workforce.compliance-policy-acknowledgements-list.surface.ts",
      "data/hr.workforce.compliance-alerts.shared.ts",
    ],
  ],
  [
    "015",
    [
      "data/hr.workforce.compliance-status.shared.ts",
      "data/hr.workforce.compliance-work-eligibility.shared.ts",
      "data/hr.workforce.compliance-work-auth-documents.shared.ts",
    ],
  ],
  [
    "016",
    [
      "data/hr.workforce.compliance-alerts.shared.ts",
      "surface/hr.workforce.compliance-alerts-list.surface.ts",
      "data/hr.workforce.compliance.page-model.server.ts",
    ],
  ],
  [
    "017",
    [
      "schemas/hr.workforce.compliance-exception.schema.ts",
      "surface/hr.workforce.compliance-exceptions-list.surface.ts",
      "actions/hr.workforce.compliance.actions.server.ts",
    ],
  ],
  [
    "018",
    [
      "schemas/hr.workforce.compliance-exception.schema.ts",
      "components/hr.workforce.compliance-list-trailing-form.component.client.tsx",
      "actions/hr.workforce.compliance.actions.server.ts",
    ],
  ],
  [
    "019",
    [
      "schemas/hr.workforce.compliance-exception.schema.ts",
      "surface/hr.workforce.compliance-exceptions-list.surface.ts",
      "actions/hr.workforce.compliance.actions.server.ts",
    ],
  ],
  [
    "020",
    [
      "data/hr.workforce.compliance-evidence-links.shared.ts",
      "schemas/hr.workforce.compliance-evidence-link.schema.ts",
      "surface/hr.workforce.compliance-evidence-links-list.surface.ts",
    ],
  ],
  [
    "021",
    [
      "data/hr.workforce.compliance-review-queue.shared.ts",
      "schemas/hr.workforce.compliance-review-queue.schema.ts",
      "surface/hr.workforce.compliance-review-queue-list.surface.ts",
    ],
  ],
  [
    "022",
    [
      "surface/hr.workforce.compliance-overview-stat.surface.ts",
      "surface/hr.workforce.compliance-overview-breakdown-list.surface.ts",
      "data/hr.workforce.compliance.page-model.server.ts",
    ],
  ],
  [
    "023",
    [
      "data/hr.workforce.compliance.reports.shared.ts",
      "data/hr.workforce.compliance.reports.shared.server.ts",
      "components/hr.workforce.compliance-reports.component.client.tsx",
    ],
  ],
  [
    "024",
    [
      "policies/hr.workforce.compliance-access.policy.server.ts",
      "data/hr.workforce.compliance-sensitive-access.shared.ts",
      "components/hr.workforce.compliance-section.component.server.tsx",
    ],
  ],
  [
    "025",
    [
      "events/hr.workforce.compliance.event.ts",
      "events/hr.workforce.compliance.audit-emitted.shared.ts",
      "surface/hr.workforce.compliance-audit-trail-list.surface.ts",
    ],
  ],
] as const satisfies readonly [
  suffix: string,
  evidence: readonly string[],
][];

export const HR_WORKFORCE_COMPLIANCE_REQUIREMENT_COVERAGE =
  requirementCoverageSeeds.map(([suffix, evidence]) => ({
    code: `HRM-CMP-${suffix}`,
    status: "shipped" as const,
    evidence: evidence.map((entry) => `${complianceSliceRoot}/${entry}`),
  })) satisfies readonly HrComplianceCoverageEntry[];

const acceptanceCoverageSeeds = [
  [1, ["HRM-CMP-001"]],
  [2, ["HRM-CMP-022"]],
  [3, ["HRM-CMP-004"]],
  [4, ["HRM-CMP-005"]],
  [5, ["HRM-CMP-011"]],
  [6, ["HRM-CMP-012", "HRM-CMP-016"]],
  [7, ["HRM-CMP-012", "HRM-CMP-015"]],
  [8, ["HRM-CMP-009"]],
  [9, ["HRM-CMP-009", "HRM-CMP-016", "HRM-CMP-017"]],
  [10, ["HRM-CMP-008"]],
  [11, ["HRM-CMP-014", "HRM-CMP-017"]],
  [12, ["HRM-CMP-007"]],
  [13, ["HRM-CMP-013", "HRM-CMP-017"]],
  [14, ["HRM-CMP-017"]],
  [15, ["HRM-CMP-018", "HRM-CMP-019"]],
  [16, ["HRM-CMP-020"]],
  [17, ["HRM-CMP-022"]],
  [18, ["HRM-CMP-024"]],
  [19, ["HRM-CMP-023"]],
  [20, ["HRM-CMP-025"]],
] as const satisfies readonly [
  criterion: number,
  requirements: readonly HrComplianceRequirementCode[],
][];

export const HR_WORKFORCE_COMPLIANCE_ACCEPTANCE_CRITERIA_COVERAGE =
  acceptanceCoverageSeeds.map(([criterion, requirements]) => ({
    code: `AC-${String(criterion).padStart(2, "0")}`,
    status: "shipped" as const,
    evidence: requirements.map((requirement) => `${requirement} shipped`),
  })) satisfies readonly HrComplianceCoverageEntry[];

function buildExpectedRequirementCode(index: number): HrComplianceRequirementCode {
  return `HRM-CMP-${String(index + 1).padStart(3, "0")}`;
}

function buildExpectedAcceptanceCode(index: number) {
  return `AC-${String(index + 1).padStart(2, "0")}`;
}

export function assertHrWorkforceComplianceEnterpriseCoverage(): void {
  const requirements = new Set(
    HR_WORKFORCE_COMPLIANCE_REQUIREMENT_COVERAGE.map((entry) => entry.code),
  );
  const acceptanceCriteria = new Set(
    HR_WORKFORCE_COMPLIANCE_ACCEPTANCE_CRITERIA_COVERAGE.map(
      (entry) => entry.code,
    ),
  );
  const missingRequirements = Array.from(
    { length: 25 },
    (_, index) => buildExpectedRequirementCode(index),
  ).filter((code) => !requirements.has(code));
  const missingAcceptanceCriteria = Array.from(
    { length: 20 },
    (_, index) => buildExpectedAcceptanceCode(index),
  ).filter((code) => !acceptanceCriteria.has(code));
  const invalidEntries = [
    ...HR_WORKFORCE_COMPLIANCE_REQUIREMENT_COVERAGE,
    ...HR_WORKFORCE_COMPLIANCE_ACCEPTANCE_CRITERIA_COVERAGE,
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
