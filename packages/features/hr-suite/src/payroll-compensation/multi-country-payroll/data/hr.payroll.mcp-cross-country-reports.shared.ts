import { formatNumeric, parseNumeric } from "@afenda/db";

export type HrMcpCrossCountryCostLine = {
  readonly id: string;
  readonly countryConfigId: string;
  readonly countryCode: string;
  readonly countryName: string;
  readonly legalEntitySetupId: string | null;
  readonly legalEntityCode: string | null;
  readonly payGroupCode: string | null;
  readonly currencyCode: string;
  readonly employerCostTotal: string;
  readonly headcount: number;
};

export type HrMcpConsolidatedEmployerCost = {
  readonly reportingCurrencyCode: string;
  readonly periodRef: string;
  readonly totalEmployerCost: number;
  readonly totalHeadcount: number;
  readonly countryCount: number;
  readonly legalEntityCount: number;
};

function escapeCsvCell(value: string | number | null): string {
  if (value === null) {
    return "";
  }
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

const CROSS_COUNTRY_COST_HEADERS = [
  "period_ref",
  "country_code",
  "country_name",
  "legal_entity_code",
  "pay_group_code",
  "currency_code",
  "employer_cost_total",
  "headcount",
] as const;

export function buildHrMcpCrossCountryCostReportCsv(input: {
  periodRef: string;
  rows: readonly HrMcpCrossCountryCostLine[];
}): string {
  const headerLine = CROSS_COUNTRY_COST_HEADERS.map(escapeCsvCell).join(",");
  const dataLines = input.rows.map((row) =>
    [
      input.periodRef,
      row.countryCode,
      row.countryName,
      row.legalEntityCode,
      row.payGroupCode,
      row.currencyCode,
      row.employerCostTotal,
      row.headcount,
    ]
      .map(escapeCsvCell)
      .join(","),
  );
  return [headerLine, ...dataLines].join("\n");
}

export function computeConsolidatedEmployerCostTotals(input: {
  periodRef: string;
  reportingCurrencyCode: string;
  rows: readonly HrMcpCrossCountryCostLine[];
}): HrMcpConsolidatedEmployerCost {
  const totalEmployerCost = input.rows.reduce((sum, row) => {
    return sum + (parseNumeric(row.employerCostTotal) ?? 0);
  }, 0);

  const countryIds = new Set(input.rows.map((row) => row.countryConfigId));
  const legalEntityIds = new Set(
    input.rows
      .map((row) => row.legalEntitySetupId)
      .filter((value): value is string => value != null),
  );

  return {
    reportingCurrencyCode: input.reportingCurrencyCode,
    periodRef: input.periodRef,
    totalEmployerCost,
    totalHeadcount: input.rows.reduce((sum, row) => sum + row.headcount, 0),
    countryCount: countryIds.size,
    legalEntityCount: legalEntityIds.size,
  };
}

export function groupCrossCountryCostByCountry(
  rows: readonly HrMcpCrossCountryCostLine[],
): ReadonlyMap<string, readonly HrMcpCrossCountryCostLine[]> {
  const grouped = new Map<string, HrMcpCrossCountryCostLine[]>();

  for (const row of rows) {
    const key = row.countryCode;
    const bucket = grouped.get(key) ?? [];
    bucket.push(row);
    grouped.set(key, bucket);
  }

  return grouped;
}

export function formatEmployerCostTotal(value: number): string {
  return formatNumeric(value, 2);
}

export function filterCrossCountryCostLines(
  rows: readonly HrMcpCrossCountryCostLine[],
  filter: {
    countryConfigId?: string;
    legalEntitySetupId?: string;
    currencyCode?: string;
  },
): readonly HrMcpCrossCountryCostLine[] {
  return rows.filter((row) => {
    if (filter.countryConfigId && row.countryConfigId !== filter.countryConfigId) {
      return false;
    }
    if (
      filter.legalEntitySetupId &&
      row.legalEntitySetupId !== filter.legalEntitySetupId
    ) {
      return false;
    }
    if (filter.currencyCode && row.currencyCode !== filter.currencyCode) {
      return false;
    }
    return true;
  });
}
