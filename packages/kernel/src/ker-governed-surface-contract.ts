export const GOVERNED_METADATA_SCHEMA_VERSION = 1 as const;

export type ErpFunction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "search"
  | "audit"
  | "predict";

export type ErpPermissionRequirement = {
  module: string;
  object: string;
  function: ErpFunction;
};

export type ActionDescriptor = {
  id: string;
  label: string;
  intent?: "default" | "destructive" | "approval" | "financial" | "compliance";
  minRole?: "member" | "admin" | "owner";
  requiresStepUp?: boolean;
  confirm?: {
    title: string;
    description?: string;
    confirmLabel: string;
  };
};

export type ListCellTone = "default" | "positive" | "attention" | "critical";

export type ListCellKind =
  | { kind: "text" }
  | { kind: "link"; href?: string }
  | { kind: "badge"; tone?: ListCellTone }
  | { kind: "currency"; currency?: string }
  | { kind: "date" }
  | { kind: "datetime" }
  | { kind: "sparkline"; points: number[] }
  | { kind: "meter"; value: number; max: number; label?: string }
  | { kind: "semantic-text"; tone?: ListCellTone }
  | { kind: "avatar-stack"; initials: string[]; overflow?: number };

export type ListColumn = {
  id: string;
  header: string;
  headerAction?: {
    label: string;
    href?: string;
    actionId?: string;
  };
  align?: "start" | "center" | "end";
  width?: "auto" | "sm" | "md" | "lg";
  priority?: "primary" | "secondary" | "tertiary";
  pin?: "start" | "end";
  wrap?: boolean;
  clip?: boolean;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  summary?: "sum" | "count" | "average" | "custom";
  cellKind?: ListCellKind;
  enableClientSort?: boolean;
};

export type EmptyState = {
  variant: "muted" | "cta" | "forbidden" | "error";
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
};

export type ListSurface = {
  header: {
    eyebrow?: string;
    title: string;
    description?: string;
    backHref?: string;
    backLabel?: string;
  };
  columnsId: string;
  rowKey: string;
  empty: EmptyState;
  primaryAction?: {
    label: string;
    href?: string;
    actionId?: string;
    minRole?: "member" | "admin" | "owner";
  };
};

export type ListSurfaceToolbarExport = {
  actionId: string;
  kind?: "download";
  label: string;
  formats: "csv"[];
  triggerElementId?: string;
};

export type ListSurfaceToolbarSearch = {
  param: string;
  label: string;
  placeholder?: string;
  value?: string;
};

export type ListSurfaceToolbarFilterOption = {
  label: string;
  value: string;
  count?: number;
};

export type ListSurfaceToolbarFilter = {
  id: string;
  label: string;
  param: string;
  value?: string;
  options: ListSurfaceToolbarFilterOption[];
};

export type ListSurfaceToolbarSortOption = {
  label: string;
  value: string;
  columnId: string;
  direction: "asc" | "desc";
};

export type ListSurfaceToolbarSort = {
  label: string;
  param: string;
  value?: string;
  options: ListSurfaceToolbarSortOption[];
};

export type ListSurfaceToolbarSavedView = {
  label: string;
  activeLabel?: string;
  href?: string;
  items?: {
    id?: string;
    label: string;
    href: string;
    active?: boolean;
    icon?: string | null;
  }[];
};

export type ListSurfaceToolbarActionConfirm = {
  title: string;
  description?: string;
  confirmLabel: string;
};

export type ListSurfaceToolbarBulkAction = {
  actionId: string;
  kind?: "server-action";
  label: string;
  disabledReason?: string;
  confirm?: ListSurfaceToolbarActionConfirm;
};

export type ListSurfaceToolbar = {
  export?: ListSurfaceToolbarExport;
  search?: ListSurfaceToolbarSearch;
  filters?: ListSurfaceToolbarFilter[];
  sort?: ListSurfaceToolbarSort;
  savedView?: ListSurfaceToolbarSavedView;
  bulkActions?: ListSurfaceToolbarBulkAction[];
  densityToggle?: boolean;
  columnPicker?: boolean;
  resetParams?: string[];
};

export type ListSurfaceRowTrailingAction = {
  state: "hidden" | "disabled" | "ready";
  disabledReason?: string;
  descriptor?: ActionDescriptor;
};

export type ListSurfaceRowTone = "default" | "attention" | "critical";

export type ListSurfaceRowDecisionLedger = {
  reason?: string;
  evidenceHref?: string;
  policyLabel?: string;
  policyHref?: string;
  actorLabel?: string;
  occurredAt?: string;
  riskTone?: "default" | "positive" | "attention" | "critical";
  nextActionLabel?: string;
};

