export type HrDocumentsCoverageStatus = "shipped";

export type HrDocumentsRequirementCode = `HRM-DOC-${string}`;

export type HrDocumentsCoverageEntry = {
  readonly code: string;
  readonly status: HrDocumentsCoverageStatus;
  readonly evidence: readonly string[];
};

const documentsSliceRoot =
  "packages/features/hr-suite/src/employee-management/documents-management";

const requirementCoverageSeeds = [
  [
    "001",
    [
      "actions/hr.workforce.documents.actions.server.ts",
      "schemas/hr.workforce.documents-repository.schema.ts",
      "surface/hr.workforce.documents-repository-list.surface.ts",
    ],
  ],
  [
    "002",
    [
      "surface/hr.workforce.documents-repository-list.surface.ts",
      "data/hr.workforce.documents.page-model.server.ts",
      "packages/db/src/schema/hr.ts (hr_employee_documents)",
    ],
  ],
  [
    "003",
    [
      "contracts/hr.workforce.documents-route.contract.ts",
      "actions/hr.workforce.documents.actions.server.ts",
      "packages/db/src/hr-documents.ts (registerHrEmployeeDocument)",
    ],
  ],
  [
    "004",
    [
      "schemas/hr.workforce.documents-repository.schema.ts",
      "surface/hr.workforce.documents-requirements-list.surface.ts",
      "surface/hr.workforce.documents-missing-list.surface.ts",
    ],
  ],
  [
    "005",
    [
      "actions/hr.workforce.documents.actions.server.ts",
      "packages/db/src/hr-documents.ts (replaceHrEmployeeDocument)",
      "surface/hr.workforce.documents-repository-list.surface.ts",
    ],
  ],
  [
    "006",
    [
      "packages/db/src/schema/hr.ts (is_latest_active)",
      "packages/db/src/hr-documents.ts (listHrEmployeeDocumentsWindow latestOnly)",
      "surface/hr.workforce.documents-repository-list.surface.ts",
    ],
  ],
  [
    "007",
    [
      "packages/db/src/hr-documents.ts (replaceHrEmployeeDocument)",
      "surface/hr.workforce.documents-retention-list.surface.ts",
      "schemas/hr.workforce.documents-repository.schema.ts",
    ],
  ],
  [
    "008",
    [
      "data/hr.workforce.documents-status.shared.ts",
      "surface/hr.workforce.documents-repository-list.surface.ts",
      "surface/hr.workforce.documents-expiring-list.surface.ts",
    ],
  ],
  [
    "009",
    [
      "actions/hr.workforce.documents.actions.server.ts",
      "components/hr.workforce.documents-list-trailing.component.client.tsx",
      "surface/hr.workforce.documents-repository-list.surface.ts",
    ],
  ],
  [
    "010",
    [
      "schemas/hr.workforce.documents-repository.schema.ts",
      "actions/hr.workforce.documents.actions.server.ts",
      "components/hr.workforce.documents-list-trailing.component.client.tsx",
    ],
  ],
  [
    "011",
    [
      "schemas/hr.workforce.documents-repository.schema.ts",
      "data/hr.workforce.documents-status.shared.ts",
      "surface/hr.workforce.documents-expiring-list.surface.ts",
    ],
  ],
  [
    "012",
    [
      "surface/hr.workforce.documents-overview-stat.surface.ts",
      "surface/hr.workforce.documents-expiring-list.surface.ts",
      "packages/db/src/hr-documents-overview.ts",
    ],
  ],
  [
    "013",
    [
      "data/hr.workforce.documents-status.shared.ts",
      "surface/hr.workforce.documents-expiring-list.surface.ts",
      "data/hr.workforce.documents.page-model.server.ts",
    ],
  ],
  [
    "014",
    [
      "actions/hr.workforce.documents.actions.server.ts",
      "schemas/hr.workforce.documents-repository.schema.ts",
      "packages/db/src/hr-documents.ts (replaceHrEmployeeDocument)",
    ],
  ],
  [
    "015",
    [
      "surface/hr.workforce.documents-acknowledgments-list.surface.ts",
      "schemas/hr.workforce.documents-repository.schema.ts",
      "packages/db/src/hr-documents.ts (recordHrDocumentAcknowledgment)",
    ],
  ],
  [
    "016",
    [
      "schemas/hr.workforce.documents-repository.schema.ts",
      "surface/hr.workforce.documents-acknowledgments-list.surface.ts",
      "components/hr.workforce.documents-forms.component.client.tsx",
    ],
  ],
  [
    "017",
    [
      "policies/hr.workforce.documents-access.policy.server.ts",
      "data/hr.workforce.documents-sensitive-access.shared.ts",
      "components/hr.workforce.documents-section.component.server.tsx",
    ],
  ],
  [
    "018",
    [
      "actions/hr.workforce.documents.actions.server.ts (authorizeHrEmployeeDocumentDownloadAction)",
      "packages/db/src/hr-documents.ts (authorizeHrEmployeeDocumentDownload)",
      "data/hr.workforce.documents-sensitive-access.shared.ts",
    ],
  ],
  [
    "019",
    [
      "surface/hr.workforce.documents-repository-list.surface.ts",
      "surface/hr.workforce.documents-expiring-list.surface.ts",
      "policies/hr.workforce.documents-access.policy.server.ts",
    ],
  ],
  [
    "020",
    [
      "data/hr.workforce.documents-search-params.parse.shared.ts",
      "surface/hr.workforce.documents-surface-metadata.shared.ts",
      "packages/db/src/hr-documents.ts (listHrEmployeeDocumentsWindow)",
    ],
  ],
  [
    "021",
    [
      "surface/hr.workforce.documents-retention-list.surface.ts",
      "schemas/hr.workforce.documents-repository.schema.ts",
      "packages/db/src/hr-documents.ts (upsertHrDocumentRetentionPolicy)",
    ],
  ],
  [
    "022",
    [
      "surface/hr.workforce.documents-retention-list.surface.ts",
      "schemas/hr.workforce.documents-repository.schema.ts",
      "packages/db/src/schema/hr.ts (archive_on_separation)",
    ],
  ],
  [
    "023",
    [
      "events/hr.workforce.documents.event.ts",
      "packages/db/src/hr-documents.ts (hr_document_audit_events)",
      "surface/hr.workforce.documents-audit-trail-list.surface.ts",
    ],
  ],
  [
    "024",
    [
      "packages/features/hr-suite/src/employee-management/employee-selfservice-portal/surface/hr.workforce.ess-surface-metadata.shared.ts",
      "packages/features/hr-suite/src/employee-management/employee-selfservice-portal/actions/hr.workforce.ess.actions.server.ts",
      "documents-management-architecture.md",
    ],
  ],
  [
    "025",
    [
      "actions/hr.workforce.documents.actions.server.ts (getHrEmployeeDocumentReadinessAction)",
      "packages/db/src/hr-documents.ts (getHrEmployeeDocumentReadiness)",
      "packages/features/hr-suite/src/employee-management/employee-records-management/surface/hr.workforce.records-document-references-list.surface.ts",
    ],
  ],
] as const satisfies readonly [
  suffix: string,
  evidence: readonly string[],
][];

