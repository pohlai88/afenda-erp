import {
  createActionBar,
  createActionBarItem,
} from "../builders/action-bar.builder";
import {
  createAuditEvent,
  createAuditTrailPanel,
} from "../builders/audit-panel.builder";
import {
  createBarChart,
  createChartSeries,
  withChartDisplay,
} from "../builders/chart.builder";
import {
  createContentTab,
  createDetailTabsSet,
} from "../builders/detail-tabs.builder";
import {
  createFileField,
  createFormField,
  createFormSection,
  createSectionedForm,
  withFormErrorSummary,
  withFormState,
} from "../builders/form.builder";
import {
  createKanbanBoard,
  createKanbanCard,
  createKanbanCardTemplate,
  createKanbanColumn,
  createKanbanTransition,
  withKanbanCards,
  withKanbanMode,
  withKanbanTransitions,
} from "../builders/kanban.builder";
import {
  createList,
  createListColumn,
  createListToolbar,
  withListToolbar,
} from "../builders/list.builder";
import {
  createPageHeader,
  createPageHeaderBadge,
  createPageHeaderBreadcrumb,
} from "../builders/page-header.builder";
import { parseMetadataUiActionContract } from "../contracts/action.contract";
import type { MetadataUiActionBar } from "../schemas/action-bar.schema";
import type { MetadataUiAuditPanel } from "../schemas/audit-panel.schema";
import type { MetadataUiChart } from "../schemas/chart.schema";
import type { MetadataUiDetailTabs } from "../schemas/detail-tabs.schema";
import type { MetadataUiForm } from "../schemas/form.schema";
import type { MetadataUiKanban } from "../schemas/kanban.schema";
import type { MetadataUiList } from "../schemas/list.schema";
import type { MetadataUiPageHeader } from "../schemas/page-header.schema";

export type MetadataUiGovernedSurfaceKind =
  | "action-bar"
  | "audit-panel"
  | "approval-timeline"
  | "chart"
  | "detail-tabs"
  | "form"
  | "kanban"
  | "list"
  | "page-header";

export type MetadataUiGovernedSurfaceParityNote = Readonly<{
  surface: MetadataUiGovernedSurfaceKind;
  sourceField: string;
  disposition: "mapped" | "carried-as-metadata" | "unsupported";
  message: string;
}>;

export type MetadataUiGovernedSurfaceAdapterResult<Data> = Readonly<{
  data: Data;
  parityNotes: readonly MetadataUiGovernedSurfaceParityNote[];
}>;

export type MetadataUiMigrationReplacementGate = Readonly<{
  canReplace: boolean;
  blockers: readonly string[];
  requiredEvidence: readonly string[];
}>;

export type GovernedActionInput = Readonly<{
  key: string;
  label: string;
  href?: string;
  disabledReason?: string;
  destructive?: boolean;
}>;

export type GovernedPageHeaderInput = Readonly<{
  key?: string;
  title: string;
  description?: string;
  eyebrow?: string;
  level?: "workspace" | "module" | "surface" | "record" | "dialog";
  breadcrumbs?: readonly Readonly<{ label: string; href?: string }>[];
  badges?: readonly Readonly<{ label: string; tone?: "neutral" | "info" | "positive" | "warning" | "critical" }>[];
  actions?: readonly GovernedActionInput[];
  unsupportedVisuals?: readonly string[];
}>;

export type GovernedActionBarInput = Readonly<{
  key?: string;
  title?: string;
  actions: readonly GovernedActionInput[];
  sticky?: boolean;
  compact?: boolean;
}>;

export type GovernedListInput = Readonly<{
  key?: string;
  title?: string;
  description?: string;
  columns: readonly Readonly<{
    key: string;
    label: string;
    format?: "text" | "number" | "currency" | "date" | "status";
  }>[];
  density?: "compact" | "comfortable" | "dense";
  searchable?: boolean;
  exportable?: boolean;
  fullDatasetClientSide?: boolean;
}>;

export type GovernedFormInput = Readonly<{
  key?: string;
  title?: string;
  state?: "clean" | "dirty" | "readonly" | "review" | "pending" | "blocked" | "invalid";
  fields: readonly Readonly<{
    key: string;
    label: string;
    kind?: "text" | "textarea" | "number" | "file";
    required?: boolean;
    blockedReason?: string;
    uploadKey?: string;
  }>[];
  errors?: readonly Readonly<{ fieldKey: string; message: string }>[];
}>;

