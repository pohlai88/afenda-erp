import type { Route } from "next";

import Link from "next/link";

import { Badge } from "@afenda/ui/badge";
import { Check, Circle, Clock, X } from "lucide-react";
import { Progress } from "@afenda/ui/progress";
import { GovernedEmpty } from "./gov-governed-empty";
import {
  parseGovernedApprovalTimelineConfiguration,
  type ApprovalTimelineDataNature,
  type ApprovalTimelineStepStatus,
} from "./gov-approval-timeline-schema";
import {
  governedParseErrorCopy,
  governedRendererCopy,
} from "./gov-governed-renderer-copy-shared";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";
import { cn } from "@afenda/ui/utils";

import type { RendererProps } from "./gov-governed-renderer-dispatch";

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

function summarizeTimeline(
  steps: readonly { status: ApprovalTimelineStepStatus }[],
) {
  const complete = steps.filter((step) => step.status === "complete").length;
  const rejected = steps.filter((step) => step.status === "rejected").length;
  const active = steps.filter((step) => step.status === "active").length;
  const progress = Math.round((complete / Math.max(steps.length, 1)) * 100);

  return {
    active,
    complete,
    rejected,
    progress,
    pending: steps.length - complete - rejected - active,
  };
}

export type ApprovalTimelineRendererProps = Omit<
  RendererProps,
  "componentType" | "diagnostics"
> & {
  componentType?: string;
  diagnostics?: RendererProps["diagnostics"];
};

export function ApprovalTimelineRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
  componentType = "governed:approval-timeline",
}: ApprovalTimelineRendererProps) {
  const resolvedComponentKey =
    componentKey ?? sectionKey ?? surfaceKey ?? "approval-timeline";
  const parsed = parseGovernedApprovalTimelineConfiguration(configuration);

  if (!parsed.success) {
    const copy = governedParseErrorCopy(diagnostics, "approvalTimeline");
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
        }}
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={resolvedComponentKey}
        renderState="invalid"
      />
    );
  }

  const { dataNature, density, title, steps } = parsed.data;

  if (steps.length === 0) {
    return (
      <GovernedEmpty
        model={{
          variant: "muted",
          title: governedRendererCopy.empty.approvalTimeline.title,
          description: governedRendererCopy.empty.approvalTimeline.description,
        }}
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={resolvedComponentKey}
      />
    );
  }
  const listGapClass = density === "compact" ? "gap-2" : "gap-3";
  const itemPaddingClass = density === "compact" ? "pb-2" : "pb-3";
  const summary = summarizeTimeline(steps);

  return (
    <section
      aria-label={title ?? "Approval timeline"}
      className={DATA_NATURE_CLASS[dataNature]}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("approval-timeline", resolvedComponentKey),
        componentType,
      })}
    >
      <div className={cn("flex flex-col", listGapClass)}>
        {title ? <h3 className="type-card-title">{title}</h3> : null}

        <div className="grid gap-2 @md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Progress
              value={summary.progress}
              aria-label="Approval completion"
            />
            <p className="type-caption">
              {summary.complete} of {steps.length} steps complete
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {summary.active > 0 ? (
              <Badge variant="default">{summary.active} active</Badge>
            ) : null}
            {summary.pending > 0 ? (
              <Badge variant="outline">{summary.pending} pending</Badge>
            ) : null}
            {summary.rejected > 0 ? (
              <Badge variant="destructive">{summary.rejected} rejected</Badge>
            ) : null}
          </div>
        </div>

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
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border type-label", // audit-ds: ignore no-raw-typography — step status badge; type-label uppercase is acceptable here
                    step.status === "complete" &&
                      "border-success/40 bg-success/10 text-success",
                    step.status === "rejected" &&
                      "border-critical/40 bg-critical/10 text-critical",
                    step.status === "active" &&
                      "border-primary/40 bg-primary/10 text-primary",
                    (step.status === "pending" || step.status === "skipped") &&
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
                        className="type-body font-medium text-primary hover:underline"
                      >
                        {step.label}
                      </Link>
                    ) : (
                      <span className="type-body font-medium">{step.label}</span>
                    )}
                    <Badge variant={STATUS_VARIANT[step.status]}>
                      {step.status}
                    </Badge>
                    {occurred ? (
                      <time className="type-caption" dateTime={step.occurredAt}>
                        {occurred}
                      </time>
                    ) : null}
                  </div>
                  {step.actorLabel ? (
                    <p className="type-caption font-medium text-foreground/80">
                      {/* audit-ds: ignore no-raw-typography — actor attribution; type-caption sets muted but foreground/80 overrides */}
                      {step.actorLabel}
                    </p>
                  ) : null}
                  {duration ? <p className="type-caption">{duration}</p> : null}
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
                  {step.note ? <p className="type-caption">{step.note}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
