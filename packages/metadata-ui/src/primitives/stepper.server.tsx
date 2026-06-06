import "server-only";

import type { ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";
import { MetadataUiPrimitiveBadge } from "./badge.server";

export type MetadataUiPrimitiveStepperStatus =
  | "available"
  | "active"
  | "complete"
  | "blocked"
  | "readonly"
  | "invalid";

export type MetadataUiPrimitiveStepperItem = Readonly<{
  key: string;
  label: ReactNode;
  description?: ReactNode;
  status: MetadataUiPrimitiveStepperStatus;
  meta?: ReactNode;
}>;

export type MetadataUiPrimitiveStepperProps = Readonly<{
  steps: readonly MetadataUiPrimitiveStepperItem[];
  className?: string;
  itemClassName?: string;
}>;

const STEPPER_STATUS_TONE = {
  available: "neutral",
  active: "info",
  complete: "positive",
  blocked: "warning",
  readonly: "neutral",
  invalid: "critical",
} as const;

function formatMetadataUiStepperStatusLabel(
  status: MetadataUiPrimitiveStepperStatus,
) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function MetadataUiPrimitiveStepper({
  steps,
  className,
  itemClassName,
}: MetadataUiPrimitiveStepperProps) {
  return (
    <ol className={cn("metadata-ui-stepper grid gap-surface-sm", className)}>
      {steps.map((step, index) => (
        <li
          key={step.key}
          className={cn("grid gap-surface-2xs rounded-section border border-border/60 bg-card p-surface-sm", itemClassName)}
          aria-current={step.status === "active" ? "step" : undefined}
          data-step-status={step.status}
        >
          <div className="flex items-start justify-between gap-surface-xs">
            <div className="grid min-w-0 gap-surface-2xs">
              <div className={cn("flex items-center gap-surface-xs", ui.color.ink.foreground)}>
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <span className={ui.typography.label}>{step.label}</span>
              </div>
              {step.description ? <p className={cn(ui.typography.caption, ui.color.ink.muted)}>{step.description}</p> : null}
            </div>
            <MetadataUiPrimitiveBadge tone={STEPPER_STATUS_TONE[step.status]}>
              {formatMetadataUiStepperStatusLabel(step.status)}
            </MetadataUiPrimitiveBadge>
          </div>
          {step.meta ? <div className={cn(ui.typography.caption, ui.color.ink.muted)}>{step.meta}</div> : null}
        </li>
      ))}
    </ol>
  );
}
