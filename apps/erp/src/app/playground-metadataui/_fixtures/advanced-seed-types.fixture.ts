import "server-only";

export type MetadataUiAdvancedPatternKind =
  | "overview"
  | "operations-list"
  | "tanstack-table"
  | "record-detail"
  | "workflow-form"
  | "planning-board"
  | "analytics"
  | "state-matrix";

export type MetadataUiAdvancedPatternId<
  Kind extends MetadataUiAdvancedPatternKind = MetadataUiAdvancedPatternKind,
> = `metadata-ui.playground.advanced.${Kind}.${string}`;

export type MetadataUiAdvancedSectionKey<
  Kind extends MetadataUiAdvancedPatternKind = MetadataUiAdvancedPatternKind,
> = `metadata-ui.playground.advanced.${Kind}.section.${string}`;

export type MetadataUiAdvancedSeedId<
  Bucket extends string = string,
> = `metadata-ui.playground.advanced.seed.${Bucket}.${string}`;

export type MetadataUiAdvancedStatus =
  | "ready"
  | "review"
  | "blocked"
  | "complete";

export type MetadataUiAdvancedPriority = "low" | "normal" | "high";

export type MetadataUiAdvancedReviewBand =
  | "standard"
  | "elevated"
  | "restricted";

export type MetadataUiAdvancedPermissionBand =
  | "available"
  | "disabled"
  | "hidden";

export type MetadataUiAdvancedScenario<
  Kind extends MetadataUiAdvancedPatternKind = MetadataUiAdvancedPatternKind,
> = Readonly<{
  id: MetadataUiAdvancedPatternId<Kind>;
  kind: Kind;
  title: string;
  description: string;
  navigationLabel: string;
  sectionKeys: readonly MetadataUiAdvancedSectionKey<Kind>[];
}>;

export type MetadataUiAdvancedNavigationGroup = Readonly<{
  id: MetadataUiAdvancedSeedId<"navigation-group">;
  label: string;
  description: string;
  scenarioIds: readonly MetadataUiAdvancedPatternId[];
}>;

export type MetadataUiAdvancedOperationsRow = Readonly<{
  kind: "operations-row";
  id: MetadataUiAdvancedSeedId<"operation">;
  recordLabel: string;
  locationLabel: string;
  ownerLabel: string;
  status: MetadataUiAdvancedStatus;
  priority: MetadataUiAdvancedPriority;
  reviewBand: MetadataUiAdvancedReviewBand;
  permissionBand: MetadataUiAdvancedPermissionBand;
  updatedAt: string;
}>;

export type MetadataUiAdvancedTableLabRow = Readonly<{
  kind: "table-lab-row";
  id: MetadataUiAdvancedSeedId<"table-row">;
  recordLabel: string;
  queueLabel: string;
  status: MetadataUiAdvancedStatus;
  sortBucket: number;
  filterTags: readonly string[];
  canSelect: boolean;
  trailingActionState: MetadataUiAdvancedPermissionBand;
}>;

export type MetadataUiAdvancedRecordSeed = Readonly<{
  kind: "record";
  id: MetadataUiAdvancedSeedId<"record">;
  title: string;
  subtitle: string;
  ownerLabel: string;
  status: MetadataUiAdvancedStatus;
  auditEventIds: readonly MetadataUiAdvancedSeedId<"audit-event">[];
}>;

export type MetadataUiAdvancedWorkflowStepSeed = Readonly<{
  kind: "workflow-step";
  id: MetadataUiAdvancedSeedId<"workflow-step">;
  label: string;
  status: MetadataUiAdvancedStatus;
  fieldKeys: readonly string[];
}>;

export type MetadataUiAdvancedPlanningCardSeed = Readonly<{
  kind: "planning-card";
  id: MetadataUiAdvancedSeedId<"planning-card">;
  lane: "intake" | "review" | "ready";
  title: string;
  status: MetadataUiAdvancedStatus;
  priority: MetadataUiAdvancedPriority;
}>;

export type MetadataUiAdvancedStateSeed = Readonly<{
  kind: "state";
  id: MetadataUiAdvancedSeedId<"state">;
  state: "ready" | "loading" | "empty" | "forbidden" | "error";
  title: string;
  description: string;
}>;

export type MetadataUiAdvancedSeedCatalog = Readonly<{
  generatedAt: "2026-01-01T08:00:00.000Z";
  scenarios: readonly MetadataUiAdvancedScenario[];
  navigationGroups: readonly MetadataUiAdvancedNavigationGroup[];
  operationsRows: readonly MetadataUiAdvancedOperationsRow[];
  tableLabRows: readonly MetadataUiAdvancedTableLabRow[];
  records: readonly MetadataUiAdvancedRecordSeed[];
  workflowSteps: readonly MetadataUiAdvancedWorkflowStepSeed[];
  planningCards: readonly MetadataUiAdvancedPlanningCardSeed[];
  states: readonly MetadataUiAdvancedStateSeed[];
}>;
