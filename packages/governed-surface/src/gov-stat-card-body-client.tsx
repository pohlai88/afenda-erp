"use client";

import NumberFlow from "@number-flow/react";
import type { Route } from "next";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useReducedMotion } from "motion/react";

import Link from "next/link";
import { Progress } from "@afenda/ui/progress";
import type {
  StatCardIcon,
  StatCardItem,
  StatCardTone,
} from "./gov-stat-card-schema";
import { cn } from "@afenda/ui/utils";

import { ListSurfaceSparkline } from "./gov-list-surface-sparkline-client";

const ICON_MAP: Record<StatCardIcon, LucideIcon> = {
  clock: Clock,
  alert: AlertTriangle,
  users: Users,
  calendar: Calendar,
  activity: Activity,
  shield: Shield,
};

const ACCENT_RAIL_CLASS: Record<StatCardTone, string> = {
  positive: "border-l-success",
  attention: "border-l-warning",
  critical: "border-l-critical",
  default: "border-l-transparent",
};

const DELTA_TONE_CLASS: Record<StatCardTone, string> = {
  positive: "text-success",
  attention: "text-warning-foreground",
  critical: "text-critical",
  default: "text-muted-foreground",
};

const COMPARISON_DIRECTION_CLASS = {
  up: "text-success",
  down: "text-critical",
  flat: "text-muted-foreground",
} as const;

export type StatCardBodyProps = {
  stat: StatCardItem;
  density: "compact" | "comfortable";
};

function parseNumericValue(value: string): number | null {
  const normalized = value.replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function StatCardBody({ stat, density }: StatCardBodyProps) {
  const reduceMotion = useReducedMotion();
  const Icon = stat.icon ? ICON_MAP[stat.icon] : null;
  const numericValue = parseNumericValue(stat.value);
  const showAccent =
    stat.tone === "attention" || stat.tone === "critical" || Boolean(stat.href);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="type-label">{stat.label}</span>
        {Icon ? (
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : null}
      </div>
      <span className="type-card-title tabular-nums tracking-tight text-foreground">
        {numericValue !== null &&
        stat.animateValue !== false &&
        !reduceMotion ? (
          <NumberFlow value={numericValue} />
        ) : (
          stat.value
        )}
      </span>
      {stat.sparkPoints && stat.sparkPoints.length >= 2 ? (
        <ListSurfaceSparkline
          points={stat.sparkPoints.map((point) => point.value)}
          className="h-8 w-full"
        />
      ) : null}
      {stat.progress ? (
        <div className="flex flex-col gap-1">
          <Progress
            value={(stat.progress.value / stat.progress.max) * 100}
            aria-label={stat.progress.label ?? stat.label}
          />
          {stat.progress.label ? (
            <span className="type-caption">{stat.progress.label}</span>
          ) : null}
        </div>
      ) : null}
      {stat.comparison ? (
        <span
          className={cn(
            "type-caption font-medium",
            COMPARISON_DIRECTION_CLASS[stat.comparison.direction],
          )}
        >
          {stat.comparison.priorValue} {stat.comparison.label}
        </span>
      ) : stat.delta !== undefined ? (
        <span
          className={cn(
            "type-caption font-medium",
            DELTA_TONE_CLASS[stat.tone],
          )}
        >
          {stat.delta}
        </span>
      ) : null}
    </>
  );

  const contentClass = cn(
    "flex flex-col",
    density === "compact" ? "gap-1 p-3" : "gap-1.5 p-4",
    showAccent && "border-l-4",
    showAccent && ACCENT_RAIL_CLASS[stat.tone],
  );

  if (stat.href) {
    const linkClass = cn(
      contentClass,
      "rounded-card transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    );
    if (stat.href.startsWith("?") || stat.href.startsWith("#")) {
      return (
        <a href={stat.href} className={linkClass}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={stat.href as Route} prefetch={false} className={linkClass}>
        {inner}
      </Link>
    );
  }

  return <div className={contentClass}>{inner}</div>;
}
