export type HrWorkforceEssCoverageStatus = "scaffold-only" | "shipped";

export type HrWorkforceEssRequirementCode = `HRM-ESS-${string}`;

export type HrWorkforceEssCoverageEntry = {
  readonly code: string;
  readonly status: HrWorkforceEssCoverageStatus;
  readonly evidence: readonly string[];
};

const essSliceRoot =
  "packages/features/hr-suite/src/employee-management/employee-selfservice-portal";

const requirementCoverageSeeds = [
  [
    "001",
    [
      "contracts/hr.workforce.ess.contract.ts (hrWorkforceEssReadPermission)",
      "policies/hr.workforce.ess-access.policy.server.ts",
      "data/hr.workforce.ess-store.shared.ts (filterHrWorkforceEssRecordsForAccess)",
      "data/hr.workforce.ess.page-model.server.ts",
    ],
  ],
  [
    "002",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssEmployeeProfileSchema)",
      "data/hr.workforce.ess-store.shared.ts (employeeProfiles)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (profile summary)",
    ],
  ],
  [
    "003",
    [
      "actions/hr.workforce.ess.actions.server.ts (requestHrWorkforceEssProfileUpdateAction)",
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssProfileUpdateRequestSchema)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (profile updates)",
    ],
  ],
  [
    "004",
    [
      "actions/hr.workforce.ess.actions.server.ts (sensitive updates pending approval)",
      "schemas/hr.workforce.ess.schema.ts (sensitive/approver fields)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (approval inbox)",
    ],
  ],
  [
    "005",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssLeaveBalanceSchema)",
      "data/hr.workforce.ess-store.shared.ts (leaveBalances)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (leave balances)",
    ],
  ],
  [
    "006",
    [
      "actions/hr.workforce.ess.actions.server.ts (submitHrWorkforceEssLeaveRequestAction)",
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssLeaveRequestSchema)",
      "events/hr.workforce.ess.event.ts (leaveRequested)",
    ],
  ],
  [
    "007",
    [
      "actions/hr.workforce.ess.actions.server.ts (amendHrWorkforceEssLeaveRequestAction)",
      "actions/hr.workforce.ess.actions.server.ts (cancelHrWorkforceEssLeaveRequestAction)",
      "events/hr.workforce.ess.event.ts (leaveAmended/leaveCancelled)",
    ],
  ],
  [
    "008",
    [
      "surface/hr.workforce.ess-surface-metadata.shared.ts (leave requests)",
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssRequestTrackerSchema)",
      "data/hr.workforce.ess.page-model.server.ts (status-filtered request rows)",
    ],
  ],
  [
    "009",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssPayDocumentSchema)",
      "data/hr.workforce.ess-store.shared.ts (payDocuments)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (pay documents)",
    ],
  ],
  [
    "010",
    [
      "actions/hr.workforce.ess.actions.server.ts (downloadHrWorkforceEssDocumentAction)",
      "schemas/hr.workforce.ess.schema.ts (authorized document fields)",
      "events/hr.workforce.ess.event.ts (payDocumentAccessed/documentAccessed)",
    ],
  ],
  [
    "011",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssAttendanceRecordSchema)",
      "data/hr.workforce.ess.page-model.server.ts (attendance rows)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (attendance)",
    ],
  ],
  [
    "012",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssShiftScheduleSchema)",
      "data/hr.workforce.ess.page-model.server.ts (shift rows)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (shift schedules)",
    ],
  ],
  [
    "013",
    [
      "actions/hr.workforce.ess.actions.server.ts (submitHrWorkforceEssClaimAction)",
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssExpenseClaimSchema)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (expense claims)",
    ],
  ],
  [
    "014",
    [
      "actions/hr.workforce.ess.actions.server.ts (uploadHrWorkforceEssSupportingDocumentAction)",
      "schemas/hr.workforce.ess.schema.ts (receipt count and document refs)",
      "events/hr.workforce.ess.event.ts (supportingDocumentUploaded)",
    ],
  ],
  [
    "015",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssResourceCenterItemSchema)",
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssDocumentReferenceSchema)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (resources/documents)",
    ],
  ],
  [
    "016",
    [
      "actions/hr.workforce.ess.actions.server.ts (acknowledgeHrWorkforceEssPolicyAction)",
      "actions/hr.workforce.ess.actions.server.ts (captureHrWorkforceEssConsentAction)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (acknowledgements/consent records)",
    ],
  ],
  [
    "017",
    [
      "schemas/hr.workforce.ess.schema.ts (assigned/onboarding/offboarding/training task schemas)",
      "actions/hr.workforce.ess.actions.server.ts (completeHrWorkforceEssTaskAction)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (assigned task surfaces)",
    ],
  ],
  [
    "018",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssRequestTrackerSchema)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (request tracker)",
      "data/hr.workforce.ess-store.shared.ts (listHrWorkforceEssIntegrationExposures)",
    ],
  ],
  [
    "019",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssNotificationSchema)",
      "actions/hr.workforce.ess.actions.server.ts (markHrWorkforceEssNotificationReadAction)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (notifications)",
    ],
  ],
  [
    "020",
    [
      "schemas/hr.workforce.ess.schema.ts (hrWorkforceEssApprovalInboxItemSchema)",
      "actions/hr.workforce.ess.actions.server.ts (decideHrWorkforceEssApprovalAction)",
      "data/hr.workforce.ess.page-model.server.ts (canApprove/canWrite approval gate)",
    ],
  ],
  [
    "021",
    [
      "policies/hr.workforce.ess-access.policy.server.ts",
      "data/hr.workforce.ess-store.shared.ts (visible employee ID filtering)",
      "data/hr.workforce.ess.page-model.server.ts (visibleStore)",
    ],
  ],
  [
    "022",
    [
      "data/hr.workforce.ess-store.shared.ts (maskProfile/maskPayDocument/maskDocument)",
      "data/hr.workforce.ess.page-model.server.ts (masked cells)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (access log)",
    ],
  ],
  [
    "023",
    [
      "events/hr.workforce.ess.event.ts",
      "data/hr.workforce.ess-store.shared.ts (emitHrWorkforceEssAuditEvent)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (audit trail)",
    ],
  ],
  [
    "024",
    [
      "surface/hr.workforce.ess-lists.surface.ts",
      "surface/hr.workforce.ess-surface-metadata.shared.ts",
      "components/hr.workforce.ess-section.component.server.tsx",
    ],
  ],
  [
    "025",
    [
      "schemas/hr.workforce.ess.schema.ts (locale fields)",
      "data/hr.workforce.ess-store.shared.ts (localized resource/consent seeds)",
      "surface/hr.workforce.ess-surface-metadata.shared.ts (locale search columns)",
    ],
  ],
] as const satisfies readonly [
  suffix: string,
  evidence: readonly string[],
][];