export type GovernedDetailTabsInput = Readonly<{
  key?: string;
  tabs: readonly Readonly<{ key: string; label: string; sectionKey: string }>[]; 
}>;

export type GovernedChartInput = Readonly<{
  key?: string;
  title?: string;
  categoryKey: string;
  series: readonly Readonly<{ key: string; label: string; valueKey: string }>[];
  data: readonly Record<string, string | number | boolean | null>[];
  visxOnly?: boolean;
}>;

export type GovernedKanbanInput = Readonly<{
  key?: string;
  columnField: string;
  columns: readonly Readonly<{ key: string; label: string; disabledReason?: string }>[];
  cards: readonly Readonly<{ key: string; title: string; columnKey: string; description?: string }>[];
  draggable?: boolean;
  transitions?: readonly Readonly<{
    from: string;
    to: string;
    label: string;
    available?: boolean;
    disabledReason?: string;
  }>[];
}>;

export type GovernedAuditPanelInput = Readonly<{
  key?: string;
  title?: string;
  events: readonly Readonly<{
    key: string;
    occurredAt: string;
    summary: string;
    actorName?: string;
    action?: string;
  }>[];
}>;

function normalizeMigrationKey(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "surface"
  );
}

function surfaceKey(surface: MetadataUiGovernedSurfaceKind, value?: string) {
  return `governed.${surface}.${normalizeMigrationKey(value ?? surface)}`;
}

function note(
  surface: MetadataUiGovernedSurfaceKind,
  sourceField: string,
  disposition: MetadataUiGovernedSurfaceParityNote["disposition"],
  message: string,
): MetadataUiGovernedSurfaceParityNote {
  return { surface, sourceField, disposition, message };
}

function adaptAction(input: GovernedActionInput, surface: MetadataUiGovernedSurfaceKind) {
  const key = surfaceKey(surface, input.key);
  return parseMetadataUiActionContract({
    id: `${key}.action`,
    label: input.label,
    intent: input.href ? "navigate" : "custom",
    tone: input.destructive ? "critical" : "neutral",
    risk: input.destructive ? "high" : "low",
    visibility: input.disabledReason ? "disabled" : "visible",
    disabledReason: input.disabledReason,
    confirmation: input.destructive
      ? {
          title: input.label,
          confirmLabel: input.label,
          cancelLabel: "Cancel",
        }
      : undefined,
    execution: input.href
      ? {
          kind: "navigation",
          href: input.href,
          target: "self",
        }
      : {
          kind: "client-event",
          eventKey: `${key}.event`,
        },
    metadata: {
      migrationSource: "governed-surface",
    },
  });
}

export function adaptGovernedPageHeader(
  input: GovernedPageHeaderInput,
): MetadataUiGovernedSurfaceAdapterResult<MetadataUiPageHeader> {
  const parityNotes = [
    ...(input.unsupportedVisuals ?? []).map((item) =>
      note("page-header", item, "unsupported", "Governed visual behavior requires replacement evidence."),
    ),
  ];
  return {
    data: createPageHeader({
      key: input.key ?? surfaceKey("page-header", input.title),
      title: input.title,
      description: input.description,
      eyebrow: input.eyebrow,
      level: input.level ?? "surface",
      breadcrumbs: (input.breadcrumbs ?? []).map((breadcrumb, index) =>
        createPageHeaderBreadcrumb({
          key: surfaceKey("page-header", `${breadcrumb.label}-${index + 1}`),
          label: breadcrumb.label,
          href: breadcrumb.href,
          current: index === (input.breadcrumbs?.length ?? 0) - 1,
        }),
      ),
      badges: (input.badges ?? []).map((badge) =>
        createPageHeaderBadge({
          key: surfaceKey("page-header", badge.label),
          label: badge.label,
          tone: badge.tone ?? "neutral",
        }),
      ),
      actions: (input.actions ?? []).map((action) => ({
        action: adaptAction(action, "page-header"),
        placement: "secondary",
      })),
    }),
    parityNotes,
  };
}