export type ListSurfaceRow = {
  id: string;
  cells: Record<string, string | number | boolean>;
  rowHref?: string;
  linkColumnId?: string;
  rowTone?: ListSurfaceRowTone;
  selectionDisabledReason?: string;
  cellKinds?: Record<string, ListCellKind>;
  trailingAction?: ListSurfaceRowTrailingAction;
  decisionLedger?: ListSurfaceRowDecisionLedger;
};

export type ListSurfacePresentation = {
  variant?: "table-only";
  tableDensity?: "compact" | "comfortable";
  narrowMode?: "table" | "cards" | "auto";
  primaryColumnId?: string;
  stickyHeader?: boolean;
  virtualizeRowThreshold?: number;
  toolbar?: ListSurfaceToolbar;
  selection?: {
    mode?: "none" | "single" | "multiple";
    label?: string;
    bulkScopeLabel?: string;
  };
  grouping?: {
    groups: {
      id: string;
      label: string;
      rowIds: string[];
    }[];
  };
  summary?: {
    rows: {
      id: string;
      label: string;
      cells: Record<string, string | number | boolean>;
    }[];
  };
  columnState?: {
    resetHref?: string;
  };
  decisionLedger?: {
    enabled?: boolean;
    label?: string;
  };
};

export type ListPresentationProfileId =
  | "erp-operational-table"
  | "erp-exception-table"
  | "erp-analytical-table"
  | "erp-audit-ledger";

export type ListSurfaceRendererConfigurationResolvedInput = {
  __schemaVersion?: typeof GOVERNED_METADATA_SCHEMA_VERSION;
  dataNature?: "table" | "document-lines";
  requiresErpPermission?: ErpPermissionRequirement;
  presentation?: ListSurfacePresentation;
  pagination?: {
    pageSize: number;
    hasNextPage?: boolean;
    nextCursor?: string;
    nextHref?: string;
    prevCursor?: string;
    prevHref?: string;
    totalCount?: number;
  };
  surface: ListSurface;
  columns: ListColumn[];
  rows: ListSurfaceRow[];
};

type BuildGovernedListSurfaceInput = Omit<
  ListSurfaceRendererConfigurationResolvedInput,
  "presentation"
> & {
  presentationProfile: ListPresentationProfileId;
  presentation?: Partial<ListSurfacePresentation>;
};

const ERP_TABLE_BASE = {
  variant: "table-only",
  tableDensity: "compact",
  stickyHeader: true,
  virtualizeRowThreshold: 100,
  toolbar: {
    columnPicker: true,
    densityToggle: true,
  },
} as const satisfies ListSurfacePresentation;

const ERP_ANALYTICAL_TABLE = {
  ...ERP_TABLE_BASE,
  narrowMode: "auto",
  selection: {
    mode: "multiple",
    label: "Select rows",
    bulkScopeLabel: "selected rows",
  },
  decisionLedger: {
    enabled: true,
    label: "Decision ledger",
  },
} as const satisfies ListSurfacePresentation;

const GOVERNED_LIST_PRESENTATION_PROFILES = {
  "erp-operational-table": ERP_TABLE_BASE,
  "erp-exception-table": {
    ...ERP_TABLE_BASE,
    narrowMode: "auto",
  },
  "erp-analytical-table": ERP_ANALYTICAL_TABLE,
  "erp-audit-ledger": ERP_TABLE_BASE,
} as const satisfies Record<ListPresentationProfileId, ListSurfacePresentation>;

function mergeListSurfaceToolbar(
  base: ListSurfaceToolbar | undefined,
  override: ListSurfaceToolbar | undefined,
): ListSurfaceToolbar | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  return {
    ...base,
    ...override,
    export: override.export ?? base.export,
    search: override.search ?? base.search,
    filters: override.filters ?? base.filters,
    sort: override.sort ?? base.sort,
    savedView: override.savedView ?? base.savedView,
    bulkActions: override.bulkActions ?? base.bulkActions,
    densityToggle: override.densityToggle ?? base.densityToggle,
    columnPicker: override.columnPicker ?? base.columnPicker,
    resetParams: override.resetParams ?? base.resetParams,
  };
}

function mergeListSurfacePresentation(
  base: ListSurfacePresentation,
  override?: Partial<ListSurfacePresentation>,
): ListSurfacePresentation {
  if (!override) return base;
  return {
    variant: override.variant ?? base.variant,
    tableDensity: override.tableDensity ?? base.tableDensity,
    narrowMode: override.narrowMode ?? base.narrowMode,
    primaryColumnId: override.primaryColumnId ?? base.primaryColumnId,
    stickyHeader: override.stickyHeader ?? base.stickyHeader,
    virtualizeRowThreshold:
      override.virtualizeRowThreshold ?? base.virtualizeRowThreshold,
    toolbar: mergeListSurfaceToolbar(base.toolbar, override.toolbar),
    selection: override.selection ?? base.selection,
    grouping: override.grouping ?? base.grouping,
    summary: override.summary ?? base.summary,
    columnState: override.columnState ?? base.columnState,
    decisionLedger: override.decisionLedger ?? base.decisionLedger,
  };
}

