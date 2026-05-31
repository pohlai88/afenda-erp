/**
 * MCP-009 — exchange rate reference for reporting and cross-country consolidation.
 *
 * Finance systems should implement `HrMcpExchangeRateProvider` and inject it at
 * payroll reporting time. The stub provider ships deterministic rates for tests
 * and local development.
 */

import type {
  HrMcpExchangeRateLookupInput,
  HrMcpExchangeRateReference,
  HrMcpExchangeRateRecord,
} from "../schemas/hr.payroll.mcp-currency-exchange.schema";

export type HrMcpExchangeRateProvider = (
  input: HrMcpExchangeRateLookupInput,
) => Promise<HrMcpExchangeRateReference | null>;

const DEFAULT_STUB_EXCHANGE_RATES: readonly HrMcpExchangeRateRecord[] = [
  {
    id: "stub-usd-myr",
    organizationId: "stub",
    fromCurrencyCode: "USD",
    toCurrencyCode: "MYR",
    rate: 4.72,
    rateDate: "2020-01-01",
    sourceReference: "finance_stub",
  },
  {
    id: "stub-eur-myr",
    organizationId: "stub",
    fromCurrencyCode: "EUR",
    toCurrencyCode: "MYR",
    rate: 5.1,
    rateDate: "2020-01-01",
    sourceReference: "finance_stub",
  },
  {
    id: "stub-sgd-myr",
    organizationId: "stub",
    fromCurrencyCode: "SGD",
    toCurrencyCode: "MYR",
    rate: 3.5,
    rateDate: "2020-01-01",
    sourceReference: "finance_stub",
  },
  {
    id: "stub-gbp-myr",
    organizationId: "stub",
    fromCurrencyCode: "GBP",
    toCurrencyCode: "MYR",
    rate: 5.95,
    rateDate: "2020-01-01",
    sourceReference: "finance_stub",
  },
];

function normalizeCurrencyCode(currencyCode: string): string {
  return currencyCode.trim().toUpperCase();
}

function isRateOnOrBeforeLookup(
  entryRateDate: string,
  lookupRateDate: string,
): boolean {
  return entryRateDate <= lookupRateDate;
}

/** Build a finance-integration adapter from configured MCP exchange rate rows. */
export function createMcpExchangeRateProvider(
  entries: readonly Pick<
    HrMcpExchangeRateRecord,
    | "fromCurrencyCode"
    | "toCurrencyCode"
    | "rate"
    | "rateDate"
    | "sourceReference"
  >[],
): HrMcpExchangeRateProvider {
  return async (input) => {
    const fromCurrencyCode = normalizeCurrencyCode(input.fromCurrencyCode);
    const toCurrencyCode = normalizeCurrencyCode(input.toCurrencyCode);

    if (fromCurrencyCode === toCurrencyCode) {
      return {
        fromCurrencyCode,
        toCurrencyCode,
        rate: 1,
        rateDate: input.rateDate,
        sourceReference: "identity",
      };
    }

    const match = [...entries]
      .filter(
        (entry) =>
          normalizeCurrencyCode(entry.fromCurrencyCode) === fromCurrencyCode &&
          normalizeCurrencyCode(entry.toCurrencyCode) === toCurrencyCode &&
          isRateOnOrBeforeLookup(entry.rateDate, input.rateDate),
      )
      .sort((left, right) => right.rateDate.localeCompare(left.rateDate))[0];

    if (!match) {
      return null;
    }

    return {
      fromCurrencyCode,
      toCurrencyCode,
      rate: match.rate,
      rateDate: input.rateDate,
      sourceReference: match.sourceReference ?? "configured",
    };
  };
}

/** Default stub provider for development and unit tests. */
export const stubMcpExchangeRateProvider = createMcpExchangeRateProvider(
  DEFAULT_STUB_EXCHANGE_RATES,
);

/**
 * Resolve an exchange rate reference for payroll reporting conversion.
 * Returns identity rate when currencies match.
 */
export async function getMcpExchangeRate(
  input: HrMcpExchangeRateLookupInput,
  provider: HrMcpExchangeRateProvider = stubMcpExchangeRateProvider,
): Promise<HrMcpExchangeRateReference> {
  const fromCurrencyCode = normalizeCurrencyCode(input.fromCurrencyCode);
  const toCurrencyCode = normalizeCurrencyCode(input.toCurrencyCode);

  const reference = await provider({
    ...input,
    fromCurrencyCode,
    toCurrencyCode,
  });

  if (!reference) {
    throw new Error(
      `Exchange rate not found for ${fromCurrencyCode}/${toCurrencyCode} on ${input.rateDate}`,
    );
  }

  return reference;
}

/** Convert a payroll amount using a resolved exchange rate reference. */
export function convertMcpPayrollAmount(
  amount: number,
  reference: HrMcpExchangeRateReference,
): number {
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return roundMcpCurrencyAmount(amount * reference.rate);
}

/** Round currency amounts to two decimal places. */
export function roundMcpCurrencyAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
