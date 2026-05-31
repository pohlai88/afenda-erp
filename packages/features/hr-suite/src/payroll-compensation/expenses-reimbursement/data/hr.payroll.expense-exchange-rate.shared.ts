/**
 * HRM-EXP-011 — exchange rate reference for foreign currency reimbursement.
 *
 * Finance systems should implement `ExchangeRateProvider` and inject it at
 * claim calculation time. The stub provider ships deterministic rates for tests
 * and local development.
 */

export type ExchangeRateLookupInput = {
  fromCurrency: string;
  toCurrency: string;
  rateDate: string;
  organizationId?: string;
};

export type ExchangeRateReference = {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate: string;
  source: string;
};

export type ExchangeRateProvider = (
  input: ExchangeRateLookupInput,
) => Promise<ExchangeRateReference | null>;

export type ExchangeRateConfigEntry = {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  source?: string;
};

const DEFAULT_STUB_EXCHANGE_RATES: readonly ExchangeRateConfigEntry[] = [
  {
    fromCurrency: "USD",
    toCurrency: "MYR",
    rate: 4.72,
    effectiveFrom: "2020-01-01",
    source: "finance_stub",
  },
  {
    fromCurrency: "EUR",
    toCurrency: "MYR",
    rate: 5.1,
    effectiveFrom: "2020-01-01",
    source: "finance_stub",
  },
  {
    fromCurrency: "SGD",
    toCurrency: "MYR",
    rate: 3.5,
    effectiveFrom: "2020-01-01",
    source: "finance_stub",
  },
  {
    fromCurrency: "GBP",
    toCurrency: "MYR",
    rate: 5.95,
    effectiveFrom: "2020-01-01",
    source: "finance_stub",
  },
];

function normalizeCurrencyCode(currencyCode: string): string {
  return currencyCode.trim().toUpperCase();
}

function isRateEffectiveOnDate(
  entry: ExchangeRateConfigEntry,
  rateDate: string,
): boolean {
  if (rateDate < entry.effectiveFrom) {
    return false;
  }

  if (entry.effectiveTo && rateDate > entry.effectiveTo) {
    return false;
  }

  return true;
}

/** Build a finance-integration adapter from configured rate rows. */
export function createExchangeRateProvider(
  entries: readonly ExchangeRateConfigEntry[],
): ExchangeRateProvider {
  return async (input) => {
    const fromCurrency = normalizeCurrencyCode(input.fromCurrency);
    const toCurrency = normalizeCurrencyCode(input.toCurrency);

    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        rate: 1,
        rateDate: input.rateDate,
        source: "identity",
      };
    }

    const match = [...entries]
      .filter(
        (entry) =>
          normalizeCurrencyCode(entry.fromCurrency) === fromCurrency &&
          normalizeCurrencyCode(entry.toCurrency) === toCurrency &&
          isRateEffectiveOnDate(entry, input.rateDate),
      )
      .sort((left, right) => right.effectiveFrom.localeCompare(left.effectiveFrom))[0];

    if (!match) {
      return null;
    }

    return {
      fromCurrency,
      toCurrency,
      rate: match.rate,
      rateDate: input.rateDate,
      source: match.source ?? "configured",
    };
  };
}

/** Default stub provider for development and unit tests. */
export const stubExchangeRateProvider = createExchangeRateProvider(
  DEFAULT_STUB_EXCHANGE_RATES,
);

/**
 * Resolve an exchange rate reference for reimbursement conversion.
 * Returns identity rate when currencies match.
 */
export async function getExchangeRate(
  input: ExchangeRateLookupInput,
  provider: ExchangeRateProvider = stubExchangeRateProvider,
): Promise<ExchangeRateReference> {
  const fromCurrency = normalizeCurrencyCode(input.fromCurrency);
  const toCurrency = normalizeCurrencyCode(input.toCurrency);

  const reference = await provider({
    ...input,
    fromCurrency,
    toCurrency,
  });

  if (!reference) {
    throw new Error(
      `Exchange rate not found for ${fromCurrency}/${toCurrency} on ${input.rateDate}`,
    );
  }

  return reference;
}

/** Convert a foreign amount using a resolved exchange rate reference. */
export function convertForeignCurrencyAmount(
  foreignAmount: number,
  reference: ExchangeRateReference,
): number {
  if (!Number.isFinite(foreignAmount) || foreignAmount < 0) {
    return 0;
  }

  return roundCurrencyAmount(foreignAmount * reference.rate);
}

/** Round currency amounts to two decimal places. */
export function roundCurrencyAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
