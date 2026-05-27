"use client";

import type { Route } from "next";
import { useLocale } from "../../i18n/governed-surface-copy.client";
import { AlertTriangle } from "lucide-react";

import Link from "next/link";

import { Avatar, AvatarFallback } from "@afenda/ui/avatar";
import { Badge } from "@afenda/ui/badge";
import { Progress } from "@afenda/ui/progress";
import type {
  ListCellKind,
  ListCellTone,
  ListColumn,
} from "../../schemas/list-surface.schema";
import type { ListSurfaceRow } from "../../schemas/list-surface-renderer.schema";
import { cn } from "@afenda/ui/utils";

import { ListSurfaceSparkline } from "./list-surface-sparkline.client";

const BADGE_TONE_CLASS: Record<ListCellTone, string> = {
  positive: "bg-success/15 text-success",
  attention: "bg-warning/15 text-warning-foreground",
  critical: "bg-destructive/15 text-destructive",
  default: "bg-muted text-muted-foreground",
};

const SEMANTIC_TONE_CLASS: Record<ListCellTone, string> = {
  positive: "text-success",
  attention: "text-warning-foreground",
  critical: "text-destructive",
  default: "text-foreground",
};

function formatCurrency(
  value: number,
  locale: string,
  currency?: string,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency ?? "USD",
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(locale, { timeZone: "UTC" });
}

function formatDateTime(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(locale, { timeZone: "UTC" });
}

export type ListSurfaceCellProps = {
  column: ListColumn;
  row: ListSurfaceRow;
};

function resolveListCellKind(
  column: ListColumn,
  row: ListSurfaceRow,
): ListCellKind | undefined {
  return row.cellKinds?.[column.id] ?? column.cellKind;
}

export function ListSurfaceCell({ column, row }: ListSurfaceCellProps) {
  const locale = useLocale();
  const raw = row.cells[column.id];
  const cellKind = resolveListCellKind(column, row);
  const kind = cellKind?.kind ?? "text";
  const display = raw === undefined || raw === null ? "—" : String(raw);

  if (kind === "link" || (row.linkColumnId === column.id && row.rowHref)) {
    const cellHref =
      cellKind?.kind === "link" && cellKind.href ? cellKind.href : undefined;
    const href =
      cellHref ??
      (row.linkColumnId === column.id && row.rowHref ? row.rowHref : undefined);
    if (href) {
      return (
        <Link
          href={href as Route}
          prefetch={false}
          className="text-primary hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {display}
        </Link>
      );
    }
    return display;
  }

  if (kind === "badge") {
    const tone: ListCellTone =
      cellKind?.kind === "badge" ? (cellKind.tone ?? "default") : "default";
    return (
      <Badge
        variant="secondary"
        className={cn("font-medium", BADGE_TONE_CLASS[tone])}
      >
        {display}
      </Badge>
    );
  }

  if (kind === "currency" && typeof raw === "number") {
    const currency =
      cellKind?.kind === "currency" ? cellKind.currency : undefined;
    return formatCurrency(raw, locale, currency);
  }

  if (kind === "date") {
    return formatDate(display, locale);
  }

  if (kind === "datetime") {
    return formatDateTime(display, locale);
  }

  if (kind === "sparkline" && cellKind?.kind === "sparkline") {
    return <ListSurfaceSparkline points={cellKind.points} />;
  }

  if (kind === "meter" && cellKind?.kind === "meter") {
    const { value, max, label } = cellKind;
    return (
      <div className="flex min-w-[6rem] flex-col gap-1">
        <Progress
          value={(value / max) * 100}
          aria-label={label ?? column.header}
        />
        {label ? (
          <span className="text-label-small text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
    );
  }

  if (kind === "semantic-text" && cellKind?.kind === "semantic-text") {
    const tone = cellKind.tone ?? "default";
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium",
          SEMANTIC_TONE_CLASS[tone],
        )}
      >
        {tone === "critical" || tone === "attention" ? (
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
        ) : null}
        {display}
      </span>
    );
  }

  if (kind === "avatar-stack" && cellKind?.kind === "avatar-stack") {
    const { initials, overflow } = cellKind;
    return (
      <div className="flex -space-x-2">
        {initials.slice(0, 3).map((initial, index) => (
          <Avatar
            key={`${initial}-${index}`}
            className="size-7 border-2 border-card"
          >
            <AvatarFallback className="text-[10px]">{initial}</AvatarFallback>
          </Avatar>
        ))}
        {overflow && overflow > 0 ? (
          <span className="ms-2 text-label-small text-muted-foreground">
            +{overflow}
          </span>
        ) : null}
      </div>
    );
  }

  return display;
}
