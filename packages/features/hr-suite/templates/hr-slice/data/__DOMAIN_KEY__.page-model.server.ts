import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { __IDENTIFIER__ListRow } from "../contracts/__DOMAIN_KEY__.contract";
import { build__IDENTIFIER__ListSurface } from "../surface/__DOMAIN_KEY__-lists.surface";
import { build__IDENTIFIER__OverviewStatGrid } from "../surface/__DOMAIN_KEY__-overview-stat.surface";
import {
  __IDENTIFIER_CAMEL__AuditTrailSurfaceKey,
  __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
  type __IDENTIFIER__ListSurfaceKey,
} from "../surface/__DOMAIN_KEY__-surface-metadata.shared";
import { __IDENTIFIER_CAMEL__UiCopy } from "../surface/__DOMAIN_KEY__-ui.copy.shared";
import type { __IDENTIFIER__PageModelInput } from "./__DOMAIN_KEY__-search-params.parse.shared";
import { get__IDENTIFIER__Store } from "./__DOMAIN_KEY__-store.shared";

const DEFAULT_PAGE_SIZE = 25;

export type __IDENTIFIER__PageModelListSection = {
  readonly surfaceKey: __IDENTIFIER__ListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type __IDENTIFIER__PageModel = {
  readonly title: string;
  readonly description: string;
  readonly canReadAudit: boolean;
  readonly reportGroupBy: __IDENTIFIER__PageModelInput["reportGroupBy"];
  readonly status: __IDENTIFIER__PageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly __IDENTIFIER__PageModelListSection[];
  readonly workbenchList: ListSurfaceRendererConfigurationResolvedInput;
};

type SearchableRecord = { readonly id: string };

function formatEnumLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "Not recorded";
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, DEFAULT_PAGE_SIZE);
}

function toneForStatus(value: string): __IDENTIFIER__ListRow["rowTone"] {
  if (["draft", "inactive"].includes(value)) return "attention";
  if (value === "archived") return "critical";
  return undefined;
}

function section(input: {
  readonly surfaceKey: __IDENTIFIER__ListSurfaceKey;
  readonly rows: readonly __IDENTIFIER__ListRow[];
  readonly searchValue?: string;
}): __IDENTIFIER__PageModelListSection {
  const copy = __IDENTIFIER_CAMEL__UiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: build__IDENTIFIER__ListSurface(input),
  };
}

export async function build__IDENTIFIER__PageModel(
  input: __IDENTIFIER__PageModelInput,
): Promise<__IDENTIFIER__PageModel> {
  const store = get__IDENTIFIER__Store(input.organizationId);
  const records = store.records.filter(
    (row) => input.status === "all" || row.status === input.status,
  );
  const recordRows: __IDENTIFIER__ListRow[] = records.map((row) => ({
    id: row.id,
    rowTone: toneForStatus(row.status),
    cells: {
      name: row.name,
      owner: row.owner,
      updatedAt: formatDate(row.updatedAt),
      status: formatEnumLabel(row.status),
    },
  }));
  const overview = build__IDENTIFIER__OverviewStatGrid({
    snapshot: {
      recordCount: records.length,
      activeCount: records.filter((row) => row.status === "active").length,
      attentionCount: records.filter((row) => row.status !== "active").length,
    },
  });

  const sections: __IDENTIFIER__PageModelListSection[] = [
    section({
      surfaceKey: __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
      searchValue: input.workbenchSearch,
      rows: filterRows(recordRows, input.workbenchSearch),
    }),
  ];

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: __IDENTIFIER_CAMEL__AuditTrailSurfaceKey,
        searchValue: input.auditTrailSearch,
        rows: filterRows(store.auditEvents, input.auditTrailSearch).map(
          (event) => ({
            id: event.id,
            cells: {
              summary: event.summary,
              action: event.action,
              actorId: event.actorId,
              targetId: event.targetId,
              occurredAt: formatDate(event.occurredAt),
            },
          }),
        ),
      }),
    );
  }

  return {
    title: __IDENTIFIER_CAMEL__UiCopy.page.title,
    description: __IDENTIFIER_CAMEL__UiCopy.page.description,
    canReadAudit: input.canReadAudit,
    reportGroupBy: input.reportGroupBy,
    status: input.status,
    overview,
    sections,
    workbenchList:
      sections.find(
        (candidate) =>
          candidate.surfaceKey === __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
      )?.listConfiguration ??
      build__IDENTIFIER__ListSurface({
        surfaceKey: __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
        rows: [],
      }),
  };
}