export const HR_WORKFORCE_DOCUMENTS_REQUIREMENT_COVERAGE =
  requirementCoverageSeeds.map(([suffix, evidence]) => ({
    code: `HRM-DOC-${suffix}`,
    status: "shipped" as const,
    evidence: evidence.map((entry) =>
      entry.startsWith("packages/") ? entry : `${documentsSliceRoot}/${entry}`,
    ),
  })) satisfies readonly HrDocumentsCoverageEntry[];

const acceptanceCoverageSeeds = [
  [1, ["HRM-DOC-001", "HRM-DOC-003"]],
  [2, ["HRM-DOC-002", "HRM-DOC-008"]],
  [3, ["HRM-DOC-004"]],
  [4, ["HRM-DOC-004"]],
  [5, ["HRM-DOC-008"]],
  [6, ["HRM-DOC-010"]],
  [7, ["HRM-DOC-011"]],
  [8, ["HRM-DOC-012"]],
  [9, ["HRM-DOC-013"]],
  [10, ["HRM-DOC-005", "HRM-DOC-007", "HRM-DOC-014"]],
  [11, ["HRM-DOC-006"]],
  [12, ["HRM-DOC-024"]],
  [13, ["HRM-DOC-015"]],
  [14, ["HRM-DOC-016"]],
  [15, ["HRM-DOC-017", "HRM-DOC-019"]],
  [16, ["HRM-DOC-018"]],
  [17, ["HRM-DOC-020"]],
  [18, ["HRM-DOC-025"]],
  [19, ["HRM-DOC-007", "HRM-DOC-021", "HRM-DOC-022"]],
  [20, ["HRM-DOC-023"]],
] as const satisfies readonly [
  criterion: number,
  requirements: readonly HrDocumentsRequirementCode[],
][];

export const HR_WORKFORCE_DOCUMENTS_ACCEPTANCE_CRITERIA_COVERAGE =
  acceptanceCoverageSeeds.map(([criterion, requirements]) => ({
    code: `AC-${String(criterion).padStart(2, "0")}`,
    status: "shipped" as const,
    evidence: requirements.map((requirement) => `${requirement} shipped`),
  })) satisfies readonly HrDocumentsCoverageEntry[];

function buildExpectedRequirementCode(
  index: number,
): HrDocumentsRequirementCode {
  return `HRM-DOC-${String(index + 1).padStart(3, "0")}`;
}

function buildExpectedAcceptanceCode(index: number) {
  return `AC-${String(index + 1).padStart(2, "0")}`;
}

export function assertHrWorkforceDocumentsEnterpriseCoverage(): void {
  const requirements = new Set(
    HR_WORKFORCE_DOCUMENTS_REQUIREMENT_COVERAGE.map((entry) => entry.code),
  );
  const acceptanceCriteria = new Set(
    HR_WORKFORCE_DOCUMENTS_ACCEPTANCE_CRITERIA_COVERAGE.map(
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
    ...HR_WORKFORCE_DOCUMENTS_REQUIREMENT_COVERAGE,
    ...HR_WORKFORCE_DOCUMENTS_ACCEPTANCE_CRITERIA_COVERAGE,
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
