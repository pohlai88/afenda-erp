import {
  hrMcpAuditTrailSearchParam,
  hrMcpAuditTrailSurfaceKey,
  hrMcpCountryConfigsSearchParam,
  hrMcpCountryConfigsSurfaceKey,
  hrMcpCrossCountryCostSearchParam,
  hrMcpCrossCountryCostSurfaceKey,
  hrMcpRuleVersionsSearchParam,
  hrMcpRuleVersionsSurfaceKey,
} from "./hr.payroll.mcp-search-params.parse.shared";
import { formatHrMcpAuditActionLabel } from "./hr.payroll.mcp-audit.shared";
import { formatHrMcpRuleVersionLabel } from "./hr.payroll.mcp-rule-versioning.shared";
import {
  buildMcpListSearchToolbar,
  buildMcpOperationalListSurface,
  formatMcpEnumLabel,
} from "./hr.payroll.mcp-list.shared";
import {
  hrMcpAuditTrailColumnsId,
  hrMcpCountryConfigsColumnsId,
  hrMcpCrossCountryCostColumnsId,
  hrMcpRuleVersionsColumnsId,
} from "./hr.payroll.mcp-surface-columns.shared";
import { hrMcpUiCopy } from "./hr.payroll.mcp-ui.copy.shared";

export {
  hrMcpCountryConfigsSurfaceKey,
  hrMcpRuleVersionsSurfaceKey,
  hrMcpCrossCountryCostSurfaceKey,
  hrMcpAuditTrailSurfaceKey,
};

export function buildHrMcpCountryConfigsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      countryCode: string;
      name: string;
      defaultCurrencyCode: string;
      active: boolean;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrMcpUiCopy.countryConfigs;
  return buildMcpOperationalListSurface({
    primaryColumnId: "country",
    searchToolbar: buildMcpListSearchToolbar({
      param: hrMcpCountryConfigsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrMcpCountryConfigsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "country",
        header: copy.colCountry,
        pin: "start",
        minWidth: 120,
        cellKind: { kind: "text" },
      },
      { id: "name", header: copy.colName, priority: "primary", cellKind: { kind: "text" } },
      { id: "currency", header: copy.colCurrency, cellKind: { kind: "text" } },
      { id: "active", header: copy.colActive, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        country: row.countryCode,
        name: row.name,
        currency: row.defaultCurrencyCode,
        active: row.active ? "Active" : "Inactive",
      },
      cellKinds: {
        active: {
          kind: "badge",
          tone: row.active ? "default" : "attention",
        },
      },
    })),
  });
}

export function buildHrMcpRuleVersionsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      versionNumber: number;
      versionStatus: string;
      effectiveFrom: Date;
      effectiveTo: Date | null;
      publishedAt: Date | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrMcpUiCopy.ruleVersions;
  return buildMcpOperationalListSurface({
    primaryColumnId: "version",
    searchToolbar: buildMcpListSearchToolbar({
      param: hrMcpRuleVersionsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrMcpRuleVersionsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "version",
        header: copy.colVersion,
        pin: "start",
        minWidth: 140,
        cellKind: { kind: "text" },
      },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
      { id: "effectiveTo", header: copy.colEffectiveTo, cellKind: { kind: "date" } },
      { id: "publishedAt", header: copy.colPublishedAt, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        version: formatHrMcpRuleVersionLabel({
          versionNumber: row.versionNumber,
          versionStatus: row.versionStatus,
        }),
        status: formatMcpEnumLabel(row.versionStatus),
        effectiveFrom: row.effectiveFrom.toISOString(),
        effectiveTo: row.effectiveTo?.toISOString() ?? "—",
        publishedAt: row.publishedAt?.toISOString() ?? "—",
      },
    })),
  });
}

export function buildHrMcpCrossCountryCostListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      countryCode: string;
      countryName: string;
      legalEntityCode: string | null;
      payGroupCode: string | null;
      currencyCode: string;
      employerCostTotal: string;
      headcount: number;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrMcpUiCopy.crossCountryCost;
  return buildMcpOperationalListSurface({
    primaryColumnId: "country",
    searchToolbar: buildMcpListSearchToolbar({
      param: hrMcpCrossCountryCostSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrMcpCrossCountryCostColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "country",
        header: copy.colCountry,
        pin: "start",
        minWidth: 120,
        cellKind: { kind: "text" },
      },
      { id: "entity", header: copy.colEntity, cellKind: { kind: "text" } },
      { id: "payGroup", header: copy.colPayGroup, cellKind: { kind: "text" } },
      { id: "currency", header: copy.colCurrency, cellKind: { kind: "text" } },
      { id: "employerCost", header: copy.colEmployerCost, cellKind: { kind: "text" } },
      { id: "headcount", header: copy.colHeadcount, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        country: `${row.countryCode} — ${row.countryName}`,
        entity: row.legalEntityCode ?? "—",
        payGroup: row.payGroupCode ?? "—",
        currency: row.currencyCode,
        employerCost: row.employerCostTotal,
        headcount: String(row.headcount),
      },
    })),
  });
}

export function buildHrMcpAuditTrailListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      action: string;
      summary: string | null;
      occurredAt: Date;
      actorUserId: string;
      payrollRunRef: string | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrMcpUiCopy.auditTrail;
  return buildMcpOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildMcpListSearchToolbar({
      param: hrMcpAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrMcpAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "occurredAt",
        header: copy.colOccurredAt,
        pin: "start",
        cellKind: { kind: "date" },
      },
      {
        id: "action",
        header: copy.colAction,
        priority: "primary",
        cellKind: { kind: "text" },
      },
      { id: "summary", header: copy.colSummary, cellKind: { kind: "text" } },
      { id: "actor", header: copy.colActor, cellKind: { kind: "text" } },
      { id: "payrollRun", header: copy.colPayrollRun, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        occurredAt: row.occurredAt.toISOString(),
        action: formatHrMcpAuditActionLabel(row.action),
        summary: row.summary ?? "—",
        actor: row.actorUserId,
        payrollRun: row.payrollRunRef ?? "—",
      },
    })),
  });
}
