import "server-only";

import type { ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPrimitiveDescriptionListTone =
  | "neutral"
  | "info"
  | "positive"
  | "warning"
  | "critical";

export type MetadataUiPrimitiveDescriptionListItem = Readonly<{
  key: string;
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  tone?: MetadataUiPrimitiveDescriptionListTone;
  copyValue?: string;
}>;

export type MetadataUiPrimitiveDescriptionListProps = Readonly<{
  items: readonly MetadataUiPrimitiveDescriptionListItem[];
  columns?: 1 | 2 | 3;
  title?: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
  itemClassName?: string;
  valueClassName?: string;
}>;

const VALUE_TONE_CLASS_BY_TONE = {
  neutral: ui.color.ink.foreground,
  info: "text-info-foreground",
  positive: "text-success-foreground",
  warning: "text-warning-foreground",
  critical: "text-critical-foreground",
} as const satisfies Record<MetadataUiPrimitiveDescriptionListTone, string>;

const COLUMNS_CLASS_BY_COUNT = {
  1: "grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
} as const satisfies Record<1 | 2 | 3, string>;

export function MetadataUiPrimitiveDescriptionList({
  items,
  columns = 2,
  title,
  description,
  id,
  className,
  itemClassName,
  valueClassName,
}: MetadataUiPrimitiveDescriptionListProps) {
  return (
    <section
      id={id}
      className={cn("metadata-ui-description-list grid", ui.surfaceGap.sm, className)}
    >
      {(title || description) ? (
        <div className="grid gap-surface-2xs">
          {title ? <h2 className={cn(ui.typography.sectionTitle, ui.color.ink.foreground)}>{title}</h2> : null}
          {description ? <p className={cn(ui.typography.caption, ui.color.ink.muted)}>{description}</p> : null}
        </div>
      ) : null}
      <dl className={cn("grid gap-surface-sm", COLUMNS_CLASS_BY_COUNT[columns])}>
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              "grid gap-surface-2xs rounded-section border border-border/60 bg-card p-surface-sm",
              itemClassName,
            )}
          >
            <dt className={cn(ui.typography.label, ui.color.ink.muted)}>{item.label}</dt>
            <dd
              className={cn(
                "min-w-0 text-sm",
                item.tone ? VALUE_TONE_CLASS_BY_TONE[item.tone] : ui.color.ink.foreground,
                valueClassName,
              )}
              title={item.copyValue}
              data-copy-value={item.copyValue}
            >
              {item.value}
            </dd>
            {item.description ? (
              <dd className={cn(ui.typography.caption, ui.color.ink.muted)}>{item.description}</dd>
            ) : null}
            {item.meta ? (
              <dd className={cn(ui.typography.caption, ui.color.ink.muted)}>{item.meta}</dd>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