export function adaptGovernedActionBar(
  input: GovernedActionBarInput,
): MetadataUiGovernedSurfaceAdapterResult<MetadataUiActionBar> {
  return {
    data: createActionBar({
      key: input.key ?? surfaceKey("action-bar", input.title ?? "actions"),
      title: input.title,
      layout: input.sticky ? "sticky-footer" : "toolbar",
      alignment: "end",
      actions: input.actions.map((action, index) =>
        createActionBarItem({
          key: surfaceKey("action-bar", `${action.key}-${index + 1}`),
          label: action.label,
          action: adaptAction(action, "action-bar"),
          priority: action.destructive ? "danger" : index === 0 ? "primary" : "secondary",
          placement: index > 3 ? "overflow" : "main",
          disabled: action.disabledReason
            ? { value: true, reason: action.disabledReason }
            : undefined,
        }),
      ),
      overflow: {
        enabled: true,
        triggerLabel: "More actions",
        collapseAfter: input.compact ? 2 : 4,
      },
    }),
    parityNotes: input.compact
      ? [note("action-bar", "compact", "mapped", "Governed compact actions map to overflow collapse.")]
      : [],
  };
}

export function adaptGovernedList(
  input: GovernedListInput,
): MetadataUiGovernedSurfaceAdapterResult<MetadataUiList> {
  const list = createList({
    key: input.key ?? surfaceKey("list", input.title ?? "list"),
    title: input.title,
    description: input.description,
    selectionMode: "none",
    density: input.density ?? "comfortable",
    columns: input.columns.map((column) =>
      createListColumn({
        key: surfaceKey("list", column.key),
        field: column.key,
        label: column.label,
        format: column.format ?? "text",
      }),
    ),
  });

  return {
    data: withListToolbar(list, createListToolbar({
      enabled: Boolean(input.searchable || input.exportable),
      showSearch: Boolean(input.searchable),
      searchPlaceholder: "Search",
      showFilters: false,
      showSavedViews: false,
      savedViews: [],
      showSort: false,
      showDensity: true,
      showExport: Boolean(input.exportable),
      resetLabel: "Reset",
    })),
    parityNotes: input.fullDatasetClientSide
      ? [note("list", "fullDatasetClientSide", "unsupported", "Lists must use server windows, not full client datasets.")]
      : [],
  };
}

export function adaptGovernedForm(
  input: GovernedFormInput,
): MetadataUiGovernedSurfaceAdapterResult<MetadataUiForm> {
  const form = createSectionedForm({
    key: input.key ?? surfaceKey("form", input.title ?? "form"),
    title: input.title,
    sections: [
      createFormSection({
        key: surfaceKey("form", "main"),
        fields: input.fields.map((field) => {
          const base = field.kind === "file"
            ? createFileField({
                key: surfaceKey("form", field.key),
                name: field.key,
                label: field.label,
                fileUpload: {
                  hostUploadKey: field.uploadKey ?? `${surfaceKey("form", field.key)}.upload`,
                },
              })
            : createFormField({
                key: surfaceKey("form", field.key),
                name: field.key,
                label: field.label,
                kind: field.kind ?? "text",
                options: [],
                validation: field.required ? { required: true, message: `${field.label} is required.` } : undefined,
                state: field.blockedReason ? { value: "blocked", reason: field.blockedReason } : undefined,
              });
          return base;
        }),
      }),
    ],
  });
  const withSummary = input.errors?.length
    ? withFormErrorSummary(form, {
        title: "Review fields",
        errors: input.errors.map((error) => ({
          fieldKey: surfaceKey("form", error.fieldKey),
          message: error.message,
        })),
      })
    : form;
  const withState = input.state ? withFormState(withSummary, input.state) : withSummary;
  return {
    data: withState,
    parityNotes: input.fields.some((field) => field.kind === "file")
      ? [note("form", "file", "carried-as-metadata", "File upload is represented as a host upload descriptor.")]
      : [],
  };
}

export function adaptGovernedDetailTabs(
  input: GovernedDetailTabsInput,
): MetadataUiGovernedSurfaceAdapterResult<MetadataUiDetailTabs> {
  return {
    data: createDetailTabsSet({
      key: input.key ?? surfaceKey("detail-tabs", "tabs"),
      tabs: input.tabs.map((tab, index) =>
        createContentTab({
          key: surfaceKey("detail-tabs", tab.key),
          label: tab.label,
          sectionKey: tab.sectionKey,
          defaultSelected: index === 0,
        }),
      ),
    }),
    parityNotes: [],
  };
}