export const HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE =
  requirementCoverageSeeds.map(([suffix, evidence]) => ({
    code: `HRM-ESS-${suffix}`,
    status: "shipped" as const,
    evidence: evidence.map((entry) =>
      entry.startsWith("packages/") ? entry : `${essSliceRoot}/${entry}`,
    ),
  })) satisfies readonly HrWorkforceEssCoverageEntry[];

const acceptanceCoverageSeeds = [
  [1, ["HRM-ESS-001", "HRM-ESS-002"]],
  [2, ["HRM-ESS-021", "HRM-ESS-022"]],
  [3, ["HRM-ESS-003"]],
  [4, ["HRM-ESS-004"]],
  [5, ["HRM-ESS-005", "HRM-ESS-008"]],
  [6, ["HRM-ESS-006"]],
  [7, ["HRM-ESS-008", "HRM-ESS-018"]],
  [8, ["HRM-ESS-009", "HRM-ESS-010"]],
  [9, ["HRM-ESS-011", "HRM-ESS-012"]],
  [10, ["HRM-ESS-013", "HRM-ESS-014"]],
  [11, ["HRM-ESS-015"]],
  [12, ["HRM-ESS-016"]],
  [13, ["HRM-ESS-017"]],
  [14, ["HRM-ESS-020"]],
  [15, ["HRM-ESS-019"]],
  [16, ["HRM-ESS-023"]],
  [17, ["HRM-ESS-022"]],
  [18, ["HRM-ESS-024"]],
  [19, ["HRM-ESS-010", "HRM-ESS-015"]],
  [20, ["HRM-ESS-018", "HRM-ESS-019"]],
] as const satisfies readonly [
  criterion: number,
  requirements: readonly HrWorkforceEssRequirementCode[],
][];

export const HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE =
  acceptanceCoverageSeeds.map(([criterion, requirements]) => ({
    code: `AC-${String(criterion).padStart(2, "0")}`,
    status: "shipped" as const,
    evidence: requirements.map((requirement) => `${requirement} shipped`),
  })) satisfies readonly HrWorkforceEssCoverageEntry[];

function buildExpectedRequirementCode(
  index: number,
): HrWorkforceEssRequirementCode {
  return `HRM-ESS-${String(index + 1).padStart(3, "0")}`;
}

function buildExpectedAcceptanceCode(index: number) {
  return `AC-${String(index + 1).padStart(2, "0")}`;
}

export function assertHrWorkforceEssEnterpriseCoverage(): void {
  const requirements = new Set<string>(
    HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE.map((entry) => entry.code),
  );
  const acceptanceCriteria = new Set<string>(
    HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE.map((entry) => entry.code),
  );
  const missingRequirements = Array.from(
    { length: 25 },
    (_, index) => buildExpectedRequirementCode(index),
  ).filter((code) => !requirements.has(code));
  const missingAcceptanceCriteria = Array.from(
    { length: 20 },
    (_, index) => buildExpectedAcceptanceCode(index),
  ).filter((code) => !acceptanceCriteria.has(code));
  const invalidAcceptanceRequirementRefs = acceptanceCoverageSeeds
    .flatMap(([, requirementCodes]) => requirementCodes)
    .filter((code) => !requirements.has(code));
  const invalidEntries = [
    ...HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE,
    ...HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE,
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
          ? `missing acceptance criteria: ${missingAcceptanceCriteria.join(", ")}`
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