export function buildGovernedListSurface(
  input: BuildGovernedListSurfaceInput,
): ListSurfaceRendererConfigurationResolvedInput {
  const { presentationProfile, presentation, ...rest } = input;
  return {
    __schemaVersion: rest.__schemaVersion ?? GOVERNED_METADATA_SCHEMA_VERSION,
    ...rest,
    presentation: mergeListSurfacePresentation(
      GOVERNED_LIST_PRESENTATION_PROFILES[presentationProfile],
      presentation,
    ),
  };
}

export type ResolveListSurfaceRowTrailingActionInput = {
  visible?: boolean;
  allowed: boolean;
  disabledReason?: string;
  descriptor?: ActionDescriptor;
};

export function resolveListSurfaceRowTrailingAction(
  input: ResolveListSurfaceRowTrailingActionInput,
): ListSurfaceRowTrailingAction | undefined {
  if (input.visible === false) {
    return { state: "hidden" };
  }
  if (input.allowed) {
    return input.descriptor
      ? { state: "ready", descriptor: input.descriptor }
      : { state: "ready" };
  }
  const disabledReason = input.disabledReason?.trim();
  return {
    state: "disabled",
    disabledReason:
      disabledReason && disabledReason.length > 0
        ? disabledReason
        : "Not permitted",
    descriptor: input.descriptor,
  };
}

export type StatCardTone = "positive" | "attention" | "default" | "critical";
export type StatCardDensity = "compact" | "comfortable";

export type StatCardConfigurationResolvedInput = {
  __schemaVersion?: typeof GOVERNED_METADATA_SCHEMA_VERSION;
  dataNature?: "kpi" | "snapshot-summary";
  density?: StatCardDensity;
  stats: {
    label: string;
    value: string;
    delta?: string;
    tone?: StatCardTone;
    href?: string;
    icon?: "clock" | "alert" | "users" | "calendar" | "activity" | "shield";
    sparkPoints?: { value: number }[];
    progress?: { value: number; max: number; label?: string };
    comparison?: {
      priorValue: string;
      label: string;
      direction: "up" | "down" | "flat";
    };
    animateValue?: boolean;
  }[];
  chrome?: GovernedSurfaceChromeInput;
};

export type StatPresentationProfileId =
  | "erp-kpi-grid"
  | "erp-executive-summary";

type BuildGovernedStatGridInput = Omit<
  StatCardConfigurationResolvedInput,
  "density"
> & {
  presentationProfile: StatPresentationProfileId;
  density?: StatCardDensity;
};

const GOVERNED_STAT_PRESENTATION_PROFILES = {
  "erp-kpi-grid": {
    density: "compact",
  },
  "erp-executive-summary": {
    density: "comfortable",
  },
} as const satisfies Record<
  StatPresentationProfileId,
  { density: StatCardDensity }
>;

export function buildGovernedStatGrid(
  input: BuildGovernedStatGridInput,
): StatCardConfigurationResolvedInput {
  const { presentationProfile, density, ...rest } = input;
  return {
    __schemaVersion: rest.__schemaVersion ?? GOVERNED_METADATA_SCHEMA_VERSION,
    ...rest,
    density: density ?? GOVERNED_STAT_PRESENTATION_PROFILES[presentationProfile].density,
  };
}

export type ChartDataNature = "time-series" | "categorical";
export type GovernedChartKind =
  | "bar"
  | "line"
  | "area"
  | "heatmap"
  | "stacked-bar"
  | "combo";

export type GovernedChartConfigurationInput = {
  __schemaVersion?: typeof GOVERNED_METADATA_SCHEMA_VERSION;
  dataNature: ChartDataNature;
  chartKind: GovernedChartKind;
  title?: string;
  description?: string;
  drilldownHref?: string;
  actions?: {
    id: string;
    label: string;
    href?: string;
    actionId?: string;
  }[];
  series?: {
    id: string;
    label: string;
    color?: string;
    points: { x: string; y: number }[];
    role?: "bar" | "line";
  }[];
  heatmap?: {
    cells: { date: string; value: number; label?: string }[];
    valueLabel?: string;
  };
  empty?: EmptyState;
  referenceBand?: { yMin: number; yMax: number; label?: string };
  referenceBands?: { yMin: number; yMax: number; label?: string }[];
  annotations?: {
    label: string;
    x?: string;
    y?: number;
    tone?: "default" | "positive" | "attention" | "critical";
  }[];
  interaction?: "none" | "brush";
  chrome?: GovernedSurfaceChromeInput;
};

