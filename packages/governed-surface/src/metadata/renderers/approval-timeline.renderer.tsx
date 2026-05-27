import type { Route } from "next";

import Link from "next/link";

import { Badge } from "@afenda/ui/badge";
import { Check, Circle, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card";
import { GovernedEmpty } from "../../client";
import {
  parseGovernedApprovalTimelineConfiguration,
  type ApprovalTimelineDataNature,
  type ApprovalTimelineStepStatus,
} from "../../schemas/approval-timeline.schema";
import { cn } from "@afenda/ui/utils";

import type { GovernedComponentRendererDiagnostics } from "../registry";

const DATA_NATURE_CLASS: Record<ApprovalTimelineDataNature, string> = {
  "approval-flow": "@container flex flex-col gap-3",
};

const STATUS_VARIANT: Record<
  ApprovalTimelineStepStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  active: "default",
  complete: "secondary",
  rejected: "destructive",
  skipped: "outline",
};

const STATUS_ICON: Record<ApprovalTimelineStepStatus, typeof Circle> = {
  pending: Clock,
  active: Circle,
  complete: Check,
  rejected: X,
  skipped: Circle,
};

const METADATA_CHIP_VARIANT = {
  default: "secondary",
  positive: "success",
  attention: "warning",
  critical: "critical",
} as const;

function formatStepTimestamp(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function stepDurationLabel(
  steps: readonly { occurredAt?: string }[],
  index: number,
): string | null {
  const current = steps[index]?.occurredAt;
  const next = steps[index + 1]?.occurredAt;
  if (!current || !next) return null;
  const ms = new Date(next).getTime() - new Date(current).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const hours = Math.round(ms / (60 * 60 * 1000));
  if (hours < 24) return `${hours}h to next step`;
  const days = Math.round(hours / 24);
  return `${days}d to next step`;
}

export type ApprovalTimelineRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
};

export function ApprovalTimelineRenderer({
  configuration,
  diagnostics = "user",
}: ApprovalTimelineRendererProps) {
  const parsed = parseGovernedApprovalTimelineConfiguration(configuration);

  if (!parsed.success) {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: "Timeline unavailable",
          description:
            diagnostics === "operator"
              ? "The approval timeline configuration failed validation."
              : "This timeline could not be loaded safely.",
        }}
      />
    );
  }

  const { dataNature, density, title, steps } = parsed.data;
  const listGapClass = density === "compact" ? "gap-2" : "gap-3";
  const itemPaddingClass = density === "compact" ? "pb-2" : "pb-3";

  return (
    <section
      aria-label={title ?? "Approval timeline"}
      className={DATA_NATURE_CLASS[dataNature]}
    >
      <Card>
        {title ? (
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{title}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent
          className={cn("flex flex-col", listGapClass, title && "pt-0")}
        >
          <ol className={cn("flex flex-col", listGapClass)}>
            {steps.map((step, index) => {
              const Icon = STATUS_ICON[step.status];
              const occurred = formatStepTimestamp(step.occurredAt);
              const duration =
                step.durationLabel ?? stepDurationLabel(steps, index);
              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex items-start gap-3 border-b border-border/60 last:border-0 last:pb-0",
                    itemPaddingClass,
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                      step.status === "complete" &&
                        "border-success/40 bg-success/10 text-success",
                      step.status === "rejected" &&
                        "border-destructive/40 bg-destructive/10 text-destructive",
                      step.status === "active" &&
                        "border-primary/40 bg-primary/10 text-primary",
                      (step.status === "pending" ||
                        step.status === "skipped") &&
                        "border-border bg-muted text-muted-foreground",
                    )}
                    aria-hidden
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {step.href ? (
                        <Link
                          href={step.href as Route}
                          prefetch={false}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {step.label}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium">
                          {step.label}
                        </span>
                      )}
                      <Badge variant={STATUS_VARIANT[step.status]}>
                        {step.status}
                      </Badge>
                      {occurred ? (
                        <time
                          className="text-xs text-muted-foreground"
                          dateTime={step.occurredAt}
                        >
                          {occurred}
                        </time>
                      ) : null}
                    </div>
                    {step.actorLabel ? (
                      <p className="text-xs font-medium text-foreground/80">
                        {step.actorLabel}
                      </p>
                    ) : null}
                    {duration ? (
                      <p className="text-xs text-muted-foreground">
                        {duration}
                      </p>
                    ) : null}
                    {step.metadataChips?.length ? (
                      <ul
                        className="flex flex-wrap gap-1"
                        aria-label="Step metadata"
                      >
                        {step.metadataChips.map((chip) => (
                          <li key={chip.label}>
                            <Badge
                              variant={
                                METADATA_CHIP_VARIANT[chip.tone ?? "default"]
                              }
                            >
                              {chip.label}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {step.note ? (
                      <p className="text-xs text-muted-foreground">
                        {step.note}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}
