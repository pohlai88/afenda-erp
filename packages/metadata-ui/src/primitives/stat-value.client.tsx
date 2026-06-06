"use client";

import NumberFlow, { type Format, useCanAnimate } from "@number-flow/react";
import type { ReactNode } from "react";

import type {
  MetadataUiStatAnimationMode,
  MetadataUiStatFormat,
} from "../schemas/stat.schema";

export type MetadataUiPrimitiveStatValueProps = Readonly<{
  value: number | string;
  format: MetadataUiStatFormat;
  display: Readonly<{
    animation: MetadataUiStatAnimationMode;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency: string;
    locale?: string;
  }>;
  prefix?: ReactNode;
  unit?: string;
  postfix?: ReactNode;
  className?: string;
}>;

function getMetadataUiStatNumber(value: number | string): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  const normalized = value.replace(/[^0-9.-]/g, "");
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function createMetadataUiStatNumberFormat(
  format: MetadataUiStatFormat,
  display: MetadataUiPrimitiveStatValueProps["display"],
): Format {
  const fractionDigits = {
    minimumFractionDigits: display.minimumFractionDigits,
    maximumFractionDigits: display.maximumFractionDigits,
  };

  if (format === "currency") {
    return {
      style: "currency",
      currency: display.currency,
      ...fractionDigits,
    };
  }

  if (format === "percentage") {
    return {
      style: "percent",
      ...fractionDigits,
    };
  }

  if (format === "compact") {
    return {
      notation: "compact",
      ...fractionDigits,
    };
  }

  return fractionDigits;
}

function formatMetadataUiStatStaticValue({
  value,
  format,
  display,
}: Pick<
  MetadataUiPrimitiveStatValueProps,
  "display" | "format" | "value"
>): string {
  const numericValue = getMetadataUiStatNumber(value);

  if (numericValue === undefined || format === "custom") {
    return String(value);
  }

  return new Intl.NumberFormat(
    display.locale,
    createMetadataUiStatNumberFormat(format, display),
  ).format(numericValue);
}

export function MetadataUiPrimitiveStatValue({
  value,
  format,
  display,
  prefix,
  unit,
  postfix,
  className,
}: MetadataUiPrimitiveStatValueProps) {
  const numericValue = getMetadataUiStatNumber(value);
  const canAnimate = useCanAnimate({
    respectMotionPreference: display.animation === "respect-user",
  });
  const shouldAnimate =
    numericValue !== undefined &&
    display.animation !== "off" &&
    format !== "custom" &&
    canAnimate;
  const suffix = unit ? ` ${unit}` : undefined;

  if (!shouldAnimate) {
    return (
      <span
        className={className}
        data-metadata-ui-stat-value="static"
        suppressHydrationWarning
      >
        {prefix ? <span className="mr-1">{prefix}</span> : null}
        {formatMetadataUiStatStaticValue({ value, format, display })}
        {suffix}
        {postfix ? <span className="ml-1">{postfix}</span> : null}
      </span>
    );
  }

  return (
    <span className={className} data-metadata-ui-stat-value="animated">
      {prefix ? <span className="mr-1">{prefix}</span> : null}
      <NumberFlow
        value={numericValue}
        locales={display.locale}
        format={createMetadataUiStatNumberFormat(format, display)}
        suffix={suffix}
        willChange
      />
      {postfix ? <span className="ml-1">{postfix}</span> : null}
    </span>
  );
}
