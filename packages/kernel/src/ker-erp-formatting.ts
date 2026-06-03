type DateLike = Date | string | null | undefined;

type ErpDateTimeFormatOptions = Omit<
  Intl.DateTimeFormatOptions,
  "dateStyle" | "timeStyle"
> & {
  dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
  fallback?: string;
  locale?: string;
  timeStyle?: Intl.DateTimeFormatOptions["timeStyle"];
};

type ErpCurrencyFormatOptions = Omit<Intl.NumberFormatOptions, "style"> & {
  fallback?: string;
  locale?: string;
};

type ErpNumberFormatOptions = Intl.NumberFormatOptions & {
  fallback?: string;
  locale?: string;
};

function toValidDate(value: DateLike) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function formatErpDateTime(
  value: DateLike,
  options: ErpDateTimeFormatOptions = {},
) {
  const {
    fallback = "Not recorded",
    locale = "en-US",
    day = "2-digit",
    hour = "2-digit",
    hourCycle = "h23",
    minute = "2-digit",
    month = "short",
    timeZone = "UTC",
    timeZoneName = "short",
    year = "numeric",
    ...rest
  } = options;

  const date = toValidDate(value);
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    day,
    hour,
    hourCycle,
    minute,
    month,
    timeZone,
    timeZoneName,
    year,
    ...rest,
  }).format(date);
}

export function formatErpNumber(
  value: number | null | undefined,
  options: ErpNumberFormatOptions = {},
) {
  const { fallback = "-", locale = "en-MY", ...rest } = options;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return new Intl.NumberFormat(locale, rest).format(value);
}

export function formatErpMoneyFromMinorUnits(
  amountMinorUnits: number | null | undefined,
  currency: string,
  options: ErpCurrencyFormatOptions = {},
) {
  const {
    fallback = "N/A",
    locale = currency === "MYR" ? "en-MY" : "en-US",
    maximumFractionDigits = 0,
    ...rest
  } = options;

  if (
    typeof amountMinorUnits !== "number" ||
    !Number.isFinite(amountMinorUnits)
  ) {
    return fallback;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
    ...rest,
  }).format(amountMinorUnits / 100);
}

export function formatErpFileSize(sizeBytes: number) {
  if (!Number.isFinite(sizeBytes) || sizeBytes < 0) {
    return "-";
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