export type ChartPresentationProfileId =
  | "erp-trend-chart"
  | "erp-status-chart";

type BuildGovernedChartSurfaceInput = Omit<
  GovernedChartConfigurationInput,
  "chartKind" | "dataNature"
> & {
  presentationProfile: ChartPresentationProfileId;
  chartKind?: GovernedChartKind;
  dataNature?: ChartDataNature;
};

const GOVERNED_CHART_PRESENTATION_PROFILES = {
  "erp-trend-chart": {
    chartKind: "area",
    dataNature: "time-series",
  },
  "erp-status-chart": {
    chartKind: "bar",
    dataNature: "categorical",
  },
} as const satisfies Record<
  ChartPresentationProfileId,
  { chartKind: GovernedChartKind; dataNature: ChartDataNature }
>;

export function buildGovernedChartSurface(
  input: BuildGovernedChartSurfaceInput,
): GovernedChartConfigurationInput {
  const { presentationProfile, chartKind, dataNature, ...rest } = input;
  const defaults = GOVERNED_CHART_PRESENTATION_PROFILES[presentationProfile];
  return {
    __schemaVersion: rest.__schemaVersion ?? GOVERNED_METADATA_SCHEMA_VERSION,
    ...rest,
    chartKind: chartKind ?? defaults.chartKind,
    dataNature: dataNature ?? defaults.dataNature,
  };
}

export type AuditPanelRow = {
  id: string;
  action: string;
  occurredAt: string;
  actorLabel: string;
  actorDetail?: string;
  resourceLabel?: string;
  href?: string;
  tone?: "default" | "attention" | "critical";
  durationLabel?: string;
  evidenceHref?: string;
  metadataChips?: {
    label: string;
    tone?: "default" | "positive" | "attention" | "critical";
  }[];
  narrative?: string;
};

export type AuditPanelModel = {
  dataNature?: "audit-trail";
  headerTitle: string;
  headerDescription?: string;
  density?: "compact" | "comfortable";
  rows: AuditPanelRow[];
};

export type GovernedDetailSection = {
  id: string;
  label: string;
  description?: string;
  hidden?: boolean;
  orderIndex?: number;
  rendererKey: string;
  rendererProps?: unknown;
};

export type GovernedRevisionEntry = {
  id: string;
  occurredAt: string;
  actorLabel: string;
  narrative: string;
  verb: "create" | "update" | "resolve" | "deprecate";
  changes?: {
    field: string;
    from?: string;
    to?: string;
  }[];
};

export type GovernedDetailTabsInput = {
  dataNature?: "tabbed-detail";
  entityLabel: string;
  entityKind: string;
  entityId: string;
  overview: GovernedDetailSection;
  relations?: GovernedDetailSection[];
  referrers?: GovernedDetailSection[];
  revisions?: GovernedRevisionEntry[];
  audit?: AuditPanelRow[];
  defaultTab?: "overview" | "relations" | "referrers" | "revisions" | "audit";
};

export type GovernedFormField = {
  id: string;
  label: string;
  kind: "text" | "email" | "textarea" | "select" | "checkbox" | "file-upload";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  rules?: unknown[];
};

export type GovernedMultiStepFormConfigurationInput = {
  __schemaVersion?: typeof GOVERNED_METADATA_SCHEMA_VERSION;
  dataNature?: "wizard";
  formId: string;
  actionId: string;
  moduleId?: string;
  steps: {
    id: string;
    title: string;
    description?: string;
    fields: GovernedFormField[];
  }[];
  submitLabel?: string;
  chrome?: GovernedSurfaceChromeInput;
};

export type GovernedKanbanBoardConfigurationInput = {
  dataNature?: "kanban";
  interactionMode?: "read-only" | "drag-drop" | "footer-actions";
  requiresErpPermission?: ErpPermissionRequirement;
  copy?: {
    boardAriaLabel?: string;
    emptyColumn?: string;
    moveLabel?: string;
    blockedLabel?: string;
  };
  columns: {
    id: string;
    label: string;
    badgeTone?: "default" | "positive" | "attention" | "critical";
  }[];
  cards: {
    id: string;
    columnId: string;
    title: string;
    subtitle?: string;
    tone?: "default" | "positive" | "attention" | "critical";
    badges?: string[];
  }[];
};

export type GovernedSurfaceChromeInput = {
  density?: "compact" | "comfortable" | "relaxed";
  elevation?: "flat" | "card" | "raised";
  surface?: "solid" | "muted" | "subtle";
};