export function adaptGovernedChart(
  input: GovernedChartInput,
): MetadataUiGovernedSurfaceAdapterResult<MetadataUiChart> {
  const chart = createBarChart({
    key: input.key ?? surfaceKey("chart", input.title ?? "chart"),
    title: input.title,
    categoryKey: input.categoryKey,
    series: input.series.map((series) =>
      createChartSeries({
        key: surfaceKey("chart", series.key),
        label: series.label,
        valueKey: series.valueKey,
      }),
    ),
    data: [...input.data],
  });
  return {
    data: withChartDisplay(chart, {
      reducedMotion: "respect-user",
      tableFallbackLabel: `${input.title ?? "Chart"} data table`,
    }),
    parityNotes: input.visxOnly
      ? [note("chart", "visxOnly", "unsupported", "Visx-only behavior must be certified before replacement.")]
      : [],
  };
}

export function adaptGovernedKanban(
  input: GovernedKanbanInput,
): MetadataUiGovernedSurfaceAdapterResult<MetadataUiKanban> {
  const board = createKanbanBoard({
    key: input.key ?? surfaceKey("kanban", "board"),
    columnField: input.columnField,
    columns: input.columns.map((column, index) =>
      createKanbanColumn({
        key: column.key,
        label: column.label,
        order: index,
        drop: column.disabledReason
          ? { enabled: false, disabledReason: column.disabledReason }
          : { enabled: true },
      }),
    ),
    cardTemplate: createKanbanCardTemplate({
      titleField: "title",
      descriptionField: "description",
      metadataFields: [],
    }),
  });
  return {
    data: withKanbanTransitions(
      withKanbanCards(withKanbanMode(board, input.draggable ? "draggable" : "read-only"), input.cards.map((card) =>
        createKanbanCard({
          key: card.key,
          record: {
            title: card.title,
            description: card.description ?? null,
            [input.columnField]: card.columnKey,
          },
        }),
      )),
      (input.transitions ?? []).map((transition) =>
        createKanbanTransition({
          key: surfaceKey("kanban", `${transition.from}-${transition.to}`),
          fromColumnKey: transition.from,
          toColumnKey: transition.to,
          label: transition.label,
          available: transition.available ?? true,
          disabledReason: transition.disabledReason,
        }),
      ),
    ),
    parityNotes: input.draggable
      ? [note("kanban", "draggable", "mapped", "Drag intent is carried as metadata; mutation remains host-owned.")]
      : [],
  };
}

export function adaptGovernedAuditPanel(
  input: GovernedAuditPanelInput,
): MetadataUiGovernedSurfaceAdapterResult<MetadataUiAuditPanel> {
  return {
    data: createAuditTrailPanel({
      key: input.key ?? surfaceKey("audit-panel", input.title ?? "audit"),
      title: input.title,
      events: input.events.map((event) =>
        createAuditEvent({
          key: surfaceKey("audit-panel", event.key),
          occurredAt: event.occurredAt,
          action: event.action ?? "recorded",
          summary: event.summary,
          actor: {
            actorId: event.actorName ?? "system",
            actorType: event.actorName ? "user" : "system",
            displayName: event.actorName,
          },
        }),
      ),
    }),
    parityNotes: [],
  };
}

export function createMetadataUiMigrationReplacementGate(input: {
  parityNotes: readonly MetadataUiGovernedSurfaceParityNote[];
  guardPassed: boolean;
  visualEvidence: boolean;
}): MetadataUiMigrationReplacementGate {
  const unsupported = input.parityNotes.filter(
    (entry) => entry.disposition === "unsupported",
  );
  const blockers = [
    ...unsupported.map((entry) => `${entry.surface}:${entry.sourceField}`),
    ...(input.guardPassed ? [] : ["guard:metadata-ui"]),
    ...(input.visualEvidence ? [] : ["visual-evidence"]),
  ];

  return {
    canReplace: blockers.length === 0,
    blockers,
    requiredEvidence: [
      "pnpm guard:metadata-ui",
      "package build and tests",
      "visual parity evidence",
      "no governed-surface runtime imports",
    ],
  };
}
